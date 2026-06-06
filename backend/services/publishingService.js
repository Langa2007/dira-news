import { env } from '../config/env.js';
import prisma from '../models/prisma.js';
import { recordAudit } from './auditService.js';
import { validateArticleMediaLicenses } from './editorialService.js';
import { addJob, QUEUE_NAMES } from './queueService.js';
import { emitRealtime } from './realtimeService.js';

const DEFAULT_CHANNELS = ['WEBSITE', 'APP_FEED', 'TELEGRAM', 'WHATSAPP_DRAFT', 'INSTAGRAM_DRAFT', 'X_DRAFT', 'RSS', 'SITEMAP'];
const SOCIAL_DRAFT_TARGETS = ['WHATSAPP_DRAFT', 'INSTAGRAM_DRAFT', 'X_DRAFT'];

function cleanJsonObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

function publicBaseUrl() {
  return env.PUBLIC_SITE_URL || env.CLIENT_ORIGIN || 'http://localhost:3000';
}

function articleUrl(article) {
  return `${publicBaseUrl().replace(/\/$/, '')}/articles/${article.slug}`;
}

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function compactText(text = '', maxLength = 240) {
  const compacted = text.replace(/\s+/g, ' ').trim();

  if (compacted.length <= maxLength) {
    return compacted;
  }

  return `${compacted.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
}

function socialTextFor(article, target) {
  const url = articleUrl(article);
  const summary = compactText(article.summary || article.subtitle || article.body || '', 180);

  if (target === 'X_DRAFT') {
    return compactText(`${article.title}\n\n${summary}\n${url}`, 280);
  }

  if (target === 'INSTAGRAM_DRAFT') {
    return compactText(`${article.title}\n\n${summary}\n\nRead more at ${url}`, 2200);
  }

  if (target === 'TELEGRAM') {
    return compactText(`<b>${article.title}</b>\n\n${summary}\n\n${url}`, 4096);
  }

  return compactText(`${article.title}\n\n${summary}\n\n${url}`, 1200);
}

async function getPublishableArticle(articleId) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      author: { select: { id: true, name: true, email: true } },
      editor: { select: { id: true, name: true, email: true } },
      region: true,
      cluster: true,
      topics: { include: { topic: true } },
      media: { include: { media: true } }
    }
  });

  if (!article) {
    const error = new Error('Article not found');
    error.statusCode = 404;
    throw error;
  }

  return article;
}

async function createPublishTarget({ articleId, type, status = 'QUEUED', payload, externalId, error, scheduledAt, publishedAt }) {
  return prisma.publishTarget.create({
    data: {
      articleId,
      type,
      status,
      payload,
      externalId,
      error,
      scheduledAt,
      publishedAt
    }
  });
}

async function enqueuePublishingJob(jobName, data) {
  return addJob(QUEUE_NAMES.PUBLISHING, jobName, data);
}

async function publishArticleToChannels({ articleId, actorId, channels = DEFAULT_CHANNELS }) {
  await validateArticleMediaLicenses(articleId);
  const articleBeforePublish = await getPublishableArticle(articleId);
  const publishedAt = new Date();
  const selectedChannels = channels.length ? channels : DEFAULT_CHANNELS;

  const article = await prisma.article.update({
    where: { id: articleId },
    data: {
      status: 'PUBLISHED',
      editorId: actorId,
      publishedAt,
      scheduledAt: null
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      editor: { select: { id: true, name: true, email: true } },
      region: true,
      cluster: true,
      topics: { include: { topic: true } },
      media: { include: { media: true } }
    }
  });

  const targets = [];
  const drafts = [];

  for (const channel of selectedChannels) {
    if (channel === 'WEBSITE') {
      targets.push(
        await createPublishTarget({
          articleId,
          type: channel,
          status: 'PUBLISHED',
          publishedAt,
          externalId: articleUrl(article),
          payload: {
            url: articleUrl(article),
            title: article.title,
            slug: article.slug
          }
        })
      );
      continue;
    }

    if (channel === 'APP_FEED') {
      targets.push(
        await createPublishTarget({
          articleId,
          type: channel,
          status: 'PUBLISHED',
          publishedAt,
          externalId: article.id,
          payload: {
            articleId: article.id,
            category: article.category,
            isBreaking: article.isBreaking,
            publishedAt: publishedAt.toISOString()
          }
        })
      );
      continue;
    }

    if (channel === 'TELEGRAM') {
      const target = await createPublishTarget({
        articleId,
        type: channel,
        status: 'QUEUED',
        payload: {
          text: socialTextFor(article, 'TELEGRAM'),
          channelId: env.TELEGRAM_DEFAULT_CHANNEL_ID
        }
      });
      targets.push(target);
      await enqueuePublishingJob('publish-telegram', { targetId: target.id, articleId });
      continue;
    }

    if (SOCIAL_DRAFT_TARGETS.includes(channel)) {
      const text = socialTextFor(article, channel);
      const target = await createPublishTarget({
        articleId,
        type: channel,
        status: 'QUEUED',
        payload: { text }
      });
      const draft = await prisma.socialDraft.create({
        data: {
          articleId,
          target: channel,
          text,
          status: 'QUEUED',
          metadata: { publishTargetId: target.id }
        }
      });

      targets.push(target);
      drafts.push(draft);
      await enqueuePublishingJob('prepare-social-draft', { targetId: target.id, draftId: draft.id, articleId });
      continue;
    }

    if (channel === 'RSS' || channel === 'SITEMAP') {
      const target = await createPublishTarget({
        articleId,
        type: channel,
        status: 'QUEUED',
        payload: { trigger: 'article_published', articleId }
      });
      targets.push(target);
      await enqueuePublishingJob(channel === 'RSS' ? 'regenerate-rss' : 'regenerate-sitemap', { targetId: target.id, articleId });
    }
  }

  emitRealtime('article.published', {
    id: article.id,
    slug: article.slug,
    title: article.title,
    category: article.category,
    isBreaking: article.isBreaking,
    publishedAt: article.publishedAt
  });

  await recordAudit({
    actorId,
    action: 'publishing.article.publish',
    entity: 'Article',
    entityId: article.id,
    metadata: {
      previousStatus: articleBeforePublish.status,
      channels: selectedChannels,
      targetIds: targets.map((target) => target.id)
    }
  });

  return { article, targets, drafts };
}

async function dispatchPublishTarget({ targetId, actorId }) {
  const target = await prisma.publishTarget.findUnique({
    where: { id: targetId },
    include: {
      article: true
    }
  });

  if (!target) {
    const error = new Error('Publish target not found');
    error.statusCode = 404;
    throw error;
  }

  if (target.type !== 'TELEGRAM') {
    const updated = await prisma.publishTarget.update({
      where: { id: target.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        error: null
      }
    });

    await recordAudit({
      actorId,
      action: 'publishing.target.dispatch',
      entity: 'PublishTarget',
      entityId: target.id,
      metadata: { type: target.type, status: updated.status }
    });

    return updated;
  }

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_DEFAULT_CHANNEL_ID) {
    const updated = await prisma.publishTarget.update({
      where: { id: target.id },
      data: {
        status: 'FAILED',
        error: 'Telegram bot token or default channel id is not configured.'
      }
    });

    await recordAudit({
      actorId,
      action: 'publishing.telegram.failed',
      entity: 'PublishTarget',
      entityId: target.id,
      metadata: { reason: 'missing_telegram_configuration' }
    });

    return updated;
  }

  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_DEFAULT_CHANNEL_ID,
      text: target.payload?.text || socialTextFor(target.article, 'TELEGRAM'),
      parse_mode: 'HTML',
      disable_web_page_preview: false
    })
  });
  const body = await response.json();

  if (!response.ok || !body.ok) {
    const updated = await prisma.publishTarget.update({
      where: { id: target.id },
      data: {
        status: 'FAILED',
        error: body.description || `Telegram request failed with status ${response.status}`
      }
    });

    await recordAudit({
      actorId,
      action: 'publishing.telegram.failed',
      entity: 'PublishTarget',
      entityId: target.id,
      metadata: { status: response.status }
    });

    return updated;
  }

  const updated = await prisma.publishTarget.update({
    where: { id: target.id },
    data: {
      status: 'PUBLISHED',
      externalId: String(body.result?.message_id || ''),
      publishedAt: new Date(),
      error: null
    }
  });

  await recordAudit({
    actorId,
    action: 'publishing.telegram.published',
    entity: 'PublishTarget',
    entityId: target.id,
    metadata: { externalId: updated.externalId }
  });

  return updated;
}

async function getAppFeed({ limit = 50, category } = {}) {
  const articles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      ...(category ? { category } : {})
    },
    orderBy: [{ isBreaking: 'desc' }, { publishedAt: 'desc' }],
    take: limit,
    include: {
      region: true,
      topics: { include: { topic: true } },
      media: { include: { media: true } },
      publishTargets: {
        where: { type: 'APP_FEED', status: 'PUBLISHED' }
      }
    }
  });

  return articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    summary: article.summary,
    category: article.category,
    region: article.region,
    topics: article.topics.map((item) => item.topic),
    media: article.media.map((item) => item.media),
    isBreaking: article.isBreaking,
    publishedAt: article.publishedAt,
    url: articleUrl(article)
  }));
}

async function generateRssFeed({ limit = 50 } = {}) {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: {
      author: { select: { name: true, email: true } }
    }
  });

  const items = articles
    .map((article) => {
      const url = articleUrl(article);
      return [
        '<item>',
        `<title>${escapeXml(article.title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid>${escapeXml(url)}</guid>`,
        `<description>${escapeXml(article.summary || article.subtitle || '')}</description>`,
        `<pubDate>${new Date(article.publishedAt || article.createdAt).toUTCString()}</pubDate>`,
        article.author?.email ? `<author>${escapeXml(article.author.email)} (${escapeXml(article.author.name || 'Dira News')})</author>` : '',
        '</item>'
      ]
        .filter(Boolean)
        .join('');
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Dira News</title><link>${escapeXml(publicBaseUrl())}</link><description>Latest published Dira News stories</description>${items}</channel></rss>`;
}

async function generateSitemap({ limit = 500 } = {}) {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: limit
  });
  const urls = articles
    .map((article) => {
      return `<url><loc>${escapeXml(articleUrl(article))}</loc><lastmod>${new Date(article.updatedAt).toISOString()}</lastmod></url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

async function listPublishLogs({ type, status, articleId, limit = 100 } = {}) {
  return prisma.publishTarget.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(articleId ? { articleId } : {})
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      article: {
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          publishedAt: true
        }
      }
    }
  });
}

async function updateSocialDraftStatus({ draftId, actorId, input }) {
  const draft = await prisma.socialDraft.update({
    where: { id: draftId },
    data: cleanJsonObject({
      status: input.status,
      text: input.text,
      metadata: input.metadata
    })
  });

  await recordAudit({
    actorId,
    action: 'publishing.socialdraft.update',
    entity: 'SocialDraft',
    entityId: draft.id,
    metadata: { target: draft.target, status: draft.status }
  });

  return draft;
}

export {
  DEFAULT_CHANNELS,
  dispatchPublishTarget,
  generateRssFeed,
  generateSitemap,
  getAppFeed,
  listPublishLogs,
  publishArticleToChannels,
  updateSocialDraftStatus
};

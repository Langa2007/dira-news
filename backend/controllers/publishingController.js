import { z } from 'zod';
import {
  DEFAULT_CHANNELS,
  dispatchPublishTarget,
  generateRssFeed,
  generateSitemap,
  getAppFeed,
  listPublishLogs,
  publishArticleToChannels,
  updateSocialDraftStatus
} from '../services/publishingService.js';

const publishTargets = ['WEBSITE', 'APP_FEED', 'TELEGRAM', 'WHATSAPP_DRAFT', 'INSTAGRAM_DRAFT', 'X_DRAFT', 'RSS', 'SITEMAP'];
const publishStatuses = ['QUEUED', 'PUBLISHED', 'FAILED', 'CANCELLED'];
const categoryValues = ['LOCAL', 'WORLD', 'POLITICS', 'BUSINESS', 'TECHNOLOGY', 'SPORTS', 'ENTERTAINMENT', 'HEALTH', 'EDUCATION', 'OPINION'];

const publishSchema = z.object({
  channels: z.array(z.enum(publishTargets)).min(1).max(8).default(DEFAULT_CHANNELS)
});

const listLogsSchema = z.object({
  type: z.enum(publishTargets).optional(),
  status: z.enum(publishStatuses).optional(),
  articleId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100)
});

const feedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  category: z.enum(categoryValues).optional()
});

const sitemapQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).default(500)
});

const draftStatusSchema = z.object({
  status: z.string().min(1).max(80),
  text: z.string().min(1).max(5000).optional(),
  metadata: z.record(z.unknown()).optional()
});

async function publishArticle(req, res) {
  const input = publishSchema.parse(req.body);
  const result = await publishArticleToChannels({
    articleId: req.params.id,
    actorId: req.user.id,
    channels: input.channels
  });

  res.json(result);
}

async function dispatchTarget(req, res) {
  const target = await dispatchPublishTarget({
    targetId: req.params.id,
    actorId: req.user.id
  });

  res.json({ target });
}

async function getLogs(req, res) {
  const query = listLogsSchema.parse(req.query);
  const logs = await listPublishLogs(query);

  res.json({ logs });
}

async function getAppFeedJson(req, res) {
  const query = feedQuerySchema.parse(req.query);
  const feed = await getAppFeed(query);

  res.json({ feed });
}

async function getRssXml(req, res) {
  const query = feedQuerySchema.omit({ category: true }).parse(req.query);
  const xml = await generateRssFeed(query);

  res.type('application/rss+xml').send(xml);
}

async function getSitemapXml(req, res) {
  const query = sitemapQuerySchema.parse(req.query);
  const xml = await generateSitemap(query);

  res.type('application/xml').send(xml);
}

async function updateDraftStatus(req, res) {
  const input = draftStatusSchema.parse(req.body);
  const draft = await updateSocialDraftStatus({
    draftId: req.params.id,
    actorId: req.user.id,
    input
  });

  res.json({ draft });
}

export { dispatchTarget, getAppFeedJson, getLogs, getRssXml, getSitemapXml, publishArticle, updateDraftStatus };

import { z } from 'zod';
import prisma from '../models/prisma.js';
import { recordAudit } from '../services/auditService.js';
import { publishArticleToChannels } from '../services/publishingService.js';
import { getRankedHotNews } from '../services/recommendationService.js';
import { makeSlug } from '../utils/slug.js';

const categoryValues = ['LOCAL', 'WORLD', 'POLITICS', 'BUSINESS', 'TECHNOLOGY', 'SPORTS', 'ENTERTAINMENT', 'HEALTH', 'EDUCATION', 'OPINION'];

const createArticleSchema = z.object({
  title: z.string().min(1).max(240),
  subtitle: z.string().max(500).optional(),
  category: z.enum(categoryValues),
  regionId: z.string().optional(),
  clusterId: z.string().optional(),
  body: z.string().optional(),
  summary: z.string().max(1200).optional(),
  seoTitle: z.string().max(240).optional(),
  seoDescription: z.string().max(320).optional(),
  isBreaking: z.boolean().default(false),
  topicIds: z.array(z.string()).default([])
});

async function listArticles(req, res) {
  const status = req.query.status;
  const category = req.query.category;

  const articles = await prisma.article.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(category ? { category } : {})
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 50,
    include: {
      author: { select: { id: true, name: true, email: true } },
      topics: { include: { topic: true } }
    }
  });

  res.json({ articles });
}

async function listHotNews(req, res) {
  const [localResult, worldResult] = await Promise.all([getRankedHotNews('local', { limit: 10 }), getRankedHotNews('world', { limit: 10 })]);
  const serialize = (items) =>
    items.map((item) => ({
      ...item.article,
      recommendation: {
        score: item.score,
        signals: item.signals
      }
    }));

  res.json({
    localHotNews: serialize(localResult.feed),
    worldHotNews: serialize(worldResult.feed)
  });
}

async function createArticle(req, res) {
  const input = createArticleSchema.parse(req.body);
  const baseSlug = makeSlug(input.title);
  const slug = await uniqueSlug(baseSlug);

  const article = await prisma.article.create({
    data: {
      slug,
      title: input.title,
      subtitle: input.subtitle,
      category: input.category,
      regionId: input.regionId,
      clusterId: input.clusterId,
      body: input.body,
      summary: input.summary,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      isBreaking: input.isBreaking,
      authorId: req.user.id,
      versions: {
        create: {
          version: 1,
          title: input.title,
          body: input.body,
          summary: input.summary,
          editorId: req.user.id
        }
      },
      topics: {
        create: input.topicIds.map((topicId) => ({
          topicId,
          weight: 1
        }))
      }
    },
    include: {
      topics: { include: { topic: true } }
    }
  });

  await recordAudit({
    actorId: req.user.id,
    action: 'article.create',
    entity: 'Article',
    entityId: article.id,
    metadata: { title: article.title, category: article.category }
  });

  res.status(201).json({ article });
}

async function publishArticle(req, res) {
  const result = await publishArticleToChannels({
    articleId: req.params.id,
    actorId: req.user.id
  });

  res.json(result);
}

async function uniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 2;

  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

export { listArticles, listHotNews, createArticle, publishArticle };

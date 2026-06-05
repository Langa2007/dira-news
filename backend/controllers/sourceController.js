import { z } from 'zod';
import prisma from '../models/prisma.js';
import { recordAudit } from '../services/auditService.js';
import { addJob, QUEUE_NAMES } from '../services/queueService.js';

const sourceSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['RSS', 'API', 'STATIC_PAGE', 'RENDERED_PAGE', 'SOCIAL_PUBLIC', 'DATASET', 'PRESS_RELEASE', 'LICENSED_FEED']),
  homepageUrl: z.string().url().optional(),
  feedUrl: z.string().url().optional(),
  apiUrl: z.string().url().optional(),
  regionId: z.string().optional(),
  category: z.enum(['LOCAL', 'WORLD', 'POLITICS', 'BUSINESS', 'TECHNOLOGY', 'SPORTS', 'ENTERTAINMENT', 'HEALTH', 'EDUCATION', 'OPINION']).optional(),
  crawlIntervalMins: z.number().int().min(5).max(10080).default(60),
  credibilityScore: z.number().min(0).max(1).default(0.5),
  termsNotes: z.string().max(1000).optional()
});

const sourceDocumentSchema = z.object({
  canonicalUrl: z.string().url().optional(),
  title: z.string().min(1).max(500),
  author: z.string().max(200).optional(),
  publishedAt: z.string().datetime().optional(),
  extractedText: z.string().optional(),
  textHash: z.string().max(128).optional(),
  metadata: z.record(z.unknown()).optional()
});

async function listSources(req, res) {
  const sources = await prisma.source.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  res.json({ sources });
}

async function createSource(req, res) {
  const input = sourceSchema.parse(req.body);
  const source = await prisma.source.create({ data: input });

  await recordAudit({
    actorId: req.user.id,
    action: 'source.create',
    entity: 'Source',
    entityId: source.id,
    metadata: { name: source.name, type: source.type }
  });

  res.status(201).json({ source });
}

async function queueSourceFetch(req, res) {
  const source = await prisma.source.findUnique({ where: { id: req.params.id } });

  if (!source) {
    return res.status(404).json({ error: { message: 'Source not found', statusCode: 404 } });
  }

  const url = source.feedUrl || source.apiUrl || source.homepageUrl;

  if (!url) {
    return res.status(400).json({ error: { message: 'Source has no fetchable URL', statusCode: 400 } });
  }

  const fetch = await prisma.sourceFetch.create({
    data: {
      sourceId: source.id,
      url,
      reason: 'manual-admin-queue'
    }
  });

  const job = await addJob(QUEUE_NAMES.SOURCE_ACQUISITION, 'fetch-source', {
    sourceId: source.id,
    fetchId: fetch.id,
    url
  });

  res.status(202).json({ fetch, jobId: job.id });
}

async function listSourceDocuments(req, res) {
  const documents = await prisma.sourceDocument.findMany({
    where: {
      ...(req.query.sourceId ? { sourceId: req.query.sourceId } : {})
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      source: true
    }
  });

  res.json({ documents });
}

async function createSourceDocument(req, res) {
  const input = sourceDocumentSchema.parse(req.body);
  const source = await prisma.source.findUnique({ where: { id: req.params.id } });

  if (!source) {
    return res.status(404).json({ error: { message: 'Source not found', statusCode: 404 } });
  }

  const document = await prisma.sourceDocument.create({
    data: {
      sourceId: source.id,
      canonicalUrl: input.canonicalUrl,
      title: input.title,
      author: input.author,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
      extractedText: input.extractedText,
      textHash: input.textHash,
      metadata: input.metadata
    }
  });

  await recordAudit({
    actorId: req.user.id,
    action: 'source.document.create',
    entity: 'SourceDocument',
    entityId: document.id,
    metadata: { sourceId: source.id }
  });

  res.status(201).json({ document });
}

export {
  listSources,
  createSource,
  queueSourceFetch,
  listSourceDocuments,
  createSourceDocument
};

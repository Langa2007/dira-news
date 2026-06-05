import { z } from 'zod';
import prisma from '../models/prisma.js';
import { emitRealtime } from '../services/realtimeService.js';
import { recordAudit } from '../services/auditService.js';

const categoryValues = ['LOCAL', 'WORLD', 'POLITICS', 'BUSINESS', 'TECHNOLOGY', 'SPORTS', 'ENTERTAINMENT', 'HEALTH', 'EDUCATION', 'OPINION'];

const storyClusterSchema = z.object({
  title: z.string().min(1).max(300),
  summary: z.string().max(2000).optional(),
  category: z.enum(categoryValues).optional(),
  localScore: z.number().min(0).max(1).default(0),
  worldScore: z.number().min(0).max(1).default(0),
  hotnessScore: z.number().min(0).max(1).default(0),
  confidenceScore: z.number().min(0).max(1).default(0),
  documentIds: z.array(z.string()).default([])
});

async function listStoryClusters(req, res) {
  const clusters = await prisma.storyCluster.findMany({
    where: {
      ...(req.query.status ? { status: req.query.status } : {})
    },
    orderBy: [{ hotnessScore: 'desc' }, { createdAt: 'desc' }],
    take: 100,
    include: {
      sources: {
        include: {
          document: {
            include: { source: true }
          }
        }
      }
    }
  });

  res.json({ clusters });
}

async function createStoryCluster(req, res) {
  const input = storyClusterSchema.parse(req.body);
  const cluster = await prisma.storyCluster.create({
    data: {
      title: input.title,
      summary: input.summary,
      category: input.category,
      localScore: input.localScore,
      worldScore: input.worldScore,
      hotnessScore: input.hotnessScore,
      confidenceScore: input.confidenceScore,
      sources: {
        create: input.documentIds.map((documentId) => ({
          documentId,
          confidence: input.confidenceScore || 0.5
        }))
      }
    },
    include: {
      sources: true
    }
  });

  emitRealtime('storycluster.created', {
    id: cluster.id,
    title: cluster.title,
    category: cluster.category,
    hotnessScore: cluster.hotnessScore
  });

  await recordAudit({
    actorId: req.user.id,
    action: 'storycluster.create',
    entity: 'StoryCluster',
    entityId: cluster.id
  });

  res.status(201).json({ cluster });
}

export { listStoryClusters, createStoryCluster };


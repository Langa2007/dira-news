import { z } from 'zod';
import prisma from '../models/prisma.js';
import { recordAudit } from '../services/auditService.js';

const preferenceSchema = z.object({
  topicIds: z.array(z.string()).default([]),
  regionIds: z.array(z.string()).default([])
});

const eventSchema = z.object({
  type: z.enum([
    'ARTICLE_OPEN',
    'READ_DEPTH',
    'SAVE',
    'SHARE',
    'SEARCH',
    'NOTIFICATION_CLICK',
    'HIDE_TOPIC',
    'FOLLOW_TOPIC'
  ]),
  articleId: z.string().optional(),
  topicId: z.string().optional(),
  value: z.number().optional(),
  metadata: z.record(z.unknown()).optional()
});

async function getPreferences(req, res) {
  const preferences = await prisma.userPreference.findMany({
    where: { userId: req.user.id },
    include: {
      topic: true,
      region: true
    }
  });

  res.json({ preferences });
}

async function updatePreferences(req, res) {
  const input = preferenceSchema.parse(req.body);

  await prisma.$transaction([
    prisma.userPreference.deleteMany({ where: { userId: req.user.id } }),
    ...input.topicIds.map((topicId) =>
      prisma.userPreference.create({
        data: {
          userId: req.user.id,
          topicId,
          weight: 1
        }
      })
    ),
    ...input.regionIds.map((regionId) =>
      prisma.userPreference.create({
        data: {
          userId: req.user.id,
          regionId,
          weight: 1
        }
      })
    ),
    prisma.recommendationProfile.upsert({
      where: { userId: req.user.id },
      update: {
        topicWeights: Object.fromEntries(input.topicIds.map((topicId) => [topicId, 1])),
        regionWeights: Object.fromEntries(input.regionIds.map((regionId) => [regionId, 1])),
        lastRefreshedAt: new Date()
      },
      create: {
        userId: req.user.id,
        topicWeights: Object.fromEntries(input.topicIds.map((topicId) => [topicId, 1])),
        regionWeights: Object.fromEntries(input.regionIds.map((regionId) => [regionId, 1])),
        lastRefreshedAt: new Date()
      }
    })
  ]);

  await recordAudit({
    actorId: req.user.id,
    action: 'user.preferences.update',
    entity: 'User',
    entityId: req.user.id,
    metadata: input
  });

  res.json({ ok: true });
}

async function createUserEvent(req, res) {
  const input = eventSchema.parse(req.body);

  const event = await prisma.userEvent.create({
    data: {
      userId: req.user.id,
      type: input.type,
      articleId: input.articleId,
      topicId: input.topicId,
      value: input.value,
      metadata: input.metadata
    }
  });

  res.status(201).json({ event });
}

export { getPreferences, updatePreferences, createUserEvent };

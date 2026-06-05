import { z } from 'zod';
import prisma from '../models/prisma.js';
import { makeSlug } from '../utils/slug.js';
import { recordAudit } from '../services/auditService.js';

const categoryValues = ['LOCAL', 'WORLD', 'POLITICS', 'BUSINESS', 'TECHNOLOGY', 'SPORTS', 'ENTERTAINMENT', 'HEALTH', 'EDUCATION', 'OPINION'];

const topicSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(140).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(categoryValues).optional()
});

async function listTopics(req, res) {
  const topics = await prisma.topic.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }]
  });

  res.json({ topics });
}

async function createTopic(req, res) {
  const input = topicSchema.parse(req.body);
  const topic = await prisma.topic.create({
    data: {
      name: input.name,
      slug: input.slug ? makeSlug(input.slug) : makeSlug(input.name),
      description: input.description,
      category: input.category
    }
  });

  await recordAudit({
    actorId: req.user.id,
    action: 'topic.create',
    entity: 'Topic',
    entityId: topic.id
  });

  res.status(201).json({ topic });
}

export { listTopics, createTopic };


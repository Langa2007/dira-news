import { z } from 'zod';
import prisma from '../models/prisma.js';
import { makeSlug } from '../utils/slug.js';
import { recordAudit } from '../services/auditService.js';

const regionSchema = z.object({
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(180).optional(),
  countryCode: z.string().min(2).max(3).optional(),
  parentId: z.string().optional()
});

async function listRegions(req, res) {
  const regions = await prisma.region.findMany({
    orderBy: { name: 'asc' },
    include: {
      parent: true
    }
  });

  res.json({ regions });
}

async function createRegion(req, res) {
  const input = regionSchema.parse(req.body);
  const region = await prisma.region.create({
    data: {
      name: input.name,
      slug: input.slug ? makeSlug(input.slug) : makeSlug(input.name),
      countryCode: input.countryCode,
      parentId: input.parentId
    }
  });

  await recordAudit({
    actorId: req.user.id,
    action: 'region.create',
    entity: 'Region',
    entityId: region.id
  });

  res.status(201).json({ region });
}

export { listRegions, createRegion };


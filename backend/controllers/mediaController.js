import { z } from 'zod';
import prisma from '../models/prisma.js';
import { recordAudit } from '../services/auditService.js';

const mediaSchema = z.object({
  url: z.string().url(),
  storageKey: z.string().max(500).optional(),
  title: z.string().max(200).optional(),
  altText: z.string().max(300).optional(),
  sourceUrl: z.string().url().optional(),
  owner: z.string().max(200).optional(),
  licenseType: z.string().max(120).optional(),
  attribution: z.string().max(500).optional(),
  licenseStatus: z.enum(['UNKNOWN', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED']).default('NEEDS_REVIEW'),
  metadata: z.record(z.unknown()).optional()
});

async function listMedia(req, res) {
  const media = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  res.json({ media });
}

async function createMedia(req, res) {
  const input = mediaSchema.parse(req.body);
  const media = await prisma.mediaAsset.create({ data: input });

  await recordAudit({
    actorId: req.user.id,
    action: 'media.create',
    entity: 'MediaAsset',
    entityId: media.id,
    metadata: { licenseStatus: media.licenseStatus }
  });

  res.status(201).json({ media });
}

export { listMedia, createMedia };


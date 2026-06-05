import { z } from 'zod';
import prisma from '../models/prisma.js';
import { emitRealtime } from '../services/realtimeService.js';
import { recordAudit } from '../services/auditService.js';

const draftSchema = z.object({
  articleId: z.string().optional(),
  target: z.enum(['WHATSAPP_DRAFT', 'INSTAGRAM_DRAFT', 'X_DRAFT', 'TELEGRAM']),
  text: z.string().min(1).max(5000),
  status: z.string().max(80).default('DRAFT'),
  metadata: z.record(z.unknown()).optional()
});

async function listSocialDrafts(req, res) {
  const drafts = await prisma.socialDraft.findMany({
    where: {
      ...(req.query.target ? { target: req.query.target } : {}),
      ...(req.query.status ? { status: req.query.status } : {})
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      article: true
    }
  });

  res.json({ drafts });
}

async function createSocialDraft(req, res) {
  const input = draftSchema.parse(req.body);
  const draft = await prisma.socialDraft.create({ data: input });

  emitRealtime('socialdraft.created', {
    id: draft.id,
    target: draft.target,
    articleId: draft.articleId
  });

  await recordAudit({
    actorId: req.user.id,
    action: 'socialdraft.create',
    entity: 'SocialDraft',
    entityId: draft.id,
    metadata: { target: draft.target }
  });

  res.status(201).json({ draft });
}

export { listSocialDrafts, createSocialDraft };


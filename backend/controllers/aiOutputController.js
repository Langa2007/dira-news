import { z } from 'zod';
import prisma from '../models/prisma.js';
import { recordAudit } from '../services/auditService.js';

const aiOutputTypes = [
  'ENTITY_EXTRACTION',
  'CLAIM_EXTRACTION',
  'STORY_CLUSTER_SUMMARY',
  'FACT_TABLE',
  'ARTICLE_OUTLINE',
  'ARTICLE_DRAFT',
  'HEADLINE_OPTIONS',
  'SEO_METADATA',
  'TELEGRAM_CAPTION',
  'WHATSAPP_HOOK',
  'X_DRAFT',
  'INSTAGRAM_CAPTION',
  'BIAS_SCAN',
  'SIMILARITY_SCAN',
  'CONTRADICTION_SCAN'
];

const aiOutputSchema = z.object({
  type: z.enum(aiOutputTypes),
  provider: z.string().min(1).max(100),
  model: z.string().min(1).max(120),
  promptKey: z.string().max(160).optional(),
  promptHash: z.string().max(160).optional(),
  input: z.record(z.unknown()),
  output: z.record(z.unknown()),
  score: z.number().min(0).max(1).optional(),
  clusterId: z.string().optional(),
  articleId: z.string().optional()
});

async function listAiOutputs(req, res) {
  const outputs = await prisma.aiOutput.findMany({
    where: {
      ...(req.query.articleId ? { articleId: req.query.articleId } : {}),
      ...(req.query.clusterId ? { clusterId: req.query.clusterId } : {}),
      ...(req.query.type ? { type: req.query.type } : {})
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  res.json({ outputs });
}

async function createAiOutput(req, res) {
  const input = aiOutputSchema.parse(req.body);
  const output = await prisma.aiOutput.create({ data: input });

  await recordAudit({
    actorId: req.user.id,
    action: 'aioutput.create',
    entity: 'AiOutput',
    entityId: output.id,
    metadata: { type: output.type, provider: output.provider, model: output.model }
  });

  res.status(201).json({ output });
}

export { listAiOutputs, createAiOutput };


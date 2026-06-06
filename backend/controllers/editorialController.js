import { z } from 'zod';
import {
  addEditorialComment,
  attachSourceEvidence,
  createArticleVersion,
  createCorrection,
  getEditorialArticleWorkflow,
  reviewClaim,
  reviewMediaLicense,
  reviewStoryCluster,
  runEditorialAssistant,
  scheduleArticlePublish
} from '../services/editorialService.js';

const categoryValues = ['LOCAL', 'WORLD', 'POLITICS', 'BUSINESS', 'TECHNOLOGY', 'SPORTS', 'ENTERTAINMENT', 'HEALTH', 'EDUCATION', 'OPINION'];
const clusterStatuses = ['CANDIDATE', 'REVIEWING', 'APPROVED', 'DISMISSED', 'MERGED'];
const articleStatuses = ['DRAFT', 'REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED', 'CORRECTED'];
const licenseStatuses = ['UNKNOWN', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED'];
const publishTargets = ['WEBSITE', 'APP_FEED', 'TELEGRAM', 'WHATSAPP_DRAFT', 'INSTAGRAM_DRAFT', 'X_DRAFT', 'RSS', 'SITEMAP'];
const assistantTasks = ['ARTICLE_OUTLINE', 'ARTICLE_DRAFT', 'HEADLINE_OPTIONS', 'SEO_METADATA', 'BIAS_SCAN', 'SIMILARITY_SCAN', 'CONTRADICTION_SCAN'];

const clusterReviewSchema = z.object({
  status: z.enum(clusterStatuses),
  summary: z.string().max(2000).optional(),
  category: z.enum(categoryValues).optional(),
  localScore: z.number().min(0).max(1).optional(),
  worldScore: z.number().min(0).max(1).optional(),
  hotnessScore: z.number().min(0).max(1).optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  notes: z.string().max(2000).optional()
});

const articleVersionSchema = z.object({
  title: z.string().min(1).max(240).optional(),
  subtitle: z.string().max(500).optional(),
  body: z.string().optional(),
  summary: z.string().max(1200).optional(),
  seoTitle: z.string().max(240).optional(),
  seoDescription: z.string().max(320).optional(),
  status: z.enum(articleStatuses).optional()
});

const commentSchema = z.object({
  status: z.string().min(1).max(80).default('COMMENT'),
  notes: z.string().min(1).max(4000)
});

const evidenceSchema = z.object({
  documentId: z.string().min(1),
  text: z.string().min(1).max(4000),
  status: z.string().min(1).max(80).default('EVIDENCE_ATTACHED'),
  confidence: z.number().min(0).max(1).optional(),
  evidenceType: z.string().min(1).max(80).optional(),
  note: z.string().max(1000).optional()
});

const claimReviewSchema = z.object({
  status: z.string().min(1).max(80),
  confidence: z.number().min(0).max(1).optional(),
  note: z.string().max(1000).optional(),
  metadata: z.record(z.unknown()).optional()
});

const licenseReviewSchema = z.object({
  licenseStatus: z.enum(licenseStatuses),
  licenseType: z.string().max(120).optional(),
  attribution: z.string().max(500).optional(),
  owner: z.string().max(200).optional(),
  note: z.string().max(1000).optional(),
  metadata: z.record(z.unknown()).optional()
});

const scheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
  targets: z.array(z.enum(publishTargets)).min(1).max(8).optional()
});

const correctionSchema = z.object({
  correctionNote: z.string().min(1).max(2000),
  title: z.string().min(1).max(240).optional(),
  body: z.string().optional(),
  summary: z.string().max(1200).optional(),
  seoTitle: z.string().max(240).optional(),
  seoDescription: z.string().max(320).optional()
});

const assistantSchema = z.object({
  task: z.enum(assistantTasks),
  articleId: z.string().optional(),
  clusterId: z.string().optional(),
  promptKey: z.string().max(160).optional(),
  instructions: z.string().max(2000).optional(),
  context: z.record(z.unknown()).optional()
});

async function getArticleWorkflow(req, res) {
  const workflow = await getEditorialArticleWorkflow(req.params.id);
  res.json(workflow);
}

async function reviewCluster(req, res) {
  const input = clusterReviewSchema.parse(req.body);
  const cluster = await reviewStoryCluster({
    clusterId: req.params.id,
    reviewerId: req.user.id,
    input
  });

  res.json({ cluster });
}

async function updateArticleVersion(req, res) {
  const input = articleVersionSchema.parse(req.body);
  const result = await createArticleVersion({
    articleId: req.params.id,
    editorId: req.user.id,
    input
  });

  res.json(result);
}

async function createComment(req, res) {
  const input = commentSchema.parse(req.body);
  const review = await addEditorialComment({
    articleId: req.params.id,
    reviewerId: req.user.id,
    input
  });

  res.status(201).json({ review });
}

async function attachEvidence(req, res) {
  const input = evidenceSchema.parse(req.body);
  const claim = await attachSourceEvidence({
    articleId: req.params.id,
    actorId: req.user.id,
    input
  });

  res.status(201).json({ claim });
}

async function updateClaimReview(req, res) {
  const input = claimReviewSchema.parse(req.body);
  const claim = await reviewClaim({
    claimId: req.params.id,
    reviewerId: req.user.id,
    input
  });

  res.json({ claim });
}

async function updateMediaLicense(req, res) {
  const input = licenseReviewSchema.parse(req.body);
  const media = await reviewMediaLicense({
    mediaId: req.params.id,
    reviewerId: req.user.id,
    input
  });

  res.json({ media });
}

async function scheduleArticle(req, res) {
  const input = scheduleSchema.parse(req.body);
  const article = await scheduleArticlePublish({
    articleId: req.params.id,
    actorId: req.user.id,
    input
  });

  res.json({ article });
}

async function correctArticle(req, res) {
  const input = correctionSchema.parse(req.body);
  const result = await createCorrection({
    articleId: req.params.id,
    actorId: req.user.id,
    input
  });

  res.status(201).json(result);
}

async function runAssistant(req, res) {
  const input = assistantSchema.parse(req.body);
  const output = await runEditorialAssistant({
    actorId: req.user.id,
    input
  });

  res.status(201).json({ output });
}

export {
  attachEvidence,
  correctArticle,
  createComment,
  getArticleWorkflow,
  reviewCluster,
  runAssistant,
  scheduleArticle,
  updateArticleVersion,
  updateClaimReview,
  updateMediaLicense
};

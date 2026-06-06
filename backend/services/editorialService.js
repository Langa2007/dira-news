import prisma from '../models/prisma.js';
import { recordAudit } from './auditService.js';
import { addJob, QUEUE_NAMES } from './queueService.js';
import { emitRealtime } from './realtimeService.js';

const PUBLISH_TARGETS = ['WEBSITE', 'APP_FEED', 'TELEGRAM', 'WHATSAPP_DRAFT', 'INSTAGRAM_DRAFT', 'X_DRAFT'];

function cleanJsonObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

async function validateArticleMediaLicenses(articleId) {
  const mediaLinks = await prisma.articleMedia.findMany({
    where: { articleId },
    include: { media: true }
  });
  const blockedMedia = mediaLinks
    .map((link) => link.media)
    .filter((media) => media.licenseStatus !== 'APPROVED');

  if (blockedMedia.length > 0) {
    const error = new Error('Article has media assets without approved licenses.');
    error.statusCode = 409;
    error.details = blockedMedia.map((media) => ({
      id: media.id,
      title: media.title,
      licenseStatus: media.licenseStatus
    }));
    throw error;
  }

  return { checked: mediaLinks.length, blocked: 0 };
}

async function reviewStoryCluster({ clusterId, reviewerId, input }) {
  const cluster = await prisma.storyCluster.update({
    where: { id: clusterId },
    data: {
      status: input.status,
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.localScore !== undefined ? { localScore: input.localScore } : {}),
      ...(input.worldScore !== undefined ? { worldScore: input.worldScore } : {}),
      ...(input.hotnessScore !== undefined ? { hotnessScore: input.hotnessScore } : {}),
      ...(input.confidenceScore !== undefined ? { confidenceScore: input.confidenceScore } : {})
    },
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

  await recordAudit({
    actorId: reviewerId,
    action: 'editorial.storycluster.review',
    entity: 'StoryCluster',
    entityId: cluster.id,
    metadata: { status: cluster.status, notes: input.notes }
  });

  emitRealtime('storycluster.reviewed', {
    id: cluster.id,
    status: cluster.status,
    category: cluster.category,
    hotnessScore: cluster.hotnessScore
  });

  return cluster;
}

async function createArticleVersion({ articleId, editorId, input }) {
  return prisma.$transaction(async (tx) => {
    const article = await tx.article.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      const error = new Error('Article not found');
      error.statusCode = 404;
      throw error;
    }

    const latestVersion = await tx.articleVersion.findFirst({
      where: { articleId },
      orderBy: { version: 'desc' }
    });
    const nextVersion = (latestVersion?.version || 0) + 1;

    const updatedArticle = await tx.article.update({
      where: { id: articleId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
        ...(input.body !== undefined ? { body: input.body } : {}),
        ...(input.summary !== undefined ? { summary: input.summary } : {}),
        ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
        ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription } : {}),
        ...(input.status !== undefined ? { status: input.status } : { status: 'REVIEW' }),
        editorId
      }
    });

    const version = await tx.articleVersion.create({
      data: {
        articleId,
        version: nextVersion,
        title: updatedArticle.title,
        body: updatedArticle.body,
        summary: updatedArticle.summary,
        editorId
      }
    });

    return { article: updatedArticle, version };
  });
}

async function addEditorialComment({ articleId, reviewerId, input }) {
  const review = await prisma.editorialReview.create({
    data: {
      articleId,
      reviewerId,
      status: input.status || 'COMMENT',
      notes: input.notes
    },
    include: {
      reviewer: { select: { id: true, name: true, email: true } }
    }
  });

  await recordAudit({
    actorId: reviewerId,
    action: 'editorial.comment.create',
    entity: 'EditorialReview',
    entityId: review.id,
    metadata: { articleId, status: review.status }
  });

  return review;
}

async function attachSourceEvidence({ articleId, actorId, input }) {
  const claim = await prisma.claim.create({
    data: {
      articleId,
      documentId: input.documentId,
      text: input.text,
      status: input.status || 'EVIDENCE_ATTACHED',
      confidence: input.confidence ?? 0.5,
      metadata: cleanJsonObject({
        evidenceType: input.evidenceType || 'SOURCE_DOCUMENT',
        note: input.note
      })
    },
    include: {
      document: {
        include: { source: true }
      },
      article: { select: { id: true, title: true, slug: true } }
    }
  });

  await recordAudit({
    actorId,
    action: 'editorial.evidence.attach',
    entity: 'Claim',
    entityId: claim.id,
    metadata: { articleId, documentId: input.documentId, status: claim.status }
  });

  return claim;
}

async function reviewClaim({ claimId, reviewerId, input }) {
  const claim = await prisma.claim.update({
    where: { id: claimId },
    data: {
      status: input.status,
      ...(input.confidence !== undefined ? { confidence: input.confidence } : {}),
      metadata: cleanJsonObject({
        ...(input.metadata || {}),
        reviewNote: input.note,
        reviewedBy: reviewerId,
        reviewedAt: new Date().toISOString()
      })
    },
    include: {
      document: {
        include: { source: true }
      },
      article: { select: { id: true, title: true, slug: true } }
    }
  });

  await recordAudit({
    actorId: reviewerId,
    action: 'editorial.claim.review',
    entity: 'Claim',
    entityId: claim.id,
    metadata: { status: claim.status, confidence: claim.confidence }
  });

  return claim;
}

async function reviewMediaLicense({ mediaId, reviewerId, input }) {
  const media = await prisma.mediaAsset.update({
    where: { id: mediaId },
    data: {
      licenseStatus: input.licenseStatus,
      ...(input.licenseType !== undefined ? { licenseType: input.licenseType } : {}),
      ...(input.attribution !== undefined ? { attribution: input.attribution } : {}),
      ...(input.owner !== undefined ? { owner: input.owner } : {}),
      metadata: cleanJsonObject({
        ...(input.metadata || {}),
        reviewNote: input.note,
        reviewedBy: reviewerId,
        reviewedAt: new Date().toISOString()
      })
    }
  });

  await recordAudit({
    actorId: reviewerId,
    action: 'editorial.media.license.review',
    entity: 'MediaAsset',
    entityId: media.id,
    metadata: { licenseStatus: media.licenseStatus }
  });

  return media;
}

async function scheduleArticlePublish({ articleId, actorId, input }) {
  const scheduledAt = new Date(input.scheduledAt);

  if (scheduledAt.getTime() <= Date.now()) {
    const error = new Error('scheduledAt must be in the future');
    error.statusCode = 400;
    throw error;
  }

  await validateArticleMediaLicenses(articleId);

  const targets = input.targets?.length ? input.targets : PUBLISH_TARGETS;
  const article = await prisma.article.update({
    where: { id: articleId },
    data: {
      status: 'SCHEDULED',
      scheduledAt,
      editorId: actorId,
      publishTargets: {
        create: targets.map((target) => ({
          type: target,
          status: 'QUEUED',
          scheduledAt,
          payload: { scheduledBy: actorId }
        }))
      }
    },
    include: {
      publishTargets: true
    }
  });

  await addJob(QUEUE_NAMES.PUBLISHING, 'scheduled-publish', {
    articleId,
    scheduledAt: scheduledAt.toISOString(),
    targets
  });

  await recordAudit({
    actorId,
    action: 'editorial.article.schedule',
    entity: 'Article',
    entityId: article.id,
    metadata: { scheduledAt: scheduledAt.toISOString(), targets }
  });

  emitRealtime('article.scheduled', {
    id: article.id,
    title: article.title,
    scheduledAt: article.scheduledAt
  });

  return article;
}

async function createCorrection({ articleId, actorId, input }) {
  const result = await createArticleVersion({
    articleId,
    editorId: actorId,
    input: {
      title: input.title,
      body: input.body,
      summary: input.summary,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      status: 'CORRECTED'
    }
  });

  const [review, publishTarget] = await Promise.all([
    prisma.editorialReview.create({
      data: {
        articleId,
        reviewerId: actorId,
        status: 'CORRECTION',
        notes: input.correctionNote
      }
    }),
    prisma.publishTarget.create({
      data: {
        articleId,
        type: 'WEBSITE',
        status: 'QUEUED',
        payload: {
          correctionNote: input.correctionNote,
          correctedVersion: result.version.version
        }
      }
    })
  ]);

  await addJob(QUEUE_NAMES.PUBLISHING, 'publish-correction', {
    articleId,
    correctionNote: input.correctionNote,
    version: result.version.version
  });

  await recordAudit({
    actorId,
    action: 'editorial.article.correct',
    entity: 'Article',
    entityId: articleId,
    metadata: { correctionReviewId: review.id, version: result.version.version }
  });

  emitRealtime('article.corrected', {
    id: articleId,
    version: result.version.version
  });

  return { ...result, review, publishTarget };
}

async function getEditorialArticleWorkflow(articleId) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      author: { select: { id: true, name: true, email: true } },
      editor: { select: { id: true, name: true, email: true } },
      region: true,
      cluster: true,
      versions: { orderBy: { version: 'desc' } },
      topics: { include: { topic: true } },
      media: { include: { media: true } },
      claims: {
        include: {
          document: {
            include: { source: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      reviews: {
        include: { reviewer: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      },
      publishTargets: { orderBy: { createdAt: 'desc' } },
      aiOutputs: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!article) {
    const error = new Error('Article not found');
    error.statusCode = 404;
    throw error;
  }

  const mediaReady = article.media.every((link) => link.media.licenseStatus === 'APPROVED');
  const reviewedClaims = article.claims.filter((claim) => ['VERIFIED', 'REJECTED', 'DISPUTED'].includes(claim.status)).length;

  return {
    article,
    readiness: {
      hasVersion: article.versions.length > 0,
      hasEvidence: article.claims.length > 0,
      reviewedClaims,
      mediaReady,
      scheduled: article.status === 'SCHEDULED' && Boolean(article.scheduledAt),
      published: article.status === 'PUBLISHED'
    }
  };
}

function summarizeText(text, maxLength = 240) {
  if (!text) {
    return '';
  }

  return text.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function buildAssistantOutput(article, task) {
  const title = article?.title || 'Untitled article';
  const bodySummary = summarizeText(article?.body || article?.summary || '', 320);

  if (task === 'HEADLINE_OPTIONS') {
    return {
      options: [
        title,
        `${title}: what readers need to know`,
        `${title} as officials weigh next steps`
      ]
    };
  }

  if (task === 'SEO_METADATA') {
    return {
      seoTitle: title.slice(0, 70),
      seoDescription: (article?.summary || bodySummary || title).slice(0, 155)
    };
  }

  if (task === 'BIAS_SCAN') {
    return {
      risk: 'REVIEW_NEEDED',
      checks: ['Verify loaded language', 'Confirm attribution for claims', 'Balance official and affected-person perspectives']
    };
  }

  if (task === 'CONTRADICTION_SCAN') {
    return {
      risk: 'REVIEW_NEEDED',
      checks: ['Compare article claims against attached evidence', 'Flag numbers and names for manual verification']
    };
  }

  if (task === 'SIMILARITY_SCAN') {
    return {
      risk: 'REVIEW_NEEDED',
      checks: ['Compare phrasing against source documents', 'Rewrite source-like sentences in original language']
    };
  }

  return {
    outline: [
      { section: 'Lead', prompt: `Summarize the latest confirmed development in "${title}".` },
      { section: 'Context', prompt: bodySummary || 'Add the verified background and affected location.' },
      { section: 'Evidence', prompt: 'Tie each key claim to a source document or editorial note.' },
      { section: 'Next steps', prompt: 'State what remains developing or awaiting confirmation.' }
    ]
  };
}

async function runEditorialAssistant({ actorId, input }) {
  const article = input.articleId
    ? await prisma.article.findUnique({
        where: { id: input.articleId },
        include: {
          claims: true,
          cluster: true,
          topics: { include: { topic: true } }
        }
      })
    : null;

  const output = buildAssistantOutput(article, input.task);
  const aiOutput = await prisma.aiOutput.create({
    data: {
      type: input.task,
      provider: 'dira-editorial-assistant',
      model: 'workflow-rules-v1',
      promptKey: input.promptKey || `editorial.${input.task.toLowerCase()}`,
      input: {
        articleId: input.articleId,
        clusterId: input.clusterId,
        instructions: input.instructions,
        context: input.context
      },
      output,
      articleId: input.articleId,
      clusterId: input.clusterId,
      score: 0.5
    }
  });

  await recordAudit({
    actorId,
    action: 'editorial.assistant.run',
    entity: 'AiOutput',
    entityId: aiOutput.id,
    metadata: { task: input.task, articleId: input.articleId, clusterId: input.clusterId }
  });

  return aiOutput;
}

export {
  addEditorialComment,
  attachSourceEvidence,
  createArticleVersion,
  createCorrection,
  getEditorialArticleWorkflow,
  reviewClaim,
  reviewMediaLicense,
  reviewStoryCluster,
  runEditorialAssistant,
  scheduleArticlePublish,
  validateArticleMediaLicenses
};

import { z } from 'zod';
import { recordAudit } from '../services/auditService.js';
import {
  enqueueRecommendationRefresh,
  getRankedFeed,
  getRankedHotNews,
  refreshRecommendationProfile
} from '../services/recommendationService.js';

const feedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  refresh: z.enum(['true', 'false']).optional()
});

function serializeRankedFeed(rankedItems) {
  return rankedItems.map((item) => ({
    ...item.article,
    recommendation: {
      score: item.score,
      signals: item.signals
    }
  }));
}

async function getMyFeed(req, res) {
  const query = feedQuerySchema.parse(req.query);
  const result = await getRankedFeed(req.user.id, {
    limit: query.limit,
    refresh: query.refresh === 'true'
  });

  res.json({
    feed: serializeRankedFeed(result.feed),
    explanation: result.explanation,
    profile: {
      id: result.profile.id,
      lastRefreshedAt: result.profile.lastRefreshedAt,
      topicWeights: result.profile.topicWeights,
      regionWeights: result.profile.regionWeights
    }
  });
}

async function getLocalHotNews(req, res) {
  const query = feedQuerySchema.omit({ refresh: true }).parse(req.query);
  const result = await getRankedHotNews('local', { limit: query.limit });

  res.json({
    localHotNews: serializeRankedFeed(result.feed),
    explanation: result.explanation
  });
}

async function getWorldHotNews(req, res) {
  const query = feedQuerySchema.omit({ refresh: true }).parse(req.query);
  const result = await getRankedHotNews('world', { limit: query.limit });

  res.json({
    worldHotNews: serializeRankedFeed(result.feed),
    explanation: result.explanation
  });
}

async function refreshMyRecommendations(req, res) {
  const profile = await refreshRecommendationProfile(req.user.id);

  await recordAudit({
    actorId: req.user.id,
    action: 'recommendation.profile.refresh',
    entity: 'RecommendationProfile',
    entityId: profile.id
  });

  res.json({ profile });
}

async function queueMyRecommendationRefresh(req, res) {
  const job = await enqueueRecommendationRefresh(req.user.id, {
    reason: 'user_requested'
  });

  await recordAudit({
    actorId: req.user.id,
    action: 'recommendation.profile.refresh.queue',
    entity: 'User',
    entityId: req.user.id,
    metadata: { jobId: job.id }
  });

  res.status(202).json({
    job: {
      id: job.id,
      name: job.name,
      queueName: job.queueName
    }
  });
}

export { getLocalHotNews, getMyFeed, getWorldHotNews, queueMyRecommendationRefresh, refreshMyRecommendations };

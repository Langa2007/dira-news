import { addJob, QUEUE_NAMES } from './queueService.js';
import prisma from '../models/prisma.js';

const PROFILE_REFRESH_WINDOW_DAYS = 90;
const PROFILE_STALE_MS = 30 * 60 * 1000;
const DEFAULT_LIMIT = 30;

const EVENT_SIGNALS = {
  ARTICLE_OPEN: 0.4,
  READ_DEPTH: 1,
  SAVE: 1.8,
  SHARE: 1.2,
  SEARCH: 0.3,
  NOTIFICATION_CLICK: 0.7,
  HIDE_TOPIC: -2.5,
  FOLLOW_TOPIC: 1.6
};

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function roundScore(value) {
  return Math.round(value * 10000) / 10000;
}

function readWeightMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, weight]) => [key, Number(weight)])
      .filter(([key, weight]) => key && Number.isFinite(weight))
  );
}

function addWeight(weights, key, value) {
  if (!key || !Number.isFinite(value)) {
    return;
  }

  weights[key] = (weights[key] || 0) + value;
}

function finalizeWeights(weights) {
  return Object.fromEntries(
    Object.entries(weights)
      .map(([key, value]) => [key, roundScore(clamp(value, -3, 5))])
      .filter(([, value]) => Math.abs(value) >= 0.01)
      .sort((left, right) => Math.abs(right[1]) - Math.abs(left[1]))
  );
}

function recencyDecay(createdAt) {
  const ageDays = Math.max(0, Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return clamp(1 - ageDays / PROFILE_REFRESH_WINDOW_DAYS, 0.15, 1);
}

function signalForEvent(event) {
  if (event.type === 'READ_DEPTH') {
    return clamp(Number(event.value || 0), 0, 1.5);
  }

  const base = EVENT_SIGNALS[event.type] || 0;
  const multiplier = Number.isFinite(Number(event.value)) ? clamp(Number(event.value), 0.1, 3) : 1;
  return base * multiplier;
}

async function refreshRecommendationProfile(userId) {
  const since = new Date(Date.now() - PROFILE_REFRESH_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const [preferences, events] = await Promise.all([
    prisma.userPreference.findMany({
      where: { userId },
      include: { topic: true, region: true }
    }),
    prisma.userEvent.findMany({
      where: {
        userId,
        createdAt: { gte: since }
      },
      orderBy: { createdAt: 'desc' },
      take: 500
    })
  ]);

  const articleIds = [...new Set(events.map((event) => event.articleId).filter(Boolean))];
  const articles = articleIds.length
    ? await prisma.article.findMany({
        where: { id: { in: articleIds } },
        include: {
          topics: true,
          region: true
        }
      })
    : [];
  const articlesById = new Map(articles.map((article) => [article.id, article]));

  const topicWeights = {};
  const regionWeights = {};

  for (const preference of preferences) {
    addWeight(topicWeights, preference.topicId, Number(preference.weight || 1));
    addWeight(regionWeights, preference.regionId, Number(preference.weight || 1));
  }

  for (const event of events) {
    const signal = signalForEvent(event) * recencyDecay(event.createdAt);
    const article = event.articleId ? articlesById.get(event.articleId) : undefined;

    addWeight(topicWeights, event.topicId, signal);

    if (article) {
      addWeight(regionWeights, article.regionId, signal * 0.75);

      for (const articleTopic of article.topics) {
        addWeight(topicWeights, articleTopic.topicId, signal * Number(articleTopic.weight || 1));
      }
    }
  }

  return prisma.recommendationProfile.upsert({
    where: { userId },
    update: {
      topicWeights: finalizeWeights(topicWeights),
      regionWeights: finalizeWeights(regionWeights),
      lastRefreshedAt: new Date()
    },
    create: {
      userId,
      topicWeights: finalizeWeights(topicWeights),
      regionWeights: finalizeWeights(regionWeights),
      lastRefreshedAt: new Date()
    }
  });
}

async function getFreshRecommendationProfile(userId, forceRefresh = false) {
  const profile = await prisma.recommendationProfile.findUnique({
    where: { userId }
  });
  const refreshedAt = profile?.lastRefreshedAt ? new Date(profile.lastRefreshedAt).getTime() : 0;
  const isStale = !refreshedAt || Date.now() - refreshedAt > PROFILE_STALE_MS;

  if (forceRefresh || !profile || isStale) {
    return refreshRecommendationProfile(userId);
  }

  return profile;
}

function articleRecencyScore(article) {
  const date = article.publishedAt || article.createdAt;
  const ageHours = Math.max(0, Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
  return clamp(1 - ageHours / (24 * 7));
}

function articleTopicScore(article, topicWeights) {
  const score = article.topics.reduce((sum, articleTopic) => {
    return sum + (topicWeights[articleTopic.topicId] || 0) * Number(articleTopic.weight || 1);
  }, 0);

  return clamp(score / 5, -1, 1);
}

function articleRegionScore(article, regionWeights) {
  return clamp((regionWeights[article.regionId] || 0) / 5, -1, 1);
}

function rankArticle(article, profile, scope) {
  const topicWeights = readWeightMap(profile?.topicWeights);
  const regionWeights = readWeightMap(profile?.regionWeights);
  const recencyScore = articleRecencyScore(article);
  const topicScore = articleTopicScore(article, topicWeights);
  const regionScore = articleRegionScore(article, regionWeights);
  const cluster = article.cluster || {};
  const localScore = Number(cluster.localScore || (article.category === 'LOCAL' ? 0.5 : 0));
  const worldScore = Number(cluster.worldScore || (article.category === 'WORLD' ? 0.5 : 0));
  const hotnessScore = Number(cluster.hotnessScore || 0);
  const confidenceScore = Number(cluster.confidenceScore || 0);
  const breakingScore = article.isBreaking ? 1 : 0;

  const weights =
    scope === 'local'
      ? { localScore: 0.35, hotnessScore: 0.24, recencyScore: 0.18, regionScore: 0.1, breakingScore: 0.08, confidenceScore: 0.05 }
      : scope === 'world'
        ? { worldScore: 0.35, hotnessScore: 0.24, recencyScore: 0.18, topicScore: 0.09, breakingScore: 0.08, confidenceScore: 0.06 }
        : {
            topicScore: 0.28,
            regionScore: 0.18,
            hotnessScore: 0.2,
            localScore: 0.08,
            worldScore: 0.08,
            recencyScore: 0.12,
            breakingScore: 0.04,
            confidenceScore: 0.02
          };

  const score =
    topicScore * (weights.topicScore || 0) +
    regionScore * (weights.regionScore || 0) +
    localScore * (weights.localScore || 0) +
    worldScore * (weights.worldScore || 0) +
    hotnessScore * (weights.hotnessScore || 0) +
    recencyScore * (weights.recencyScore || 0) +
    breakingScore * (weights.breakingScore || 0) +
    confidenceScore * (weights.confidenceScore || 0);

  return {
    article,
    score: roundScore(score),
    signals: {
      topicScore: roundScore(topicScore),
      regionScore: roundScore(regionScore),
      localScore: roundScore(localScore),
      worldScore: roundScore(worldScore),
      hotnessScore: roundScore(hotnessScore),
      recencyScore: roundScore(recencyScore),
      breakingScore,
      confidenceScore: roundScore(confidenceScore)
    }
  };
}

function primaryTopicId(article) {
  return [...article.topics].sort((left, right) => Number(right.weight || 0) - Number(left.weight || 0))[0]?.topicId;
}

function selectDiverseArticles(rankedArticles, limit, scope) {
  const selected = [];
  const selectedIds = new Set();
  const categoryCounts = new Map();
  const regionCounts = new Map();
  const topicCounts = new Map();
  const maxCategory = scope === 'personalized' ? Math.max(3, Math.ceil(limit * 0.35)) : limit;
  const maxRegion = Math.max(3, Math.ceil(limit * 0.3));
  const maxTopic = Math.max(3, Math.ceil(limit * 0.3));

  for (const ranked of rankedArticles) {
    if (selected.length >= limit) {
      break;
    }

    const topicId = primaryTopicId(ranked.article);
    const categoryCount = categoryCounts.get(ranked.article.category) || 0;
    const regionCount = ranked.article.regionId ? regionCounts.get(ranked.article.regionId) || 0 : 0;
    const topicCount = topicId ? topicCounts.get(topicId) || 0 : 0;

    if (categoryCount >= maxCategory || regionCount >= maxRegion || topicCount >= maxTopic) {
      continue;
    }

    selected.push(ranked);
    selectedIds.add(ranked.article.id);
    categoryCounts.set(ranked.article.category, categoryCount + 1);

    if (ranked.article.regionId) {
      regionCounts.set(ranked.article.regionId, regionCount + 1);
    }

    if (topicId) {
      topicCounts.set(topicId, topicCount + 1);
    }
  }

  for (const ranked of rankedArticles) {
    if (selected.length >= limit) {
      break;
    }

    if (!selectedIds.has(ranked.article.id)) {
      selected.push(ranked);
    }
  }

  return selected;
}

async function getCandidateArticles(scope, limit) {
  return prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      ...(scope === 'local' ? { category: 'LOCAL' } : {}),
      ...(scope === 'world' ? { category: 'WORLD' } : {})
    },
    orderBy: [{ isBreaking: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: Math.max(limit * 5, 100),
    include: {
      topics: { include: { topic: true } },
      region: true,
      cluster: true
    }
  });
}

async function getRankedFeed(userId, options = {}) {
  const limit = options.limit || DEFAULT_LIMIT;
  const profile = await getFreshRecommendationProfile(userId, Boolean(options.refresh));
  const articles = await getCandidateArticles('personalized', limit);
  const rankedArticles = articles
    .map((article) => rankArticle(article, profile, 'personalized'))
    .sort((left, right) => right.score - left.score || new Date(right.article.publishedAt || right.article.createdAt) - new Date(left.article.publishedAt || left.article.createdAt));

  return {
    feed: selectDiverseArticles(rankedArticles, limit, 'personalized'),
    profile,
    explanation: 'Ranked by topic affinity, location preference, hotness, recency, and diversity controls.'
  };
}

async function getRankedHotNews(scope, options = {}) {
  const limit = options.limit || DEFAULT_LIMIT;
  const articles = await getCandidateArticles(scope, limit);
  const rankedArticles = articles
    .map((article) => rankArticle(article, { topicWeights: {}, regionWeights: {} }, scope))
    .sort((left, right) => right.score - left.score || new Date(right.article.publishedAt || right.article.createdAt) - new Date(left.article.publishedAt || left.article.createdAt));

  return {
    feed: selectDiverseArticles(rankedArticles, limit, scope),
    explanation: `Ranked ${scope} news by cluster scores, breaking status, source confidence, and recency.`
  };
}

async function enqueueRecommendationRefresh(userId, metadata = {}) {
  return addJob(QUEUE_NAMES.RECOMMENDATIONS, 'refresh-user-profile', {
    userId,
    metadata,
    requestedAt: new Date().toISOString()
  });
}

export { enqueueRecommendationRefresh, getRankedFeed, getRankedHotNews, refreshRecommendationProfile };

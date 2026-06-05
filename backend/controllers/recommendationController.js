import prisma from '../models/prisma.js';

async function getMyFeed(req, res) {
  const preferences = await prisma.userPreference.findMany({
    where: { userId: req.user.id },
    include: { topic: true, region: true }
  });

  const topicIds = preferences.filter((preference) => preference.topicId).map((preference) => preference.topicId);
  const regionIds = preferences.filter((preference) => preference.regionId).map((preference) => preference.regionId);
  const preferredFilters = [
    topicIds.length
      ? {
          topics: {
            some: {
              topicId: { in: topicIds }
            }
          }
        }
      : undefined,
    regionIds.length ? { regionId: { in: regionIds } } : undefined
  ].filter(Boolean);

  const personalized = preferredFilters.length
    ? await prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
          OR: preferredFilters
        },
        orderBy: [{ isBreaking: 'desc' }, { publishedAt: 'desc' }],
        take: 30,
        include: {
          topics: { include: { topic: true } },
          region: true
        }
      })
    : [];

  const fallback = personalized.length
    ? []
    : await prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ isBreaking: 'desc' }, { publishedAt: 'desc' }],
        take: 30,
        include: {
          topics: { include: { topic: true } },
          region: true
        }
      });

  res.json({
    feed: personalized.length ? personalized : fallback,
    explanation: personalized.length ? 'Matched user preferences' : 'Fallback to latest published news'
  });
}

export { getMyFeed };


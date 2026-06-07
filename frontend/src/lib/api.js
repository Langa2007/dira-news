import { API_BASE_URL } from './endpoints';

const fallbackStories = [
  {
    id: 'fallback-local-1',
    slug: 'county-health-centers-get-new-supplies',
    title: 'County health centers get new supplies after week of shortages',
    subtitle: 'Clinics say the delivery should stabilize basic care while officials review distribution gaps.',
    summary:
      'Dira News is tracking health, procurement, and county response updates as residents wait for more consistent service across local facilities.',
    category: 'LOCAL',
    region: { name: 'Local Desk' },
    topics: [{ name: 'Health' }, { name: 'County Services' }],
    isBreaking: true,
    publishedAt: new Date().toISOString(),
    url: '/articles/county-health-centers-get-new-supplies',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1400&q=80',
        altText: 'Health worker preparing supplies'
      }
    ]
  },
  {
    id: 'fallback-world-1',
    slug: 'regional-leaders-meet-on-food-and-energy-costs',
    title: 'Regional leaders meet on food and energy costs',
    subtitle: 'The talks focus on transport corridors, staple prices, and climate pressure on harvests.',
    summary:
      'Officials are expected to outline a joint plan for trade routes and emergency reserves after several months of price volatility.',
    category: 'WORLD',
    region: { name: 'World Desk' },
    topics: [{ name: 'Economy' }, { name: 'Food Security' }],
    isBreaking: false,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    url: '/articles/regional-leaders-meet-on-food-and-energy-costs',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1400&q=80',
        altText: 'Newspapers stacked on a newsroom table'
      }
    ]
  },
  {
    id: 'fallback-business-1',
    slug: 'small-traders-adapt-to-new-digital-tax-tools',
    title: 'Small traders adapt to new digital tax tools',
    subtitle: 'Business groups want more training before enforcement expands.',
    summary:
      'Traders say mobile-first reporting could reduce paperwork, but poor onboarding risks leaving smaller shops behind.',
    category: 'BUSINESS',
    region: { name: 'Business Desk' },
    topics: [{ name: 'Small Business' }, { name: 'Tax' }],
    isBreaking: false,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    url: '/articles/small-traders-adapt-to-new-digital-tax-tools',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80',
        altText: 'Business documents and calculator on a desk'
      }
    ]
  },
  {
    id: 'fallback-education-1',
    slug: 'schools-test-new-attendance-alerts',
    title: 'Schools test new attendance alerts for parents',
    subtitle: 'The pilot links class registers to same-day SMS notifications.',
    summary:
      'Education officials say the system is meant to improve safeguarding and identify absentee patterns earlier.',
    category: 'EDUCATION',
    region: { name: 'Education Desk' },
    topics: [{ name: 'Schools' }, { name: 'Families' }],
    isBreaking: false,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    url: '/articles/schools-test-new-attendance-alerts',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=80',
        altText: 'Students working in a classroom'
      }
    ]
  }
];

function normalizeStory(story) {
  const url = story.url || `/articles/${story.slug}`;
  const media = Array.isArray(story.media) ? story.media : [];

  return {
    ...story,
    url,
    href: `/articles/${story.slug}`,
    imageUrl: media[0]?.url || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80',
    imageAlt: media[0]?.altText || story.title,
    topics: Array.isArray(story.topics) ? story.topics : [],
    region: story.region || null
  };
}

async function fetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    next: { revalidate: 30 }
  });

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status}`);
  }

  return response.json();
}

export async function getPublicFeed(options = {}) {
  const params = new URLSearchParams();

  if (options.limit) {
    params.set('limit', String(options.limit));
  }

  if (options.category) {
    params.set('category', options.category);
  }

  try {
    const data = await fetchJson(`/publishing/app-feed${params.size ? `?${params.toString()}` : ''}`);
    const feed = Array.isArray(data.feed) && data.feed.length ? data.feed : fallbackStories;

    return feed.map(normalizeStory);
  } catch {
    return fallbackStories
      .filter((story) => !options.category || story.category === options.category)
      .slice(0, options.limit || fallbackStories.length)
      .map(normalizeStory);
  }
}

export async function getHotNews() {
  try {
    const data = await fetchJson('/articles/hot');
    return {
      local: (data.localHotNews || []).map(normalizeStory),
      world: (data.worldHotNews || []).map(normalizeStory)
    };
  } catch {
    return {
      local: fallbackStories.filter((story) => story.category === 'LOCAL').map(normalizeStory),
      world: fallbackStories.filter((story) => story.category === 'WORLD').map(normalizeStory)
    };
  }
}

export async function getStoryBySlug(slug) {
  const feed = await getPublicFeed({ limit: 100 });
  return feed.find((story) => story.slug === slug) || null;
}

export { API_BASE_URL };

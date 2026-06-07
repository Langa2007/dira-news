import { readFileSync } from 'node:fs';
import { kenyaSourceRegistry } from './data/sourceRegistry.js';

function loadEnv(path = '.env') {
  const values = {};

  try {
    const content = readFileSync(path, 'utf8');

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
        continue;
      }

      const [key, ...rest] = trimmed.split('=');
      values[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    // The deployed environment can provide variables directly.
  }

  return values;
}

function envValue(env, ...keys) {
  for (const key of keys) {
    const value = process.env[key] || env[key];

    if (value && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function cleanUrl(value) {
  return String(value || '').trim().replace(/\/$/, '');
}

function apiBaseUrl(env) {
  const explicitApi = cleanUrl(envValue(env, 'SOURCE_SEED_API_BASE_URL', 'SCRAPER_API_BASE_URL', 'NEXT_PUBLIC_API_BASE_URL'));

  if (explicitApi) {
    return explicitApi;
  }

  const backendUrl = cleanUrl(envValue(env, 'BACKEND_URL', 'NEXT_PUBLIC_BACKEND_URL')) || 'https://dira-news.onrender.com';
  return `${backendUrl}/api`;
}

async function request(apiUrl, path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.error?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

async function login(apiUrl, env) {
  const email = envValue(env, 'ADMIN_EMAIL', 'ADMIN_USER_EMAIL', 'ADMIN_LOGIN_EMAIL', 'SUPER_ADMIN_EMAIL', 'SEED_ADMIN_EMAIL', 'EMAIL');
  const password = envValue(
    env,
    'ADMIN_PASSWORD',
    'ADMIN_PASS',
    'ADMIN_USER_PASSWORD',
    'ADMIN_LOGIN_PASSWORD',
    'SUPER_ADMIN_PASSWORD',
    'SEED_ADMIN_PASSWORD',
    'PASSWORD'
  );

  if (!email || !password) {
    throw new Error('Missing admin credentials in .env.');
  }

  const data = await request(apiUrl, '/auth/login', {
    method: 'POST',
    body: { email, password }
  });

  if (!data.accessToken) {
    throw new Error('Backend login did not return an access token.');
  }

  return data.accessToken;
}

function sourceExists(source, existingSources) {
  return existingSources.some(
    (existing) =>
      existing.name === source.name ||
      (source.feedUrl && existing.feedUrl === source.feedUrl) ||
      (source.apiUrl && existing.apiUrl === source.apiUrl) ||
      (source.homepageUrl && existing.homepageUrl === source.homepageUrl)
  );
}

function toPayload(source) {
  return {
    name: source.name,
    type: source.type,
    homepageUrl: source.homepageUrl,
    feedUrl: source.feedUrl,
    apiUrl: source.apiUrl,
    category: source.category,
    credibilityScore: source.credibilityScore,
    crawlIntervalMins: source.crawlIntervalMins,
    termsNotes: `[${source.group}] ${source.termsNotes}`
  };
}

async function main() {
  const env = loadEnv();
  const apiUrl = apiBaseUrl(env);
  const token = await login(apiUrl, env);
  const data = await request(apiUrl, '/sources', { token });
  const existingSources = Array.isArray(data.sources) ? data.sources : [];
  let created = 0;
  let skipped = 0;

  for (const source of kenyaSourceRegistry) {
    if (sourceExists(source, existingSources)) {
      skipped += 1;
      continue;
    }

    const response = await request(apiUrl, '/sources', {
      method: 'POST',
      token,
      body: toPayload(source)
    });
    existingSources.push(response.source);
    created += 1;
  }

  console.log(`Seeded source registry through backend API.`);
  console.log(`Created: ${created}`);
  console.log(`Skipped existing: ${skipped}`);
  console.log(`Backend API: ${apiUrl}`);
}

main().catch((error) => {
  console.error(`Source API seed failed: ${error.message}`);
  process.exit(1);
});

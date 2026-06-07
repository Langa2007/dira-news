import { createRequire } from 'node:module';
import { applyDatabaseConfig } from './backend/config/database.config.js';
import { kenyaSourceRegistry } from './data/sourceRegistry.js';

const require = createRequire(new URL('./backend/package.json', import.meta.url));
const { PrismaClient } = require('@prisma/client');

function requestedDatabaseTarget() {
  if (process.argv.includes('--local')) {
    return 'local';
  }

  if (process.argv.includes('--database-url')) {
    return 'databaseUrl';
  }

  if (process.argv.includes('--neon')) {
    return 'neon';
  }

  return process.env.SOURCE_SEED_DB_TARGET || (process.env.DATABASE_URL_NEON ? 'neon' : 'local');
}

function sourceUrlWhere(source) {
  const clauses = [{ name: source.name }];

  if (source.feedUrl) {
    clauses.push({ feedUrl: source.feedUrl });
  }

  if (source.apiUrl) {
    clauses.push({ apiUrl: source.apiUrl });
  }

  if (source.homepageUrl) {
    clauses.push({ homepageUrl: source.homepageUrl });
  }

  return clauses;
}

function toSourceData(source) {
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
  const database = applyDatabaseConfig(requestedDatabaseTarget());
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });

  let created = 0;
  let updated = 0;

  try {
    for (const source of kenyaSourceRegistry) {
      const existing = await prisma.source.findFirst({
        where: {
          OR: sourceUrlWhere(source)
        }
      });
      const data = toSourceData(source);

      if (existing) {
        await prisma.source.update({
          where: { id: existing.id },
          data
        });
        updated += 1;
      } else {
        await prisma.source.create({ data });
        created += 1;
      }
    }

    console.log(`Seeded ${kenyaSourceRegistry.length} sources.`);
    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);
    console.log(`Database target: ${database.target}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(`Source seed failed: ${error.message}`);
  process.exit(1);
});

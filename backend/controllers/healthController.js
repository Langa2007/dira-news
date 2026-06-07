import prisma from '../models/prisma.js';
import IORedis from 'ioredis';
import { env } from '../config/env.js';

async function getHealth(req, res) {
  const result = {
    ok: true,
    service: 'dira-news-backend',
    timestamp: new Date().toISOString(),
    database: { ok: false },
    redis: { ok: false }
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    result.database.ok = true;
  } catch (err) {
    result.database.ok = false;
    result.database.error = String(err.message || err);
  }

  try {
    const r = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });
    const pong = await r.ping();
    result.redis.ok = pong === 'PONG';
    await r.quit();
  } catch (err) {
    result.redis.ok = false;
    result.redis.error = String(err.message || err);
  }

  res.json(result);
}

export { getHealth };

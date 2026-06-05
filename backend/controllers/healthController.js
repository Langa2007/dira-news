import prisma from '../models/prisma.js';

async function getHealth(req, res) {
  await prisma.$queryRaw`SELECT 1`;

  res.json({
    ok: true,
    service: 'dira-news-backend',
    timestamp: new Date().toISOString()
  });
}

export { getHealth };

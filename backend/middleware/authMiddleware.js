import jwt from 'jsonwebtoken';
import prisma from '../models/prisma.js';
import { env } from '../config/env.js';

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'Missing bearer token', statusCode: 401 } });
    }

    const token = header.slice('Bearer '.length);
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: { message: 'Invalid user', statusCode: 401 } });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: { message: 'Unauthorized', statusCode: 401 } });
  }
}

function requireRole(...roleKeys) {
  return (req, res, next) => {
    const userRoles = req.user?.roles?.map((item) => item.role.key) || [];
    const allowed = roleKeys.some((role) => userRoles.includes(role));

    if (!allowed) {
      return res.status(403).json({ error: { message: 'Forbidden', statusCode: 403 } });
    }

    next();
  };
}

export { requireAuth, requireRole };

import jwt from 'jsonwebtoken';
import prisma from '../models/prisma.js';
import { env } from '../config/env.js';

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    let token = null;

    if (header && header.startsWith('Bearer ')) {
      token = header.slice('Bearer '.length);
    } else if (req.headers.cookie) {
      const cookies = Object.fromEntries(
        req.headers.cookie.split(';').map((c) => {
          const [k, ...v] = c.split('=');
          return [k.trim(), decodeURIComponent(v.join('='))];
        })
      );

      token = cookies['dira-access-token'] || cookies['dira_access_token'] || null;
    }

    if (!token) {
      return res.status(401).json({ error: { message: 'Missing bearer token', statusCode: 401 } });
    }

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

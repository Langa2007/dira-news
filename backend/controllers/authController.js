import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../models/prisma.js';
import { env } from '../config/env.js';
import { recordAudit } from '../services/auditService.js';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120).optional(),
  password: z.string().min(8).max(200)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN
    }
  );
}

async function ensureReaderRole() {
  return prisma.role.upsert({
    where: { key: 'reader' },
    update: {},
    create: {
      key: 'reader',
      name: 'Reader'
    }
  });
}

async function register(req, res) {
  const input = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });

  if (existing) {
    return res.status(409).json({ error: { message: 'Email already registered', statusCode: 409 } });
  }

  const readerRole = await ensureReaderRole();
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash,
      roles: {
        create: {
          roleId: readerRole.id
        }
      },
      recommendationProfile: {
        create: {
          topicWeights: {}
        }
      }
    },
    include: {
      roles: {
        include: { role: true }
      }
    }
  });

  await recordAudit({
    actorId: user.id,
    action: 'auth.register',
    entity: 'User',
    entityId: user.id
  });

  res.status(201).json({
    user: sanitizeUser(user),
    accessToken: signAccessToken(user)
  });
}

async function login(req, res) {
  const input = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    include: {
      roles: {
        include: { role: true }
      }
    }
  });

  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: { message: 'Invalid credentials', statusCode: 401 } });
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);

  if (!valid) {
    return res.status(401).json({ error: { message: 'Invalid credentials', statusCode: 401 } });
  }

  await recordAudit({
    actorId: user.id,
    action: 'auth.login',
    entity: 'User',
    entityId: user.id
  });

  res.json({
    user: sanitizeUser(user),
    accessToken: signAccessToken(user)
  });
}

async function me(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    roles: user.roles?.map((item) => item.role.key) || [],
    createdAt: user.createdAt
  };
}

export { register, login, me };

import { createRequire } from 'node:module';
import { applyDatabaseConfig } from './backend/config/database.config.js';

const require = createRequire(new URL('./backend/package.json', import.meta.url));
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const permissions = [
  'users.read',
  'sources.manage',
  'articles.write',
  'articles.review',
  'articles.publish',
  'ai.outputs.read',
  'recommendations.manage',
  'publishing.manage'
];

function envValue(...keys) {
  for (const key of keys) {
    const value = process.env[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

async function ensureAdminRole(prisma) {
  const adminRole = await prisma.role.upsert({
    where: { key: 'admin' },
    update: { name: 'Admin' },
    create: {
      key: 'admin',
      name: 'Admin'
    }
  });

  for (const key of permissions) {
    const permission = await prisma.permission.upsert({
      where: { key },
      update: {},
      create: {
        key,
        description: key
      }
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id
      }
    });
  }

  return adminRole;
}

async function main() {
  const email = envValue('ADMIN_EMAIL', 'SUPER_ADMIN_EMAIL', 'SEED_ADMIN_EMAIL');
  const password = envValue('ADMIN_PASSWORD', 'SUPER_ADMIN_PASSWORD', 'SEED_ADMIN_PASSWORD');
  const name = envValue('ADMIN_NAME', 'SUPER_ADMIN_NAME', 'SEED_ADMIN_NAME') || 'Admin';

  if (!email) {
    throw new Error('Missing admin email. Add ADMIN_EMAIL to your .env file.');
  }

  if (!password) {
    throw new Error('Missing admin password. Add ADMIN_PASSWORD to your .env file.');
  }

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters.');
  }

  const database = applyDatabaseConfig();
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });

  try {
    const adminRole = await ensureAdminRole(prisma);
    const passwordHash = await bcrypt.hash(password, 12);
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        name,
        passwordHash,
        status: 'ACTIVE',
        emailVerifiedAt: new Date()
      },
      create: {
        email: normalizedEmail,
        name,
        passwordHash,
        status: 'ACTIVE',
        emailVerifiedAt: new Date()
      }
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: adminRole.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleId: adminRole.id
      }
    });

    await prisma.recommendationProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        topicWeights: {}
      }
    });

    console.log(`Admin ready: ${normalizedEmail}`);
    console.log(`Database target: ${database.target}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(`Create admin failed: ${error.message}`);
  process.exit(1);
});

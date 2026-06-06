import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { applyDatabaseConfig } from './backend/config/database.config.js';
import { getDatabaseConfig, localConnectionArgs, localConnectionEnv } from './database.config.js';

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

function requestedDatabaseTarget() {
  if (process.argv.includes('--neon')) {
    return 'neon';
  }

  if (process.argv.includes('--database-url')) {
    return 'databaseUrl';
  }

  if (process.argv.includes('--local')) {
    return 'local';
  }

  return process.env.CREATE_ADMIN_DB_TARGET || 'local';
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function stableId(prefix, value) {
  return `${prefix}-${createHash('sha256').update(value).digest('hex').slice(0, 24)}`;
}

function runLocalPsql(sql) {
  const local = getDatabaseConfig('local');

  return new Promise((resolve, reject) => {
    const child = spawn('psql', [...localConnectionArgs(local), '-v', 'ON_ERROR_STOP=1'], {
      env: localConnectionEnv(local),
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true
    });
    let stdout = '';
    let stderr = '';

    child.stdin.end(sql);
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      reject(new Error(stderr.trim() || stdout.trim() || `psql exited with code ${code}`));
    });
  });
}

async function createLocalAdmin({ email, password, name }) {
  const passwordHash = await bcrypt.hash(password, 12);
  const normalizedEmail = email.toLowerCase();
  const userId = stableId('user-admin', normalizedEmail);
  const profileId = stableId('profile-admin', normalizedEmail);

  const permissionRows = permissions
    .map((key) => `(${sqlLiteral(stableId('perm', key))}, ${sqlLiteral(key)}, ${sqlLiteral(key)})`)
    .join(',\n  ');

  const sql = `
WITH saved_user AS (
  INSERT INTO "User" ("id", "email", "name", "passwordHash", "status", "emailVerifiedAt", "createdAt", "updatedAt")
  VALUES (${sqlLiteral(userId)}, ${sqlLiteral(normalizedEmail)}, ${sqlLiteral(name)}, ${sqlLiteral(passwordHash)}, 'ACTIVE', now(), now(), now())
  ON CONFLICT ("email") DO UPDATE SET
    "name" = EXCLUDED."name",
    "passwordHash" = EXCLUDED."passwordHash",
    "status" = 'ACTIVE',
    "emailVerifiedAt" = COALESCE("User"."emailVerifiedAt", now()),
    "updatedAt" = now()
  RETURNING "id"
),
saved_role AS (
  INSERT INTO "Role" ("id", "key", "name")
  VALUES ('role-admin', 'admin', 'Admin')
  ON CONFLICT ("key") DO UPDATE SET "name" = EXCLUDED."name"
  RETURNING "id"
),
saved_permissions AS (
  INSERT INTO "Permission" ("id", "key", "description")
  VALUES
  ${permissionRows}
  ON CONFLICT ("key") DO UPDATE SET "description" = EXCLUDED."description"
  RETURNING "id"
),
saved_role_permissions AS (
  INSERT INTO "RolePermission" ("roleId", "permissionId")
  SELECT saved_role."id", saved_permissions."id"
  FROM saved_role, saved_permissions
  ON CONFLICT ("roleId", "permissionId") DO NOTHING
  RETURNING "roleId"
),
saved_user_role AS (
  INSERT INTO "UserRole" ("userId", "roleId")
  SELECT saved_user."id", saved_role."id"
  FROM saved_user, saved_role
  ON CONFLICT ("userId", "roleId") DO NOTHING
  RETURNING "userId"
)
INSERT INTO "RecommendationProfile" ("id", "userId", "topicWeights", "createdAt", "updatedAt")
SELECT ${sqlLiteral(profileId)}, saved_user."id", '{}'::jsonb, now(), now()
FROM saved_user
ON CONFLICT ("userId") DO NOTHING;
`;

  await runLocalPsql(sql);

  return {
    email: normalizedEmail,
    target: 'local'
  };
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
  const requestedTarget = requestedDatabaseTarget();
  const database = applyDatabaseConfig(requestedTarget);
  const email = envValue('ADMIN_EMAIL', 'ADMIN_USER_EMAIL', 'ADMIN_LOGIN_EMAIL', 'SUPER_ADMIN_EMAIL', 'SEED_ADMIN_EMAIL', 'EMAIL');
  const password = envValue(
    'ADMIN_PASSWORD',
    'ADMIN_PASS',
    'ADMIN_USER_PASSWORD',
    'ADMIN_LOGIN_PASSWORD',
    'SUPER_ADMIN_PASSWORD',
    'SEED_ADMIN_PASSWORD',
    'PASSWORD'
  );
  const name = envValue('ADMIN_NAME', 'ADMIN_USER_NAME', 'SUPER_ADMIN_NAME', 'SEED_ADMIN_NAME', 'NAME') || 'Admin';

  if (!email) {
    throw new Error('Missing admin email. Add ADMIN_EMAIL to your .env file.');
  }

  if (!password) {
    throw new Error('Missing admin password. Add ADMIN_PASSWORD to your .env file.');
  }

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters.');
  }

  if (database.target === 'local') {
    const admin = await createLocalAdmin({ email, password, name });

    console.log(`Admin ready: ${admin.email}`);
    console.log(`Database target: ${admin.target}`);
    return;
  }

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

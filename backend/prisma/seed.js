import prisma from '../models/prisma.js';

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

const roles = [
  {
    key: 'reader',
    name: 'Reader',
    permissions: []
  },
  {
    key: 'editor',
    name: 'Editor',
    permissions: ['articles.write', 'articles.review', 'ai.outputs.read']
  },
  {
    key: 'editor_in_chief',
    name: 'Editor in Chief',
    permissions: ['articles.write', 'articles.review', 'articles.publish', 'ai.outputs.read', 'publishing.manage']
  },
  {
    key: 'admin',
    name: 'Admin',
    permissions
  }
];

const topics = [
  ['Local', 'local', 'LOCAL'],
  ['World', 'world', 'WORLD'],
  ['Politics', 'politics', 'POLITICS'],
  ['Business', 'business', 'BUSINESS'],
  ['Technology', 'technology', 'TECHNOLOGY'],
  ['Sports', 'sports', 'SPORTS'],
  ['Entertainment', 'entertainment', 'ENTERTAINMENT'],
  ['Health', 'health', 'HEALTH'],
  ['Education', 'education', 'EDUCATION'],
  ['Opinion', 'opinion', 'OPINION']
];

async function main() {
  for (const key of permissions) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, description: key }
    });
  }

  for (const role of roles) {
    const savedRole = await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name },
      create: { key: role.key, name: role.name }
    });

    for (const permissionKey of role.permissions) {
      const permission = await prisma.permission.findUnique({ where: { key: permissionKey } });
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: savedRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: savedRole.id,
          permissionId: permission.id
        }
      });
    }
  }

  for (const [name, slug, category] of topics) {
    await prisma.topic.upsert({
      where: { slug },
      update: { name, category },
      create: { name, slug, category }
    });
  }

  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

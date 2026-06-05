# Dira News

Planning date: 2026-06-05

Dira News is a backend-first, AI-assisted media intelligence and publishing platform. It is meant to gather information from permitted sources, compare multiple sources, help editors write original stories, rank local and world news, personalize user feeds, and publish to website, app, Telegram, and prepared social drafts for WhatsApp, Instagram, and X.

The build starts with the backend engine, not the frontend.

## Current Direction

The project uses plain JavaScript with native ESM for the backend.

Preferred structure:

```text
dira news/
  backend/
    index.js
    config/
    controllers/
    middleware/
    models/
    prisma/
    routes/
    services/
    utils/
  python/
    acquisition/
    ai/
  docs later as needed
```

The `python/` side will come later for scraping/source acquisition, extraction, AI pipelines, clustering, and machine-learning jobs. The current work focuses on Phase 1: a serious JavaScript backend foundation.

## Backend Tech Stack

- Runtime: Node.js
- Backend framework: Express.js
- Module style: native ESM with `import` and `export`
- Database: PostgreSQL
- ORM/migrations: Prisma
- Realtime: Socket.IO
- Queues: BullMQ
- Queue/cache transport: Redis
- Auth: JWT with bcrypt password hashing
- Validation: Zod
- Storage-ready: S3-compatible client for MinIO, AWS S3, or Cloudflare R2
- Local infrastructure: Docker Compose for PostgreSQL, Redis, and MinIO

## Prisma And Database

Prisma does not require a cloud database.

It works with:

- local PostgreSQL from Docker
- local PostgreSQL installed directly on your machine
- Neon PostgreSQL later
- Supabase PostgreSQL later
- any normal PostgreSQL database URL

For now, use local PostgreSQL. Later, when moving to Neon, change `DATABASE_URL` and run:

```bash
npm run prisma:deploy
```

from the `backend` folder.

## Phase 1 Backend Scope

Already scaffolded:

- Express backend entry file
- ESM route layer
- ESM controller layer
- Prisma model access
- auth middleware
- role middleware
- error middleware
- audit service
- queue service
- realtime service
- storage service
- Prisma schema
- seed file for roles, permissions, and topics
- Docker Compose services for PostgreSQL, Redis, and MinIO

Core backend domains:

- users
- roles
- permissions
- user preferences
- user events
- topics
- regions
- sources
- source fetches
- source documents
- story clusters
- claims
- articles
- article versions
- media assets
- media licenses
- editorial reviews
- publish targets
- social drafts
- AI outputs
- recommendation profiles
- notifications
- audit logs

## Backend Commands

From `backend/`:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

The API runs on:

```text
http://localhost:4000/api
```

Health check:

```text
GET /api/health
```

## Environment

Use `backend/.env.example` as the backend environment template.

Minimum required values:

```text
DATABASE_URL=
REDIS_URL=
JWT_ACCESS_SECRET=
```

If you create `.env` in the project root instead of `backend/.env`, the backend will also read it.

## Product Rule

Dira News should not copy-paste other publishers. It should gather allowed source material, compare multiple sources, extract facts, write original drafts, keep source trails, and require editorial approval before publishing.

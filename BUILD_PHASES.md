# Dira News Build Phases

Planning date: 2026-06-05

This plan follows the new direction: JavaScript ESM backend first, clean `backend` folder, Python workers later, frontend after the backend intelligence is strong.

## Phase 0: Product, Editorial, And Data Rules

Status: started in `PRODUCT_EDITORIAL_DATA_RULES.md`.

Build:

- product identity
- editorial categories
- story types
- source rules
- image/media rules
- AI usage rules
- personalization rules
- publication rules
- trust and corrections rules

## Phase 1: Backend Foundation

Goal: build the serious backend core before frontend work.

Tech:

- Node.js
- Express.js
- JavaScript with native ESM
- PostgreSQL
- Prisma
- Redis
- BullMQ
- Socket.IO
- JWT auth
- Zod validation
- S3-compatible storage client
- Docker Compose

Folder shape:

```text
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
```

Build:

- Express server
- API routing
- auth registration/login
- JWT middleware
- role middleware
- error middleware
- Prisma schema
- database migrations
- seed roles, permissions, and topics
- audit logging
- source registry APIs
- source fetch queue API
- article creation APIs
- article publish API
- local hot news API
- world hot news API
- user preference APIs
- user event APIs
- realtime event service
- queue service
- storage service

Output:

- Backend can run without a frontend.
- Backend can connect to local PostgreSQL or Neon later.
- Backend can store the data shape needed for AI, recommendations, editorial workflow, and publishing.

## Phase 2: Source Acquisition Workers

Goal: build Python workers that gather information from allowed sources.

Tech:

- Python
- Scrapy
- Playwright
- Trafilatura
- BeautifulSoup
- Redis/BullMQ integration
- PostgreSQL through Prisma-owned schema or direct database client

Build:

- RSS ingestion
- static page extraction
- rendered page extraction
- robots.txt checks
- per-domain rate limits
- source fetch status updates
- source document storage
- duplicate detection
- text hashing
- crawl logs

## Phase 3: AI And ML Core

Goal: turn source documents into structured story intelligence.

Build:

- entity extraction
- claim extraction
- fact table generation
- source comparison
- contradiction detection
- story clustering
- hotness scoring
- local relevance scoring
- world relevance scoring
- similarity/plagiarism-risk checks
- AI output audit records
- original article draft generation
- social phrase generation

## Phase 4: Recommendation Algorithm

Goal: create backend feed intelligence before frontend design.

Build:

- user event tracking
- topic affinity scoring
- location preference scoring
- local hot news ranking
- world hot news ranking
- personalized feed ranking
- diversity controls
- recommendation refresh jobs

## Phase 5: Editorial Backend

Goal: make admin workflows backend-native before building the admin UI.

Build:

- story cluster review
- article versioning
- editorial comments
- source evidence attachment
- claim review status
- media licensing checks
- scheduled publish
- corrections workflow
- AI assistant endpoints

## Phase 6: Publishing And Channels

Goal: publish from one approved article source of truth.

Build:

- website publish target
- app feed publish target
- Telegram publishing worker
- WhatsApp draft queue
- Instagram draft queue
- X draft queue
- RSS generator
- sitemap generator
- publish logs

## Phase 7: Public Website

Goal: connect frontend to real backend data.

Build:

- local hot news
- world hot news
- latest news
- categories
- article pages
- signup/login
- preference popup
- personalized feed
- realtime breaking news

## Phase 8: Admin Panel Frontend

Goal: give editors a serious newsroom interface.

Build:

- source monitor
- story clusters
- AI briefing panel
- verification desk
- article editor
- media library
- social draft queue
- Telegram controls
- analytics

## Phase 9: Mobile App

Goal: build the app after backend, algorithm, website, and admin flows are mature.

Tech:

- Expo React Native
- JavaScript or TypeScript can be decided later

Build:

- onboarding
- auth
- preferences
- personalized feed
- article view
- saved articles
- breaking alerts
- push notifications

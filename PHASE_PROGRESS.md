# Dira News Phase Progress

Last updated: 2026-06-06

Rule: a build item is marked done only when the code exists and the relevant checks pass. We do not move to the next phase until all required builds in the current phase are done without known errors.

## Phase 0: Product, Editorial, And Data Rules

Status: Done

- [x] Product identity documented
- [x] Editorial categories documented
- [x] Story types documented
- [x] Editorial rules documented
- [x] Source rules documented
- [x] Image and media rules documented
- [x] AI usage rules documented
- [x] Personalization rules documented
- [x] Publication rules documented
- [x] Trust features documented

Evidence:

- `PRODUCT_EDITORIAL_DATA_RULES.md`

## Phase 1: Backend Foundation

Status: Done

- [x] JavaScript ESM backend structure
- [x] Express server entry file
- [x] Environment configuration
- [x] Development fallback for missing `REDIS_URL`
- [x] Development fallback for missing `JWT_ACCESS_SECRET`
- [x] Error middleware
- [x] Prisma client model access
- [x] Prisma schema
- [x] Role and permission seed
- [x] Topic seed
- [x] JWT auth middleware
- [x] Role middleware
- [x] Auth APIs
- [x] User preference APIs
- [x] User event APIs
- [x] Topic APIs
- [x] Region APIs
- [x] Source registry APIs
- [x] Source fetch queue API
- [x] Source document APIs
- [x] Article create/list APIs
- [x] Local hot news API
- [x] World hot news API
- [x] Article publish API
- [x] Story cluster APIs
- [x] AI output audit APIs
- [x] Media asset APIs
- [x] Social draft APIs
- [x] Basic personalized feed API
- [x] Audit service
- [x] Realtime Socket.IO service
- [x] Lazy BullMQ queue service
- [x] S3-compatible storage service
- [x] Docker Compose for PostgreSQL, Redis, and MinIO
- [x] Recursive JavaScript syntax check
- [x] Prisma schema validation
- [x] Backend import smoke test without `REDIS_URL`/`JWT_ACCESS_SECRET` in development
- [x] Backend boot smoke test without `REDIS_URL`/`JWT_ACCESS_SECRET` in development
- [x] Prisma migration applied to a real database
- [x] Database seed confirmed on real database
- [x] Backend starts successfully against configured `.env`
- [x] Health endpoint confirmed
- [x] Protected route auth flow confirmed
- [x] Publish flow confirmed

Latest verified checks:

- Recursive `node --check` over backend JavaScript files: passed.
- `prisma validate` with local PostgreSQL URL: passed.
- Backend route import with missing dev `REDIS_URL` and `JWT_ACCESS_SECRET`: passed.
- Backend boot smoke test with missing dev `REDIS_URL` and `JWT_ACCESS_SECRET`: passed.
- Prisma migration `20260605180823_phase_one_backend`: applied.
- Database seed: passed.
- Configured `.env` backend health/auth/publish verification: passed with exit code 0.

## Phase 2: Source Acquisition Workers

Status: Done

- [x] Python worker folder
- [x] RSS ingestion
- [x] Static page extraction
- [x] Rendered page extraction interface
- [x] robots.txt checks
- [x] Per-domain rate limiting
- [x] Source fetch status payloads
- [x] Source fetch status backend endpoint
- [x] Source document payloads
- [x] Source document backend client
- [x] Duplicate detection
- [x] Text hashing
- [x] Crawl logs
- [x] Test fixtures
- [x] Automated tests
- [x] Verification output captured

Latest verified checks:

- `python -m unittest discover -s python/acquisition/tests -p "test_*.py"`: passed, 8 tests.
- Recursive backend JavaScript syntax check after adding source fetch status endpoint: passed.

## Phase 3: AI And ML Core

Status: Done

- [x] AI provider adapter
- [x] Entity extraction
- [x] Claim extraction
- [x] Fact table generation
- [x] Source comparison
- [x] Contradiction detection
- [x] Story clustering jobs
- [x] Hotness scoring jobs
- [x] Local relevance scoring
- [x] World relevance scoring
- [x] Similarity/plagiarism-risk checks
- [x] Original draft generation
- [x] Social phrase generation
- [x] Backend-compatible AI output records
- [x] AI pipeline orchestration
- [x] Test fixtures
- [x] Automated tests
- [x] Verification output captured

Latest verified checks:

- `python -m unittest discover -s python/ai_core/tests -p "test_*.py"`: passed, 7 tests.
- `python -m unittest discover -s python/acquisition/tests -p "test_*.py"`: passed, 8 tests.
- Recursive backend JavaScript syntax check: passed.

## Phase 4: Recommendation Algorithm

Status: Done

- [x] User event tracking
- [x] Topic affinity scoring
- [x] Location preference scoring
- [x] Local hot news ranking
- [x] World hot news ranking
- [x] Personalized feed ranking
- [x] Diversity controls
- [x] Recommendation refresh jobs
- [x] Recommendation route import smoke test
- [x] Prisma schema validation
- [x] Recursive backend JavaScript syntax check

Evidence:

- `backend/services/recommendationService.js`
- `backend/controllers/recommendationController.js`
- `backend/routes/recommendationRoutes.js`
- `backend/controllers/articleController.js`

Latest verified checks:

- Recursive `node --check` over project backend JavaScript files, excluding `node_modules`: passed.
- `prisma validate` with root `.env` loaded into the command environment: passed.
- Recommendation route import smoke test with root `.env` loaded into the command environment: passed.

## Phase 5: Editorial Backend

Status: Done

- [x] Story cluster review
- [x] Article versioning
- [x] Editorial comments
- [x] Source evidence attachment
- [x] Claim review status
- [x] Media licensing checks
- [x] Scheduled publish
- [x] Corrections workflow
- [x] AI assistant endpoints
- [x] Editorial route import smoke test
- [x] Prisma schema validation
- [x] Recursive backend JavaScript syntax check

Evidence:

- `backend/services/editorialService.js`
- `backend/controllers/editorialController.js`
- `backend/routes/editorialRoutes.js`
- `backend/routes/index.js`
- `backend/controllers/articleController.js`

Latest verified checks:

- Recursive `node --check` over project backend JavaScript files, excluding `node_modules`: passed.
- `prisma validate` with root `.env` loaded into the command environment: passed.
- Editorial route and main route import smoke test with root `.env` loaded into the command environment: passed.

## Phase 6: Publishing And Channels

Status: Done

- [x] Website publish target
- [x] App feed publish target
- [x] Telegram publishing worker
- [x] WhatsApp draft queue
- [x] Instagram draft queue
- [x] X draft queue
- [x] RSS generator
- [x] Sitemap generator
- [x] Publish logs
- [x] Publishing route import smoke test
- [x] Prisma schema validation
- [x] Recursive backend JavaScript syntax check

Evidence:

- `backend/services/publishingService.js`
- `backend/controllers/publishingController.js`
- `backend/routes/publishingRoutes.js`
- `backend/routes/index.js`
- `backend/controllers/articleController.js`
- `backend/config/env.js`

Latest verified checks:

- Recursive `node --check` over project backend JavaScript files, excluding `node_modules`: passed.
- `prisma validate` with root `.env` loaded into the command environment: passed.
- Publishing route and main route import smoke test with root `.env` loaded into the command environment: passed.

## Phase 7: Public Website

Status: Done

Tech:

- Next.js
- React
- JavaScript
- Tailwind CSS
- Socket.IO client
- Lucide icons

- [x] Frontend folder scaffolded
- [x] JavaScript app structure
- [x] Dira editorial visual system
- [x] Local hot news
- [x] World hot news
- [x] Latest news
- [x] Categories
- [x] Article pages
- [x] Signup/login
- [x] Preference popup
- [x] Personalized feed
- [x] Realtime breaking news
- [x] RSS and sitemap frontend routes
- [x] Frontend lint check
- [x] Frontend production build

Evidence:

- `frontend/src/app/page.js`
- `frontend/src/app/categories/[category]/page.js`
- `frontend/src/app/articles/[slug]/page.js`
- `frontend/src/app/feed/page.js`
- `frontend/src/app/login/page.js`
- `frontend/src/app/signup/page.js`
- `frontend/src/app/globals.css`
- `frontend/src/lib/api.js`
- `frontend/src/components/BreakingTicker.js`
- `frontend/src/components/PreferencePrompt.js`
- `frontend/src/components/PersonalizedFeed.js`

Latest verified checks:

- `npm run lint` in `frontend`: passed.
- `npm run build` in `frontend`: passed.
- Local frontend HTTP response at `http://localhost:3000`: passed.

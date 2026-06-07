# Dira News Build Phases

Planning date: 2026-06-05

This plan follows the new direction: JavaScript ESM backend first, clean `backend` folder, Python workers later, frontend after the backend intelligence is strong.

## Phase 0: Product, Editorial, And Data Rules

Status: Done in `PRODUCT_EDITORIAL_DATA_RULES.md`.

Build:

- [x] product identity
- [x] editorial categories
- [x] story types
- [x] source rules
- [x] image/media rules
- [x] AI usage rules
- [x] personalization rules
- [x] publication rules
- [x] trust and corrections rules

## Phase 1: Backend Foundation

Status: Done

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

- [x] Express server
- [x] API routing
- [x] auth registration/login
- [x] JWT middleware
- [x] role middleware
- [x] error middleware
- [x] Prisma client setup
- [x] Prisma schema
- [x] role, permission, and topic seed file
- [x] audit logging
- [x] source registry APIs
- [x] source fetch queue API
- [x] source document APIs
- [x] article creation APIs
- [x] article publish API
- [x] article list API
- [x] local hot news API
- [x] world hot news API
- [x] user preference APIs
- [x] user event APIs
- [x] topic APIs
- [x] region APIs
- [x] story cluster APIs
- [x] AI output audit APIs
- [x] media asset APIs
- [x] social draft APIs
- [x] basic personalized feed API
- [x] realtime event service
- [x] queue service
- [x] lazy Redis queue connection
- [x] storage service
- [x] Docker Compose for PostgreSQL, Redis, and MinIO
- [x] development fallback for missing `REDIS_URL`
- [x] development fallback for missing `JWT_ACCESS_SECRET`
- [x] recursive backend JavaScript syntax check
- [x] Prisma schema validation
- [x] backend import smoke test
- [x] backend boot smoke test
- [x] database migration applied to a real database
- [x] database seed confirmed on a real database
- [x] backend health endpoint confirmed against real database
- [x] protected auth flow confirmed against real database
- [x] publish flow confirmed against real database

Output:

- [x] Backend can run without a frontend.
- [x] Backend can connect to local PostgreSQL or Neon later.
- [x] Backend can store the data shape needed for AI, recommendations, editorial workflow, and publishing.
- [x] Backend has been fully verified against the configured `.env` database.

## Phase 2: Source Acquisition Workers

Status: Done

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

- [x] Python worker folder
- [x] RSS ingestion
- [x] static page extraction
- [x] rendered page extraction interface
- [x] robots.txt checks
- [x] per-domain rate limits
- [x] source fetch status payloads
- [x] source fetch status backend endpoint
- [x] source document payloads
- [x] source document backend client
- [x] duplicate detection
- [x] text hashing
- [x] crawl logs
- [x] fixture-based test suite
- [x] verification output captured
- [x] Kenya source registry seed covering official government, legislature, judiciary, parastatal, media, banking, telecom, and international comparator sources
- [x] deployed backend scraper runner that reads registered sources and posts source documents

Seeded source groups:

- Kenya executive: Office of the President, MyGov, parliamentary affairs, interior, treasury, foreign affairs, defence, health, education, transport, ICT, agriculture, energy, and environment.
- Kenya legislature and judiciary: Parliament, National Assembly, Senate, Judiciary, and Kenya Law.
- Kenya parastatals and regulators: KRA, CBK, KNBS, IEBC, CA, Competition Authority, PPRA, NEMA, Kenya Power, KenGen, KETRACO, KPA, KeNHA, KeRRA, KURA, DCI, and EACC.
- Kenyan media houses: Standard, Capital FM, Nation, Citizen, KBC, Business Daily, The Star, People Daily, and K24.
- International comparator sources: BBC Africa RSS, Reuters Africa, and CNN Africa.
- Kenyan banks: Equity, KCB, Co-operative Bank, Absa Kenya, NCBA, Stanbic, Standard Chartered Kenya, I&M, and DTB.
- Kenyan telcos: Safaricom, Airtel Kenya, Telkom Kenya, and Jamii Telecommunications/Faiba.

Source registry files:

- `data/sourceRegistry.js`
- `seed-sources.js`
- `python/acquisition/run_scraper.py`

Run:

```bash
npm run sources:seed
python -m python.acquisition.run_scraper --limit 10
```

## Phase 3: AI And ML Core

Status: Done

Goal: turn source documents into structured story intelligence.

Build:

- [x] AI provider adapter
- [x] entity extraction
- [x] claim extraction
- [x] fact table generation
- [x] source comparison
- [x] contradiction detection
- [x] story clustering
- [x] hotness scoring
- [x] local relevance scoring
- [x] world relevance scoring
- [x] similarity/plagiarism-risk checks
- [x] backend-compatible AI output records
- [x] original article draft generation
- [x] social phrase generation
- [x] AI pipeline orchestration
- [x] fixture-based test suite
- [x] verification output captured

## Phase 4: Recommendation Algorithm

Status: Done

Goal: create backend feed intelligence before frontend design.

Build:

- [x] user event tracking
- [x] topic affinity scoring
- [x] location preference scoring
- [x] local hot news ranking
- [x] world hot news ranking
- [x] personalized feed ranking
- [x] diversity controls
- [x] recommendation refresh jobs

## Phase 5: Editorial Backend

Status: Done

Goal: make admin workflows backend-native before building the admin UI.

Build:

- [x] story cluster review
- [x] article versioning
- [x] editorial comments
- [x] source evidence attachment
- [x] claim review status
- [x] media licensing checks
- [x] scheduled publish
- [x] corrections workflow
- [x] AI assistant endpoints

## Phase 6: Publishing And Channels

Status: Done

Goal: publish from one approved article source of truth.

Build:

- [x] website publish target
- [x] app feed publish target
- [x] Telegram publishing worker
- [x] WhatsApp draft queue
- [x] Instagram draft queue
- [x] X draft queue
- [x] RSS generator
- [x] sitemap generator
- [x] publish logs

## Phase 7: Public Website

Status: Done

Goal: connect frontend to real backend data.

Tech:

- Next.js
- React
- JavaScript
- Tailwind CSS
- Socket.IO client
- Lucide icons

Build:

- [x] local hot news
- [x] world hot news
- [x] latest news
- [x] categories
- [x] article pages
- [x] signup/login
- [x] preference popup
- [x] personalized feed
- [x] realtime breaking news

## Phase 8: Admin Panel Frontend

Status: Done

Goal: give editors a serious newsroom interface.

Tech:

- Next.js
- React
- JavaScript
- Tailwind CSS
- Lucide icons
- Standalone `admin/` app

Build:

- [x] source monitor
- [x] story clusters
- [x] AI briefing panel
- [x] verification desk
- [x] article editor
- [x] media library
- [x] social draft queue
- [x] Telegram controls
- [x] analytics

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

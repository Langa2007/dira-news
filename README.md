# Dira News

Planning date: 2026-06-05

Dira News is an AI-assisted media platform for discovering, verifying, writing, and publishing news across a website, mobile app, Telegram, and prepared social-channel drafts for WhatsApp, Instagram, and X.

The core idea is not to copy other publishers. Dira News gathers signals from many allowed sources, compares them, extracts facts, keeps source trails for editors, writes original coverage in Dira's voice, and publishes only after editorial review.

## Product Vision

Dira News should become a news compass:

- Local hot news on the landing page.
- Hot world news beside local stories.
- Personalized feeds based on reader interests and behavior.
- Admin tools for editors to discover, verify, write, schedule, and publish.
- AI assistance for headlines, summaries, WhatsApp-channel phrases, Telegram captions, SEO metadata, and fact-check prompts.
- Realtime updates on the website and later the mobile app.

## Critical Principles

- Do not copy-paste article text from other publishers.
- Do not reuse copyrighted images unless licensed, public domain, Creative Commons with correct attribution, or explicitly allowed.
- Keep every AI-assisted story linked to its internal source evidence.
- Prefer RSS, public APIs, official websites, press releases, government portals, public datasets, and licensed feeds over aggressive crawling.
- Respect robots.txt, source terms, rate limits, and takedown requests.
- Use humans for final publishing decisions.
- Clearly separate verified news, developing stories, opinion, sponsored content, and AI-assisted media.

## Recommended Tech Stack

### Web Frontend

- Framework: Next.js with TypeScript
- Styling: Tailwind CSS
- UI components: shadcn/ui or a small internal component library
- Data fetching: TanStack Query
- Forms: React Hook Form plus Zod
- Realtime: WebSocket client or Server-Sent Events for live headlines
- SEO: Next.js metadata, structured data, XML sitemap, RSS feed

Why: Next.js gives strong SEO, fast article pages, server rendering, and a good path to admin tools in the same ecosystem.

### Admin Panel

- Framework: Next.js with TypeScript
- Auth: Auth.js / NextAuth, or Clerk if a managed auth provider is preferred
- Roles: owner, editor-in-chief, editor, writer, analyst, social manager
- Core screens:
  - Source monitor
  - Story clusters
  - Verification desk
  - Article editor
  - AI assistant panel
  - Image/licensing panel
  - Telegram publisher
  - Social draft queue for WhatsApp, Instagram, and X
  - Analytics dashboard

### Backend API

- Framework: NestJS with TypeScript
- API style: REST first, GraphQL optional later
- ORM: Prisma
- Database: PostgreSQL
- Realtime: Socket.IO or native WebSocket gateway in NestJS
- Cache and pub/sub: Redis
- Background jobs: BullMQ for Node jobs
- File storage: S3-compatible storage such as AWS S3, Cloudflare R2, or MinIO locally

Why: NestJS is structured enough for a large system and works well with WebSockets, queues, roles, and modular services.

### AI and Machine Learning

- LLM provider layer: create an adapter so the system can use OpenAI, Anthropic, Gemini, local models, or another provider without rewriting the app.
- Embeddings: store article/source embeddings in PostgreSQL with pgvector.
- NLP extraction:
  - entities: people, places, organizations
  - dates and timelines
  - locations
  - claims
  - source credibility signals
- AI tasks:
  - story clustering
  - duplicate detection
  - source comparison
  - fact extraction
  - original article draft generation
  - headline generation
  - short social captions
  - WhatsApp-channel hooks
  - Telegram captions
  - SEO title and meta description
  - bias/tone review
  - contradiction detection

### Scraping and Source Acquisition

Use "source acquisition" as the internal term, because the system should include more than scraping.

- RSS ingestion: feedparser or a Node RSS parser
- Static page extraction: Python workers with Trafilatura and BeautifulSoup
- Complex page rendering: Playwright only when needed
- Crawling framework: Scrapy for Python-based crawling, or Crawlee if the team prefers Node
- Scheduling: Celery with Redis, or BullMQ if staying mostly in Node
- Deduplication: canonical URL normalization, content hashing, embeddings similarity
- Rate limiting: per-domain limits
- Compliance:
  - robots.txt checks
  - source allow/block list
  - crawl logs
  - takedown workflow

Recommended split:

- NestJS owns the product API, users, publishing, auth, realtime, and admin.
- Python workers own source acquisition, extraction, ML pipelines, and heavy AI processing.
- Redis queues connect them.

### Search and Discovery

- MVP: PostgreSQL full-text search
- Growth stage: Meilisearch for fast site search
- Later: OpenSearch if advanced indexing, analytics, and scale require it

### Recommendation Algorithm

Start simple and improve in layers.

MVP personalization:

- User-selected interests during signup.
- Location preference.
- Followed topics.
- Category clicks.
- Article reads.
- Saves and shares.
- Dwell time, with privacy limits.

Ranking signals:

- interest match
- recency
- locality
- trending score
- source confidence
- editorial importance
- topic diversity
- freshness decay

Later ML:

- Content-based recommendations from categories, tags, locations, and embeddings.
- Collaborative filtering once there are enough users.
- Hybrid ranking model using user behavior plus article embeddings.
- Offline model training jobs.
- Online feature store using Redis or PostgreSQL materialized views.

Important: the algorithm should not trap users in one topic. Add diversity controls so readers still see important public-interest news.

### Mobile App

- Framework: Expo React Native
- Auth: same auth provider as web
- API: same NestJS API
- Push notifications: Expo Notifications first, Firebase Cloud Messaging later if needed
- Realtime: WebSocket for live headlines and breaking news

Build after the website and admin are stable.

### Social and Channel Publishing

Telegram:

- Automate via Telegram Bot API.
- Publish approved posts to a Telegram channel.
- Support text, image, link, and breaking-news formats.

WhatsApp:

- Start with AI-generated drafts and manual posting.
- Store channel-ready text in the admin queue.
- Later review official WhatsApp Business/API options based on what is allowed for the exact account type.

Instagram:

- Start with image/story/reel caption drafts and manual posting.
- Later integrate official Meta APIs where account type and permissions allow it.

X:

- Start with draft queue.
- Later integrate official X API if pricing, permissions, and policy fit the business.

## Realtime Architecture

WebSocket can absolutely be used here.

Use realtime for:

- breaking-news banners
- live headline updates
- article status changes in admin
- editor collaboration indicators
- notification counters
- publish progress
- Telegram publish results

Suggested flow:

1. Editor publishes an article.
2. Backend writes article to PostgreSQL.
3. Backend publishes an event to Redis.
4. WebSocket gateway receives the event.
5. Connected website/admin clients receive the update.
6. Telegram job is queued if enabled.
7. Social drafts are generated and placed in the approval queue.

## High-Level Architecture

```text
Sources
  RSS | Official sites | Public pages | APIs | Press releases | Datasets
    |
    v
Source Acquisition Workers
  Scrapy/Playwright/Trafilatura | rate limits | robots.txt | dedupe
    |
    v
AI Processing
  extraction | clustering | claims | summaries | embeddings | risk checks
    |
    v
Editorial Admin
  verify | edit | approve | image licensing | schedule | publish
    |
    v
Publishing API
  website | app feed | Telegram | social draft queue | RSS | sitemap
    |
    v
Readers
  local hot news | world hot news | personalized feeds | notifications
```

## Main Data Models

- User
- UserPreference
- UserEvent
- Topic
- Source
- SourceFetch
- SourceDocument
- StoryCluster
- Claim
- Article
- ArticleVersion
- MediaAsset
- MediaLicense
- EditorialReview
- PublishTarget
- SocialDraft
- Notification
- RecommendationProfile

## Local Development Target

The first working version should be a monorepo:

```text
dira-news/
  apps/
    web/
    admin/
    api/
    mobile/
  workers/
    acquisition/
    ai/
  packages/
    database/
    shared/
    config/
  docs/
```

For the empty workspace, the first implementation step should be:

1. Create a monorepo.
2. Add Next.js web.
3. Add NestJS API.
4. Add PostgreSQL, Redis, and object storage through Docker Compose.
5. Add Prisma schema.
6. Build landing page, auth, article model, and admin article editor.
7. Add source ingestion after the publishing core exists.


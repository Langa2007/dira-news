--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AiOutputType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AiOutputType" AS ENUM (
    'ENTITY_EXTRACTION',
    'CLAIM_EXTRACTION',
    'STORY_CLUSTER_SUMMARY',
    'FACT_TABLE',
    'ARTICLE_OUTLINE',
    'ARTICLE_DRAFT',
    'HEADLINE_OPTIONS',
    'SEO_METADATA',
    'TELEGRAM_CAPTION',
    'WHATSAPP_HOOK',
    'X_DRAFT',
    'INSTAGRAM_CAPTION',
    'BIAS_SCAN',
    'SIMILARITY_SCAN',
    'CONTRADICTION_SCAN'
);


--
-- Name: ArticleStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ArticleStatus" AS ENUM (
    'DRAFT',
    'REVIEW',
    'APPROVED',
    'SCHEDULED',
    'PUBLISHED',
    'ARCHIVED',
    'CORRECTED'
);


--
-- Name: CategorySlug; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CategorySlug" AS ENUM (
    'LOCAL',
    'WORLD',
    'POLITICS',
    'BUSINESS',
    'TECHNOLOGY',
    'SPORTS',
    'ENTERTAINMENT',
    'HEALTH',
    'EDUCATION',
    'OPINION'
);


--
-- Name: FetchStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FetchStatus" AS ENUM (
    'QUEUED',
    'RUNNING',
    'SUCCESS',
    'FAILED',
    'SKIPPED',
    'BLOCKED'
);


--
-- Name: MediaLicenseStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MediaLicenseStatus" AS ENUM (
    'UNKNOWN',
    'NEEDS_REVIEW',
    'APPROVED',
    'REJECTED',
    'EXPIRED'
);


--
-- Name: PublishStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PublishStatus" AS ENUM (
    'QUEUED',
    'PUBLISHED',
    'FAILED',
    'CANCELLED'
);


--
-- Name: PublishTargetType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PublishTargetType" AS ENUM (
    'WEBSITE',
    'APP_FEED',
    'TELEGRAM',
    'WHATSAPP_DRAFT',
    'INSTAGRAM_DRAFT',
    'X_DRAFT',
    'RSS',
    'SITEMAP'
);


--
-- Name: SourceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SourceStatus" AS ENUM (
    'ACTIVE',
    'PAUSED',
    'BLOCKED',
    'TAKEDOWN'
);


--
-- Name: SourceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SourceType" AS ENUM (
    'RSS',
    'API',
    'STATIC_PAGE',
    'RENDERED_PAGE',
    'SOCIAL_PUBLIC',
    'DATASET',
    'PRESS_RELEASE',
    'LICENSED_FEED'
);


--
-- Name: StoryClusterStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."StoryClusterStatus" AS ENUM (
    'CANDIDATE',
    'REVIEWING',
    'APPROVED',
    'DISMISSED',
    'MERGED'
);


--
-- Name: UserEventType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserEventType" AS ENUM (
    'ARTICLE_OPEN',
    'READ_DEPTH',
    'SAVE',
    'SHARE',
    'SEARCH',
    'NOTIFICATION_CLICK',
    'HIDE_TOPIC',
    'FOLLOW_TOPIC'
);


--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'DELETED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AiOutput; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AiOutput" (
    id text NOT NULL,
    type public."AiOutputType" NOT NULL,
    provider text NOT NULL,
    model text NOT NULL,
    "promptKey" text,
    "promptHash" text,
    input jsonb NOT NULL,
    output jsonb NOT NULL,
    score double precision,
    "clusterId" text,
    "articleId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Article; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Article" (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    subtitle text,
    status public."ArticleStatus" DEFAULT 'DRAFT'::public."ArticleStatus" NOT NULL,
    category public."CategorySlug" NOT NULL,
    "regionId" text,
    "authorId" text,
    "editorId" text,
    "clusterId" text,
    body text,
    summary text,
    "seoTitle" text,
    "seoDescription" text,
    "isBreaking" boolean DEFAULT false NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "scheduledAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ArticleMedia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ArticleMedia" (
    "articleId" text NOT NULL,
    "mediaId" text NOT NULL,
    role text DEFAULT 'BODY'::text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


--
-- Name: ArticleTopic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ArticleTopic" (
    "articleId" text NOT NULL,
    "topicId" text NOT NULL,
    weight double precision DEFAULT 1 NOT NULL
);


--
-- Name: ArticleVersion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ArticleVersion" (
    id text NOT NULL,
    "articleId" text NOT NULL,
    version integer NOT NULL,
    title text NOT NULL,
    body text,
    summary text,
    "editorId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "actorId" text,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Claim; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Claim" (
    id text NOT NULL,
    "documentId" text,
    "articleId" text,
    text text NOT NULL,
    status text DEFAULT 'UNREVIEWED'::text NOT NULL,
    confidence double precision DEFAULT 0 NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: EditorialReview; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EditorialReview" (
    id text NOT NULL,
    "articleId" text NOT NULL,
    "reviewerId" text NOT NULL,
    status text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: MediaAsset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MediaAsset" (
    id text NOT NULL,
    url text NOT NULL,
    "storageKey" text,
    title text,
    "altText" text,
    "sourceUrl" text,
    owner text,
    "licenseType" text,
    attribution text,
    "licenseStatus" public."MediaLicenseStatus" DEFAULT 'NEEDS_REVIEW'::public."MediaLicenseStatus" NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text,
    title text NOT NULL,
    body text,
    data jsonb,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Permission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Permission" (
    id text NOT NULL,
    key text NOT NULL,
    description text
);


--
-- Name: PublishTarget; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PublishTarget" (
    id text NOT NULL,
    "articleId" text NOT NULL,
    type public."PublishTargetType" NOT NULL,
    status public."PublishStatus" DEFAULT 'QUEUED'::public."PublishStatus" NOT NULL,
    "externalId" text,
    payload jsonb,
    error text,
    "scheduledAt" timestamp(3) without time zone,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: RecommendationProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RecommendationProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "topicWeights" jsonb NOT NULL,
    "regionWeights" jsonb,
    "lastRefreshedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Region; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Region" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "countryCode" text,
    "parentId" text
);


--
-- Name: Role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Role" (
    id text NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    description text
);


--
-- Name: RolePermission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RolePermission" (
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: SocialDraft; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SocialDraft" (
    id text NOT NULL,
    "articleId" text,
    target public."PublishTargetType" NOT NULL,
    text text NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Source; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Source" (
    id text NOT NULL,
    name text NOT NULL,
    type public."SourceType" NOT NULL,
    status public."SourceStatus" DEFAULT 'ACTIVE'::public."SourceStatus" NOT NULL,
    "homepageUrl" text,
    "feedUrl" text,
    "apiUrl" text,
    "regionId" text,
    category public."CategorySlug",
    "credibilityScore" double precision DEFAULT 0.5 NOT NULL,
    "crawlIntervalMins" integer DEFAULT 60 NOT NULL,
    "robotsAllowed" boolean,
    "termsNotes" text,
    "takedownRequested" boolean DEFAULT false NOT NULL,
    "lastFetchedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SourceDocument; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SourceDocument" (
    id text NOT NULL,
    "sourceId" text NOT NULL,
    "fetchId" text,
    "canonicalUrl" text,
    title text NOT NULL,
    author text,
    "publishedAt" timestamp(3) without time zone,
    "extractedText" text,
    "textHash" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: SourceFetch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SourceFetch" (
    id text NOT NULL,
    "sourceId" text NOT NULL,
    status public."FetchStatus" DEFAULT 'QUEUED'::public."FetchStatus" NOT NULL,
    url text NOT NULL,
    reason text,
    "httpStatus" integer,
    error text,
    "startedAt" timestamp(3) without time zone,
    "finishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: StoryCluster; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StoryCluster" (
    id text NOT NULL,
    title text NOT NULL,
    summary text,
    status public."StoryClusterStatus" DEFAULT 'CANDIDATE'::public."StoryClusterStatus" NOT NULL,
    category public."CategorySlug",
    "localScore" double precision DEFAULT 0 NOT NULL,
    "worldScore" double precision DEFAULT 0 NOT NULL,
    "hotnessScore" double precision DEFAULT 0 NOT NULL,
    "confidenceScore" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: StoryClusterSource; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StoryClusterSource" (
    "clusterId" text NOT NULL,
    "documentId" text NOT NULL,
    confidence double precision DEFAULT 0.5 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Topic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Topic" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    category public."CategorySlug",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    "passwordHash" text,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "emailVerifiedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: UserEvent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserEvent" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."UserEventType" NOT NULL,
    "articleId" text,
    "topicId" text,
    value double precision,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: UserPreference; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserPreference" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "topicId" text,
    "regionId" text,
    weight double precision DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: UserRole; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserRole" (
    "userId" text NOT NULL,
    "roleId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: AiOutput; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiOutput" (id, type, provider, model, "promptKey", "promptHash", input, output, score, "clusterId", "articleId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Article; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Article" (id, slug, title, subtitle, status, category, "regionId", "authorId", "editorId", "clusterId", body, summary, "seoTitle", "seoDescription", "isBreaking", "publishedAt", "scheduledAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ArticleMedia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ArticleMedia" ("articleId", "mediaId", role, "sortOrder") FROM stdin;
\.


--
-- Data for Name: ArticleTopic; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ArticleTopic" ("articleId", "topicId", weight) FROM stdin;
\.


--
-- Data for Name: ArticleVersion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ArticleVersion" (id, "articleId", version, title, body, summary, "editorId", "createdAt") FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "actorId", action, entity, "entityId", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: Claim; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Claim" (id, "documentId", "articleId", text, status, confidence, metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: EditorialReview; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EditorialReview" (id, "articleId", "reviewerId", status, notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: MediaAsset; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MediaAsset" (id, url, "storageKey", title, "altText", "sourceUrl", owner, "licenseType", attribution, "licenseStatus", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, "userId", title, body, data, "readAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Permission" (id, key, description) FROM stdin;
perm-users-read	users.read	users.read
perm-sources-manage	sources.manage	sources.manage
perm-articles-write	articles.write	articles.write
perm-articles-review	articles.review	articles.review
perm-articles-publish	articles.publish	articles.publish
perm-ai-outputs-read	ai.outputs.read	ai.outputs.read
perm-recommendations-manage	recommendations.manage	recommendations.manage
perm-publishing-manage	publishing.manage	publishing.manage
\.


--
-- Data for Name: PublishTarget; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PublishTarget" (id, "articleId", type, status, "externalId", payload, error, "scheduledAt", "publishedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RecommendationProfile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RecommendationProfile" (id, "userId", "topicWeights", "regionWeights", "lastRefreshedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Region; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Region" (id, name, slug, "countryCode", "parentId") FROM stdin;
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Role" (id, key, name, description) FROM stdin;
role-reader	reader	Reader	\N
role-editor	editor	Editor	\N
role-editor-in-chief	editor_in_chief	Editor in Chief	\N
role-admin	admin	Admin	\N
\.


--
-- Data for Name: RolePermission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RolePermission" ("roleId", "permissionId", "createdAt") FROM stdin;
role-editor	perm-articles-write	2026-06-06 20:00:54.605
role-editor	perm-articles-review	2026-06-06 20:00:54.605
role-editor	perm-ai-outputs-read	2026-06-06 20:00:54.605
role-editor-in-chief	perm-articles-write	2026-06-06 20:00:54.605
role-editor-in-chief	perm-articles-review	2026-06-06 20:00:54.605
role-editor-in-chief	perm-articles-publish	2026-06-06 20:00:54.605
role-editor-in-chief	perm-ai-outputs-read	2026-06-06 20:00:54.605
role-editor-in-chief	perm-publishing-manage	2026-06-06 20:00:54.605
role-admin	perm-users-read	2026-06-06 20:00:54.605
role-admin	perm-sources-manage	2026-06-06 20:00:54.605
role-admin	perm-articles-write	2026-06-06 20:00:54.605
role-admin	perm-articles-review	2026-06-06 20:00:54.605
role-admin	perm-articles-publish	2026-06-06 20:00:54.605
role-admin	perm-ai-outputs-read	2026-06-06 20:00:54.605
role-admin	perm-recommendations-manage	2026-06-06 20:00:54.605
role-admin	perm-publishing-manage	2026-06-06 20:00:54.605
\.


--
-- Data for Name: SocialDraft; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SocialDraft" (id, "articleId", target, text, status, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Source; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Source" (id, name, type, status, "homepageUrl", "feedUrl", "apiUrl", "regionId", category, "credibilityScore", "crawlIntervalMins", "robotsAllowed", "termsNotes", "takedownRequested", "lastFetchedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SourceDocument; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SourceDocument" (id, "sourceId", "fetchId", "canonicalUrl", title, author, "publishedAt", "extractedText", "textHash", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: SourceFetch; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SourceFetch" (id, "sourceId", status, url, reason, "httpStatus", error, "startedAt", "finishedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: StoryCluster; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StoryCluster" (id, title, summary, status, category, "localScore", "worldScore", "hotnessScore", "confidenceScore", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StoryClusterSource; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StoryClusterSource" ("clusterId", "documentId", confidence, "createdAt") FROM stdin;
\.


--
-- Data for Name: Topic; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Topic" (id, name, slug, description, category, "createdAt") FROM stdin;
topic-local	Local	local	\N	LOCAL	2026-06-06 20:00:54.616
topic-world	World	world	\N	WORLD	2026-06-06 20:00:54.616
topic-politics	Politics	politics	\N	POLITICS	2026-06-06 20:00:54.616
topic-business	Business	business	\N	BUSINESS	2026-06-06 20:00:54.616
topic-technology	Technology	technology	\N	TECHNOLOGY	2026-06-06 20:00:54.616
topic-sports	Sports	sports	\N	SPORTS	2026-06-06 20:00:54.616
topic-entertainment	Entertainment	entertainment	\N	ENTERTAINMENT	2026-06-06 20:00:54.616
topic-health	Health	health	\N	HEALTH	2026-06-06 20:00:54.616
topic-education	Education	education	\N	EDUCATION	2026-06-06 20:00:54.616
topic-opinion	Opinion	opinion	\N	OPINION	2026-06-06 20:00:54.616
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, name, "passwordHash", status, "emailVerifiedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UserEvent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserEvent" (id, "userId", type, "articleId", "topicId", value, metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: UserPreference; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserPreference" (id, "userId", "topicId", "regionId", weight, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UserRole; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserRole" ("userId", "roleId", "createdAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
20260605180823-phase-one-backend	5c87e04f906203b179d62f036a6ba3a49da62765a88b834e657c4a56ce7e0818	2026-06-06 20:00:54.272695+03	20260605180823_phase_one_backend	\N	\N	2026-06-06 20:00:54.272695+03	1
\.


--
-- Name: AiOutput AiOutput_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiOutput"
    ADD CONSTRAINT "AiOutput_pkey" PRIMARY KEY (id);


--
-- Name: ArticleMedia ArticleMedia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ArticleMedia"
    ADD CONSTRAINT "ArticleMedia_pkey" PRIMARY KEY ("articleId", "mediaId", role);


--
-- Name: ArticleTopic ArticleTopic_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ArticleTopic"
    ADD CONSTRAINT "ArticleTopic_pkey" PRIMARY KEY ("articleId", "topicId");


--
-- Name: ArticleVersion ArticleVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ArticleVersion"
    ADD CONSTRAINT "ArticleVersion_pkey" PRIMARY KEY (id);


--
-- Name: Article Article_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Article"
    ADD CONSTRAINT "Article_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Claim Claim_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Claim"
    ADD CONSTRAINT "Claim_pkey" PRIMARY KEY (id);


--
-- Name: EditorialReview EditorialReview_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EditorialReview"
    ADD CONSTRAINT "EditorialReview_pkey" PRIMARY KEY (id);


--
-- Name: MediaAsset MediaAsset_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MediaAsset"
    ADD CONSTRAINT "MediaAsset_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY (id);


--
-- Name: PublishTarget PublishTarget_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PublishTarget"
    ADD CONSTRAINT "PublishTarget_pkey" PRIMARY KEY (id);


--
-- Name: RecommendationProfile RecommendationProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RecommendationProfile"
    ADD CONSTRAINT "RecommendationProfile_pkey" PRIMARY KEY (id);


--
-- Name: Region Region_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Region"
    ADD CONSTRAINT "Region_pkey" PRIMARY KEY (id);


--
-- Name: RolePermission RolePermission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId");


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: SocialDraft SocialDraft_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SocialDraft"
    ADD CONSTRAINT "SocialDraft_pkey" PRIMARY KEY (id);


--
-- Name: SourceDocument SourceDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SourceDocument"
    ADD CONSTRAINT "SourceDocument_pkey" PRIMARY KEY (id);


--
-- Name: SourceFetch SourceFetch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SourceFetch"
    ADD CONSTRAINT "SourceFetch_pkey" PRIMARY KEY (id);


--
-- Name: Source Source_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Source"
    ADD CONSTRAINT "Source_pkey" PRIMARY KEY (id);


--
-- Name: StoryClusterSource StoryClusterSource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StoryClusterSource"
    ADD CONSTRAINT "StoryClusterSource_pkey" PRIMARY KEY ("clusterId", "documentId");


--
-- Name: StoryCluster StoryCluster_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StoryCluster"
    ADD CONSTRAINT "StoryCluster_pkey" PRIMARY KEY (id);


--
-- Name: Topic Topic_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Topic"
    ADD CONSTRAINT "Topic_pkey" PRIMARY KEY (id);


--
-- Name: UserEvent UserEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserEvent"
    ADD CONSTRAINT "UserEvent_pkey" PRIMARY KEY (id);


--
-- Name: UserPreference UserPreference_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserPreference"
    ADD CONSTRAINT "UserPreference_pkey" PRIMARY KEY (id);


--
-- Name: UserRole UserRole_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId", "roleId");


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ArticleVersion_articleId_version_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ArticleVersion_articleId_version_key" ON public."ArticleVersion" USING btree ("articleId", version);


--
-- Name: Article_isBreaking_publishedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Article_isBreaking_publishedAt_idx" ON public."Article" USING btree ("isBreaking", "publishedAt");


--
-- Name: Article_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Article_slug_key" ON public."Article" USING btree (slug);


--
-- Name: Article_status_category_publishedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Article_status_category_publishedAt_idx" ON public."Article" USING btree (status, category, "publishedAt");


--
-- Name: AuditLog_actorId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_actorId_createdAt_idx" ON public."AuditLog" USING btree ("actorId", "createdAt");


--
-- Name: AuditLog_entity_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_entity_entityId_idx" ON public."AuditLog" USING btree (entity, "entityId");


--
-- Name: Permission_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Permission_key_key" ON public."Permission" USING btree (key);


--
-- Name: PublishTarget_type_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PublishTarget_type_status_idx" ON public."PublishTarget" USING btree (type, status);


--
-- Name: RecommendationProfile_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "RecommendationProfile_userId_key" ON public."RecommendationProfile" USING btree ("userId");


--
-- Name: Region_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Region_slug_key" ON public."Region" USING btree (slug);


--
-- Name: Role_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Role_key_key" ON public."Role" USING btree (key);


--
-- Name: SourceDocument_canonicalUrl_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SourceDocument_canonicalUrl_idx" ON public."SourceDocument" USING btree ("canonicalUrl");


--
-- Name: SourceDocument_sourceId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SourceDocument_sourceId_createdAt_idx" ON public."SourceDocument" USING btree ("sourceId", "createdAt");


--
-- Name: SourceDocument_textHash_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SourceDocument_textHash_idx" ON public."SourceDocument" USING btree ("textHash");


--
-- Name: Source_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Source_category_idx" ON public."Source" USING btree (category);


--
-- Name: Source_status_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Source_status_type_idx" ON public."Source" USING btree (status, type);


--
-- Name: Topic_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Topic_slug_key" ON public."Topic" USING btree (slug);


--
-- Name: UserEvent_type_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserEvent_type_createdAt_idx" ON public."UserEvent" USING btree (type, "createdAt");


--
-- Name: UserEvent_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserEvent_userId_createdAt_idx" ON public."UserEvent" USING btree ("userId", "createdAt");


--
-- Name: UserPreference_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserPreference_userId_idx" ON public."UserPreference" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: AiOutput AiOutput_articleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiOutput"
    ADD CONSTRAINT "AiOutput_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES public."Article"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AiOutput AiOutput_clusterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiOutput"
    ADD CONSTRAINT "AiOutput_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES public."StoryCluster"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ArticleMedia ArticleMedia_articleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ArticleMedia"
    ADD CONSTRAINT "ArticleMedia_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES public."Article"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ArticleMedia ArticleMedia_mediaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ArticleMedia"
    ADD CONSTRAINT "ArticleMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES public."MediaAsset"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ArticleTopic ArticleTopic_articleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ArticleTopic"
    ADD CONSTRAINT "ArticleTopic_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES public."Article"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ArticleTopic ArticleTopic_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ArticleTopic"
    ADD CONSTRAINT "ArticleTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public."Topic"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ArticleVersion ArticleVersion_articleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ArticleVersion"
    ADD CONSTRAINT "ArticleVersion_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES public."Article"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Article Article_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Article"
    ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Article Article_clusterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Article"
    ADD CONSTRAINT "Article_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES public."StoryCluster"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Article Article_editorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Article"
    ADD CONSTRAINT "Article_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Article Article_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Article"
    ADD CONSTRAINT "Article_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public."Region"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AuditLog AuditLog_actorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Claim Claim_articleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Claim"
    ADD CONSTRAINT "Claim_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES public."Article"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Claim Claim_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Claim"
    ADD CONSTRAINT "Claim_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."SourceDocument"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EditorialReview EditorialReview_articleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EditorialReview"
    ADD CONSTRAINT "EditorialReview_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES public."Article"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EditorialReview EditorialReview_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EditorialReview"
    ADD CONSTRAINT "EditorialReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PublishTarget PublishTarget_articleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PublishTarget"
    ADD CONSTRAINT "PublishTarget_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES public."Article"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RecommendationProfile RecommendationProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RecommendationProfile"
    ADD CONSTRAINT "RecommendationProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Region Region_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Region"
    ADD CONSTRAINT "Region_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Region"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RolePermission RolePermission_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public."Permission"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RolePermission RolePermission_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SocialDraft SocialDraft_articleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SocialDraft"
    ADD CONSTRAINT "SocialDraft_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES public."Article"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SourceDocument SourceDocument_fetchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SourceDocument"
    ADD CONSTRAINT "SourceDocument_fetchId_fkey" FOREIGN KEY ("fetchId") REFERENCES public."SourceFetch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SourceDocument SourceDocument_sourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SourceDocument"
    ADD CONSTRAINT "SourceDocument_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES public."Source"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SourceFetch SourceFetch_sourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SourceFetch"
    ADD CONSTRAINT "SourceFetch_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES public."Source"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Source Source_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Source"
    ADD CONSTRAINT "Source_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public."Region"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StoryClusterSource StoryClusterSource_clusterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StoryClusterSource"
    ADD CONSTRAINT "StoryClusterSource_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES public."StoryCluster"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StoryClusterSource StoryClusterSource_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StoryClusterSource"
    ADD CONSTRAINT "StoryClusterSource_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."SourceDocument"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserEvent UserEvent_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserEvent"
    ADD CONSTRAINT "UserEvent_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public."Topic"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserEvent UserEvent_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserEvent"
    ADD CONSTRAINT "UserEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserPreference UserPreference_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserPreference"
    ADD CONSTRAINT "UserPreference_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public."Region"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserPreference UserPreference_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserPreference"
    ADD CONSTRAINT "UserPreference_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public."Topic"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserPreference UserPreference_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserPreference"
    ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRole UserRole_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRole UserRole_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


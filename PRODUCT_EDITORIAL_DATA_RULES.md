# Dira News Product, Editorial, and Data Rules

Planning date: 2026-06-05

This document defines how Dira News should behave before automation, AI, scraping, publishing, or personalization are allowed to scale.

## Product Identity

Dira News is a news compass. It helps readers understand what is happening locally and globally without copying other publishers or flooding users with noise.

The platform should be built as a backend-first media intelligence system:

- gather information from permitted sources
- compare multiple sources
- extract facts and claims
- create original Dira News drafts
- support human editorial review
- rank local hot news and world hot news
- personalize feeds responsibly
- publish to website, app, Telegram, and prepared social-channel drafts

## Editorial Categories

Primary categories:

- Local
- World
- Politics
- Business
- Technology
- Sports
- Entertainment
- Health
- Education
- Opinion

Optional later categories:

- Climate
- Religion
- Investigations
- Lifestyle
- Jobs
- Markets
- Travel

## Story Types

- Breaking news: urgent story with short confirmed facts.
- Standard article: complete news article with context.
- Developing story: evolving story that receives updates.
- Explainer: background and meaning of a topic.
- Opinion: clearly labeled viewpoint content.
- Short brief: concise summary for feeds and social channels.
- Live update: chronological updates during active events.
- Social-only brief: channel-specific text for Telegram, WhatsApp, Instagram, or X.

## Editorial Rules

- Dira News must not copy-paste articles from other publishers.
- AI-generated drafts must be based on extracted facts, not copied prose.
- Every AI-assisted article must keep internal links to the source documents used.
- Multiple-source verification is preferred for all important news.
- A single-source story must be labeled internally as lower confidence until confirmed.
- Quotes must be short, necessary, attributed, and preserved accurately.
- Corrections must be tracked as first-class editorial records.
- Opinion must never be mixed with straight news.
- Sponsored content must be clearly labeled.
- Developing stories must show update timestamps.
- Editors approve publication; AI does not publish by itself.

## Source Rules

Preferred source types:

- RSS feeds
- official websites
- government portals
- public datasets
- press releases
- public agency statements
- public social posts
- licensed news feeds
- event/sports/business feeds with allowed access

Source acquisition rules:

- Respect robots.txt.
- Respect source terms where known.
- Apply per-domain rate limits.
- Store fetch logs.
- Keep a source allow/block list.
- Support source takedown flags.
- Do not bypass paywalls.
- Do not scrape private groups, private chats, or restricted accounts.
- Do not use stolen, leaked, or unauthorized credentials.

## Image And Media Rules

Allowed media:

- original Dira News photos or graphics
- licensed stock or editorial images
- public-domain images
- Creative Commons images with correct attribution and license terms
- generated illustrations where appropriate
- embedded official posts where terms allow it

Disallowed media:

- copied news-site images without rights
- watermarked images from other publishers
- private social images without permission
- images with unclear ownership for publication

Every media asset should store:

- source URL
- creator/owner
- license type
- attribution text
- usage restrictions
- approval status

## AI Usage Rules

AI can:

- cluster stories
- extract facts
- identify claims
- compare sources
- find contradictions
- summarize source material for editors
- draft original articles
- suggest headlines
- create WhatsApp-channel hooks
- create Telegram captions
- create X and Instagram drafts
- check tone
- flag unsupported claims
- detect similarity to source wording

AI cannot:

- publish without approval
- invent facts
- remove uncertainty from uncertain information
- hide source disagreements
- present opinion as news
- reuse protected wording from sources
- choose copyrighted images without a license record

## Personalization Rules

The feed algorithm should learn from:

- signup preferences
- location preference
- selected topics
- article opens
- read depth
- saved articles
- shares
- searches
- notification clicks
- hidden topics

The feed algorithm must still show:

- major local news
- major world news
- urgent public-interest stories
- editor's picks
- important developing stories

Avoid trapping users in a narrow bubble. Add diversity controls so a user who reads sports, for example, can still see major politics, safety, weather, health, or world events.

## Data Governance

Store only what is needed.

Required logs:

- source fetch logs
- AI output logs
- editorial action logs
- publish logs
- recommendation event logs
- media license logs

Privacy rules:

- user event data should support personalization, not surveillance
- sensitive user data should be minimized
- users should be able to update preferences
- users should be able to disable personalization where required
- data retention rules should be defined before scale

## Publication Rules

Publishing targets:

- website
- mobile app feed
- Telegram channel
- WhatsApp draft queue
- Instagram draft queue
- X draft queue
- RSS feed
- sitemap

Telegram can be automated after editorial approval.

WhatsApp, Instagram, and X should begin as AI-generated draft queues with human posting or approval. Official API integrations can be added later if account type, access, pricing, and platform policy allow it.

## Trust Features

Dira News should eventually support:

- corrections page
- source transparency notes
- author/editor profiles
- AI-assistance audit trail
- article update history
- report-a-problem flow
- media license review
- source quality dashboard


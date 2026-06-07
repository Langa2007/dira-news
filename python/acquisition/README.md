# Dira News Source Acquisition Worker

This worker gathers source material for Dira News. It is intentionally built with Python standard-library components first so the core acquisition behavior can be tested locally without network dependencies.

Later phases can add Scrapy, Playwright browser binaries, richer extraction libraries, and direct queue workers.

## Current Features

- RSS parsing
- Static HTML extraction
- robots.txt permission checks
- Per-domain rate limiting
- Canonical URL normalization
- Text hashing for duplicate detection
- JSONL crawl logs
- Backend-compatible source document payloads
- Optional rendered-page extractor interface

## Tests

From the project root:

```bash
python -m unittest discover -s python/acquisition/tests -p "test_*.py"
```

## One-shot deployed scrape

The runner reads `.env`, logs in with the admin credentials, uses `BACKEND_URL`, and posts extracted documents back to the backend API:

```bash
python -m python.acquisition.run_scraper
```

Run only a small batch:

```bash
python -m python.acquisition.run_scraper --limit 10
```

Run one source:

```bash
python -m python.acquisition.run_scraper --source-id SOURCE_ID
```

If there are no sources yet, add these to `.env`:

```bash
SCRAPER_SOURCE_URL=https://example.com/news
SCRAPER_SOURCE_NAME=Example News
SCRAPER_SOURCE_TYPE=STATIC_PAGE
```

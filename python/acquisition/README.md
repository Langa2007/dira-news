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


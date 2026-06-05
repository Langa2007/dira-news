# Phase 2 Verification

Last updated: 2026-06-05

Phase 2 builds the source acquisition worker. The worker must be testable without relying on live websites, because crawling tests that depend on the internet are fragile and slow.

## Verification Goals

- RSS feeds can be parsed into source items.
- Static HTML pages can be extracted into title, text, links, and metadata.
- Rendered-page extraction has a defined interface and a clear dependency error when Playwright is unavailable.
- robots.txt rules are respected.
- Per-domain rate limiting prevents rapid repeated fetches.
- Canonical URL normalization is stable.
- Text hashing supports duplicate detection.
- Crawl logs are written as JSONL records.
- Extracted documents can be converted into backend-compatible payloads.

## Test Command

Run from the project root:

```bash
python -m unittest discover -s python/acquisition/tests -p "test_*.py"
```

## Expected Output

The command should finish with:

```text
OK
```

## Phase 2 Build Items

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

## Actual Output

Command:

```bash
python -m unittest discover -s python/acquisition/tests -p "test_*.py"
```

Output:

```text
........
----------------------------------------------------------------------
Ran 8 tests in 0.424s

OK
```

# Phase 3 Verification

Last updated: 2026-06-05

Phase 3 builds the AI and ML core that turns extracted source documents into structured story intelligence. The first version is provider-ready but locally testable: deterministic heuristics verify the contracts before external LLM providers are connected.

## Verification Goals

- AI provider adapter interface exists.
- Entities can be extracted from source text.
- Claims can be extracted from source text.
- Fact tables can be built from claims and entities.
- Multiple sources can be compared.
- Contradictions can be flagged.
- Related source documents can be clustered.
- Hotness, local relevance, and world relevance can be scored.
- Similarity/plagiarism-risk checks work.
- Original article drafts can be generated without copying full source text.
- Social phrase generation works for Telegram, WhatsApp, X, and Instagram.
- Pipeline output is backend-compatible for `AiOutput` records.

## Test Command

Run from the project root:

```bash
python -m unittest discover -s python/ai_core/tests -p "test_*.py"
```

## Expected Output

The command should finish with:

```text
OK
```

## Phase 3 Build Items

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

## Actual Output

Command:

```bash
python -m unittest discover -s python/ai_core/tests -p "test_*.py"
```

Output:

```text
.......
----------------------------------------------------------------------
Ran 7 tests in 0.013s

OK
```

Regression checks:

```text
python -m unittest discover -s python/acquisition/tests -p "test_*.py"
........
----------------------------------------------------------------------
Ran 8 tests in 0.392s

OK

backend recursive JavaScript syntax check
checked js files
```

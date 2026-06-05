from .models import SimilarityResult
from .text import phrase_ngrams


def plagiarism_risk(draft: str, source_texts: list[str]) -> SimilarityResult:
    draft_phrases = phrase_ngrams(draft)
    source_phrases: set[str] = set()
    for text in source_texts:
        source_phrases |= phrase_ngrams(text)
    overlap = sorted(draft_phrases & source_phrases)
    score = len(overlap) / max(len(draft_phrases), 1)

    if score >= 0.25:
        risk = "HIGH"
    elif score >= 0.1:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return SimilarityResult(score=round(score, 4), risk=risk, overlapping_phrases=overlap[:20])

from .models import SourceComparison, SourceDocumentInput
from .text import keyword_set


def compare_sources(documents: list[SourceDocumentInput]) -> SourceComparison:
    if not documents:
        return SourceComparison(shared_terms=[], unique_by_document={}, source_count=0, agreement_score=0)

    keyword_sets: dict[str, set[str]] = {
        document.id: keyword_set(document.title + " " + document.text) for document in documents
    }
    all_keyword_sets = list(keyword_sets.values())
    shared: set[str] = set(all_keyword_sets[0])
    union: set[str] = set()

    for words in all_keyword_sets:
        shared &= words
        union |= words
    unique_by_document = {
        document_id: sorted(words - shared)[:20] for document_id, words in keyword_sets.items()
    }
    agreement_score = len(shared) / max(len(union), 1)

    return SourceComparison(
        shared_terms=sorted(shared)[:30],
        unique_by_document=unique_by_document,
        source_count=len(documents),
        agreement_score=round(agreement_score, 4),
    )

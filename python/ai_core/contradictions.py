from .models import Claim, Contradiction


def detect_contradictions(claims: list[Claim]) -> list[Contradiction]:
    contradictions: list[Contradiction] = []
    number_map: dict[str, set[str]] = {}

    for claim in claims:
        for number in claim.numbers:
            key = _claim_topic_key(claim.text)
            number_map.setdefault(key, set()).add(number)

    for key, numbers in number_map.items():
        if len(numbers) > 1:
            document_ids = sorted({claim.document_id for claim in claims if _claim_topic_key(claim.text) == key})
            contradictions.append(
                Contradiction(
                    kind="NUMBER_MISMATCH",
                    detail=f"Claims about {key} contain different numbers: {', '.join(sorted(numbers))}",
                    document_ids=document_ids,
                    confidence=0.68,
                )
            )

    return contradictions


def _claim_topic_key(text: str) -> str:
    words = [word.lower().strip(".,;:") for word in text.split() if len(word) > 4]
    return " ".join(words[:4]) if words else "general"


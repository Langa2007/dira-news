from .models import Claim, FactTable, SourceComparison, StoryScores
from .text import normalize_text


def generate_original_draft(title: str, facts: FactTable, comparison: SourceComparison, scores: StoryScores) -> str:
    lead = _lead_sentence(title, facts)
    context = f"The story is supported by {comparison.source_count} source document(s), with an agreement score of {comparison.agreement_score}."
    confidence = f"Dira's current confidence score for this developing report is {scores.confidence}."
    details = " ".join(_rewrite_claim(claim) for claim in facts.claims[:3])
    return normalize_text(" ".join([lead, details, context, confidence]))


def _lead_sentence(title: str, facts: FactTable) -> str:
    place = facts.where[0] if facts.where else "the affected area"
    actor = facts.who[0] if facts.who else "officials"
    return f"{actor} is at the center of a developing story in {place}: {title}."


def _rewrite_claim(claim: Claim) -> str:
    text = claim.text.rstrip(".")
    return f"One verified point says that {text[0].lower() + text[1:]}."

from .models import SourceComparison, StoryScores


LOCAL_TERMS = {"county", "local", "nairobi", "kenya", "ward", "governor"}
WORLD_TERMS = {"world", "global", "markets", "international", "africa", "foreign"}


def score_story(text: str, source_count: int, comparison: SourceComparison) -> StoryScores:
    lowered = text.lower()
    local_hits = sum(1 for term in LOCAL_TERMS if term in lowered)
    world_hits = sum(1 for term in WORLD_TERMS if term in lowered)
    hotness = min(1.0, 0.25 + source_count * 0.18 + comparison.agreement_score * 0.4)
    confidence = min(1.0, 0.35 + source_count * 0.15 + comparison.agreement_score * 0.5)

    return StoryScores(
        hotness=round(hotness, 4),
        local_relevance=round(min(1.0, local_hits / 4), 4),
        world_relevance=round(min(1.0, world_hits / 4), 4),
        confidence=round(confidence, 4),
    )


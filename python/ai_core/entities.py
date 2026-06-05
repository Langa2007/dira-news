import re

from .models import Entity

LOCATION_HINTS = {"County", "Kenya", "Nairobi", "Africa", "World", "Market", "Markets"}
ORG_HINTS = {"Council", "Ministry", "Bank", "Agency", "Commission", "Court", "Police"}


def extract_entities(text: str) -> list[Entity]:
    candidates = re.findall(r"\b(?:[A-Z][a-z]+|[A-Z]{2,})(?:\s+(?:[A-Z][a-z]+|[A-Z]{2,}))*", text)
    entities: dict[str, Entity] = {}

    for candidate in candidates:
        entity_type = _classify(candidate)
        confidence = 0.75 if entity_type != "UNKNOWN" else 0.45
        entities[candidate] = Entity(text=candidate, type=entity_type, confidence=confidence)

    return sorted(entities.values(), key=lambda item: (item.type, item.text))


def _classify(value: str) -> str:
    words = set(value.split())
    if words & ORG_HINTS:
        return "ORG"
    if words & LOCATION_HINTS:
        return "PLACE"
    if len(value.split()) >= 2:
        return "PERSON_OR_ORG"
    return "UNKNOWN"


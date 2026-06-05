from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


def empty_metadata() -> dict[str, Any]:
    return {}


def empty_string_list() -> list[str]:
    return []


@dataclass(frozen=True)
class SourceDocumentInput:
    id: str
    source_id: str
    title: str
    text: str
    canonical_url: str | None = None
    published_at: str | None = None
    metadata: dict[str, Any] = field(default_factory=empty_metadata)


@dataclass(frozen=True)
class Entity:
    text: str
    type: str
    confidence: float


@dataclass(frozen=True)
class Claim:
    text: str
    document_id: str
    confidence: float
    numbers: list[str] = field(default_factory=empty_string_list)
    dates: list[str] = field(default_factory=empty_string_list)


@dataclass(frozen=True)
class FactTable:
    who: list[str]
    what: list[str]
    where: list[str]
    when: list[str]
    claims: list[Claim]


@dataclass(frozen=True)
class SourceComparison:
    shared_terms: list[str]
    unique_by_document: dict[str, list[str]]
    source_count: int
    agreement_score: float


@dataclass(frozen=True)
class Contradiction:
    kind: str
    detail: str
    document_ids: list[str]
    confidence: float


@dataclass(frozen=True)
class StoryCluster:
    id: str
    title: str
    document_ids: list[str]
    score: float


@dataclass(frozen=True)
class StoryScores:
    hotness: float
    local_relevance: float
    world_relevance: float
    confidence: float


@dataclass(frozen=True)
class SimilarityResult:
    score: float
    risk: str
    overlapping_phrases: list[str]


@dataclass(frozen=True)
class SocialDraftBundle:
    telegram: str
    whatsapp: str
    x: str
    instagram: str


@dataclass(frozen=True)
class AiOutputRecord:
    type: str
    provider: str
    model: str
    input: dict[str, Any]
    output: dict[str, Any]
    score: float | None = None
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_backend_payload(self) -> dict[str, Any]:
        return {
            "type": self.type,
            "provider": self.provider,
            "model": self.model,
            "input": self.input,
            "output": self.output,
            "score": self.score,
        }

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


def empty_metadata() -> dict[str, Any]:
    return {}


@dataclass(frozen=True)
class SourceItem:
    title: str
    url: str
    published_at: str | None = None
    author: str | None = None
    summary: str | None = None
    metadata: dict[str, Any] = field(default_factory=empty_metadata)


@dataclass(frozen=True)
class ExtractedDocument:
    source_id: str
    canonical_url: str | None
    title: str
    extracted_text: str
    author: str | None = None
    published_at: str | None = None
    text_hash: str | None = None
    metadata: dict[str, Any] = field(default_factory=empty_metadata)

    def to_backend_payload(self) -> dict[str, Any]:
        return {
            "canonicalUrl": self.canonical_url,
            "title": self.title,
            "author": self.author,
            "publishedAt": self.published_at,
            "extractedText": self.extracted_text,
            "textHash": self.text_hash,
            "metadata": self.metadata,
        }


@dataclass(frozen=True)
class FetchLog:
    source_id: str
    url: str
    status: str
    reason: str | None = None
    http_status: int | None = None
    error: str | None = None
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_json(self) -> dict[str, Any]:
        return {
            "sourceId": self.source_id,
            "url": self.url,
            "status": self.status,
            "reason": self.reason,
            "httpStatus": self.http_status,
            "error": self.error,
            "createdAt": self.created_at,
        }

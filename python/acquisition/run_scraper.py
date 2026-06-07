from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

from .backend_client import BackendClient
from .models import ExtractedDocument
from .rss import parse_rss
from .utils import text_hash
from .worker import SourceAcquisitionWorker, SourceConfig
import json
import re

from pathlib import Path

JsonObject = dict[str, Any]
FETCH_TIMEOUT_SECONDS = 10


def load_env(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}

    if not path.exists():
        return values

    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()

        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue

        key, value = stripped.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")

    return values


def clean_url(value: str) -> str:
    return value.strip().rstrip("/")


def api_base_url(env: dict[str, str]) -> str:
    explicit_api = clean_url(env.get("SCRAPER_API_BASE_URL") or env.get("NEXT_PUBLIC_API_BASE_URL") or "")

    if explicit_api:
        return explicit_api

    backend_url = clean_url(env.get("BACKEND_URL") or env.get("NEXT_PUBLIC_BACKEND_URL") or "https://dira-news.onrender.com")
    return f"{backend_url}/api"


def first_value(*values: str | None) -> str:
    for value in values:
        if value and value.strip():
            return value.strip()

    return ""


def source_url(source: JsonObject) -> str:
    return first_value(
        str(source.get("feedUrl") or ""),
        str(source.get("apiUrl") or ""),
        str(source.get("homepageUrl") or ""),
    )


def choose_source(sources: list[JsonObject], source_id: str | None = None) -> JsonObject | None:
    if source_id:
        return next((source for source in sources if source.get("id") == source_id), None)

    return next((source for source in sources if source_url(source)), None)


def choose_sources(sources: list[JsonObject], source_id: str | None = None, limit: int | None = None) -> list[JsonObject]:
    if source_id:
        selected = choose_source(sources, source_id)
        return [selected] if selected else []

    fetchable = [source for source in sources if source_url(source)]

    if limit is not None:
        return fetchable[:limit]

    return fetchable


def fetch_text(url: str) -> str:
    request = Request(url, headers={"User-Agent": "DiraNewsBot"})

    with urlopen(request, timeout=FETCH_TIMEOUT_SECONDS) as response:
        return response.read().decode(response.headers.get_content_charset() or "utf-8", errors="replace")


def rss_documents(source: JsonObject, url: str) -> list[ExtractedDocument]:
    items = parse_rss(fetch_text(url))
    documents: list[ExtractedDocument] = []

    for item in items[:10]:
        text = first_value(item.summary, item.title)
        documents.append(
            ExtractedDocument(
                source_id=str(source["id"]),
                canonical_url=item.url,
                title=item.title,
                author=item.author,
                extracted_text=text,
                text_hash=text_hash(text),
                metadata={**item.metadata, "feedUrl": url},
            )
        )

    return documents


def static_documents(source: JsonObject, url: str) -> list[ExtractedDocument]:
    worker = SourceAcquisitionWorker(timeout_seconds=FETCH_TIMEOUT_SECONDS)
    document, log = worker.acquire_static_page(
        SourceConfig(
            id=str(source["id"]),
            url=url,
            type=str(source.get("type") or "STATIC_PAGE"),
        )
    )

    if log.status != "SUCCESS" or document is None:
        raise RuntimeError(log.error or log.reason or f"Source fetch ended with {log.status}")

    return [document]


def ensure_source(client: BackendClient, env: dict[str, str], source_id: str | None) -> JsonObject:
    sources = client.list_sources()
    selected = choose_source(sources, source_id)

    if selected:
        return selected

    configured_url = env.get("SCRAPER_SOURCE_URL", "").strip()

    if not configured_url:
        raise RuntimeError("No fetchable source found. Add a source in admin or set SCRAPER_SOURCE_URL in .env.")

    source_type = env.get("SCRAPER_SOURCE_TYPE", "STATIC_PAGE")
    payload: JsonObject = {
        "name": env.get("SCRAPER_SOURCE_NAME", "Dira scraper source"),
        "type": source_type,
        "credibilityScore": 0.6,
    }

    if source_type == "RSS":
        payload["feedUrl"] = configured_url
    else:
        payload["homepageUrl"] = configured_url

    return client.create_source(payload)


def document_is_new(document: ExtractedDocument, existing_documents: list[JsonObject]) -> bool:
    for existing in existing_documents:
        if document.text_hash and existing.get("textHash") == document.text_hash:
            return False

        if document.canonical_url and existing.get("canonicalUrl") == document.canonical_url:
            return False

    return True


def scrape_source(source: JsonObject) -> list[ExtractedDocument]:
    url = source_url(source)

    if not url:
        raise RuntimeError("Source has no feedUrl, apiUrl, or homepageUrl.")

    if str(source.get("type")) == "RSS" or url.endswith(".xml") or "rss" in url.lower():
        return rss_documents(source, url)

    return static_documents(source, url)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run one Dira News source acquisition pass.")
    parser.add_argument("--source-id", help="Specific backend Source id to scrape")
    parser.add_argument("--limit", type=int, help="Maximum number of backend sources to scrape")
    parser.add_argument("--env", default=".env", help="Path to env file")
    args = parser.parse_args()

    env = load_env(Path(args.env))
    email = first_value(
        env.get("ADMIN_EMAIL"),
        env.get("ADMIN_USER_EMAIL"),
        env.get("ADMIN_LOGIN_EMAIL"),
        env.get("SUPER_ADMIN_EMAIL"),
        env.get("SEED_ADMIN_EMAIL"),
        env.get("EMAIL"),
    )
    password = first_value(
        env.get("ADMIN_PASSWORD"),
        env.get("ADMIN_PASS"),
        env.get("ADMIN_USER_PASSWORD"),
        env.get("ADMIN_LOGIN_PASSWORD"),
        env.get("SUPER_ADMIN_PASSWORD"),
        env.get("SEED_ADMIN_PASSWORD"),
        env.get("PASSWORD"),
    )

    if not email or not password:
        raise RuntimeError("Missing admin credentials in .env.")

    client = BackendClient.login(api_base_url(env), email, password)
    # Merge backend sources with local registry so scraper includes local news
    backend_sources = client.list_sources()

    # Try to load JS registry at project root `data/sourceRegistry.js`
    def load_registry_js(js_path: Path) -> list[JsonObject]:
        if not js_path.exists():
            return []

        raw = js_path.read_text(encoding="utf-8")
        start = raw.find("[")
        end = raw.rfind("]")

        if start == -1 or end == -1 or end <= start:
            return []

        arr_text = raw[start : end + 1]

        # Quote unquoted keys: key: -> "key":
        arr_text = re.sub(r"(?P<k>\b[a-zA-Z_][a-zA-Z0-9_]*\b)\s*:", r'"\g<k>":', arr_text)
        # Convert single quotes to double quotes
        arr_text = arr_text.replace("'", '"')
        # Remove trailing commas before } or ]
        arr_text = re.sub(r",\s*([}\]])", r"\1", arr_text)

        try:
            return json.loads(arr_text)
        except Exception:
            return []

    repo_root = Path(__file__).resolve().parents[2]
    registry_path = repo_root / "data" / "sourceRegistry.js"
    registry = load_registry_js(registry_path)

    # Create registry sources in backend if missing
    for item in registry:
        hp = str(item.get("homepageUrl") or "").strip()
        feed = str(item.get("feedUrl") or "").strip()
        exists = any(
            (s.get("homepageUrl") and str(s.get("homepageUrl")).strip() == hp) or
            (s.get("feedUrl") and str(s.get("feedUrl")).strip() == feed)
            for s in backend_sources
        )

        if not exists:
            payload: JsonObject = {
                "name": item.get("name") or item.get("group") or "registry-source",
                "type": item.get("type") or "STATIC_PAGE",
                "credibilityScore": item.get("credibilityScore") or 0.5,
                "category": item.get("category") or "LOCAL",
            }

            if feed:
                payload["feedUrl"] = feed
            elif hp:
                payload["homepageUrl"] = hp

            try:
                created = client.create_source(payload)
                backend_sources.append(created)
            except Exception as exc:
                print(f"Failed creating registry source {payload.get('name')}: {exc}", flush=True)

    sources = choose_sources(backend_sources, args.source_id, args.limit)

    if not sources:
        sources = [ensure_source(client, env, args.source_id)]

    posted = 0
    skipped = 0
    failed: list[str] = []

    for source in sources:
        print(f"Checking: {source.get('name') or source.get('id')}", flush=True)
        try:
            documents = scrape_source(source)
            existing_documents = client.list_source_documents(str(source["id"]))
            source_posted = 0
            source_skipped = 0

            for document in documents:
                if document_is_new(document, existing_documents):
                    client.create_source_document(str(source["id"]), document)
                    posted += 1
                    source_posted += 1
                else:
                    skipped += 1
                    source_skipped += 1

            print(f"  posted {source_posted}, skipped {source_skipped}", flush=True)
        except Exception as exc:
            failed.append(f"{source.get('name') or source.get('id')}: {exc}")
            print(f"  failed: {exc}", flush=True)

    if failed and posted == 0 and skipped == 0:
        raise RuntimeError("Scraper could not post documents:\n" + "\n".join(failed))

    print(f"Scraper checked {len(sources)} source(s).")
    print(f"Posted: {posted}")
    print(f"Skipped duplicates: {skipped}")
    if failed:
        print(f"Failed sources: {len(failed)}")
        for item in failed[:10]:
            print(f"- {item}")
    print(f"Backend API: {api_base_url(env)}")


if __name__ == "__main__":
    main()

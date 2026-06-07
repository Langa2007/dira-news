from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

from python.acquisition.backend_client import BackendClient
from python.ai_core.clustering import cluster_documents
from python.ai_core.models import SourceDocumentInput
from python.ai_core.pipeline import process_story_documents

JsonObject = dict[str, Any]


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


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Dira News AI clustering and drafting pipeline.")
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

    print("Fetching current story clusters...", flush=True)
    clusters_data = client.list_story_clusters()
    already_clustered_ids: set[str] = set()
    for cluster in clusters_data:
        for link in cluster.get("sources", []):
            if link.get("documentId"):
                already_clustered_ids.add(link["documentId"])

    print(f"Found {len(already_clustered_ids)} document(s) already clustered.", flush=True)

    print("Fetching all source documents...", flush=True)
    docs_data = client.list_all_source_documents()
    print(f"Total source documents in backend: {len(docs_data)}", flush=True)

    unclustered_docs = [doc for doc in docs_data if doc["id"] not in already_clustered_ids]
    print(f"Unclustered documents to process: {len(unclustered_docs)}", flush=True)

    if not unclustered_docs:
        print("No new unclustered documents. Pipeline run finished.")
        return

    # Convert to SourceDocumentInput
    inputs = [
        SourceDocumentInput(
            id=doc["id"],
            source_id=doc["sourceId"],
            title=doc["title"],
            text=doc.get("extractedText") or doc["title"],
            canonical_url=doc.get("canonicalUrl"),
            published_at=doc.get("publishedAt"),
        )
        for doc in unclustered_docs
    ]

    print("Running document clustering...", flush=True)
    new_clusters = cluster_documents(inputs, threshold=0.25)
    print(f"Generated {len(new_clusters)} new cluster(s).", flush=True)

    for index, cluster in enumerate(new_clusters):
        print(f"\nProcessing Cluster {index + 1}: {cluster.title} ({len(cluster.document_ids)} documents)", flush=True)

        # Get first document to determine default category
        first_doc_id = cluster.document_ids[0]
        first_doc = next(doc for doc in unclustered_docs if doc["id"] == first_doc_id)
        category = (first_doc.get("source") or {}).get("category") or "LOCAL"

        # 1. Create Story Cluster
        cluster_payload = {
            "title": cluster.title,
            "summary": f"AI clustered story containing {len(cluster.document_ids)} documents.",
            "category": category,
            "localScore": 0.5,
            "worldScore": 0.5,
            "hotnessScore": cluster.score,
            "confidenceScore": 0.8,
            "documentIds": cluster.document_ids,
        }
        print("  creating story cluster in backend...", end="", flush=True)
        backend_cluster = client.create_story_cluster(cluster_payload)
        cluster_id = backend_cluster["id"]
        print(f" done (ID: {cluster_id})", flush=True)

        # 2. Run AI processing pipeline on these documents
        print("  running AI extraction and drafting pipeline...", flush=True)
        cluster_inputs = [inp for inp in inputs if inp.id in cluster.document_ids]
        ai_outputs = process_story_documents(cluster_inputs)

        # 3. Create AI Output records in backend
        print("  posting AI output records...", flush=True)
        draft_text = ""
        for output in ai_outputs:
            payload = output.to_backend_payload()
            payload["clusterId"] = cluster_id
            # Backend score field requires a number — strip None values
            if payload.get("score") is None:
                del payload["score"]
            client.create_ai_output(payload)
            if output.type == "ARTICLE_DRAFT":
                draft_text = str(output.output.get("draft") or "")

        # 4. Create Draft Article in backend
        print("  creating original article draft in backend...", end="", flush=True)
        article_payload = {
            "title": cluster.title,
            "category": category,
            "clusterId": cluster_id,
            "body": draft_text or "No draft text generated.",
            "summary": f"Original draft generated from story cluster: {cluster.title}",
        }
        backend_article = client.create_article(article_payload)
        print(f" done (ID: {backend_article['id']})", flush=True)

    print("\nAI pipeline execution finished successfully.")


if __name__ == "__main__":
    main()

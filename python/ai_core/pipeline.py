from .claims import extract_claims
from .clustering import cluster_documents
from .comparison import compare_sources
from .contradictions import detect_contradictions
from .drafting import generate_original_draft
from .entities import extract_entities
from .facts import build_fact_table
from .models import AiOutputRecord, SourceDocumentInput
from .provider import LocalHeuristicProvider
from .scoring import score_story
from .similarity import plagiarism_risk
from .social import generate_social_drafts


def process_story_documents(documents: list[SourceDocumentInput]) -> list[AiOutputRecord]:
    provider = LocalHeuristicProvider()
    combined_text = " ".join(document.title + " " + document.text for document in documents)
    entities = extract_entities(combined_text)
    claims = [claim for document in documents for claim in extract_claims(document)]
    facts = build_fact_table(entities, claims)
    comparison = compare_sources(documents)
    contradictions = detect_contradictions(claims)
    clusters = cluster_documents(documents)
    title = clusters[0].title if clusters else (documents[0].title if documents else "Untitled story")
    scores = score_story(combined_text, len(documents), comparison)
    draft = generate_original_draft(title, facts, comparison, scores)
    similarity = plagiarism_risk(draft, [document.text for document in documents])
    social = generate_social_drafts(title, facts.what[0] if facts.what else "A developing story is being reviewed.", documents[0].canonical_url if documents else None)

    return [
        AiOutputRecord(
            type="ENTITY_EXTRACTION",
            provider=provider.name,
            model=provider.model,
            input={"documentIds": [document.id for document in documents]},
            output={"entities": [entity.__dict__ for entity in entities]},
        ),
        AiOutputRecord(
            type="CLAIM_EXTRACTION",
            provider=provider.name,
            model=provider.model,
            input={"documentIds": [document.id for document in documents]},
            output={"claims": [claim.__dict__ for claim in claims]},
        ),
        AiOutputRecord(
            type="FACT_TABLE",
            provider=provider.name,
            model=provider.model,
            input={"documentIds": [document.id for document in documents]},
            output={"who": facts.who, "what": facts.what, "where": facts.where, "when": facts.when},
        ),
        AiOutputRecord(
            type="CONTRADICTION_SCAN",
            provider=provider.name,
            model=provider.model,
            input={"documentIds": [document.id for document in documents]},
            output={"contradictions": [contradiction.__dict__ for contradiction in contradictions]},
            score=1 - min(len(contradictions), 1),
        ),
        AiOutputRecord(
            type="ARTICLE_DRAFT",
            provider=provider.name,
            model=provider.model,
            input={"documentIds": [document.id for document in documents]},
            output={"draft": draft, "scores": scores.__dict__},
            score=1 if similarity.risk == "LOW" else 0.5,
        ),
        AiOutputRecord(
            type="SIMILARITY_SCAN",
            provider=provider.name,
            model=provider.model,
            input={"documentIds": [document.id for document in documents]},
            output=similarity.__dict__,
            score=similarity.score,
        ),
        AiOutputRecord(
            type="WHATSAPP_HOOK",
            provider=provider.name,
            model=provider.model,
            input={"title": title},
            output=social.__dict__,
        ),
    ]


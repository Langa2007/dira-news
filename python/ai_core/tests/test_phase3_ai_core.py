import unittest

from python.ai_core.claims import extract_claims
from python.ai_core.clustering import cluster_documents
from python.ai_core.comparison import compare_sources
from python.ai_core.contradictions import detect_contradictions
from python.ai_core.drafting import generate_original_draft
from python.ai_core.entities import extract_entities
from python.ai_core.facts import build_fact_table
from python.ai_core.models import SourceDocumentInput
from python.ai_core.pipeline import process_story_documents
from python.ai_core.scoring import score_story
from python.ai_core.similarity import plagiarism_risk
from python.ai_core.social import generate_social_drafts


def fixture_documents() -> list[SourceDocumentInput]:
    return [
        SourceDocumentInput(
            id="doc_1",
            source_id="source_1",
            title="County Council Approves New Health Center",
            canonical_url="https://example.com/local/health-center",
            text=(
                "County Council approved funding for a new health center in Nairobi County. "
                "Officials said construction is expected to begin in 2026. "
                "The project budget is 20 million."
            ),
        ),
        SourceDocumentInput(
            id="doc_2",
            source_id="source_2",
            title="New Health Center Approved After Public Talks",
            canonical_url="https://example.org/health-center",
            text=(
                "Nairobi County officials confirmed a health center plan after public talks. "
                "The agency reported that construction is expected in 2026. "
                "The project budget is 25 million."
            ),
        ),
        SourceDocumentInput(
            id="doc_3",
            source_id="source_3",
            title="World Markets Open Higher",
            canonical_url="https://example.net/world/markets",
            text="World markets opened higher after investors reacted to new international economic data.",
        ),
    ]


class Phase3AiCoreTests(unittest.TestCase):
    def test_entity_and_claim_extraction(self):
        documents = fixture_documents()
        entities = extract_entities(documents[0].text)
        claims = extract_claims(documents[0])

        self.assertTrue(any(entity.text == "County Council" for entity in entities))
        self.assertGreaterEqual(len(claims), 3)
        self.assertIn("20", claims[-1].numbers)

    def test_fact_table_and_source_comparison(self):
        documents = fixture_documents()[:2]
        entities = extract_entities(" ".join(document.text for document in documents))
        claims = [claim for document in documents for claim in extract_claims(document)]
        facts = build_fact_table(entities, claims)
        comparison = compare_sources(documents)

        self.assertTrue(facts.what)
        self.assertIn("2026", facts.when)
        self.assertEqual(comparison.source_count, 2)
        self.assertIn("health", comparison.shared_terms)

    def test_contradiction_detection_flags_number_mismatch(self):
        documents = fixture_documents()[:2]
        claims = [claim for document in documents for claim in extract_claims(document)]
        contradictions = detect_contradictions(claims)

        self.assertTrue(any(item.kind == "NUMBER_MISMATCH" for item in contradictions))

    def test_clustering_groups_related_documents(self):
        documents = fixture_documents()
        clusters = cluster_documents(documents, threshold=0.2)
        cluster_sizes = sorted(len(cluster.document_ids) for cluster in clusters)

        self.assertEqual(cluster_sizes, [1, 2])

    def test_scoring_and_similarity(self):
        documents = fixture_documents()[:2]
        comparison = compare_sources(documents)
        text = " ".join(document.text for document in documents)
        scores = score_story(text, len(documents), comparison)
        low_risk = plagiarism_risk("Officials are reviewing a local health project with public interest.", [documents[0].text])

        self.assertGreater(scores.hotness, 0.5)
        self.assertGreater(scores.local_relevance, 0)
        self.assertEqual(low_risk.risk, "LOW")

    def test_draft_and_social_generation(self):
        documents = fixture_documents()[:2]
        entities = extract_entities(" ".join(document.text for document in documents))
        claims = [claim for document in documents for claim in extract_claims(document)]
        facts = build_fact_table(entities, claims)
        comparison = compare_sources(documents)
        scores = score_story(" ".join(document.text for document in documents), len(documents), comparison)
        draft = generate_original_draft("County Council Approves New Health Center", facts, comparison, scores)
        social = generate_social_drafts("County Council Approves New Health Center", facts.what[0], documents[0].canonical_url)

        self.assertIn("developing story", draft)
        self.assertIn("Read more", social.whatsapp)
        self.assertLess(len(social.x), 320)

    def test_pipeline_outputs_backend_compatible_ai_records(self):
        outputs = process_story_documents(fixture_documents()[:2])
        payloads = [output.to_backend_payload() for output in outputs]
        output_types = {payload["type"] for payload in payloads}

        self.assertIn("ENTITY_EXTRACTION", output_types)
        self.assertIn("ARTICLE_DRAFT", output_types)
        self.assertIn("SIMILARITY_SCAN", output_types)
        self.assertTrue(all("provider" in payload for payload in payloads))
        self.assertTrue(all("output" in payload for payload in payloads))


if __name__ == "__main__":
    unittest.main()


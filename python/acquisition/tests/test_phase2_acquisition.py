import json
import tempfile
import unittest
from pathlib import Path

from python.acquisition.crawl_log import CrawlLogger
from python.acquisition.backend_client import BackendClient
from python.acquisition.dedupe import DuplicateDetector
from python.acquisition.html_extractor import extract_static_html
from python.acquisition.models import FetchLog
from python.acquisition.rate_limiter import DomainRateLimiter
from python.acquisition.rendered_extractor import RenderedExtractionUnavailable, extract_rendered_page
from python.acquisition.robots import RobotsPolicy
from python.acquisition.rss import parse_rss
from python.acquisition.utils import canonicalize_url, text_hash


FIXTURES = Path(__file__).parent / "fixtures"


class Phase2AcquisitionTests(unittest.TestCase):
    def test_rss_ingestion_parses_items(self):
        feed = (FIXTURES / "sample_feed.xml").read_text(encoding="utf-8")
        items = parse_rss(feed)

        self.assertEqual(len(items), 2)
        self.assertEqual(items[0].title, "Local Council Approves New Health Center")
        self.assertEqual(items[0].url, "https://example.com/local/health-center?utm_source=social")
        self.assertEqual(items[0].metadata["sourceFormat"], "rss")

    def test_static_html_extraction_outputs_backend_payload(self):
        html = (FIXTURES / "sample_article.html").read_text(encoding="utf-8")
        document = extract_static_html("source_1", "https://example.com/local/health-center?utm_source=social", html)
        payload = document.to_backend_payload()

        self.assertEqual(document.title, "Local Council Approves New Health Center")
        self.assertEqual(document.canonical_url, "https://example.com/local/health-center")
        self.assertIn("county council approved funding", document.extracted_text)
        self.assertEqual(payload["canonicalUrl"], document.canonical_url)
        self.assertEqual(payload["textHash"], text_hash(document.extracted_text))

    def test_rendered_extractor_reports_missing_playwright_cleanly(self):
        with self.assertRaises(RenderedExtractionUnavailable):
            import asyncio

            asyncio.run(extract_rendered_page("source_1", "https://example.com"))

    def test_robots_policy_blocks_disallowed_path(self):
        policy = RobotsPolicy(
            robots_url="https://example.com/robots.txt",
            text="User-agent: *\nDisallow: /private\nAllow: /\n",
        )

        self.assertFalse(policy.can_fetch("https://example.com/private/story"))
        self.assertTrue(policy.can_fetch("https://example.com/public/story"))

    def test_rate_limiter_blocks_fast_repeat_domain_fetches(self):
        limiter = DomainRateLimiter(interval_seconds=10)

        self.assertTrue(limiter.can_fetch("https://example.com/a", now=100))
        self.assertFalse(limiter.can_fetch("https://example.com/b", now=105))
        self.assertTrue(limiter.can_fetch("https://example.com/c", now=111))

    def test_canonical_url_and_duplicate_detection(self):
        detector = DuplicateDetector()
        first = "https://Example.com/story?utm_source=x&id=1"
        second = "https://example.com/story?id=1&utm_medium=y"

        self.assertEqual(canonicalize_url(first), "https://example.com/story?id=1")
        self.assertFalse(detector.seen_url(first))
        self.assertTrue(detector.seen_url(second))
        self.assertFalse(detector.seen_text("One story with useful facts."))
        self.assertTrue(detector.seen_text(" one   story with useful facts. "))

    def test_crawl_log_writes_jsonl(self):
        with tempfile.TemporaryDirectory() as tmp:
            log_path = Path(tmp) / "crawl.jsonl"
            logger = CrawlLogger(log_path)
            logger.write(FetchLog(source_id="source_1", url="https://example.com", status="SUCCESS", http_status=200))

            lines = log_path.read_text(encoding="utf-8").splitlines()
            record = json.loads(lines[0])

        self.assertEqual(record["sourceId"], "source_1")
        self.assertEqual(record["status"], "SUCCESS")
        self.assertEqual(record["httpStatus"], 200)

    def test_backend_client_builds_expected_requests(self):
        client = BackendClient("http://localhost:4000/api", "token")

        self.assertEqual(client.api_base_url, "http://localhost:4000/api")


if __name__ == "__main__":
    unittest.main()

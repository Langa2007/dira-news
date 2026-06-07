from dataclasses import dataclass
from urllib.request import Request, urlopen

from .html_extractor import extract_static_html
from .models import ExtractedDocument, FetchLog
from .rate_limiter import DomainRateLimiter
from .robots import RobotsPolicy


@dataclass(frozen=True)
class SourceConfig:
    id: str
    url: str
    type: str
    robots_text: str | None = None


class SourceAcquisitionWorker:
    def __init__(
        self,
        rate_limiter: DomainRateLimiter | None = None,
        user_agent: str = "DiraNewsBot",
        timeout_seconds: int = 10,
    ):
        self.rate_limiter = rate_limiter or DomainRateLimiter(interval_seconds=5)
        self.user_agent = user_agent
        self.timeout_seconds = timeout_seconds

    def acquire_static_page(self, source: SourceConfig) -> tuple[ExtractedDocument | None, FetchLog]:
        if source.robots_text:
            policy = RobotsPolicy(robots_url=_robots_url(source.url), text=source.robots_text)
            if not policy.can_fetch(source.url, self.user_agent):
                return None, FetchLog(source_id=source.id, url=source.url, status="BLOCKED", reason="robots.txt")

        if not self.rate_limiter.can_fetch(source.url):
            return None, FetchLog(source_id=source.id, url=source.url, status="SKIPPED", reason="rate-limit")

        try:
            request = Request(source.url, headers={"User-Agent": self.user_agent})
            with urlopen(request, timeout=self.timeout_seconds) as response:
                body = response.read().decode(response.headers.get_content_charset() or "utf-8", errors="replace")
                document = extract_static_html(source_id=source.id, url=source.url, html=body)
                return document, FetchLog(
                    source_id=source.id,
                    url=source.url,
                    status="SUCCESS",
                    http_status=getattr(response, "status", None),
                )
        except Exception as exc:
            return None, FetchLog(source_id=source.id, url=source.url, status="FAILED", error=str(exc))


def _robots_url(url: str) -> str:
    from urllib.parse import urlsplit, urlunsplit

    parsed = urlsplit(url)
    return urlunsplit((parsed.scheme, parsed.netloc, "/robots.txt", "", ""))

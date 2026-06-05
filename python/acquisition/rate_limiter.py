import time
from urllib.parse import urlsplit


class DomainRateLimiter:
    def __init__(self, interval_seconds: float):
        self.interval_seconds = interval_seconds
        self._last_seen: dict[str, float] = {}

    def can_fetch(self, url: str, now: float | None = None) -> bool:
        current = time.monotonic() if now is None else now
        domain = urlsplit(url).netloc.lower()
        last_seen = self._last_seen.get(domain)

        if last_seen is not None and current - last_seen < self.interval_seconds:
            return False

        self._last_seen[domain] = current
        return True


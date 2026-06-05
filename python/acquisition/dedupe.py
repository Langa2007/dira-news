from .utils import canonicalize_url, text_hash


class DuplicateDetector:
    def __init__(self):
        self._urls: set[str] = set()
        self._hashes: set[str] = set()

    def seen_url(self, url: str) -> bool:
        canonical = canonicalize_url(url)
        if canonical in self._urls:
            return True
        self._urls.add(canonical)
        return False

    def seen_text(self, text: str) -> bool:
        digest = text_hash(text)
        if digest in self._hashes:
            return True
        self._hashes.add(digest)
        return False


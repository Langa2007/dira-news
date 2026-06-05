import json
from pathlib import Path

from .models import FetchLog


class CrawlLogger:
    def __init__(self, path: str | Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def write(self, log: FetchLog) -> None:
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(log.to_json(), sort_keys=True) + "\n")


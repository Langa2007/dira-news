from typing import Protocol


class AiProvider(Protocol):
    name: str
    model: str

    def complete(self, prompt: str) -> str:
        ...


class LocalHeuristicProvider:
    name = "local"
    model = "heuristic-v1"

    def complete(self, prompt: str) -> str:
        return prompt.strip()

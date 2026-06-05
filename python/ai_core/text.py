import re

STOPWORDS = {
    "a",
    "after",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "in",
    "is",
    "it",
    "new",
    "of",
    "on",
    "said",
    "says",
    "the",
    "to",
    "with",
}


def normalize_text(value: str) -> str:
    return " ".join(value.split())


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+", normalize_text(text))
    return [part.strip() for part in parts if part.strip()]


def tokenize(text: str) -> list[str]:
    return [token.lower() for token in re.findall(r"[A-Za-z][A-Za-z'-]+|\d+(?:\.\d+)?%?", text)]


def keyword_set(text: str) -> set[str]:
    return {token for token in tokenize(text) if len(token) > 2 and token not in STOPWORDS}


def phrase_ngrams(text: str, size: int = 6) -> set[str]:
    tokens = tokenize(text)
    if len(tokens) < size:
        return set()
    return {" ".join(tokens[index : index + size]) for index in range(len(tokens) - size + 1)}


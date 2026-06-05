import re

from .models import Claim, SourceDocumentInput
from .text import split_sentences

CLAIM_VERBS = ("approved", "announced", "confirmed", "reported", "said", "expects", "expected", "launched", "opened", "closed")


def extract_claims(document: SourceDocumentInput) -> list[Claim]:
    claims: list[Claim] = []
    for sentence in split_sentences(document.text):
        lowered = sentence.lower()
        if any(verb in lowered for verb in CLAIM_VERBS) or re.search(r"\d", sentence):
            claims.append(
                Claim(
                    text=sentence,
                    document_id=document.id,
                    confidence=0.72,
                    numbers=re.findall(r"\b\d+(?:\.\d+)?%?\b", sentence),
                    dates=re.findall(r"\b20\d{2}\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b", sentence),
                )
            )
    return claims


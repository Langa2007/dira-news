from xml.etree import ElementTree

from .models import SourceItem
from .utils import normalize_whitespace


def parse_rss(xml_text: str) -> list[SourceItem]:
    root = ElementTree.fromstring(xml_text)
    items: list[SourceItem] = []

    for item in root.findall(".//item"):
        title = _text(item, "title")
        link = _text(item, "link")
        published_at = _text(item, "pubDate")
        author = _text(item, "author") or _text(item, "{http://purl.org/dc/elements/1.1/}creator")
        summary = _text(item, "description")

        if title and link:
            items.append(
                SourceItem(
                    title=normalize_whitespace(title),
                    url=normalize_whitespace(link),
                    published_at=published_at,
                    author=author,
                    summary=summary,
                    metadata={"sourceFormat": "rss"},
                )
            )

    return items


def _text(item: ElementTree.Element, tag: str) -> str | None:
    child = item.find(tag)
    if child is None or child.text is None:
        return None
    value = normalize_whitespace(child.text)
    return value or None


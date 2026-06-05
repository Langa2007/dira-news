from html.parser import HTMLParser

from .models import ExtractedDocument
from .utils import canonicalize_url, normalize_whitespace, text_hash

HtmlAttrs = list[tuple[str, str | None]]


class ArticleHtmlParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title_parts: list[str] = []
        self.text_parts: list[str] = []
        self.links: list[str] = []
        self._tag_stack: list[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag: str, attrs: HtmlAttrs):
        self._tag_stack.append(tag)
        if tag in {"script", "style", "noscript"}:
            self._skip_depth += 1

        if tag == "a":
            href = dict(attrs).get("href")
            if href:
                self.links.append(href)

    def handle_endtag(self, tag: str):
        if tag in {"script", "style", "noscript"} and self._skip_depth > 0:
            self._skip_depth -= 1

        if self._tag_stack:
            self._tag_stack.pop()

    def handle_data(self, data: str):
        if self._skip_depth > 0:
            return

        value = normalize_whitespace(data)
        if not value:
            return

        current_tag = self._tag_stack[-1] if self._tag_stack else ""
        if current_tag == "title":
            self.title_parts.append(value)
        elif current_tag in {"p", "h1", "h2", "h3", "li", "blockquote"}:
            self.text_parts.append(value)


def extract_static_html(source_id: str, url: str, html: str) -> ExtractedDocument:
    parser = ArticleHtmlParser()
    parser.feed(html)

    title = normalize_whitespace(" ".join(parser.title_parts)) or "Untitled source document"
    extracted_text = normalize_whitespace(" ".join(parser.text_parts))
    canonical_url = canonicalize_url(url)

    return ExtractedDocument(
        source_id=source_id,
        canonical_url=canonical_url,
        title=title,
        extracted_text=extracted_text,
        text_hash=text_hash(extracted_text),
        metadata={
            "extractor": "static-html",
            "linkCount": len(parser.links),
            "links": parser.links[:50],
        },
    )

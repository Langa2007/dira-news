from importlib import import_module
from typing import Any

from .html_extractor import extract_static_html
from .models import ExtractedDocument


class RenderedExtractionUnavailable(RuntimeError):
    pass


async def extract_rendered_page(source_id: str, url: str) -> ExtractedDocument:
    try:
        playwright_api = import_module("playwright.async_api")
    except ModuleNotFoundError as exc:
        raise RenderedExtractionUnavailable(
            "Playwright is not installed. Install it in Phase 2 expansion when rendered-page crawling is needed."
        ) from exc

    async_playwright: Any = getattr(playwright_api, "async_playwright")

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()
        try:
            page = await browser.new_page()
            await page.goto(url, wait_until="networkidle")
            html: str = await page.content()
        finally:
            await browser.close()

    return extract_static_html(source_id=source_id, url=url, html=html)

from .models import SocialDraftBundle


def generate_social_drafts(title: str, summary: str, url: str | None = None) -> SocialDraftBundle:
    link = f" Read more: {url}" if url else ""
    short_title = title[:220]
    return SocialDraftBundle(
        telegram=f"{short_title}\n\n{summary}{link}",
        whatsapp=f"Breaking down what matters: {short_title}. {summary}{link}",
        x=f"{short_title} - {summary[:180]}{link}",
        instagram=f"{short_title}\n\n{summary}\n\n#DiraNews #News",
    )


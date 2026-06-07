import { API_BASE_URL } from '@/lib/endpoints';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/publishing/rss.xml`, {
      next: { revalidate: 60 }
    });
    const xml = await response.text();

    return new Response(xml, {
      headers: { 'content-type': 'application/rss+xml' }
    });
  } catch {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Dira News</title></channel></rss>', {
      headers: { 'content-type': 'application/rss+xml' }
    });
  }
}

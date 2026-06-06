const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/publishing/sitemap.xml`, {
      next: { revalidate: 60 }
    });
    const xml = await response.text();

    return new Response(xml, {
      headers: { 'content-type': 'application/xml' }
    });
  } catch {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'content-type': 'application/xml' }
    });
  }
}

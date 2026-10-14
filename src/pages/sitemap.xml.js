import { documents, topics, BASE, ORIGIN } from '../lib/content.mjs';
export function GET() {
  const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const pages = [{ url: BASE }, ...topics, ...documents];
  return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + pages.map(page => '<url><loc>' + escape(new URL(page.url, ORIGIN).href) + '</loc>' + (page.modified ? '<lastmod>' + page.modified + '</lastmod>' : '') + '</url>').join('') + '</urlset>', { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

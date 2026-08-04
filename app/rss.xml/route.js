import { db } from '@/packages/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.manikantar.in';

export const revalidate = 3600;

export async function GET() {
  let articles = [];
  try { articles = await db.articles.list({ status: 'published', limit: 50 }); } catch { articles = []; }

  const items = articles.map((a) => {
    const url = `${SITE_URL}/article/${a.slug}`;
    const date = new Date(a.publishedAt || a.createdAt).toUTCString();
    return `<item>
      <title><![CDATA[${a.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${a.excerpt || ''}]]></description>
      <pubDate>${date}</pubDate>
      <category>${a.section || ''}</category>
      ${(a.hashtags || []).map((t) => `<category>${t.replace('#', '')}</category>`).join('\n      ')}
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>INSIGHTS</title>
    <link>${SITE_URL}</link>
    <description>Ideas. Intelligence. Impact. — A premium digital publication on AI, business, and the future of work.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/icon.svg</url>
      <title>INSIGHTS</title>
      <link>${SITE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  });
}
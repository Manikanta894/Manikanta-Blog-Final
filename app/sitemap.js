import { db } from '@/packages/db';
import { SECTIONS } from '@/packages/utils';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.manikantar.in';

export default async function sitemap() {
  let articles = [];
  try {
    articles = await db.articles.list({ status: 'published', limit: 1000 });
  } catch {
    articles = [];
  }

  const staticPages = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/latest`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/search`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/newsletter`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    ...SECTIONS.map((s) => ({ url: `${SITE_URL}/${s.slug}`, changeFrequency: 'daily', priority: 0.7 })),
  ];

  const articlePages = articles.map((a) => ({
    url: `${SITE_URL}/article/${a.slug}`,
    lastModified: a.updatedAt || a.publishedAt || a.createdAt,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticPages, ...articlePages];
}

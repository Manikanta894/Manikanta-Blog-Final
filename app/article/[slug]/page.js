import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import Kicker from '@/components/site/Kicker';
import ArticleCard from '@/components/site/ArticleCard';
import ArticleActions from '@/components/site/ArticleActions';
import ReadingProgress from '@/components/site/ReadingProgress';
import ArticleTOC from '@/components/site/ArticleTOC';
import { db } from '@/packages/db';
import { renderMd, mdToText, ensureEditorialStructure, extractHeadings, coverImageFor } from '@/packages/utils';

export const revalidate = 3600; // ISR: re-check every hour so Google sees fresh content fast

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.manikantar.in';
const SITE_NAME = 'INSIGHTS';

async function getArticle(slug) {
  try { return await db.articles.getBySlug(slug); } catch { return null; }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Not found — INSIGHTS' };

  const title = article.seo?.title || `${article.title} — ${SITE_NAME}`;
  const description = article.seo?.description || article.excerpt || mdToText(article.content, 160);
  const url = `${SITE_URL}/article/${article.slug}`;
  const coverImage = article.coverImage || coverImageFor(article.title, article.section);
  const image = [{ url: coverImage, width: 1600, height: 900, alt: article.title }];

  return {
    title,
    description,
    keywords: article.seo?.keywords || article.hashtags || undefined,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description,
      url,
      type: 'article',
      publishedTime: article.publishedAt || article.createdAt,
      modifiedTime: article.updatedAt || article.publishedAt || article.createdAt,
      section: article.section,
      tags: article.hashtags,
      images: image,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [coverImage],
    },
    robots: { index: article.status === 'published', follow: true },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || article.status !== 'published') return notFound();

  const related = (await db.articles.list({ section: article.section, status: 'published', limit: 4 }))
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  const date = new Date(article.publishedAt || article.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const readMin = Math.max(2, Math.round((article.content || '').split(/\s+/).length / 220));
  const url = `${SITE_URL}/article/${article.slug}`;

  // Cover image is mandatory: fall back to a deterministic auto-generated
  // one when the article (old or new) doesn't have one saved.
  const coverImage = article.coverImage || coverImageFor(article.title, article.section);

  // Guarantee visual structure on every article, old and new: at least one
  // pull-quote and one Key Takeaways callout, auto-extracted from the
  // article's own text when the source markdown doesn't already have them.
  const content = ensureEditorialStructure(article.content);
  const headings = extractHeadings(content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || mdToText(article.content, 160),
    image: [coverImage],
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.publishedAt || article.createdAt,
    author: { '@type': 'Person', name: 'Manikanta R', url: `${SITE_URL}/about` },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: (article.seo?.keywords || article.hashtags || []).join(', '),
    articleSection: article.section,
  };

  return (
    <div className="min-h-screen">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress targetId="article-body" />
      <Nav />
      <article className="pt-10 pb-24">
        <div className="container max-w-3xl text-center">
          <Kicker>{article.section} · {dateStr} · {readMin} min read</Kicker>
          <h1 className="text-hero italic mt-5 text-[#181818] animate-fade-up">{article.title}</h1>
          <p className="mt-6 text-lead text-[#555555] max-w-2xl mx-auto">{article.excerpt}</p>
          <div className="flex items-center justify-center gap-6 mt-8 text-eyebrow text-[#555555]">
            <span>By Manikanta</span>
            <span className="h-3 w-px bg-[#D8D3CB]" />
            <ArticleActions title={article.title} url={url} />
          </div>
        </div>

        <div className="container max-w-6xl mt-14">
          <img
            src={coverImage}
            alt={article.title}
            width={1600}
            height={900}
            className="w-full aspect-[16/9] object-cover rounded-sm"
            style={{ filter: 'grayscale(15%) contrast(1.02)' }}
          />
        </div>

        <div className="container max-w-6xl mt-16">
          <div className={headings.length >= 3 ? 'grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-16' : 'flex justify-center'}>
            {headings.length >= 3 && <ArticleTOC headings={headings} />}
            <div id="article-body" className="max-w-2xl w-full">
              <div className="prose-editorial dropcap" dangerouslySetInnerHTML={{ __html: renderMd(content) }} />

              {article.hashtags?.length > 0 && (
                <div className="mt-16 pt-8 border-t border-[#D8D3CB] flex flex-wrap gap-2">
                  {article.hashtags.map((h) => (
                    <span key={h} className="text-eyebrow text-[#555555] border border-[#D8D3CB] px-2 py-1 rounded-sm">{h}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="container max-w-6xl mt-24">
            <div className="flex items-end justify-between mb-8 pb-4 border-b border-[#181818]">
              <div>
                <Kicker>More From</Kicker>
                <h2 className="text-h2 italic mt-1 capitalize text-[#181818]">{article.section.replace('-', ' ')}</h2>
              </div>
              <Link href={`/${article.section}`} className="text-eyebrow text-[#555555] hover:text-[#181818]">See all →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
            </div>
          </div>
        )}
      </article>
      <Footer />
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import ArticleCard from '@/components/site/ArticleCard';
import ArticleActions from '@/components/site/ArticleActions';
import ReadingProgress from '@/components/site/ReadingProgress';
import ArticleTOC from '@/components/site/ArticleTOC';
import Comments from '@/components/site/Comments';
import { db } from '@/packages/db';
import { renderMd, mdToText, ensureEditorialStructure, extractHeadings, coverImageFor } from '@/packages/utils';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 3600;

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
  const ogUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(article.title)}&section=${encodeURIComponent(article.section)}`;
  const image = [{ url: ogUrl, width: 1200, height: 630, alt: article.title }];

  return {
    title,
    description,
    keywords: Array.isArray(article.seo?.keywords) ? article.seo.keywords : typeof article.seo?.keywords === 'string' ? article.seo.keywords.split(',').map(s => s.trim()) : article.hashtags || undefined,
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
    twitter: { card: 'summary_large_image', title: article.title, description, images: [coverImage] },
    robots: { index: article.status === 'published', follow: true },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || article.status !== 'published') return notFound();

  const allRelated = (await db.articles.list({ status: 'published', limit: 20 }))
    .filter((a) => a.id !== article.id);
  const tagMatch = (a) => {
    if (!article.hashtags?.length || !a.hashtags?.length) return 0;
    return article.hashtags.filter((t) => a.hashtags.includes(t)).length;
  };
  const scored = allRelated.map((a) => ({ article: a, score: tagMatch(a) + (a.section === article.section ? 1 : 0) }));
  scored.sort((a, b) => b.score - a.score);
  const related = scored.slice(0, 3).map((s) => s.article);

  const date = new Date(article.publishedAt || article.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const readMin = Math.max(2, Math.round((article.content || '').split(/\s+/).length / 220));
  const url = `${SITE_URL}/article/${article.slug}`;
  const coverImage = article.coverImage || coverImageFor(article.title, article.section);
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
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: (Array.isArray(article.seo?.keywords) ? article.seo.keywords : typeof article.seo?.keywords === 'string' ? article.seo.keywords.split(',').map(s => s.trim()) : article.hashtags || []).join(', '),
    articleSection: article.section,
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress targetId="article-body" />
      <Nav />
      <article className="pt-8 pb-24">
        {/* Back link */}
        <div className="max-w-[680px] mx-auto px-5 mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[--brand-text-secondary] hover:text-[--brand-accent] transition-colors">
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>

        {/* Header */}
        <div className="max-w-[900px] mx-auto px-5 mb-10">
          <div className="max-w-[680px] mx-auto mb-2">
            <span className="text-sm font-semibold text-[--brand-accent] uppercase tracking-wider">{article.section}</span>
          </div>
          <h1 className="cool-hero text-[--brand-text] max-w-[800px] mb-4">{article.title}</h1>
          <p className="text-lg md:text-xl text-[--brand-text-secondary] leading-relaxed max-w-[680px] mb-6">{article.excerpt}</p>

          <div className="flex items-center gap-4 pb-6 border-b border-[--brand-border]">
            <div className="avatar"><span>M</span></div>
            <div className="flex-1">
              <div className="text-sm font-bold text-[--brand-text]">Manikanta</div>
              <div className="text-sm text-[--brand-text-secondary]">{dateStr} &middot; {readMin} min read</div>
            </div>
            <div className="flex items-center gap-3 text-sm text-[--brand-text-secondary]">
              <ArticleActions title={article.title} url={url} />
            </div>
          </div>
        </div>

        {/* Cover image */}
        <div className="max-w-[900px] mx-auto px-5 mb-12">
          <div className="aspect-[3/2] rounded-2xl overflow-hidden bg-[--shimmer-base] shadow-lg">
            <img src={coverImage} alt={article.title} width={1600} height={900} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Body */}
        <div className="max-w-[1200px] mx-auto px-5">
          <div className={headings.length >= 3 ? 'grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-12 justify-center' : 'flex justify-center'}>
            {headings.length >= 3 && (
              <div className="hidden lg:block">
                <ArticleTOC headings={headings} />
              </div>
            )}
            <div id="article-body" className="max-w-[680px] w-full article-body">
              <div dangerouslySetInnerHTML={{ __html: renderMd(content) }} />

              {article.hashtags?.length > 0 && (
                <div className="mt-14 pt-8 border-t border-[--brand-border] flex flex-wrap gap-2">
                  {article.hashtags.map((h) => (
                    <span key={h} className="tag">{h}</span>
                  ))}
                </div>
              )}

              <div className="mt-12 p-6 rounded-xl bg-[--brand-accent-soft] border border-[--brand-accent]/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="avatar avatar-sm"><span>M</span></div>
                  <div>
                    <div className="text-sm font-bold text-[--brand-text]">Written by Manikanta</div>
                    <div className="text-xs text-[--brand-text-secondary]">Writer, builder, and the mind behind INSIGHTS</div>
                  </div>
                </div>
                <Link href="/author" className="text-sm font-medium text-[--brand-accent] hover:underline">View profile →</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="max-w-[1200px] mx-auto px-5 mt-24 pt-12 border-t border-[--brand-border]">
            <h2 className="cool-h2 text-[--brand-text] mb-2">Continue reading</h2>
            <p className="text-[--brand-text-secondary] mb-8">More articles from INSIGHTS</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
              {related.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="max-w-[680px] mx-auto px-5 mt-16">
          <Comments articleSlug={article.slug} articleTitle={article.title} />
        </div>
      </article>
      <Footer />
    </div>
  );
}

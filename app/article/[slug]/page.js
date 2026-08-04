import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import ArticleCard from '@/components/site/ArticleCard';
import ArticleActions from '@/components/site/ArticleActions';
import ArticleToolbar from '@/components/site/ArticleToolbar';
import ReadingProgress from '@/components/site/ReadingProgress';
import ArticleTOC from '@/components/site/ArticleTOC';
import Comments from '@/components/site/Comments';
import NewsletterForm from '@/components/site/NewsletterForm';
import { db } from '@/packages/db';
import { renderMd, mdToText, ensureEditorialStructure, extractHeadings, coverImageFor } from '@/packages/utils';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { findSection } from '@/lib/sections';

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
      images: [{ url: coverImage, width: 1200, height: 630, alt: article.title }],
      siteName: SITE_NAME,
    },
    twitter: { card: 'summary_large_image', title: article.title, description, images: [coverImage] },
    robots: { index: article.status === 'published', follow: true },
  };
}

function readingMin(content) {
  return Math.max(2, Math.round((content || '').split(/\s+/).length / 220));
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || article.status !== 'published') return notFound();

  const allArticles = await db.articles.list({ status: 'published', limit: 20 });
  const allRelated = allArticles.filter((a) => a.id !== article.id);
  const tagMatch = (a) => {
    if (!article.hashtags?.length || !a.hashtags?.length) return 0;
    return article.hashtags.filter((t) => a.hashtags.includes(t)).length;
  };
  const scored = allRelated.map((a) => ({ article: a, score: tagMatch(a) + (a.section === article.section ? 1 : 0) }));
  scored.sort((a, b) => b.score - a.score);
  const related = scored.slice(0, 3).map((s) => s.article);

  const dateStr = formatDate(article.publishedAt || article.createdAt);
  const updatedStr = article.updatedAt && article.updatedAt !== article.publishedAt ? formatDate(article.updatedAt) : null;
  const readMin = readingMin(article.content);
  const url = `${SITE_URL}/article/${article.slug}`;
  const coverImage = article.coverImage || coverImageFor(article.title, article.section);
  const content = ensureEditorialStructure(article.content);
  const headings = extractHeadings(content);
  const sectionName = findSection(article.section)?.name || article.section;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}/#article`,
        headline: article.title,
        description: article.excerpt || mdToText(article.content, 160),
        image: [coverImage],
        datePublished: article.publishedAt || article.createdAt,
        dateModified: article.updatedAt || article.publishedAt || article.createdAt,
        author: { '@type': 'Person', name: 'Manikanta R', url: `${SITE_URL}/author` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        keywords: (Array.isArray(article.seo?.keywords) ? article.seo.keywords : typeof article.seo?.keywords === 'string' ? article.seo.keywords.split(',').map(s => s.trim()) : article.hashtags || []).join(', '),
        articleSection: article.section,
        wordCount: (article.content || '').split(/\s+/).length,
        isAccessibleForFree: true,
        inLanguage: 'en',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: sectionName, item: `${SITE_URL}/${article.section}` },
          { '@type': 'ListItem', position: 3, name: article.title },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress targetId="article-body" />
      <ArticleToolbar url={url} title={article.title} articleSlug={article.slug} />
      <Nav />
      <article>
        {/* ═══ HERO IMAGE — full width, subtle parallax ═══ */}
        <div className="w-full mb-12">
          <div className="relative overflow-hidden aspect-[2.5/1] md:aspect-[2.8/1] bg-[--shimmer-base]">
            <img
              src={coverImage}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover will-change-transform"
              style={{ transform: 'translateY(var(--scroll-offset, 0px))' }}
            />
          </div>
        </div>

        {/* ═══ HEADER ═══ */}
        <div className="max-w-[900px] mx-auto px-5 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors">
              <ArrowLeft size={14} /> Home
            </Link>
            <span className="text-[--brand-border]">/</span>
            <Link href={`/${article.section}`} className="text-sm text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors">
              {sectionName}
            </Link>
          </div>

          <div className="max-w-[760px]">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[--brand-text-secondary] uppercase tracking-[0.12em] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[--brand-text]" />
              {sectionName}
            </span>
            <h1 className="cool-hero text-[--brand-text]">{article.title}</h1>
            <p className="mt-4 text-lg md:text-xl text-[--brand-text-secondary] leading-relaxed">{article.excerpt}</p>

            <div className="flex flex-wrap items-center gap-4 mt-8 pb-8 border-b border-[--brand-border]">
              <div className="flex items-center gap-3">
                <div className="avatar"><span>M</span></div>
                <div>
                  <div className="text-sm font-bold text-[--brand-text]">Manikanta</div>
                  <div className="text-xs text-[--brand-text-secondary]">
                    {dateStr} &middot; {readMin} min read
                    {updatedStr && <span> &middot; Updated {updatedStr}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <ArticleActions title={article.title} url={url} />
              </div>
            </div>
          </div>
        </div>

        {/* ═══ BODY — centered with TOC sidebar ═══ */}
        <div className="max-w-[1280px] mx-auto px-5">
          <div className={headings.length >= 3 ? 'flex justify-center gap-16' : 'flex justify-center'}>
            {headings.length >= 3 && (
              <aside className="hidden lg:block w-[200px] shrink-0">
                <div className="sticky top-24">
                  <ArticleTOC headings={headings} />
                </div>
              </aside>
            )}

            <div id="article-body" className="max-w-[760px] w-full min-w-0 article-body">
              <div dangerouslySetInnerHTML={{ __html: renderMd(content) }} />

              {article.hashtags?.length > 0 && (
                <div className="mt-16 pt-8 border-t border-[--brand-border] flex flex-wrap gap-2">
                  {article.hashtags.map((h) => (
                    <span key={h} className="tag">{h}</span>
                  ))}
                </div>
              )}

              {/* ═══ AUTHOR CARD ═══ */}
              <div className="mt-12 p-8 rounded-2xl bg-[--brand-accent-soft]/50 border border-[--brand-border]">
                <div className="flex items-start gap-4">
                  <div className="avatar shrink-0"><span>M</span></div>
                  <div>
                    <div className="text-base font-bold text-[--brand-text]">Written by Manikanta</div>
                    <p className="mt-1 text-sm text-[--brand-text-secondary] leading-relaxed">
                      Writer, builder, and creator of INSIGHTS. Writing about AI, business, and the craft of building things that matter.
                    </p>
                    <Link href="/author" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[--brand-text] hover:opacity-70 transition-opacity">
                      View all articles &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RELATED ═══ */}
        {related.length > 0 && (
          <div className="max-w-[1280px] mx-auto px-5 mt-24 pt-16 border-t border-[--brand-border]">
            <h2 className="cool-h2 text-[--brand-text] mb-2">Continue Reading</h2>
            <p className="text-[--brand-text-secondary] mb-10">Hand-picked articles you might enjoy</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
              {related.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
            </div>
          </div>
        )}

        {/* ═══ NEWSLETTER ═══ */}
        <div className="max-w-[760px] mx-auto px-5 mt-20">
          <div className="relative overflow-hidden rounded-2xl bg-[--brand-text] p-8 md:p-10 text-[--brand-bg] text-center">
            <Sparkles size={18} className="mx-auto mb-4 text-white/50" />
            <h3 className="text-xl font-bold text-white mb-2">Enjoyed this article?</h3>
            <p className="text-sm text-white/60 mb-6">Get the latest posts delivered to your inbox.</p>
            <NewsletterForm variant="inline" />
          </div>
        </div>

        {/* ═══ NOTES ═══ */}
        <div id="article-notes" className="max-w-[760px] mx-auto px-5 mt-20 mb-16">
          <Comments articleSlug={article.slug} articleTitle={article.title} />
        </div>
      </article>
      <Footer />
    </div>
  );
}

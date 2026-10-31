import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import ArticleCard from '@/components/site/ArticleCard';
import Breadcrumb from '@/components/site/Breadcrumb';
import { db } from '@/packages/db';
import { coverImageFor } from '@/packages/utils';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 900;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.manikantar.in';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await db.categories.getBySlug(slug).catch(() => null);
  if (!category) return { title: 'Category not found — NEXT DRAFT' };
  return {
    title: `${category.name} — NEXT DRAFT`,
    description: category.description || `Browse ${category.name} articles on NEXT DRAFT.`,
    alternates: { canonical: `${SITE_URL}/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = await db.categories.getBySlug(slug).catch(() => null);
  if (!category) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="max-w-[1200px] mx-auto px-5 py-32 text-center">
          <h1 className="cool-h1 text-[--brand-text]">Category not found</h1>
        </div>
        <Footer />
      </div>
    );
  }

  let articles = [];
  try { articles = await db.articles.list({ status: 'published', limit: 100 }); } catch { articles = []; }
  const categoryArticles = articles.filter((a) => a.categoryId === category.id);
  const [hero, ...rest] = categoryArticles;

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <div className="max-w-[1200px] mx-auto px-5 pt-8 pb-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors mb-8">
            <ArrowLeft size={14} /> Home
          </Link>
        </div>

        <div className="max-w-[1200px] mx-auto px-5 mb-16">
          <div className="border-b border-[--brand-border] pb-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[--brand-border]/30 bg-[--brand-accent-soft]/20 text-[10px] font-semibold uppercase tracking-[0.15em] text-[--brand-text-secondary]">
                Category
              </span>
              <h1 className="cool-hero text-[--brand-text]">{category.name}</h1>
            </div>
            {category.description && <p className="mt-3 text-lg text-[--brand-text-secondary] max-w-xl">{category.description}</p>}
            <p className="mt-2 text-sm text-[--brand-text-secondary]">{categoryArticles.length} article{categoryArticles.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {categoryArticles.length === 0 ? (
          <div className="max-w-[1200px] mx-auto px-5 py-24 text-center text-[--brand-text-secondary]">
            <p className="text-lg">No articles yet in {category.name}.</p>
            <Link href="/" className="mt-4 inline-flex items-center gap-1 text-sm font-medium hover:text-[--brand-text] transition-colors">Browse all articles &rarr;</Link>
          </div>
        ) : (
          <div className="max-w-[1200px] mx-auto px-5 pb-20">
            {hero && (
              <Link href={`/article/${hero.slug}`} className="group block mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  <div className="relative overflow-hidden rounded-2xl aspect-[2/1] bg-[--shimmer-base] shadow-sm lg:order-1">
                    <img
                      src={hero.coverImage || coverImageFor(hero.title, hero.section)}
                      alt={hero.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="lg:order-2">
                    <span className="text-xs font-semibold text-[--brand-text-secondary] uppercase tracking-[0.1em]">Featured</span>
                    <h2 className="cool-h1 mt-3 text-[--brand-text] group-hover:opacity-80 transition-opacity">{hero.title}</h2>
                    <p className="mt-3 text-base text-[--brand-text-secondary] leading-relaxed">{hero.excerpt}</p>
                    <div className="flex items-center gap-2 mt-4 text-sm text-[--brand-text-secondary]">
                      <span>{Math.max(2, Math.round((hero.content || '').split(/\s+/).length / 220))} min read</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
              {rest.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

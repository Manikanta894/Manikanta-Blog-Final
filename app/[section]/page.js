import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import ArticleCard from '@/components/site/ArticleCard';
import Kicker from '@/components/site/Kicker';
import { findSection } from '@/lib/sections';
import { db } from '@/packages/db';

export const revalidate = 900;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.manikantar.in';

export async function generateMetadata({ params }) {
  const { section } = await params;
  const cfg = findSection(section);
  if (!cfg) return { title: 'Not found — INSIGHTS' };
  return {
    title: cfg.name,
    description: cfg.desc,
    alternates: { canonical: `${SITE_URL}/${cfg.slug}` },
    openGraph: { title: `${cfg.name} — INSIGHTS`, description: cfg.desc, url: `${SITE_URL}/${cfg.slug}` },
  };
}

export default async function SectionPage({ params }) {
  const { section } = await params;
  const cfg = findSection(section);

  if (!cfg) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="container py-40 text-center">
          <Kicker>404</Kicker>
          <h1 className="text-h1 italic mt-3 text-[--brand-text]">Nothing here yet.</h1>
        </div>
        <Footer />
      </div>
    );
  }

  let articles = [];
  try { articles = await db.articles.list({ section, status: 'published', limit: 50 }); } catch { articles = []; }
  const [hero, ...rest] = articles;

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="container pt-10 pb-16">
        <div className="text-center max-w-3xl mx-auto py-10">
          <Kicker color={cfg.accent}>{cfg.kicker}</Kicker>
          <h1 className="text-hero italic mt-4 text-[--brand-text]">{cfg.name}</h1>
          <p className="mt-5 text-lead text-[--brand-text-secondary]">{cfg.desc}</p>
          <div className="hairline mt-8 max-w-sm mx-auto" />
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-[--brand-text-secondary]">No articles published in this section yet.</div>
        ) : (
          <>
            {hero && (
              <div className="mt-8">
                <ArticleCard article={hero} variant="hero" />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {rest.map((a, i) => (
                <ArticleCard key={a.id} article={a} index={i} />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

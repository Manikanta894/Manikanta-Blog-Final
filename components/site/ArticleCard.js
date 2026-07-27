'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SECTIONS } from '@/lib/sections';
import { coverImageFor } from '@/packages/utils';

function readingMinutes(article) {
  const words = (article.content || '').split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

function CategoryLabel({ section }) {
  const cfg = SECTIONS.find((s) => s.slug === section);
  return (
    <span className="text-eyebrow text-brand">
      {cfg?.name || section}
    </span>
  );
}

export default function ArticleCard({ article, variant = 'default', index = 0 }) {
  const href = `/article/${article.slug}`;
  const date = article.publishedAt ? new Date(article.publishedAt) : new Date(article.createdAt || Date.now());
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const readMin = readingMinutes(article);
  const cover = article.coverImage || coverImageFor(article.title, article.section);

  // Full-width featured card — used on category pages.
  if (variant === 'hero') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="group"
      >
        <Link href={href} className="block">
          <div className="relative overflow-hidden rounded-md bg-[#D8D3CB] aspect-[16/9] grain">
            <img
              src={cover}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              style={{ filter: 'grayscale(15%) contrast(1.02)' }}
            />
          </div>
          <div className="mt-6">
            <CategoryLabel section={article.section} />
            <h1 className="text-h2 italic mt-2 text-[#181818] group-hover:text-brand transition-colors">
              {article.title}
            </h1>
            <p className="mt-3 text-lead text-[#555555] max-w-2xl">{article.excerpt}</p>
            <div className="mt-4 flex items-center gap-3 text-eyebrow text-[#555555]">
              <span>{readMin} min read</span>
              <span className="w-1 h-1 rounded-full bg-[#D8D3CB]" />
              <span>{dateStr}</span>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  // List row — used for Editor's Picks.
  if (variant === 'compact') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.04 }}
        className="group"
      >
        <Link href={href} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-5 items-start py-5 border-b border-[#D8D3CB] last:border-0 transition-[padding] duration-200 group-hover:pl-1.5">
          <div className="relative overflow-hidden rounded aspect-square bg-[#D8D3CB]">
            <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'grayscale(15%) contrast(1.02)' }} />
          </div>
          <div className="min-w-0">
            <CategoryLabel section={article.section} />
            <h3 className="text-h4 italic mt-1.5 mb-2 text-[#181818] group-hover:text-brand transition-colors">
              {article.title}
            </h3>
            <div className="flex items-center gap-3 text-eyebrow text-[#555555]">
              <span>{readMin} min read</span>
              <span className="w-1 h-1 rounded-full bg-[#D8D3CB]" />
              <span>{dateStr}</span>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  // Default — image-first grid card.
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-md border border-[#D8D3CB] bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_-18px_rgba(24,24,24,0.25)]"
    >
      <Link href={href} className="block">
        <div className="relative overflow-hidden aspect-[4/3] bg-[#D8D3CB]">
          <img
            src={cover}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            style={{ filter: 'grayscale(15%) contrast(1.02)' }}
          />
        </div>
        <div className="p-5">
          <CategoryLabel section={article.section} />
          <h3 className="text-h4 italic mt-2 mb-2 text-[#181818] group-hover:text-brand transition-colors">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-meta text-[#555555] line-clamp-2 mb-4">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-3 pt-3 border-t border-[#D8D3CB] text-eyebrow text-[#555555]">
            <span>{readMin} min read</span>
            <span>{dateStr}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

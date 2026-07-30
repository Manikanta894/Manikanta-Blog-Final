import { NextResponse } from 'next/server';
import { db } from '@/packages/db';
import { sendNewsletter } from '@/lib/email';
import { newsletterHtml } from '@/lib/newsletter-template';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.manikantar.in';

function generateWeekdayNewsletter(articles) {
  const latest = articles.slice(0, 5);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];

  return {
    subject: `INSIGHTS \u2014 ${today}'s top reads`,
    greeting: `Good morning. Here's what's new at INSIGHTS this ${today}.`,
    articles: latest.map((a) => ({
      title: a.title,
      excerpt: a.excerpt || '',
      url: `${SITE_URL}/article/${a.slug}`,
      readTime: Math.max(2, Math.round((a.content || '').split(/\s+/).length / 220)),
    })),
    intro: ``,
    outro: `Thanks for reading. See you tomorrow.\n\n— Manikanta`,
  };
}

function generateWeekendNewsletter(articles) {
  const latest = articles.slice(0, 6);

  return {
    subject: 'INSIGHTS \u2014 Weekend Edition',
    greeting: 'Happy weekend. Grab a coffee and dive into this week\'s best writing.',
    articles: latest.map((a) => ({
      title: a.title,
      excerpt: a.excerpt || '',
      url: `${SITE_URL}/article/${a.slug}`,
      readTime: Math.max(2, Math.round((a.content || '').split(/\s+/).length / 220)),
    })),
    intro: 'Missed something this week? We\'ve gathered the highlights \u2014 deep dives on AI, practical guides for builders, and essays worth your Sunday.',
    outro: 'Enjoy the rest of your weekend.\n\n— Manikanta',
  };
}

export async function GET(request) {
  try {
    const articles = await db.articles.list({ status: 'published', limit: 7 });
    if (articles.length === 0) return NextResponse.json({ ok: false, error: 'No articles' });

    const day = new Date().getDay(); // 0=Sun, 6=Sat
    const isWeekend = day === 0 || day === 6;
    const data = isWeekend ? generateWeekendNewsletter(articles) : generateWeekdayNewsletter(articles);

    const html = newsletterHtml(data);
    const result = await sendNewsletter({ subject: data.subject, html });

    await db.logs.create({
      action: 'newsletter.send',
      status: result.ok ? 'ok' : 'failed',
      meta: { sent: result.sent || 0, total: result.total || 0, isWeekend },
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

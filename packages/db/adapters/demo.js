import { v4 as uuid } from 'uuid';

const NOW = new Date('2026-07-29T12:00:00Z');

function ago(minutes) {
  return new Date(NOW.getTime() - minutes * 60000).toISOString();
}

function md(content) {
  return content;
}

const SECTIONS = ['ai', 'tech', 'business', 'essays', 'productivity'];

const SAMPLE_ARTICLES = [
  {
    slug: 'building-production-rag-systems',
    title: 'Building Production-Ready RAG Systems: A Practical Guide',
    excerpt: 'Retrieval-Augmented Generation is transforming how enterprises interact with their data. Here is what I learned shipping RAG to production across three different use cases.',
    section: 'ai',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&h=600&fit=crop',
    hashtags: ['#AI', '#RAG', '#LLM', '#production'],
    seo: { title: 'Building Production-Ready RAG Systems — INSIGHTS', description: 'What I learned shipping RAG to production across three use cases.', keywords: 'RAG, LLM, production, AI, retrieval augmented generation' },
    publishedAt: ago(1440 * 5),
  },
  {
    slug: 'react-server-components-deep-dive',
    title: 'React Server Components: Beyond the Hype',
    excerpt: 'RSC is not just another rendering strategy. It fundamentally changes how we think about the boundary between server and client in modern web applications.',
    section: 'tech',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900&h=600&fit=crop',
    hashtags: ['#React', '#RSC', '#webdev', '#JavaScript'],
    seo: { title: 'React Server Components — INSIGHTS', description: 'How RSC changes the server-client boundary in web apps.', keywords: 'React, Server Components, RSC, web development, Next.js' },
    publishedAt: ago(1440 * 7),
  },
  {
    slug: 'the-case-for-async-everything',
    title: 'The Case for Async-First Engineering Cultures',
    excerpt: 'After leading teams at three different companies, I have seen firsthand how synchronous communication patterns are the single biggest drain on engineering productivity.',
    section: 'essays',
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=600&fit=crop',
    hashtags: ['#engineering', '#culture', '#async', '#productivity'],
    seo: { title: 'Async-First Engineering Cultures — INSIGHTS', description: 'Why synchronous comms drain engineering productivity.', keywords: 'async, engineering culture, productivity, remote work' },
    publishedAt: ago(1440 * 12),
  },
  {
    slug: 'startup-pricing-lessons',
    title: 'Pricing Lessons Learned from 50+ SaaS Startup Audits',
    excerpt: 'Most startups leave money on the table because they treat pricing as a one-time decision rather than a continuous strategy. Here is what the data says.',
    section: 'business',
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&h=600&fit=crop',
    hashtags: ['#startups', '#pricing', '#SaaS', '#business'],
    seo: { title: 'SaaS Pricing Lessons — INSIGHTS', description: 'What 50+ startup audits taught me about SaaS pricing.', keywords: 'startup, pricing, SaaS, business strategy' },
    publishedAt: ago(1440 * 15),
  },
  {
    slug: 'ai-coding-assistants-workflow',
    title: 'How I Use AI Coding Assistants Without Losing My Edge',
    excerpt: 'AI is a powerful accelerator, but over-reliance erodes your fundamentals. Here is my framework for staying sharp while shipping faster.',
    section: 'ai',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&h=600&fit=crop',
    hashtags: ['#AI', '#coding', '#productivity', '#developer'],
    seo: { title: 'AI Coding Assistants — INSIGHTS', description: 'A framework for staying sharp while shipping faster with AI.', keywords: 'AI, coding assistant, Copilot, developer productivity' },
    publishedAt: ago(1440 * 20),
  },
  {
    slug: 'what-i-learned-rewriting-my-blog-five-times',
    title: 'What I Learned Rewriting My Blog Five Times',
    excerpt: 'Every developer has that project they rebuild obsessively. For me it was this blog. Here is what each iteration taught me about simplicity and shipping.',
    section: 'essays',
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=900&h=600&fit=crop',
    hashtags: ['#writing', '#sideprojects', '#minimalism', '#blogging'],
    seo: { title: 'Rewriting My Blog Five Times — INSIGHTS', description: 'What each iteration taught me about simplicity and shipping.', keywords: 'blogging, side projects, rebuilding, simplicity' },
    publishedAt: ago(1440 * 25),
  },
  {
    slug: 'indiehacking-on-indian-stack',
    title: 'Indie Hacking on the Indian Stack: Building in Public',
    excerpt: 'Building a SaaS on UPI, Razorpay, and AWS billing in rupees comes with unique challenges. Here is the playbook I wish I had when I started.',
    section: 'business',
    coverImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=900&h=600&fit=crop',
    hashtags: ['#indiehacking', '#India', '#SaaS', '#startup'],
    seo: { title: 'Indie Hacking India Stack — INSIGHTS', description: 'Building SaaS in India — UPI, Razorpay, and more.', keywords: 'indie hacking, India stack, UPI, Razorpay, SaaS' },
    publishedAt: ago(1440 * 30),
  },
  {
    slug: 'deep-work-habits-that-stick',
    title: 'Deep Work Habits That Actually Stick',
    excerpt: 'Forget the productivity porn. After experimenting for two years, these are the only four habits that survived and actually moved the needle.',
    section: 'productivity',
    coverImage: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=900&h=600&fit=crop',
    hashtags: ['#productivity', '#deepwork', '#habits', '#focus'],
    seo: { title: 'Deep Work Habits That Stick — INSIGHTS', description: 'Four habits that survived two years of experimentation.', keywords: 'deep work, productivity, habits, focus' },
    publishedAt: ago(1440 * 35),
  },
  {
    slug: 'why-typescript-won-the-framework-wars',
    title: 'Why TypeScript Won — And What Comes Next',
    excerpt: 'TypeScript did not win because it was the best type system. It won because it made the right trade-offs at the right time. Here is what the next era looks like.',
    section: 'tech',
    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=900&h=600&fit=crop',
    hashtags: ['#TypeScript', '#JavaScript', '#webdev', '#programming'],
    seo: { title: 'Why TypeScript Won — INSIGHTS', description: 'TypeScript won on trade-offs, not type system superiority.', keywords: 'TypeScript, JavaScript, web development, programming languages' },
    publishedAt: ago(1440 * 40),
  },
  {
    slug: 'data-science-for-product-managers',
    title: 'Data Science for Product Managers: A Cheatsheet',
    excerpt: 'You do not need to be a statistician to make data-driven product decisions. Here is the minimal set of concepts every PM should know.',
    section: 'productivity',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=600&fit=crop',
    hashtags: ['#datascience', '#product', '#PM', '#analytics'],
    seo: { title: 'Data Science for PMs — INSIGHTS', description: 'Minimal data concepts every product manager should know.', keywords: 'data science, product management, analytics, metrics' },
    publishedAt: ago(1440 * 45),
  },
  {
    slug: 'building-agentic-workflows',
    title: 'Building Agentic Workflows That Dont Fall Apart',
    excerpt: 'Agentic AI sounds magical until your agent gets stuck in a loop. Here is the architecture I use to build reliable multi-step AI workflows.',
    section: 'ai',
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&h=600&fit=crop',
    hashtags: ['#AI', '#agents', '#workflows', '#architecture'],
    seo: { title: 'Agentic AI Workflows — INSIGHTS', description: 'Architecture for reliable multi-step AI agent workflows.', keywords: 'AI agents, workflows, architecture, LLM' },
    publishedAt: ago(1440 * 50),
  },
  {
    slug: 'designing-for-low-bandwidth-india',
    title: 'Designing for the Next Billion Users: Lessons from India',
    excerpt: 'Building for users on 2G networks and budget devices teaches you more about good design than any UX course ever will.',
    section: 'tech',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&h=600&fit=crop',
    hashtags: ['#design', '#India', '#ux', '#mobile'],
    seo: { title: 'Designing for Low-Bandwidth — INSIGHTS', description: 'Lessons from building for the next billion users in India.', keywords: 'UX design, India, mobile, low-bandwidth, Jio' },
    publishedAt: ago(1440 * 55),
  },
];

function buildArticle(base, i) {
  return {
    id: uuid(),
    status: 'published',
    author: 'Manikanta',
    ...base,
    content: md(`\
# ${base.title}

${base.excerpt}

## Introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## The Core Idea

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Why This Matters Now

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

## Key Takeaways

1. **First principle**: Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
2. **Second principle**: Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
3. **Third principle**: Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.

> "The best time to start was yesterday. The second best time is now."

## Putting It Into Practice

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.

## Conclusion

Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.
`),
    createdAt: ago(1440 * (60 + i * 2)),
    updatedAt: ago(1440 * (55 - i)),
  };
}

const articles = {
  async list({ section, status = 'published', limit = 30 } = {}) {
    let items = SAMPLE_ARTICLES.map((a, i) => buildArticle(a, i));
    if (section) items = items.filter((a) => a.section === section);
    if (status && status !== 'all') items = items.filter((a) => a.status === status);
    return items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, limit);
  },
  async getById(id) {
    const items = SAMPLE_ARTICLES.map((a, i) => buildArticle(a, i));
    return items.find((a) => a.id === id) || null;
  },
  async getBySlug(slug) {
    const idx = SAMPLE_ARTICLES.findIndex((a) => a.slug === slug);
    if (idx === -1) return null;
    return buildArticle(SAMPLE_ARTICLES[idx], idx);
  },
  async create(data) {
    return { id: uuid(), status: 'draft', hashtags: [], seo: {}, author: 'Manikanta', createdAt: NOW.toISOString(), updatedAt: NOW.toISOString(), ...data };
  },
  async update(id, patch) {
    return { id, status: 'published', ...patch, updatedAt: NOW.toISOString() };
  },
  async delete() { return true; },
  async search(q) {
    if (!q) return [];
    return (await articles.list()).filter((a) =>
      a.title.toLowerCase().includes(q.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(q.toLowerCase()) ||
      a.hashtags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
    );
  },
  async countByStatus(status) {
    const items = SAMPLE_ARTICLES.map((a, i) => buildArticle(a, i));
    if (status) return items.filter((a) => a.status === status).length;
    return items.length;
  },
};

const journal = {
  async list() {
    return [
      { id: uuid(), title: 'Deep work session on RAG architecture', mood: 'focused', content: 'Spent 4 hours refining the retrieval pipeline. Finally got recall above 90%.', entryDate: ago(1440 * 2), photos: [], memories: [], createdAt: ago(1440 * 2) },
      { id: uuid(), title: 'Morning walk and clarity', mood: 'happy', content: 'Had a breakthrough on the pricing model during my walk. Sometimes stepping away is the best thing you can do.', entryDate: ago(1440 * 5), photos: [], memories: [], createdAt: ago(1440 * 5) },
      { id: uuid(), title: 'Reviewing PRs and feeling proud', mood: 'grateful', content: 'The team is shipping some of the best code I have seen. Mentoring is paying off.', entryDate: ago(1440 * 7), photos: [], memories: [], createdAt: ago(1440 * 7) },
      { id: uuid(), title: 'Stuck on a bug', mood: 'frustrated', content: 'Spent 3 hours debugging a race condition. Need to sleep on it.', entryDate: ago(1440 * 10), photos: [], memories: [], createdAt: ago(1440 * 10) },
    ];
  },
  async create(input) {
    return { id: uuid(), mood: 'focused', photos: [], memories: [], entryDate: NOW.toISOString(), ...input };
  },
  async update() { return true; },
  async delete() { return true; },
};

const media = {
  async list() { return []; },
  async create(input) { return { id: uuid(), type: 'image', ...input }; },
};

const aiQueue = {
  async list() { return []; },
  async create(input) { return { id: uuid(), status: 'pending', ...input }; },
  async update() { return true; },
};

const socialQueue = {
  async list() { return []; },
  async create(input) { return { id: uuid(), status: 'pending', ...input }; },
  async update() { return true; },
};

const rssSources = {
  async list() { return []; },
  async create(input) { return { id: uuid(), active: true, ...input }; },
  async delete() { return true; },
};

const subscribers = {
  async list() { return []; },
  async subscribe() { return true; },
  async count() { return 42; },
};

const logs = {
  async list() { return []; },
  async create(input) { return { id: uuid(), ...input }; },
};

const settings = {
  async get() { return { id: 'global', blogName: 'INSIGHTS', blogDescription: 'Thoughts on tech, AI, and building things that matter.' }; },
  async patch(input) { return { id: 'global', ...input }; },
};

const stats = {
  async overview() {
    return { articles: SAMPLE_ARTICLES.length, published: SAMPLE_ARTICLES.length, drafts: 2, journal: 4, subscribers: 42, socialQueue: 0 };
  },
};

export const db = {
  articles, journal, media, aiQueue, socialQueue, rssSources, subscribers, logs, settings, stats,
};

export async function initDb() {
  return true;
}

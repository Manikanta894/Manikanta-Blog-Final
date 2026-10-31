import { v4 as uuid } from 'uuid';

const NOW = new Date().toISOString();

const SAMPLE_ARTICLES = [];

let _articles = [];

const articles = {
  async list(opts = {}) {
    let r = _articles.slice();
    if (opts?.status) r = r.filter((a) => a.status === opts.status);
    if (opts?.section) r = r.filter((a) => a.section === opts.section);
    if (opts?.limit) r = r.slice(0, opts.limit);
    return r;
  },
  async getById(id) { return _articles.find((a) => a.id === id) || null; },
  async getBySlug(slug) { return _articles.find((a) => a.slug === slug) || null; },
  async create(data) {
    const a = { id: uuid(), status: 'draft', hashtags: [], seo: {}, author: 'Manikanta', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data };
    _articles.unshift(a);
    return a;
  },
  async update(id, patch) {
    const i = _articles.findIndex((a) => a.id === id);
    if (i === -1) {
      const a = { id, status: 'published', ...patch, updatedAt: new Date().toISOString() };
      _articles.unshift(a);
      return a;
    }
    _articles[i] = { ..._articles[i], ...patch, updatedAt: new Date().toISOString() };
    return _articles[i];
  },
  async delete(id) { _articles = _articles.filter((a) => a.id !== id); return true; },
  async search(q) {
    const s = (q || '').toLowerCase();
    return _articles.filter((a) => (a.title || '').toLowerCase().includes(s) || (a.content || '').toLowerCase().includes(s));
  },
  async countByStatus() {
    const out = {};
    for (const a of _articles) out[a.status] = (out[a.status] || 0) + 1;
    return out;
  },
};

let _journal = [];

const journal = {
  async list() { return _journal.slice(); },
  async create(input) { const e = { id: uuid(), mood: 'focused', photos: [], memories: [], entryDate: new Date().toISOString(), ...input }; _journal.unshift(e); return e; },
  async update(id, patch) { const i = _journal.findIndex((e) => e.id === id); if (i === -1) return true; _journal[i] = { ..._journal[i], ...patch }; return true; },
  async delete(id) { _journal = _journal.filter((e) => e.id !== id); return true; },
};

let _media = [];

const media = {
  async list() { return _media.slice(); },
  async create(input) { const m = { id: uuid(), type: 'image', ...input }; _media.unshift(m); return m; },
  async getById(id) { return _media.find((m) => m.id === id) || null; },
  async getByKey(key) { return _media.find((m) => m.key === key) || null; },
  async delete(id) { _media = _media.filter((m) => m.id !== id); return true; },
};

let _aiQueue = [];

const aiQueue = {
  async list() { return _aiQueue.slice(); },
  async create(input) { const j = { id: uuid(), status: 'pending', ...input }; _aiQueue.unshift(j); return j; },
  async update(id, patch) { const i = _aiQueue.findIndex((x) => x.id === id); if (i === -1) return true; _aiQueue[i] = { ..._aiQueue[i], ...patch }; return true; },
};

let _socialQueue = [];

const socialQueue = {
  async list(opts = {}) {
    let r = _socialQueue.slice();
    if (opts?.status) r = r.filter((x) => x.status === opts.status);
    if (opts?.limit) r = r.slice(0, opts.limit);
    return r;
  },
  async getById(id) { return _socialQueue.find((x) => x.id === id) || null; },
  async create(input) { const q = { id: uuid(), status: 'pending', ...input }; _socialQueue.unshift(q); return q; },
  async update(id, patch) { const i = _socialQueue.findIndex((x) => x.id === id); if (i === -1) return null; _socialQueue[i] = { ..._socialQueue[i], ...patch }; return _socialQueue[i]; },
};

let _rss = [];

const rssSources = {
  async list() { return _rss.slice(); },
  async create(input) { const r = { id: uuid(), active: true, ...input }; _rss.unshift(r); return r; },
  async delete(id) { _rss = _rss.filter((x) => x.id !== id); return true; },
};

let _logs = [];

const logs = {
  async list() { return _logs.slice(); },
  async create(input) { const l = { id: uuid(), createdAt: new Date().toISOString(), ...input }; _logs.unshift(l); return l; },
};

let _inbox = [];

const inbox = {
  async list() { return _inbox.slice(); },
  async getById(id) { return _inbox.find((x) => x.id === id) || null; },
  async create(input) { const it = { id: uuid(), status: 'pending', ...input }; _inbox.unshift(it); return it; },
  async update(id, patch) { const i = _inbox.findIndex((x) => x.id === id); if (i === -1) return null; _inbox[i] = { ..._inbox[i], ...patch }; return _inbox[i]; },
  async delete(id) { _inbox = _inbox.filter((x) => x.id !== id); return true; },
};

const _subs = new Map();

const subscribers = {
  async list() { return Array.from(_subs.values()); },
  async subscribe(email) {
    const existing = Array.from(_subs.values()).find((s) => s.email === email);
    if (!existing) {
      _subs.set(email, { id: uuid(), email, status: 'active', subscribedAt: NOW });
    }
    return true;
  },
  async count() { return _subs.size; },
};

let _settings = { id: 'global', blogName: 'NEXT DRAFT', blogDescription: 'Thoughts on tech, AI, and building things that matter.' };

const settings = {
  async get() { return { ..._settings }; },
  async patch(input) { _settings = { ..._settings, ...input }; return { ..._settings }; },
};

const _sessions = new Map();
const sessions = {
  async create(token, meta = {}) {
    _sessions.set(token, { token, created: NOW, ...meta });
    return true;
  },
  async validate(token) {
    const s = _sessions.get(token);
    if (!s) return false;
    return true;
  },
  async delete(token) { return _sessions.delete(token); },
  async deleteAll() { _sessions.clear(); return true; },
  async list() { return Array.from(_sessions.values()); },
};

const stats = {
  async overview() {
    const published = _articles.filter((a) => a.status === 'published').length;
    const drafts = _articles.filter((a) => a.status === 'draft').length;
    return { articles: _articles.length, published, drafts, journal: _journal.length, subscribers: _subs.size, socialQueue: _socialQueue.length };
  },
};

// ============ CATEGORIES (demo) ============
const _demoCategories = [
  { id: 'cat-ai', slug: 'ai', name: 'Artificial Intelligence', kicker: 'The AI Desk', description: 'Frontier models, agents, and the race to AGI', accent: '#7C3AED', sort_order: 0, createdAt: NOW },
  { id: 'cat-business', slug: 'business', name: 'Business & Strategy', kicker: 'Business & Strategy', description: 'Markets, moats, and modern operators', accent: '#0A0A0A', sort_order: 1, createdAt: NOW },
  { id: 'cat-career', slug: 'career', name: 'Career & Growth', kicker: 'The Career Desk', description: 'Navigating the future of work', accent: '#EA580C', sort_order: 2, createdAt: NOW },
  { id: 'cat-productivity', slug: 'productivity', name: 'Productivity', kicker: 'Systems & Craft', description: 'Deep work rituals and systems', accent: '#0284C7', sort_order: 3, createdAt: NOW },
  { id: 'cat-essays', slug: 'essays', name: 'Essays', kicker: 'Long Reads', description: 'Slow ideas, written to last', accent: '#0A0A0A', sort_order: 4, createdAt: NOW },
];
let _cats = [..._demoCategories];

const categories = {
  async list() { return _cats.slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)); },
  async getById(id) { return _cats.find((c) => c.id === id) || null; },
  async getBySlug(slug) { return _cats.find((c) => c.slug === slug) || null; },
  async create(input) {
    const c = { id: uuid(), sort_order: 0, ...input, createdAt: NOW };
    _cats.push(c);
    return c;
  },
  async update(id, patch) {
    const i = _cats.findIndex((c) => c.id === id);
    if (i === -1) return null;
    _cats[i] = { ..._cats[i], ...patch };
    return _cats[i];
  },
  async delete(id) {
    const before = _cats.length;
    _cats = _cats.filter((c) => c.id !== id);
    return _cats.length < before;
  },
};

// ============ TAGS (demo) ============
let _tags = [];

const tags = {
  async list() { return _tags.slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''))); },
  async getById(id) { return _tags.find((t) => t.id === id) || null; },
  async getBySlug(slug) { return _tags.find((t) => t.slug === slug) || null; },
  async create(input) {
    const t = { id: uuid(), ...input, createdAt: NOW };
    _tags.push(t);
    return t;
  },
  async update(id, patch) {
    const i = _tags.findIndex((t) => t.id === id);
    if (i === -1) return null;
    _tags[i] = { ..._tags[i], ...patch };
    return _tags[i];
  },
  async delete(id) {
    const before = _tags.length;
    _tags = _tags.filter((t) => t.id !== id);
    return _tags.length < before;
  },
};

// in-memory admin users for demo mode
const _adminUsers = [];
const adminUsers = {
  async getByUsername(username) { return _adminUsers.find(u => u.username === username) || null; },
  async create(data) { const doc = { id: 'demo-' + Math.random().toString(36).slice(2), totpEnabled: false, totpSecretEncrypted: null, recoveryCodeHashes: [], createdAt: new Date(), updatedAt: new Date(), ...data }; _adminUsers.push(doc); return doc; },
  async update(username, patch) { const u = _adminUsers.find(x => x.username === username); if (!u) return null; Object.assign(u, patch, { updatedAt: new Date() }); return u; },
  async list() { return [..._adminUsers]; },
};


export const db = {
  articles, journal, media, aiQueue, socialQueue, rssSources, subscribers, logs, settings, sessions, stats, categories, tags, inbox, adminUsers,
};

export async function initDb() {
  return true;
}
// Supabase (Postgres) adapter. Uses @supabase/supabase-js with the service-role key
// on the server. Client-side reads should use anon key + RLS policies (schema.sql).
//
// Env required:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (server-side only — never ship to browser)

import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';

let _client = null;
function sb() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for DB_DRIVER=supabase');
  }
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'public' },
  });
  return _client;
}

// Exposed so /api/upload can use Supabase Storage without duplicating the
// client setup (uses the same service-role credentials).
export function getClient() { return sb(); }

// Map camelCase JS <-> snake_case Postgres
const toRow = (o) => {
  const out = {};
  for (const [k, v] of Object.entries(o || {})) {
    const key = k.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
    out[key] = v instanceof Date ? v.toISOString() : v;
  }
  return out;
};
const toObj = (r) => {
  if (!r) return r;
  const out = {};
  for (const [k, v] of Object.entries(r)) {
    const key = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[key] = v;
  }
  return out;
};
const toObjs = (rows) => (rows || []).map(toObj);

// ============ ARTICLES ============
const articles = {
  async list({ section, status = 'published', limit = 30 } = {}) {
    let q = sb().from('articles').select('*').order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }).limit(limit);
    if (section) q = q.eq('section', section);
    if (status && status !== 'all') q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    return toObjs(data);
  },
  async getById(id) {
    const { data, error } = await sb().from('articles').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return toObj(data);
  },
  async getBySlug(slug) {
    const { data, error } = await sb().from('articles').select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    return toObj(data);
  },
  async create(input) {
    const row = toRow({
      id: uuid(),
      status: 'draft',
      hashtags: [],
      seo: {},
      ...input,
    });
    if (row.status === 'published' && !row.published_at) row.published_at = new Date().toISOString();
    const { data, error } = await sb().from('articles').insert(row).select().single();
    if (error) throw error;
    return toObj(data);
  },
  async update(id, patch) {
    const p = toRow(patch);
    if (patch.status === 'published' && !patch.publishedAt) p.published_at = new Date().toISOString();
    p.updated_at = new Date().toISOString();
    const { data, error } = await sb().from('articles').update(p).eq('id', id).select().single();
    if (error) throw error;
    return toObj(data);
  },
  async delete(id) {
    const { error } = await sb().from('articles').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
  async search(q) {
    if (!q) return [];
    // uses Postgres full-text search on articles_search_idx (schema.sql)
    const { data, error } = await sb()
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .textSearch('search_vector', q.split(/\s+/).filter(Boolean).join(' & '), { type: 'websearch', config: 'english' })
      .limit(30);
    if (error) {
      // fallback: ilike on title/excerpt
      const { data: d2 } = await sb().from('articles').select('*').eq('status', 'published').or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`).limit(30);
      return toObjs(d2);
    }
    return toObjs(data);
  },
  async countByStatus(status) {
    let q = sb().from('articles').select('id', { count: 'exact', head: true });
    if (status) q = q.eq('status', status);
    const { count } = await q;
    return count || 0;
  },
};

// ============ JOURNAL ============
const journal = {
  async list() {
    const { data, error } = await sb().from('journal_entries').select('*').order('entry_date', { ascending: false });
    if (error) throw error;
    return toObjs(data);
  },
  async create(input) {
    const row = toRow({
      id: uuid(),
      mood: 'focused',
      photos: [],
      memories: [],
      entryDate: new Date(),
      ...input,
    });
    // journal entry mapping: 'date' -> entry_date already handled by toRow
    if (input.date) row.entry_date = new Date(input.date).toISOString();
    const { data, error } = await sb().from('journal_entries').insert(row).select().single();
    if (error) throw error;
    return toObj(data);
  },
  async update(id, patch) {
    const { error } = await sb().from('journal_entries').update(toRow(patch)).eq('id', id);
    if (error) throw error;
    return true;
  },
  async delete(id) {
    const { error } = await sb().from('journal_entries').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

// ============ MEDIA ============
const media = {
  async list(limit = 80) {
    const { data, error } = await sb().from('media').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return toObjs(data);
  },
  async create(input) {
    const row = toRow({ id: uuid(), type: 'image', ...input });
    const { data, error } = await sb().from('media').insert(row).select().single();
    if (error) throw error;
    return toObj(data);
  },
};

// ============ AI QUEUE ============
const aiQueue = {
  async list(limit = 50) {
    const { data, error } = await sb().from('ai_queue').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return toObjs(data);
  },
  async create(input) {
    const row = toRow({ id: uuid(), status: 'pending', ...input });
    const { data, error } = await sb().from('ai_queue').insert(row).select().single();
    if (error) throw error;
    return toObj(data);
  },
  async update(id, patch) {
    const { error } = await sb().from('ai_queue').update(toRow(patch)).eq('id', id);
    if (error) throw error;
    return true;
  },
};

// ============ SOCIAL QUEUE ============
const socialQueue = {
  async list(limit = 100) {
    const { data, error } = await sb().from('social_queue').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return toObjs(data);
  },
  async create(input) {
    const row = toRow({ id: uuid(), status: 'pending', ...input });
    const { data, error } = await sb().from('social_queue').insert(row).select().single();
    if (error) throw error;
    return toObj(data);
  },
  async update(id, patch) {
    const { error } = await sb().from('social_queue').update(toRow(patch)).eq('id', id);
    if (error) throw error;
    return true;
  },
};

// ============ RSS ============
const rssSources = {
  async list() {
    const { data, error } = await sb().from('rss_sources').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return toObjs(data);
  },
  async create(input) {
    const row = toRow({ id: uuid(), active: true, ...input });
    const { data, error } = await sb().from('rss_sources').insert(row).select().single();
    if (error) throw error;
    return toObj(data);
  },
  async delete(id) {
    const { error } = await sb().from('rss_sources').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

// ============ SUBSCRIBERS ============
const subscribers = {
  async list() {
    const { data, error } = await sb().from('subscribers').select('*').order('subscribed_at', { ascending: false });
    if (error) throw error;
    return toObjs(data);
  },
  async subscribe(email, meta = {}) {
    const row = toRow({ id: uuid(), email, status: 'active', ...meta });
    const { error } = await sb().from('subscribers').upsert(row, { onConflict: 'email', ignoreDuplicates: true });
    if (error && !error.message.includes('duplicate')) throw error;
    return true;
  },
  async count() {
    const { count } = await sb().from('subscribers').select('id', { count: 'exact', head: true });
    return count || 0;
  },
};

// ============ LOGS ============
const logs = {
  async list(limit = 200) {
    const { data, error } = await sb().from('automation_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return toObjs(data);
  },
  async create(input) {
    const row = toRow({ id: uuid(), ...input });
    const { data, error } = await sb().from('automation_logs').insert(row).select().single();
    if (error) throw error;
    return toObj(data);
  },
};

// ============ SETTINGS ============
const settings = {
  async get() {
    const { data, error } = await sb().from('settings').select('*').eq('id', 'global').maybeSingle();
    if (error) throw error;
    if (!data) return { id: 'global' };
    return { id: 'global', ...(data.data || {}) };
  },
  async patch(input) {
    delete input._id;
    delete input.id;
    const current = await settings.get();
    const merged = { ...current, ...input };
    delete merged.id;
    const { error } = await sb().from('settings').upsert({ id: 'global', data: merged, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (error) throw error;
    return await settings.get();
  },
};

const sessions = {
  async create(token, meta = {}) {
    const row = toRow({ token, ...meta });
    const { error } = await sb().from('sessions').insert(row);
    if (error) throw error;
    return true;
  },
  async validate(token) {
    const { data, error } = await sb().from('sessions').select('*').eq('token', token).maybeSingle();
    if (error || !data) return false;
    const age = Date.now() - new Date(data.created_at).getTime();
    if (age > 86400000) { await sb().from('sessions').delete().eq('token', token); return false; }
    return true;
  },
  async delete(token) { await sb().from('sessions').delete().eq('token', token); return true; },
  async deleteAll() { await sb().from('sessions').delete().neq('token', ''); return true; },
  async list() {
    const { data, error } = await sb().from('sessions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return toObjs(data);
  },
};

const stats = {
  async overview() {
    const [a, p, dr, j, s, sq] = await Promise.all([
      articles.countByStatus(null),
      articles.countByStatus('published'),
      articles.countByStatus('draft'),
      sb().from('journal_entries').select('id', { count: 'exact', head: true }).then((r) => r.count || 0),
      subscribers.count(),
      sb().from('social_queue').select('id', { count: 'exact', head: true }).eq('status', 'pending').then((r) => r.count || 0),
    ]);
    return { articles: a, published: p, drafts: dr, journal: j, subscribers: s, socialQueue: sq };
  },
};

export const db = {
  articles,
  journal,
  media,
  aiQueue,
  socialQueue,
  rssSources,
  subscribers,
  logs,
  settings,
  sessions,
  stats,
};

export async function initDb() {
  // schema is applied via schema.sql — no-op here
  return true;
}

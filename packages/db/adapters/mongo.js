// MongoDB adapter — kept for local/dev preview use.
// Same shape as the Supabase adapter (DB_DRIVER switch).

import { MongoClient } from 'mongodb';
import { v4 as uuid } from 'uuid';

const uri = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName =
  process.env.DB_NAME && process.env.DB_NAME !== 'your_database_name'
    ? process.env.DB_NAME
    : 'manii_journal';

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
  global._mongoClientPromise = client.connect().catch((err) => {
    if (process.env.DB_DRIVER === 'demo') {
      return null; // silent fallback — we're in demo mode
    }
    console.warn('[mongo] MongoDB unavailable:', err.message);
    return null;
  });
}
const clientPromise = global._mongoClientPromise;

async function _db() {
  const c = await clientPromise;
  return c.db(dbName);
}

const strip = (o) => { if (!o) return o; const { _id, ...rest } = o; return rest; };
const stripAll = (arr) => (arr || []).map(strip);

const articles = {
  async list({ section, status = 'published', limit = 30 } = {}) {
    const d = await _db();
    const q = {};
    if (section) q.section = section;
    if (status && status !== 'all') q.status = status;
    const docs = await d.collection('articles').find(q).sort({ publishedAt: -1, createdAt: -1 }).limit(limit).toArray();
    return stripAll(docs);
  },
  async getById(id) { const d = await _db(); return strip(await d.collection('articles').findOne({ id })); },
  async getBySlug(slug) { const d = await _db(); return strip(await d.collection('articles').findOne({ slug })); },
  async create(data) {
    const d = await _db();
    const doc = { id: uuid(), status: 'draft', hashtags: [], seo: {}, author: 'Manikanta', createdAt: new Date(), updatedAt: new Date(), ...data };
    if (doc.status === 'published' && !doc.publishedAt) doc.publishedAt = new Date();
    await d.collection('articles').insertOne(doc);
    return strip(doc);
  },
  async update(id, patch) {
    const d = await _db();
    const p = { ...patch, updatedAt: new Date() };
    if (patch.status === 'published' && !patch.publishedAt) p.publishedAt = new Date();
    await d.collection('articles').updateOne({ id }, { $set: p });
    return strip(await d.collection('articles').findOne({ id }));
  },
  async delete(id) { const d = await _db(); await d.collection('articles').deleteOne({ id }); return true; },
  async search(q) {
    if (!q) return [];
    const d = await _db();
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return stripAll(await d.collection('articles').find({
      status: 'published',
      $or: [{ title: rx }, { excerpt: rx }, { content: rx }, { hashtags: rx }],
    }).limit(30).toArray());
  },
  async countByStatus(status) {
    const d = await _db();
    if (!status) return d.collection('articles').countDocuments({});
    return d.collection('articles').countDocuments({ status });
  },
};

const journal = {
  async list() { const d = await _db(); return stripAll(await d.collection('journal_entries').find({}).sort({ date: -1, createdAt: -1 }).toArray()); },
  async create(data) {
    const d = await _db();
    const doc = { id: uuid(), title: '', content: '', mood: 'focused', photos: [], voiceNoteUrl: null, reflections: '', lessons: '', memories: [], date: new Date(), createdAt: new Date(), ...data };
    await d.collection('journal_entries').insertOne(doc);
    return strip(doc);
  },
  async update(id, patch) { const d = await _db(); await d.collection('journal_entries').updateOne({ id }, { $set: patch }); return true; },
  async delete(id) { const d = await _db(); await d.collection('journal_entries').deleteOne({ id }); return true; },
};

const media = {
  async list(limit = 80) { const d = await _db(); return stripAll(await d.collection('media').find({}).sort({ createdAt: -1 }).limit(limit).toArray()); },
  async create(data) { const d = await _db(); const doc = { id: uuid(), type: 'image', createdAt: new Date(), ...data }; await d.collection('media').insertOne(doc); return strip(doc); },
};

const aiQueue = {
  async list(limit = 50) { const d = await _db(); return stripAll(await d.collection('ai_queue').find({}).sort({ createdAt: -1 }).limit(limit).toArray()); },
  async create(data) { const d = await _db(); const doc = { id: uuid(), status: 'pending', createdAt: new Date(), ...data }; await d.collection('ai_queue').insertOne(doc); return strip(doc); },
  async update(id, patch) { const d = await _db(); await d.collection('ai_queue').updateOne({ id }, { $set: patch }); return true; },
};

const socialQueue = {
  async list({ limit = 100, status = null } = {}) {
    const d = await _db();
    const q = status ? { status } : {};
    return stripAll(await d.collection('social_queue').find(q).sort({ createdAt: -1 }).limit(limit).toArray());
  },
  async getById(id) { const d = await _db(); return strip(await d.collection('social_queue').findOne({ id })); },
  async create(data) { const d = await _db(); const doc = { id: uuid(), status: 'pending_approval', createdAt: new Date(), ...data }; await d.collection('social_queue').insertOne(doc); return strip(doc); },
  async update(id, patch) { const d = await _db(); await d.collection('social_queue').updateOne({ id }, { $set: patch }); return strip(await d.collection('social_queue').findOne({ id })); },
  async delete(id) { const d = await _db(); await d.collection('social_queue').deleteOne({ id }); return true; },
};

const rssSources = {
  async list() { const d = await _db(); return stripAll(await d.collection('rss_sources').find({}).sort({ createdAt: -1 }).toArray()); },
  async create(data) { const d = await _db(); const doc = { id: uuid(), active: true, createdAt: new Date(), ...data }; await d.collection('rss_sources').insertOne(doc); return strip(doc); },
  async delete(id) { const d = await _db(); await d.collection('rss_sources').deleteOne({ id }); return true; },
};

const subscribers = {
  async list() { const d = await _db(); return stripAll(await d.collection('subscribers').find({}).sort({ subscribedAt: -1 }).toArray()); },
  async subscribe(email, meta = {}) {
    const d = await _db();
    await d.collection('subscribers').updateOne(
      { email },
      { $setOnInsert: { id: uuid(), email, status: 'active', subscribedAt: new Date(), ...meta } },
      { upsert: true }
    );
    return true;
  },
  async count() { const d = await _db(); return d.collection('subscribers').countDocuments({}); },
};

const logs = {
  async list(limit = 200) { const d = await _db(); return stripAll(await d.collection('automation_logs').find({}).sort({ createdAt: -1 }).limit(limit).toArray()); },
  async create(data) { const d = await _db(); const doc = { id: uuid(), createdAt: new Date(), ...data }; await d.collection('automation_logs').insertOne(doc); return strip(doc); },
};

const settings = {
  async get() { const d = await _db(); const s = await d.collection('settings').findOne({ id: 'global' }); return s ? strip(s) : { id: 'global' }; },
  async patch(data) {
    const d = await _db();
    delete data._id;
    await d.collection('settings').updateOne({ id: 'global' }, { $set: { ...data, updatedAt: new Date() } }, { upsert: true });
    return await settings.get();
  },
};

// ============ SESSIONS ============
const sessions = {
  async create(token, meta = {}) {
    const d = await _db();
    await d.collection('sessions').insertOne({ token, created: new Date(), ...meta });
    return true;
  },
  async validate(token) {
    const d = await _db();
    const s = await d.collection('sessions').findOne({ token });
    if (!s) return false;
    const age = Date.now() - new Date(s.created).getTime();
    if (age > 86400000) { await d.collection('sessions').deleteOne({ token }); return false; }
    return true;
  },
  async delete(token) { const d = await _db(); await d.collection('sessions').deleteOne({ token }); return true; },
  async deleteAll() { const d = await _db(); await d.collection('sessions').deleteMany({}); return true; },
  async list() { const d = await _db(); return stripAll(await d.collection('sessions').find({}).sort({ created: -1 }).toArray()); },
};

// ============ CONTENT INBOX ============
const inbox = {
  async list(limit = 200) { const d = await _db(); return stripAll(await d.collection('content_inbox').find({}).sort({ createdAt: -1 }).limit(limit).toArray()); },
  async getById(id) { const d = await _db(); return strip(await d.collection('content_inbox').findOne({ id })); },
  async create(data) {
    const d = await _db();
    const doc = {
      id: uuid(), type: data.type || 'idea', content: data.content || '', section: data.section || 'ai',
      notes: data.notes || '', status: 'new', articleId: null, source: data.source || 'admin',
      createdAt: new Date(),
    };
    await d.collection('content_inbox').insertOne(doc);
    return strip(doc);
  },
  async update(id, patch) { const d = await _db(); await d.collection('content_inbox').updateOne({ id }, { $set: patch }); return strip(await d.collection('content_inbox').findOne({ id })); },
  async delete(id) { const d = await _db(); await d.collection('content_inbox').deleteOne({ id }); return true; },
};

const stats = {
  async overview() {
    const d = await _db();
    const [a, p, dr, j, s, sq, inb] = await Promise.all([
      d.collection('articles').countDocuments({}),
      d.collection('articles').countDocuments({ status: 'published' }),
      d.collection('articles').countDocuments({ status: 'draft' }),
      d.collection('journal_entries').countDocuments({}),
      d.collection('subscribers').countDocuments({}),
      d.collection('social_queue').countDocuments({ status: 'pending_approval' }),
      d.collection('content_inbox').countDocuments({ status: 'new' }),
    ]);
    return { articles: a, published: p, drafts: dr, journal: j, subscribers: s, socialQueue: sq, inbox: inb };
  },
};

export const db = { articles, journal, media, aiQueue, socialQueue, rssSources, subscribers, logs, settings, sessions, inbox, stats };

export async function initDb() {
  const d = await _db();
  await Promise.all([
    d.collection('articles').createIndex({ id: 1 }, { unique: true }),
    d.collection('articles').createIndex({ slug: 1 }, { unique: true }),
    d.collection('subscribers').createIndex({ email: 1 }, { unique: true }),
  ]);
  return true;
}

import { v4 as uuid } from 'uuid';

const NOW = new Date().toISOString();

const SAMPLE_ARTICLES = [];

const articles = {
  async list() { return []; },
  async getById() { return null; },
  async getBySlug() { return null; },
  async create(data) {
    return { id: uuid(), status: 'draft', hashtags: [], seo: {}, author: 'Manikanta', createdAt: NOW, updatedAt: NOW, ...data };
  },
  async update(id, patch) {
    return { id, status: 'published', ...patch, updatedAt: NOW };
  },
  async delete() { return true; },
  async search() { return []; },
  async countByStatus() { return 0; },
};

const journal = {
  async list() { return []; },
  async create(input) { return { id: uuid(), mood: 'focused', photos: [], memories: [], entryDate: NOW, ...input }; },
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

const logs = {
  async list() { return []; },
  async create(input) { return { id: uuid(), ...input }; },
};

const settings = {
  async get() { return { id: 'global', blogName: 'INSIGHTS', blogDescription: 'Thoughts on tech, AI, and building things that matter.' }; },
  async patch(input) { return { id: 'global', ...input }; },
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
    return { articles: 0, published: 0, drafts: 0, journal: 0, subscribers: _subs.size, socialQueue: 0 };
  },
};

export const db = {
  articles, journal, media, aiQueue, socialQueue, rssSources, subscribers, logs, settings, sessions, stats,
};

export async function initDb() {
  return true;
}
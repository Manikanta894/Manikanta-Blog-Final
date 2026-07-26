#!/usr/bin/env node
// Mongo → Supabase/Postgres migration script.
// Usage:
//   MONGO_URL=... DB_NAME=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node packages/db/migrate.js
//
// Copies: articles, journal_entries, media, ai_queue, social_queue, rss_sources,
// subscribers, automation_logs, settings.

import { MongoClient } from 'mongodb';
import { createClient } from '@supabase/supabase-js';

const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME || 'manii_journal';
const supaUrl = process.env.SUPABASE_URL;
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!mongoUrl || !supaUrl || !supaKey) {
  console.error('Missing MONGO_URL / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const toRow = (o) => {
  const out = {};
  for (const [k, v] of Object.entries(o || {})) {
    if (k === '_id') continue;
    const key = k.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
    out[key] = v instanceof Date ? v.toISOString() : v;
  }
  return out;
};

async function main() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const mdb = client.db(dbName);
  const supa = createClient(supaUrl, supaKey, { auth: { persistSession: false } });

  const map = [
    { from: 'articles', to: 'articles' },
    { from: 'journal_entries', to: 'journal_entries', mapper: (r) => { const x = toRow(r); if (x.date) { x.entry_date = x.date; delete x.date; } return x; } },
    { from: 'media', to: 'media' },
    { from: 'ai_queue', to: 'ai_queue' },
    { from: 'social_queue', to: 'social_queue' },
    { from: 'rss_sources', to: 'rss_sources' },
    { from: 'subscribers', to: 'subscribers' },
    { from: 'automation_logs', to: 'automation_logs' },
    // settings has a special shape
  ];

  for (const m of map) {
    const docs = await mdb.collection(m.from).find({}).toArray();
    if (docs.length === 0) { console.log(`– ${m.from}: empty, skipped`); continue; }
    const rows = docs.map(m.mapper || toRow);
    const { error } = await supa.from(m.to).upsert(rows, { onConflict: 'id' });
    if (error) console.error(`✗ ${m.from}→${m.to}:`, error.message);
    else console.log(`✓ ${m.from}→${m.to}: ${rows.length} rows`);
  }

  // settings
  const s = await mdb.collection('settings').findOne({ id: 'global' });
  if (s) {
    const { _id, id, updatedAt, ...data } = s;
    const { error } = await supa.from('settings').upsert({ id: 'global', data, updated_at: (updatedAt || new Date()).toISOString() }, { onConflict: 'id' });
    if (error) console.error('✗ settings:', error.message);
    else console.log('✓ settings migrated');
  }

  await client.close();
  console.log('\nDone.');
}

main().catch((e) => { console.error(e); process.exit(1); });

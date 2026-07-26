// Legacy shim so old imports keep compiling. New code should import from '@/packages/db'.
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URL;
const dbName = process.env.DB_NAME && process.env.DB_NAME !== 'your_database_name' ? process.env.DB_NAME : 'manii_journal';
if (!global._mongoClientPromise) {
  const client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
const clientPromise = global._mongoClientPromise;

export async function getDb() {
  const c = await clientPromise;
  return c.db(dbName);
}

export const COLLECTIONS = {
  articles: 'articles',
  journal: 'journal_entries',
  media: 'media',
  aiQueue: 'ai_queue',
  socialQueue: 'social_queue',
  rssSources: 'rss_sources',
  newsletter: 'subscribers',
  logs: 'automation_logs',
  settings: 'settings',
};

export async function getSettings() {
  const d = await getDb();
  return (await d.collection(COLLECTIONS.settings).findOne({ id: 'global' })) || { id: 'global' };
}
export async function setSettings(patch) {
  const d = await getDb();
  await d.collection(COLLECTIONS.settings).updateOne(
    { id: 'global' },
    { $set: { ...patch, updatedAt: new Date() } },
    { upsert: true }
  );
  return getSettings();
}

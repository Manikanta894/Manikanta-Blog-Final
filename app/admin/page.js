'use client';
import { useEffect, useRef, useState } from 'react';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import Kicker from '@/components/site/Kicker';
import { motion } from 'framer-motion';
import { SECTIONS, renderMd } from '@/packages/utils';
import { Sparkles, Loader2, FileText, Image as ImageIcon, Calendar, Rss, Share2, Settings as SettingsIcon, BookOpen, Activity, LayoutDashboard, Send, Check, Clock, Trash2, Inbox, X, PlayCircle, CheckCircle2, XCircle, CalendarClock, Edit3, Tag, Hash } from 'lucide-react';
import { toast } from 'sonner';

// This page's content depends entirely on the admin session cookie via
// middleware — it must never be served as a cached static shell.
export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'editor',    label: 'Editor', icon: Edit3 },
  { key: 'ai',        label: 'AI Studio', icon: Sparkles },
  { key: 'inbox',     label: 'Content Inbox', icon: Inbox },
  { key: 'drafts',    label: 'Drafts', icon: FileText },
  { key: 'calendar',  label: 'Calendar', icon: Calendar },
  { key: 'media',     label: 'Media', icon: ImageIcon },
  { key: 'journal',   label: 'Journal', icon: BookOpen },
  { key: 'social',    label: 'Social Queue', icon: Share2 },
  { key: 'rss',       label: 'RSS Sources', icon: Rss },
  { key: 'logs',      label: 'Automation Logs', icon: Activity },
  { key: 'settings',  label: 'Settings', icon: SettingsIcon },
  { key: 'categories',label: 'Categories', icon: Tag },
  { key: 'tags',      label: 'Tags', icon: Hash },
];

export default function AdminPage() {
  const [tab, setTab] = useState('dashboard');
  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };
  return (
    <div className="min-h-screen bg-[--brand-bg]">
      <Nav />
      <div className="max-w-[1400px] mx-auto px-5 pt-8 pb-16">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[--brand-text-secondary]">Private · Studio</span>
            <h1 className="font-display italic text-4xl md:text-5xl tracking-[-0.02em] mt-2 text-[--brand-text]">The Studio</h1>
            <p className="text-[--brand-text-secondary] mt-2 max-w-xl">Your control room. Draft, generate, schedule, and publish across the Journal.</p>
          </div>
          <button onClick={logout} className="shrink-0 mt-2 text-xs font-mono uppercase tracking-[0.2em] text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors">
            Log out
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="lg:sticky lg:top-20 self-start bg-[--brand-card] border border-[--brand-border] rounded-2xl p-3 space-y-0.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setTab(t.key)} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${tab === t.key ? 'bg-[--brand-text] text-white shadow-sm' : 'text-[--brand-text-secondary] hover:bg-[--brand-accent-soft] hover:text-[--brand-text]'}`}>
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </aside>
          <section className="bg-[--brand-card] rounded-2xl border border-[--brand-border] p-6 md:p-8 min-h-[70vh] shadow-sm">
            {tab === 'dashboard' && <Dashboard />}
            {tab === 'editor' && <Editor />}
            {tab === 'ai' && <AIStudio />}
            {tab === 'inbox' && <ContentInbox />}
            {tab === 'drafts' && <Drafts />}
            {tab === 'calendar' && <CalendarView />}
            {tab === 'media' && <MediaLib />}
            {tab === 'journal' && <JournalMgmt />}
            {tab === 'social' && <SocialQueue />}
            {tab === 'rss' && <RssSources />}
            {tab === 'logs' && <Logs />}
            {tab === 'settings' && <Settings />}
            {tab === 'categories' && <CategoryAdmin />}
            {tab === 'tags' && <TagAdmin />}
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { fetch('/api/stats').then((r) => r.json()).then(setStats); }, []);
  const cards = [
    { k: 'Total Articles', v: stats?.articles ?? '—' },
    { k: 'Published',      v: stats?.published ?? '—' },
    { k: 'Drafts',         v: stats?.drafts ?? '—' },
    { k: 'Journal Entries',v: stats?.journal ?? '—' },
    { k: 'Subscribers',    v: stats?.subscribers ?? '—' },
    { k: 'Pending Social', v: stats?.socialQueue ?? '—' },
    { k: 'Inbox (new)',    v: stats?.inbox ?? '—' },
  ];
  return (
    <div>
      <h2 className="font-display text-3xl mb-6">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.k} className="border border-[--brand-border] rounded-lg p-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary]">{c.k}</div>
            <div className="font-display text-4xl mt-2">{c.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIStudio() {
  const [section, setSection] = useState('ai');
  const [angle, setAngle] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const generate = async ({ publish } = { publish: false }) => {
    setBusy(true); setResult(null);
    try {
      const r = await fetch('/api/ai/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section, angle, publish }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed');
      setResult(d.article);
      toast.success(`Generated via ${d.article.provider}`);
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  return (
    <div>
      <h2 className="font-display text-3xl mb-2">AI Studio</h2>
      <p className="text-[--brand-text-secondary] text-sm mb-6">Generate a full magazine article + SEO + hashtags + cover image + social copy in one click.</p>
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full border border-[--brand-border] rounded-lg p-2.5 bg-[--brand-card]">
          {SECTIONS.filter((s) => s.slug !== 'archive').map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
        <input value={angle} onChange={(e) => setAngle(e.target.value)} placeholder="Angle (optional)" className="md:col-span-2 w-full border border-[--brand-border] rounded-lg p-2.5" />
      </div>
      <div className="flex gap-3">
        <button disabled={busy} onClick={() => generate({ publish: false })} className="inline-flex items-center gap-2 border border-[--brand-text] px-5 py-2.5 text-xs font-mono uppercase tracking-[0.2em] hover:bg-[--brand-text] hover:text-white disabled:opacity-50">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Generate Draft
        </button>
        <button disabled={busy} onClick={() => generate({ publish: true })} className="inline-flex items-center gap-2 bg-[--brand-text] text-white px-5 py-2.5 text-xs font-mono uppercase tracking-[0.2em] hover:bg-[--brand-text] disabled:opacity-50">
          <Send size={14} /> Generate & Publish
        </button>
      </div>
      {result && (
        <div className="mt-8 border border-[--brand-border] rounded-lg p-6">
          <Kicker>{result.section} · {result.provider}</Kicker>
          <h3 className="font-display text-3xl mt-2">{result.title}</h3>
          {result.coverImage && <img src={result.coverImage} className="mt-4 rounded-lg w-full aspect-[16/9] object-cover" alt="" />}
          <p className="mt-4 text-[--brand-text]">{result.excerpt}</p>
          <a href={`/article/${result.slug}`} target="_blank" className="mt-4 inline-block text-xs font-mono uppercase tracking-[0.2em] underline">Open article →</a>
        </div>
      )}
    </div>
  );
}

function ContentInbox() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ type: 'idea', content: '', section: 'ai', notes: '' });
  const [busy, setBusy] = useState(null);
  const [webhookSecret, setWebhookSecret] = useState('');

  const load = () => fetch('/api/inbox').then((r) => r.json()).then((d) => setItems(d.items || []));
  useEffect(() => {
    load();
    fetch('/api/settings').then((r) => r.json()).then((d) => setWebhookSecret(d.settings?.inboxWebhookSecret || ''));
  }, []);

  const add = async () => {
    if (!form.content) return toast.error('Paste a URL, idea, or news item');
    await fetch('/api/inbox', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ type: 'idea', content: '', section: form.section, notes: '' });
    load();
  };
  const del = async (id) => { await fetch(`/api/inbox/${id}`, { method: 'DELETE' }); load(); };
  const proc = async (id) => {
    setBusy(id);
    try {
      const r = await fetch(`/api/inbox/${id}/process`, { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success(`Draft created: ${d.article.title}`);
    } catch (e) { toast.error(e.message); } finally { setBusy(null); load(); }
  };
  const saveSecret = async () => {
    const s = webhookSecret || (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2));
    setWebhookSecret(s);
    await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inboxWebhookSecret: s }) });
    toast.success('Webhook secret saved');
  };

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/inbox/webhook?secret=${webhookSecret || 'SET_A_SECRET_FIRST'}`
    : '';

  const STATUS_STYLE = {
    new:        'bg-[--brand-accent-soft] text-[--brand-text]',
    processing: 'bg-blue-100 text-blue-700 animate-pulse',
    done:       'bg-green-100 text-green-700',
    failed:     'bg-red-100 text-red-700',
  };

  return (
    <div>
      <h2 className="font-display text-3xl mb-2">Content Inbox</h2>
      <p className="text-[--brand-text-secondary] text-sm mb-6">Paste URLs, ideas, images, or news. One click turns each into a full article + SEO + hashtags + cover image + social copy — saved as a Draft (never auto-published).</p>

      {/* Add form */}
      <div className="border border-[--brand-border] rounded-lg p-5 mb-6 bg-[--brand-accent-soft]">
        <div className="grid md:grid-cols-4 gap-3 mb-3">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border border-[--brand-border] rounded-lg p-2 bg-[--brand-card] text-sm">
            <option value="idea">Idea</option>
            <option value="url">URL / Article link</option>
            <option value="news">News item</option>
            <option value="image">Image link</option>
          </select>
          <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="border border-[--brand-border] rounded-lg p-2 bg-[--brand-card] text-sm">
            {SECTIONS.filter((s) => s.slug !== 'archive').map((s) => <option key={s.slug} value={s.slug}>Target: {s.name}</option>)}
          </select>
          <input placeholder="Optional notes / angle" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="md:col-span-2 border border-[--brand-border] rounded-lg p-2 bg-[--brand-card] text-sm" />
        </div>
        <textarea rows={2} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Paste URL, image link, or write the raw idea…" className="w-full border border-[--brand-border] rounded-lg p-2.5 bg-[--brand-card] text-sm" />
        <div className="mt-3 flex justify-end">
          <button onClick={add} className="bg-[--brand-text] text-white px-5 py-2.5 text-xs font-mono uppercase tracking-[0.2em] rounded-lg hover:bg-orange-600">Add to Inbox</button>
        </div>
      </div>

      {/* Google Sheets / n8n webhook helper */}
      <details className="border border-dashed border-[--brand-border] rounded-lg p-4 mb-6 bg-[--brand-card]">
        <summary className="cursor-pointer text-sm font-medium">📊 Sync from Google Sheets or n8n <span className="text-xs text-[--brand-text-secondary] ml-2">(click to expand)</span></summary>
        <div className="mt-4 space-y-3 text-sm">
          <p className="text-[--brand-text-secondary]">Post rows to this URL from Google Apps Script, Zapier, or n8n. Every row becomes an inbox item. Nothing publishes automatically — you still approve each one.</p>
          <div className="flex gap-2">
            <input readOnly value={webhookUrl} className="flex-1 font-mono text-xs bg-[--brand-accent-soft] border border-[--brand-border] rounded-lg p-2" />
            <button onClick={saveSecret} className="border border-[--brand-text] px-3 py-2 text-xs font-mono uppercase tracking-[0.2em] hover:bg-[--brand-text] hover:text-white">
              {webhookSecret ? 'Rotate Secret' : 'Generate Secret'}
            </button>
          </div>
          <div className="text-xs text-[--brand-text-secondary]">
            <strong>Payload:</strong> <code className="bg-[--brand-accent-soft] px-1">{'{ "rows": [{ "type": "url", "content": "https://…", "section": "ai", "notes": "…" }] }'}</code>
          </div>
          <div className="text-xs text-[--brand-text-secondary]">
            <strong>Google Apps Script snippet</strong> (paste into your Sheet → Extensions → Apps Script):
            <pre className="bg-[--brand-text] text-white rounded-lg p-3 mt-1 overflow-x-auto text-[10px] leading-relaxed">{`function pushToJournal() {
  const rows = SpreadsheetApp.getActiveSheet().getDataRange().getValues().slice(1);
  const payload = { rows: rows.map(r => ({
    type: r[0], content: r[1], section: r[2] || 'ai', notes: r[3] || ''
  })) };
  UrlFetchApp.fetch("${webhookUrl}", {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify(payload)
  });
}`}</pre>
          </div>
        </div>
      </details>

      {/* Inbox list */}
      <div className="space-y-2">
        {items.length === 0 && <div className="text-sm text-[--brand-text-secondary] py-6 text-center">Inbox is empty. Paste your first idea above.</div>}
        {items.map((i) => (
          <div key={i.id} className="border border-[--brand-border] rounded-lg p-4 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[9px] font-mono uppercase tracking-[0.22em] px-2 py-0.5 rounded-full bg-[--brand-accent-soft]">{i.type}</span>
                <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary]">→ {i.section}</span>
                <span className={`text-[9px] font-mono uppercase tracking-[0.22em] px-2 py-0.5 rounded-full ${STATUS_STYLE[i.status] || 'bg-[--brand-accent-soft]'}`}>{i.status}</span>
                <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary]">{new Date(i.createdAt).toLocaleString()}</span>
                {i.source && i.source !== 'admin' && <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-orange-600">via {i.source}</span>}
              </div>
              <div className="text-sm text-[--brand-text] break-words">{i.content}</div>
              {i.notes && <div className="text-xs text-[--brand-text-secondary] italic mt-1">↳ {i.notes}</div>}
              {i.articleId && <a href={`/article/${i.articleId}`} className="text-xs text-orange-600 underline mt-1 inline-block">draft created →</a>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {i.status === 'new' && (
                <button disabled={busy === i.id} onClick={() => proc(i.id)} className="inline-flex items-center gap-1.5 bg-[--brand-text] text-white px-3 py-2 text-[10px] font-mono uppercase tracking-[0.2em] rounded-lg hover:bg-orange-600 disabled:opacity-50">
                  {busy === i.id ? <Loader2 size={12} className="animate-spin" /> : <PlayCircle size={12} />} Process
                </button>
              )}
              <button onClick={() => del(i.id)} className="text-[--brand-text-secondary] hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const EMPTY_DRAFT = {
  id: null,
  title: '',
  section: 'essays',
  excerpt: '',
  content: '',
  coverImage: '',
  hashtagsText: '',
  seoTitle: '',
  seoDescription: '',
  status: 'draft',
};

function Editor() {
  const [all, setAll] = useState([]);
  const [form, setForm] = useState(EMPTY_DRAFT);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [genCover, setGenCover] = useState(false);
  const [hashnodeBusy, setHashnodeBusy] = useState(false);
  const [hashnodeResult, setHashnodeResult] = useState(null);
  const contentRef = useRef(null);
  const coverFileRef = useRef(null);
  const inlineFileRef = useRef(null);

  const loadAll = () => fetch('/api/articles?status=all&limit=200').then((r) => r.json()).then((d) => setAll(d.articles || []));
  useEffect(() => { loadAll(); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const loadIntoForm = (a) => {
    setForm({
      id: a.id,
      title: a.title || '',
      section: a.section || 'essays',
      excerpt: a.excerpt || '',
      content: a.content || '',
      coverImage: a.coverImage || '',
      hashtagsText: (a.hashtags || []).join(', '),
      seoTitle: a.seo?.title || '',
      seoDescription: a.seo?.description || '',
      status: a.status || 'draft',
    });
    setPreview(false);
  };

  const newDraft = () => setForm(EMPTY_DRAFT);

  const insertAtCursor = (snippet) => {
    const el = contentRef.current;
    if (!el) { setForm((f) => ({ ...f, content: f.content + '\n' + snippet + '\n' })); return; }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    setForm((f) => ({ ...f, content: f.content.slice(0, start) + snippet + f.content.slice(end) }));
    requestAnimationFrame(() => { el.focus(); const pos = start + snippet.length; el.setSelectionRange(pos, pos); });
  };

  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Upload failed');
    return d.url;
  };

  const onCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadFile(file);
      setForm((f) => ({ ...f, coverImage: url }));
      toast.success('Cover image uploaded');
    } catch (err) { toast.error(err.message); } finally { setUploadingCover(false); if (coverFileRef.current) coverFileRef.current.value = ''; }
  };

  const onInlineUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingInline(true);
    try {
      const url = await uploadFile(file);
      insertAtCursor(`![${file.name.replace(/\.[a-z0-9]+$/i, '')}](${url})`);
      toast.success('Image inserted into post');
    } catch (err) { toast.error(err.message); } finally { setUploadingInline(false); if (inlineFileRef.current) inlineFileRef.current.value = ''; }
  };

  const publishToHashnode = async () => {
    if (!form.title || !form.content) { toast.error('Title and content are required'); return; }
    setHashnodeBusy(true); setHashnodeResult(null);
    try {
      const r = await fetch('/api/hashnode/publish', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, content: form.content, excerpt: form.excerpt, coverImage: form.coverImage, hashtags: form.hashtagsText.split(',').map((h) => h.trim()).filter(Boolean) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Hashnode publish failed');
      setHashnodeResult(d);
      toast.success('Published to Hashnode!');
    } catch (e) { toast.error(e.message); } finally { setHashnodeBusy(false); }
  };

  const generateCover = async () => {
    if (!form.title) { toast.error('Add a title first — it\u2019s used as the image prompt'); return; }
    setGenCover(true);
    try {
      const r = await fetch('/api/media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `${form.title}, cinematic editorial photograph, magazine cover, no text` }) });
      const d = await r.json();
      setForm((f) => ({ ...f, coverImage: d.media?.url || '' }));
      toast.success('Cover generated');
    } catch { toast.error('Generation failed'); } finally { setGenCover(false); }
  };

  const save = async (statusOverride) => {
    if (!form.title || !form.content) { toast.error('Title and content are required'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        section: form.section,
        excerpt: form.excerpt,
        content: form.content,
        coverImage: form.coverImage,
        hashtags: form.hashtagsText.split(',').map((h) => h.trim()).filter(Boolean),
        seo: { title: form.seoTitle || form.title, description: form.seoDescription || form.excerpt },
        status: statusOverride || form.status,
        ...((statusOverride === 'published' || form.status === 'published') ? { publishedAt: new Date() } : {}),
      };
      if (form.id) {
        const r = await fetch(`/api/articles/${form.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || `Save failed (${r.status})`);
      } else {
        const r = await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || `Save failed (${r.status})`);
        setForm((f) => ({ ...f, id: d.article?.id }));
      }
      toast.success(statusOverride === 'published' ? 'Published' : 'Saved');
      loadAll();
    } catch (e) { toast.error(e.message || 'Save failed'); } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl">Editor</h2>
        <div className="flex gap-2">
          <button onClick={newDraft} className="text-xs font-mono uppercase tracking-[0.2em] border border-[--brand-border] px-3 py-1.5 hover:bg-[--brand-accent-soft]">+ New</button>
          <select onChange={(e) => { const a = all.find((x) => x.id === e.target.value); if (a) loadIntoForm(a); }} value="" className="text-xs border border-[--brand-border] rounded-lg px-2 py-1.5">
            <option value="" disabled>Open existing…</option>
            {all.map((a) => <option key={a.id} value={a.id}>{a.status} — {a.title}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <input value={form.title} onChange={set('title')} placeholder="Title" className="w-full border border-[--brand-border] rounded-lg p-3 font-display text-2xl" />
          <textarea value={form.excerpt} onChange={set('excerpt')} placeholder="Excerpt (shown on cards + under the title)" rows={2} className="w-full border border-[--brand-border] rounded-lg p-3 text-sm" />

          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary]">Content (Markdown)</div>
            <div className="flex gap-3">
              <label className="text-xs font-mono uppercase tracking-[0.2em] text-[--brand-text-secondary] hover:text-[--brand-text] cursor-pointer">
                {uploadingInline ? 'Uploading…' : 'Insert Image'}
                <input ref={inlineFileRef} type="file" accept="image/*" onChange={onInlineUpload} className="hidden" />
              </label>
              <button onClick={() => setPreview((p) => !p)} className="text-xs font-mono uppercase tracking-[0.2em] text-[--brand-text-secondary] hover:text-[--brand-text]">
                {preview ? 'Edit' : 'Preview'}
              </button>
            </div>
          </div>

          {preview ? (
            <div className="prose-editorial border border-[--brand-border] rounded-lg p-5 min-h-[420px]" dangerouslySetInnerHTML={{ __html: renderMd(form.content) }} />
          ) : (
            <textarea ref={contentRef} value={form.content} onChange={set('content')} placeholder={'# Start writing…\n\nUse ## for headings, - for lists, > for quotes, ![alt](url) for images, [text](url) for links, ```code``` for code blocks.'} rows={22} className="w-full border border-[--brand-border] rounded-lg p-3 font-mono text-sm leading-relaxed" />
          )}
          <div className="text-[11px] text-[--brand-text-secondary]">{form.content.split(/\s+/).filter(Boolean).length} words · supports headings, bold/italic, links, images, lists, tables, code blocks, quotes</div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary] mb-1.5">Section</div>
            <select value={form.section} onChange={set('section')} className="w-full border border-[--brand-border] rounded-lg p-2.5 text-sm">
              {SECTIONS.filter((s) => s.slug !== 'archive').map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary] mb-1.5">Cover Image</div>
            {form.coverImage && <img src={form.coverImage} alt="" className="w-full aspect-[16/9] object-cover rounded-lg mb-2" />}
            <input value={form.coverImage} onChange={set('coverImage')} placeholder="Paste an image URL…" className="w-full border border-[--brand-border] rounded-lg p-2 text-xs mb-2" />
            <div className="flex gap-2">
              <label className="flex-1 text-center text-xs font-mono uppercase tracking-[0.2em] border border-[--brand-text] px-3 py-2 cursor-pointer hover:bg-[--brand-text] hover:text-white transition-colors">
                {uploadingCover ? '…' : 'Upload'}
                <input ref={coverFileRef} type="file" accept="image/*" onChange={onCoverUpload} className="hidden" />
              </label>
              <button onClick={generateCover} disabled={genCover} className="flex-1 text-xs font-mono uppercase tracking-[0.2em] border border-[--brand-border] px-3 py-2 hover:bg-[--brand-accent-soft] disabled:opacity-50">{genCover ? '…' : 'Generate (AI)'}</button>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary] mb-1.5">Hashtags (comma-separated)</div>
            <input value={form.hashtagsText} onChange={set('hashtagsText')} placeholder="#hr, #analytics, #career" className="w-full border border-[--brand-border] rounded-lg p-2 text-xs" />
          </div>

          <div className="border-t border-[--brand-border] pt-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary] mb-1.5">SEO Title</div>
            <input value={form.seoTitle} onChange={set('seoTitle')} placeholder="Defaults to the title above" className="w-full border border-[--brand-border] rounded-lg p-2 text-xs mb-3" />
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary] mb-1.5">Meta Description ({form.seoDescription.length}/160)</div>
            <textarea value={form.seoDescription} onChange={set('seoDescription')} rows={3} placeholder="Defaults to the excerpt above" className="w-full border border-[--brand-border] rounded-lg p-2 text-xs" />
          </div>

          <div className="border-t border-[--brand-border] pt-4 flex flex-col gap-2">
            <button onClick={() => save('draft')} disabled={saving} className="text-xs font-mono uppercase tracking-[0.2em] border border-[--brand-border] px-3 py-2.5 hover:bg-[--brand-accent-soft] disabled:opacity-50">{saving ? 'Saving…' : 'Save Draft'}</button>
            <button onClick={() => save('published')} disabled={saving} className="text-xs font-mono uppercase tracking-[0.2em] bg-[--brand-text] text-white px-3 py-2.5 hover:bg-[--brand-text] disabled:opacity-50">{saving ? '…' : form.id ? 'Save & Publish' : 'Publish'}</button>
            <button onClick={publishToHashnode} disabled={hashnodeBusy} className="text-xs font-mono uppercase tracking-[0.2em] border border-[--brand-border] text-[--brand-text-secondary] px-3 py-2.5 hover:bg-[--brand-accent-soft] disabled:opacity-50">{hashnodeBusy ? '…' : 'Publish to Hashnode'}</button>
            {hashnodeResult && <a href={hashnodeResult.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[--brand-text-secondary] underline text-center">View on Hashnode →</a>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Drafts() {
  const [items, setItems] = useState([]);
  const load = () => fetch('/api/articles?status=all&limit=200').then((r) => r.json()).then((d) => setItems(d.articles || []));
  useEffect(() => { load(); }, []);
  const patch = async (id, p) => { await fetch(`/api/articles/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) }); load(); };
  const del = async (id) => { if (confirm('Delete?')) { await fetch(`/api/articles/${id}`, { method: 'DELETE' }); load(); } };
  return (
    <div>
      <h2 className="font-display text-3xl mb-6">Draft Queue</h2>
      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="flex items-center gap-4 border border-[--brand-border] rounded-lg p-3">
            <img src={a.coverImage} className="w-20 h-14 object-cover rounded-lg" alt="" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary]">{a.section} · {a.status}</div>
              <div className="font-display text-lg truncate">{a.title}</div>
            </div>
            <div className="flex items-center gap-2">
              {a.status !== 'published' ? (
                <button onClick={() => patch(a.id, { status: 'published', publishedAt: new Date() })} className="text-xs font-mono uppercase tracking-[0.2em] border border-[--brand-text] px-3 py-1.5 hover:bg-[--brand-text] hover:text-white"><Check size={12} className="inline mr-1" />Publish</button>
              ) : (
                <button onClick={() => patch(a.id, { status: 'draft' })} className="text-xs font-mono uppercase tracking-[0.2em] border border-[--brand-border] px-3 py-1.5">Unpublish</button>
              )}
              <a href={`/article/${a.slug}`} target="_blank" className="text-xs font-mono uppercase tracking-[0.2em] text-[--brand-text-secondary] hover:text-[--brand-text]">View</a>
              <button onClick={() => del(a.id)} className="text-[--brand-text-secondary] hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarView() {
  const [items, setItems] = useState([]);
  useEffect(() => { fetch('/api/articles?status=all&limit=200').then((r) => r.json()).then((d) => setItems(d.articles || [])); }, []);
  const grouped = items.reduce((acc, a) => {
    const d = new Date(a.scheduledFor || a.publishedAt || a.createdAt).toDateString();
    (acc[d] = acc[d] || []).push(a); return acc;
  }, {});
  return (
    <div>
      <h2 className="font-display text-3xl mb-6">Content Calendar</h2>
      <div className="space-y-6">
        {Object.entries(grouped).map(([d, arr]) => (
          <div key={d}>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary]">{d}</div>
            <div className="mt-2 space-y-2">
              {arr.map((a) => (
                <div key={a.id} className="flex items-center gap-3 border border-[--brand-border] rounded-lg p-3">
                  <Clock size={14} className="text-[--brand-text-secondary]" />
                  <div className="flex-1 truncate">
                    <div className="text-xs text-[--brand-text-secondary]">{a.section} · {a.status}</div>
                    <div className="font-display truncate">{a.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaLib() {
  const [media, setMedia] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const load = () => fetch('/api/media').then((r) => r.json()).then((d) => setMedia(d.media || []));
  useEffect(() => { load(); }, []);
  const gen = async () => {
    if (!prompt) return; setBusy(true);
    await fetch('/api/media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
    setBusy(false); setPrompt(''); load();
  };
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Upload failed');
      toast.success('Uploaded to media library');
      load();
    } catch (err) { toast.error(err.message); } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };
  const removeMedia = async (m) => {
    if (!confirm('Delete this file from the media library?')) return;
    try {
      const r = await fetch(`/api/media/${m.id}`, { method: 'DELETE' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Delete failed');
      toast.success('Deleted');
      load();
    } catch (err) { toast.error(err.message); }
  };
  const copyUrl = async (url) => { await navigator.clipboard.writeText(url); toast.success('URL copied'); };
  return (
    <div>
      <h2 className="font-display text-3xl mb-6">Media Library</h2>
      <div className="flex gap-2 mb-3">
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Prompt an image (Pollinations AI)" className="flex-1 border border-[--brand-border] rounded-lg p-2.5" />
        <button onClick={gen} disabled={busy} className="bg-[--brand-text] text-white px-4 text-xs font-mono uppercase tracking-[0.2em] disabled:opacity-50">{busy ? '…' : 'Generate'}</button>
      </div>
      <div className="mb-6">
        <label className="inline-block text-xs font-mono uppercase tracking-[0.2em] border border-[--brand-border] px-4 py-2.5 cursor-pointer hover:bg-[--brand-accent-soft]">
          {uploading ? 'Uploading…' : 'Upload Your Own Photo'}
          <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={upload} className="hidden" />
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {media.map((m) => (
          <div key={m.id} className="border border-[--brand-border] rounded-lg overflow-hidden group relative">
            {m.contentType === 'application/pdf' || /\.pdf(\?|$)/i.test(m.url || '') ? (
              <div className="aspect-square w-full flex items-center justify-center bg-[--brand-accent-soft] text-[--brand-text-secondary] text-xs font-mono uppercase tracking-[0.2em]">PDF</div>
            ) : (
              <img src={m.url} alt="" className="aspect-square object-cover w-full" />
            )}
            <div className="p-2 text-[10px] text-[--brand-text-secondary] truncate">{m.prompt || m.originalName}</div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => copyUrl(m.url)} className="bg-white/90 text-[10px] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-lg">Copy URL</button>
              <button onClick={() => removeMedia(m)} className="bg-white/90 text-[10px] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-lg text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JournalMgmt() {
  const [entries, setEntries] = useState([]);
  useEffect(() => { fetch('/api/journal').then((r) => r.json()).then((d) => setEntries(d.entries || [])); }, []);
  return (
    <div>
      <h2 className="font-display text-3xl mb-6">Journal Management</h2>
      <div className="text-sm text-[--brand-text-secondary] mb-4">{entries.length} entries recorded.</div>
      <div className="space-y-2">
        {entries.map((e) => (
          <div key={e.id} className="flex items-center justify-between border border-[--brand-border] rounded-lg p-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[--brand-text-secondary]">{new Date(e.date || e.createdAt).toLocaleString()} · {e.mood}</div>
              <div className="font-display">{e.title || e.content?.slice(0, 60)}</div>
            </div>
            <a href="/journal" className="text-xs font-mono uppercase tracking-[0.2em] text-[--brand-text-secondary]">Open →</a>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_BADGE = {
  draft:             'bg-[--brand-accent-soft] text-[--brand-text]',
  pending_approval:  'bg-amber-100 text-amber-800',
  approved:          'bg-blue-100 text-blue-700',
  scheduled:         'bg-purple-100 text-purple-700',
  posted:            'bg-green-100 text-green-700',
  failed:            'bg-red-100 text-red-700',
  rejected:          'bg-[--brand-accent-soft] text-[--brand-text-secondary] line-through',
};

function SocialQueue() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = () => fetch('/api/social-queue?limit=200').then((r) => r.json()).then((d) => setItems(d.items || []));
  useEffect(() => { load(); }, []);

  const act = async (id, action, body = {}) => {
    setBusy(id + action);
    try {
      const r = await fetch(`/api/social-queue/${id}/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed');
      if (action === 'publish') {
        if (d.result?.ok) toast.success('Posted');
        else toast.error(d.result?.reason || 'publish failed');
      } else toast.success(action);
      load();
    } catch (e) { toast.error(e.message); } finally { setBusy(null); }
  };

  const saveEdit = async () => {
    if (!editing) return;
    await fetch(`/api/social-queue/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: editing.content }) });
    setEditing(null); toast.success('Saved'); load();
  };
  const del = async (id) => { await fetch(`/api/social-queue/${id}`, { method: 'DELETE' }); load(); };

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter);
  const STATUSES = ['all', 'pending_approval', 'approved', 'scheduled', 'posted', 'failed', 'rejected'];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-3xl">Social Queue</h2>
        <div className="text-xs text-[--brand-text-secondary]">Nothing posts automatically. You approve, schedule, or publish each one.</div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${filter === s ? 'bg-[--brand-text] text-white border-[--brand-text]' : 'border-[--brand-border] hover:bg-[--brand-accent-soft]'}`}>
            {s.replace('_', ' ')} <span className="ml-1 opacity-60">{s === 'all' ? items.length : items.filter((i) => i.status === s).length}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <div className="text-sm text-[--brand-text-secondary] py-6 text-center">No items in this bucket.</div>}
        {filtered.map((i) => (
          <div key={i.id} className="border border-[--brand-border] rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-mono uppercase tracking-[0.22em] px-2 py-0.5 rounded-full bg-[--brand-text] text-white">{i.platform}</span>
                <span className={`text-[9px] font-mono uppercase tracking-[0.22em] px-2 py-0.5 rounded-full ${STATUS_BADGE[i.status] || 'bg-[--brand-accent-soft]'}`}>{(i.status || 'draft').replace('_', ' ')}</span>
                <span className="text-[10px] text-[--brand-text-secondary]">{new Date(i.createdAt).toLocaleString()}</span>
                {i.scheduledAt && <span className="text-[10px] text-purple-600 inline-flex items-center gap-1"><CalendarClock size={11}/>{new Date(i.scheduledAt).toLocaleString()}</span>}
                {i.error && <span className="text-[10px] text-red-600">⚠ {i.error}</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <button title="Edit" onClick={() => setEditing(i)} className="p-1.5 border border-[--brand-border] rounded-lg hover:bg-[--brand-accent-soft]"><Edit3 size={12} /></button>
                {i.status === 'pending_approval' && <>
                  <button disabled={busy===i.id+'approve'} onClick={() => act(i.id, 'approve')} className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"><CheckCircle2 size={12}/> Approve</button>
                  <button disabled={busy===i.id+'reject'} onClick={() => act(i.id, 'reject')} className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] border border-[--brand-border] px-3 py-1.5 rounded-lg hover:bg-[--brand-accent-soft]"><XCircle size={12}/> Reject</button>
                </>}
                {(i.status === 'approved' || i.status === 'pending_approval') && (
                  <button onClick={() => {
                    const when = prompt('Schedule for (YYYY-MM-DD HH:MM, local):');
                    if (!when) return;
                    const dt = new Date(when);
                    if (isNaN(dt)) return toast.error('Invalid date');
                    act(i.id, 'schedule', { scheduledAt: dt.toISOString() });
                  }} className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700"><CalendarClock size={12}/> Schedule</button>
                )}
                {(i.status === 'approved' || i.status === 'scheduled' || i.status === 'failed') && (
                  <button disabled={busy===i.id+'publish'} onClick={() => act(i.id, 'publish')} className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                    {busy===i.id+'publish' ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>} Publish Now
                  </button>
                )}
                <button onClick={() => del(i.id)} className="p-1.5 text-[--brand-text-secondary] hover:text-red-500"><Trash2 size={12} /></button>
              </div>
            </div>

            {/* Preview */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary] mb-2">Caption</div>
                <div className="whitespace-pre-wrap text-sm border border-[--brand-border] rounded-lg p-3 bg-[--brand-accent-soft] max-h-48 overflow-y-auto">{i.content?.caption || '—'}</div>
                {i.content?.hashtags && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {i.content.hashtags.map((h, x) => <span key={x} className="text-[10px] font-mono text-[--brand-text-secondary]">{h}</span>)}
                  </div>
                )}
              </div>
              {i.content?.slides && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary] mb-2">Carousel (5 slides)</div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {i.content.slides.map((s, idx) => (
                      <div key={idx} className="aspect-square border border-[--brand-border] rounded-lg p-2 text-[9px] flex flex-col justify-between bg-[--brand-accent-soft]">
                        <div className="font-mono uppercase text-[--brand-text-secondary]">{idx + 1}</div>
                        <div className="font-display text-[11px] leading-tight">{s.title}</div>
                        <div className="text-[--brand-text-secondary] text-[9px] leading-tight line-clamp-3">{s.body}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[--brand-card] rounded-lg border border-[--brand-border] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[--brand-card] border-b border-[--brand-border] px-6 py-4 flex items-center justify-between">
              <div>
                <Kicker>Edit · {editing.platform}</Kicker>
                <div className="font-display text-2xl">Social copy</div>
              </div>
              <button onClick={() => setEditing(null)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary] mb-1">Caption</div>
                <textarea rows={8} value={editing.content?.caption || ''} onChange={(e) => setEditing({ ...editing, content: { ...editing.content, caption: e.target.value } })} className="w-full border border-[--brand-border] rounded-lg p-3 text-sm" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary] mb-1">Hashtags (comma or space separated)</div>
                <input value={(editing.content?.hashtags || []).join(' ')} onChange={(e) => setEditing({ ...editing, content: { ...editing.content, hashtags: e.target.value.split(/[\s,]+/).filter(Boolean) } })} className="w-full border border-[--brand-border] rounded-lg p-2.5 text-sm" />
              </div>
              {editing.content?.slides && editing.content.slides.map((s, idx) => (
                <div key={idx} className="border border-[--brand-border] rounded-lg p-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary] mb-2">Slide {idx + 1}</div>
                  <input value={s.title} onChange={(e) => { const slides=[...editing.content.slides]; slides[idx]={...slides[idx], title:e.target.value}; setEditing({...editing, content:{...editing.content, slides}}); }} className="w-full border border-[--brand-border] rounded-lg p-2 text-sm mb-2" />
                  <textarea rows={2} value={s.body} onChange={(e) => { const slides=[...editing.content.slides]; slides[idx]={...slides[idx], body:e.target.value}; setEditing({...editing, content:{...editing.content, slides}}); }} className="w-full border border-[--brand-border] rounded-lg p-2 text-sm" />
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 bg-[--brand-card] border-t border-[--brand-border] px-6 py-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="border border-[--brand-border] px-4 py-2 text-xs font-mono uppercase tracking-[0.2em]">Cancel</button>
              <button onClick={saveEdit} className="bg-[--brand-text] text-white px-5 py-2 text-xs font-mono uppercase tracking-[0.2em]">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RssSources() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', url: '', section: 'ai' });
  const load = () => fetch('/api/rss-sources').then((r) => r.json()).then((d) => setItems(d.sources || []));
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!form.url) return;
    await fetch('/api/rss-sources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ name: '', url: '', section: 'ai' }); load();
  };
  const del = async (id) => { await fetch(`/api/rss-sources/${id}`, { method: 'DELETE' }); load(); };
  return (
    <div>
      <h2 className="font-display text-3xl mb-2">RSS Sources</h2>
      <p className="text-[--brand-text-secondary] text-sm mb-6">RSS ingestion feeds directly into the Content Inbox. From there, you approve items to become drafts.</p>
      <div className="grid md:grid-cols-4 gap-2 mb-4">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-[--brand-border] rounded-lg p-2" />
        <input placeholder="https://feed.url/rss" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="border border-[--brand-border] rounded-lg p-2 md:col-span-2" />
        <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="border border-[--brand-border] rounded-lg p-2">
          {SECTIONS.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
      </div>
      <button onClick={add} className="bg-[--brand-text] text-white px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] mb-6">Add Source</button>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.id} className="flex items-center justify-between border border-[--brand-border] rounded-lg p-3">
            <div>
              <div className="font-medium">{i.name || i.url}</div>
              <div className="text-xs text-[--brand-text-secondary]">{i.section} · {i.url}</div>
            </div>
            <button onClick={() => del(i.id)} className="text-[--brand-text-secondary] hover:text-red-500"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Logs() {
  const [items, setItems] = useState([]);
  useEffect(() => { fetch('/api/logs').then((r) => r.json()).then((d) => setItems(d.logs || [])); }, []);
  return (
    <div>
      <h2 className="font-display text-3xl mb-6">Automation Logs</h2>
      <div className="font-mono text-xs space-y-1 max-h-[70vh] overflow-y-auto">
        {items.map((l) => (
          <div key={l.id} className="border-l-2 border-[--brand-border] pl-3 py-1">
            <span className="text-[--brand-text-secondary]">{new Date(l.createdAt).toLocaleString()}</span>{' '}
            <span className={l.status === 'ok' ? 'text-green-700' : 'text-red-700'}>[{l.status}]</span>{' '}
            <span>{l.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Settings() {
  const [s, setS] = useState({}); const [saving, setSaving] = useState(false);
  useEffect(() => { fetch('/api/settings').then((r) => r.json()).then((d) => setS(d.settings || {})); }, []);
  const save = async () => {
    setSaving(true);
    const r = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
    setSaving(false);
    if (r.ok) toast.success('Saved'); else toast.error('Save failed');
  };
  const F = ({ label, k, type = 'text', placeholder = '', hint = '' }) => (
    <div>
      <label className="text-[10px] font-mono uppercase tracking-[0.22em] text-[--brand-text-secondary]">{label}</label>
      <input type={type} value={s[k] || ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} placeholder={placeholder} className="mt-1 w-full border border-[--brand-border] rounded-lg p-2.5" />
      {hint && <div className="text-xs text-[--brand-text-secondary] mt-1">{hint}</div>}
    </div>
  );
  return (
    <div>
      <h2 className="font-display text-3xl mb-2">Settings</h2>
      <p className="text-[--brand-text-secondary] text-sm mb-8">Store your API keys and integration endpoints. Everything is optional — the site runs with demo content until you add keys.</p>
      <div className="space-y-6">
        <section>
          <h3 className="font-display text-xl mb-3">Author</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <F label="Author Photo URL" k="authorPhoto" placeholder="https://…/portrait.jpg" hint="Replaces the default portrait in the About section on the homepage." />
            <F label="Portfolio URL" k="authorPortfolio" placeholder="https://manikantar.in" />
          </div>
        </section>
        <section>
          <h3 className="font-display text-xl mb-3">AI Providers</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <F label="Groq API Key" k="groqKey" type="password" placeholder="gsk_…" hint="Get one free at console.groq.com/keys" />
            <F label="OpenRouter API Key" k="openrouterKey" type="password" placeholder="sk-or-…" />
          </div>
        </section>
        <section>
          <h3 className="font-display text-xl mb-3">Hashnode</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <F label="Hashnode PAT" k="hashnodeToken" type="password" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" hint="Personal Access Token from hashnode.com/settings/developer — give write access." />
            <F label="Hashnode Publication ID" k="hashnodePublicationId" placeholder="clxyz1234567890abcdef" hint="Find in your Hashnode dashboard → Publication settings." />
          </div>
        </section>
        <section>
          <h3 className="font-display text-xl mb-3">Social OAuth</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <F label="LinkedIn Access Token" k="linkedinToken" type="password" />
            <F label="LinkedIn Actor URN" k="linkedinActor" placeholder="urn:li:person:xxxx" />
            <F label="Instagram Access Token" k="instagramToken" type="password" />
            <F label="Instagram Business Account ID" k="instagramActor" />
          </div>
        </section>
        <section>
          <h3 className="font-display text-xl mb-3">Automation</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <F label="n8n Inbound Webhook URL" k="n8nWebhook" placeholder="https://n8n.your.host/webhook/…" />
            <F label="n8n Trigger Secret" k="n8nSecret" type="password" />
            <F label="Content Inbox Webhook Secret" k="inboxWebhookSecret" type="password" hint="Used by Google Sheets / n8n to POST rows to /api/inbox/webhook" />
            <F label="Cron Secret" k="cronSecret" type="password" />
          </div>
        </section>
        <section>
          <h3 className="font-display text-xl mb-3">Analytics</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <F label="Umami URL" k="umamiUrl" placeholder="https://umami.your.host" />
            <F label="Umami Website ID" k="umamiId" />
          </div>
        </section>
         <section>
           <h3 className="font-display text-xl mb-3">Security (2FA)</h3>
           <div className="space-y-3">
             <div className="flex gap-2 flex-wrap">
               <button onClick={async () => {
                 const password = prompt('Confirm password'); const totpCode = prompt('Current TOTP code (leave blank if none)');
                 const r = await fetch('/api/admin/recovery/regenerate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, totpCode }) });
                 const d = await r.json().catch(() => ({}));
                 if (r.ok) alert('New recovery codes:\n' + (d.recoveryCodes || []).join('\n')); else alert(d.error || 'Failed');
               }} className="bg-[--brand-text] text-white px-4 py-2 text-xs font-mono uppercase tracking-[0.2em]">Regenerate recovery codes</button>
               <button onClick={async () => {
                 const password = prompt('Confirm password'); const totpCode = prompt('Current TOTP code');
                 const r = await fetch('/api/admin/totp/disable', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, totpCode }) });
                 const d = await r.json().catch(() => ({}));
                 if (r.ok) alert('2FA disabled'); else alert(d.error || 'Failed');
               }} className="border border-red-300 text-red-600 px-4 py-2 text-xs font-mono uppercase tracking-[0.2em]">Disable 2FA</button>
             </div>
           </div>
         </section>


        <button onClick={save} disabled={saving} className="bg-[--brand-text] text-white px-5 py-2.5 text-xs font-mono uppercase tracking-[0.2em] hover:bg-[--brand-text] disabled:opacity-50">{saving ? 'Saving…' : 'Save Settings'}</button>
      </div>
    </div>
  );
}
// ============ CATEGORIES ADMIN ============
function CategoryAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', accent: '#7C3AED', sort_order: '0' });
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState({});
  useEffect(() => { load(); }, []);
  async function load() {
    try { const d = await (await fetch('/api/categories')).json(); setItems(d.categories || []); } catch { setItems([]); }
  }
  async function save(e) {
    e.preventDefault(); setBusy({ ...busy, saving: true });
    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const r = await fetch(url, { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, sort_order: Number(form.sort_order) || 0 }) });
      if (!r.ok) throw new Error((await r.json()).error || 'Save failed');
      toast.success(editingId ? 'Category updated' : 'Category created'); reset(); load();
    } catch (e) { toast.error(e.message || 'Save failed'); }
    finally { setBusy({ ...busy, saving: false }); }
  }
  async function del(id) {
    if (!window.confirm('Delete this category?')) return;
    setBusy({ ...busy, [id]: true });
    try {
      const r = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Delete failed');
      toast.success('Category deleted'); load();
    } catch (e) { toast.error(e.message || 'Delete failed'); }
    finally { setBusy({ ...busy, [id]: false }); }
  }
  function edit(c) { setForm({ name: c.name || '', slug: c.slug || '', accent: c.accent || '#7C3AED', sort_order: String(c.sort_order ?? 0) }); setEditingId(c.id); }
  function reset() { setForm({ name: '', slug: '', accent: '#7C3AED', sort_order: '0' }); setEditingId(null); }
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="font-display text-3xl mb-1">Categories</h2><p className="text-[--brand-text-secondary] text-sm">Manage editorial categories.</p></div>
        <button onClick={reset} className="text-xs font-medium text-[--brand-text-secondary] hover:text-[--brand-text]">{editingId ? 'Cancel' : '+ Add Category'}</button>
      </div>
      <form onSubmit={save} className="grid md:grid-cols-12 gap-3 items-end border border-[--brand-border] rounded-lg p-4 bg-[--brand-accent-soft]/50">
        <div className="md:col-span-3"><label className="text-[10px] font-mono uppercase text-[--brand-text-secondary] mb-1.5 block">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-[--brand-border] rounded-lg p-2 text-sm" disabled={busy.saving} /></div>
        <div className="md:col-span-2"><label className="text-[10px] font-mono uppercase text-[--brand-text-secondary] mb-1.5 block">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border border-[--brand-border] rounded-lg p-2 text-sm" disabled={busy.saving} /></div>
        <div className="md:col-span-2"><label className="text-[10px] font-mono uppercase text-[--brand-text-secondary] mb-1.5 block">Accent</label><input type="color" value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} className="w-full h-9 rounded-lg border-0 p-0 cursor-pointer" disabled={busy.saving} /></div>
        <div className="md:col-span-2"><label className="text-[10px] font-mono uppercase text-[--brand-text-secondary] mb-1.5 block">Order</label><input value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} type="number" className="w-full border border-[--brand-border] rounded-lg p-2 text-sm" disabled={busy.saving} /></div>
        <div className="md:col-span-12"><button type="submit" disabled={busy.saving} className="inline-flex items-center gap-2 bg-[--brand-text] text-white px-4 py-2 text-xs font-mono uppercase rounded-lg hover:bg-[--brand-text] disabled:opacity-50">{busy.saving ? <Loader2 size={12} className="animate-spin" /> : null} {editingId ? 'Save' : 'Create'}</button></div>
      </form>
      <div className="border border-[--brand-border] rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead><tr className="border-b border-[--brand-border] bg-[--brand-accent-soft]"><th className="px-4 py-3 font-semibold text-[--brand-text-secondary] uppercase tracking-wider">Name</th><th className="px-4 py-3 font-semibold text-[--brand-text-secondary] uppercase tracking-wider">Slug</th><th className="px-4 py-3 font-semibold text-[--brand-text-secondary] uppercase tracking-wider text-right">Order</th><th className="px-4 py-3 font-semibold text-[--brand-text-secondary] uppercase tracking-wider text-right">Actions</th></tr></thead>
          <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-b border-[--brand-border] hover:bg-[--brand-accent-soft]">
              <td className="px-4 py-3"><span className="font-semibold text-[--brand-text]">{c.name}</span>{c.accent && <span className="ml-2 inline-block w-3 h-3 rounded-full border border-[--brand-border]" style={{ backgroundColor: c.accent }} />}</td>
              <td className="px-4 py-3 font-mono text-[--brand-text-secondary]">{c.slug}</td>
              <td className="px-4 py-3 text-[--brand-text-secondary] text-right">{c.sort_order ?? 0}</td>
              <td className="px-4 py-3 text-right"><button onClick={() => edit(c)} disabled={busy[c.id]} className="text-[10px] font-mono uppercase text-[--brand-text-secondary] hover:text-[--brand-text] mr-3">Edit</button><button onClick={() => del(c.id)} disabled={busy[c.id]} className="text-[10px] font-mono uppercase text-red-500 hover:text-red-700">Delete</button></td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-[--brand-text-secondary] text-sm">No categories yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// ============ TAGS ADMIN ============
function TagAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '' });
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState({});
  useEffect(() => { load(); }, []);
  async function load() {
    try { const d = await (await fetch('/api/tags')).json(); setItems(d.tags || []); } catch { setItems([]); }
  }
  async function save(e) {
    e.preventDefault(); setBusy({ ...busy, saving: true });
    try {
      const url = editingId ? `/api/tags/${editingId}` : '/api/tags';
      const r = await fetch(url, { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error((await r.json()).error || 'Save failed');
      toast.success(editingId ? 'Tag updated' : 'Tag created'); reset(); load();
    } catch (e) { toast.error(e.message || 'Save failed'); }
    finally { setBusy({ ...busy, saving: false }); }
  }
  async function del(id) {
    if (!window.confirm('Delete this tag?')) return;
    setBusy({ ...busy, [id]: true });
    try {
      const r = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Delete failed');
      toast.success('Tag deleted'); load();
    } catch (e) { toast.error(e.message || 'Delete failed'); }
    finally { setBusy({ ...busy, [id]: false }); }
  }
  function edit(t) { setForm({ name: t.name || '', slug: t.slug || '' }); setEditingId(t.id); }
  function reset() { setForm({ name: '', slug: '' }); setEditingId(null); }
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="font-display text-3xl mb-1">Tags</h2><p className="text-[--brand-text-secondary] text-sm">Manage article tags (hashtags).</p></div>
        <button onClick={reset} className="text-xs font-medium text-[--brand-text-secondary] hover:text-[--brand-text]">{editingId ? 'Cancel' : '+ Add Tag'}</button>
      </div>
      <form onSubmit={save} className="grid md:grid-cols-12 gap-3 items-end border border-[--brand-border] rounded-lg p-4 bg-[--brand-accent-soft]/50">
        <div className="md:col-span-4"><label className="text-[10px] font-mono uppercase text-[--brand-text-secondary] mb-1.5 block">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="#hr" className="w-full border border-[--brand-border] rounded-lg p-2 text-sm" disabled={busy.saving} /></div>
        <div className="md:col-span-4"><label className="text-[10px] font-mono uppercase text-[--brand-text-secondary] mb-1.5 block">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="hr" className="w-full border border-[--brand-border] rounded-lg p-2 text-sm" disabled={busy.saving} /></div>
        <div className="md:col-span-4"><button type="submit" disabled={busy.saving} className="inline-flex items-center gap-2 w-full bg-[--brand-text] text-white px-4 py-2 text-xs font-mono uppercase rounded-lg hover:bg-[--brand-text] disabled:opacity-50">{busy.saving ? <Loader2 size={12} className="animate-spin" /> : null} {editingId ? 'Save' : 'Create'}</button></div>
      </form>
      <div className="border border-[--brand-border] rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead><tr className="border-b border-[--brand-border] bg-[--brand-accent-soft]"><th className="px-4 py-3 font-semibold text-[--brand-text-secondary] uppercase tracking-wider">Name</th><th className="px-4 py-3 font-semibold text-[--brand-text-secondary] uppercase tracking-wider">Slug</th><th className="px-4 py-3 font-semibold text-[--brand-text-secondary] uppercase tracking-wider text-right">Actions</th></tr></thead>
          <tbody>
          {items.map((t) => (
            <tr key={t.id} className="border-b border-[--brand-border] hover:bg-[--brand-accent-soft]">
              <td className="px-4 py-3"><span className="font-semibold text-[--brand-text]">#{t.name}</span></td>
              <td className="px-4 py-3 font-mono text-[--brand-text-secondary]">{t.slug}</td>
              <td className="px-4 py-3 text-right"><button onClick={() => edit(t)} disabled={busy[t.id]} className="text-[10px] font-mono uppercase text-[--brand-text-secondary] hover:text-[--brand-text] mr-3">Edit</button><button onClick={() => del(t.id)} disabled={busy[t.id]} className="text-[10px] font-mono uppercase text-red-500 hover:text-red-700">Delete</button></td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-[--brand-text-secondary] text-sm">No tags yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

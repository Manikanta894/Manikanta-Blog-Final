'use client';
import { useEffect, useRef, useState } from 'react';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import Kicker from '@/components/site/Kicker';
import { motion } from 'framer-motion';
import { SECTIONS, renderMd } from '@/packages/utils';
import { Sparkles, Loader2, FileText, Image as ImageIcon, Calendar, Rss, Share2, Settings as SettingsIcon, BookOpen, Activity, LayoutDashboard, Send, Check, Clock, Trash2, Inbox, X, PlayCircle, CheckCircle2, XCircle, CalendarClock, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

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
];

export default function AdminPage() {
  const [tab, setTab] = useState('dashboard');
  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };
  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <Nav />
      <div className="container py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <Kicker>Private · Studio</Kicker>
            <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-2">The Studio</h1>
            <p className="text-neutral-600 mt-2">Your control room. Draft, generate, schedule, and publish across the Journal.</p>
          </div>
          <button onClick={logout} className="shrink-0 mt-1 text-xs font-mono uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-colors">
            Log out
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          <aside className="space-y-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setTab(t.key)} className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm transition-colors ${tab === t.key ? 'bg-neutral-900 text-white' : 'hover:bg-white'}`}>
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </aside>
          <section className="bg-white rounded-sm border border-neutral-200 p-6 md:p-8 min-h-[70vh]">
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
          <div key={c.k} className="border border-neutral-200 rounded-sm p-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500">{c.k}</div>
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
      <p className="text-neutral-600 text-sm mb-6">Generate a full magazine article + SEO + hashtags + cover image + social copy in one click.</p>
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full border border-neutral-200 rounded-sm p-2.5 bg-white">
          {SECTIONS.filter((s) => s.slug !== 'archive').map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
        <input value={angle} onChange={(e) => setAngle(e.target.value)} placeholder="Angle (optional)" className="md:col-span-2 w-full border border-neutral-200 rounded-sm p-2.5" />
      </div>
      <div className="flex gap-3">
        <button disabled={busy} onClick={() => generate({ publish: false })} className="inline-flex items-center gap-2 border border-neutral-900 px-5 py-2.5 text-xs font-mono uppercase tracking-[0.2em] hover:bg-neutral-900 hover:text-white disabled:opacity-50">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Generate Draft
        </button>
        <button disabled={busy} onClick={() => generate({ publish: true })} className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 text-xs font-mono uppercase tracking-[0.2em] hover:bg-neutral-800 disabled:opacity-50">
          <Send size={14} /> Generate & Publish
        </button>
      </div>
      {result && (
        <div className="mt-8 border border-neutral-200 rounded-sm p-6">
          <Kicker>{result.section} · {result.provider}</Kicker>
          <h3 className="font-display text-3xl mt-2">{result.title}</h3>
          {result.coverImage && <img src={result.coverImage} className="mt-4 rounded-sm w-full aspect-[16/9] object-cover" alt="" />}
          <p className="mt-4 text-neutral-700">{result.excerpt}</p>
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
    new:        'bg-neutral-100 text-neutral-700',
    processing: 'bg-blue-100 text-blue-700 animate-pulse',
    done:       'bg-green-100 text-green-700',
    failed:     'bg-red-100 text-red-700',
  };

  return (
    <div>
      <h2 className="font-display text-3xl mb-2">Content Inbox</h2>
      <p className="text-neutral-600 text-sm mb-6">Paste URLs, ideas, images, or news. One click turns each into a full article + SEO + hashtags + cover image + social copy — saved as a Draft (never auto-published).</p>

      {/* Add form */}
      <div className="border border-neutral-200 rounded-sm p-5 mb-6 bg-neutral-50">
        <div className="grid md:grid-cols-4 gap-3 mb-3">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border border-neutral-200 rounded-sm p-2 bg-white text-sm">
            <option value="idea">Idea</option>
            <option value="url">URL / Article link</option>
            <option value="news">News item</option>
            <option value="image">Image link</option>
          </select>
          <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="border border-neutral-200 rounded-sm p-2 bg-white text-sm">
            {SECTIONS.filter((s) => s.slug !== 'archive').map((s) => <option key={s.slug} value={s.slug}>Target: {s.name}</option>)}
          </select>
          <input placeholder="Optional notes / angle" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="md:col-span-2 border border-neutral-200 rounded-sm p-2 bg-white text-sm" />
        </div>
        <textarea rows={2} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Paste URL, image link, or write the raw idea…" className="w-full border border-neutral-200 rounded-sm p-2.5 bg-white text-sm" />
        <div className="mt-3 flex justify-end">
          <button onClick={add} className="bg-neutral-900 text-white px-5 py-2.5 text-xs font-mono uppercase tracking-[0.2em] rounded-sm hover:bg-orange-600">Add to Inbox</button>
        </div>
      </div>

      {/* Google Sheets / n8n webhook helper */}
      <details className="border border-dashed border-neutral-300 rounded-sm p-4 mb-6 bg-white">
        <summary className="cursor-pointer text-sm font-medium">📊 Sync from Google Sheets or n8n <span className="text-xs text-neutral-500 ml-2">(click to expand)</span></summary>
        <div className="mt-4 space-y-3 text-sm">
          <p className="text-neutral-600">Post rows to this URL from Google Apps Script, Zapier, or n8n. Every row becomes an inbox item. Nothing publishes automatically — you still approve each one.</p>
          <div className="flex gap-2">
            <input readOnly value={webhookUrl} className="flex-1 font-mono text-xs bg-neutral-50 border border-neutral-200 rounded-sm p-2" />
            <button onClick={saveSecret} className="border border-neutral-900 px-3 py-2 text-xs font-mono uppercase tracking-[0.2em] hover:bg-neutral-900 hover:text-white">
              {webhookSecret ? 'Rotate Secret' : 'Generate Secret'}
            </button>
          </div>
          <div className="text-xs text-neutral-500">
            <strong>Payload:</strong> <code className="bg-neutral-100 px-1">{'{ "rows": [{ "type": "url", "content": "https://…", "section": "ai", "notes": "…" }] }'}</code>
          </div>
          <div className="text-xs text-neutral-500">
            <strong>Google Apps Script snippet</strong> (paste into your Sheet → Extensions → Apps Script):
            <pre className="bg-neutral-900 text-neutral-100 rounded-sm p-3 mt-1 overflow-x-auto text-[10px] leading-relaxed">{`function pushToJournal() {
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
        {items.length === 0 && <div className="text-sm text-neutral-500 py-6 text-center">Inbox is empty. Paste your first idea above.</div>}
        {items.map((i) => (
          <div key={i.id} className="border border-neutral-200 rounded-sm p-4 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[9px] font-mono uppercase tracking-[0.22em] px-2 py-0.5 rounded-full bg-neutral-100">{i.type}</span>
                <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-neutral-500">→ {i.section}</span>
                <span className={`text-[9px] font-mono uppercase tracking-[0.22em] px-2 py-0.5 rounded-full ${STATUS_STYLE[i.status] || 'bg-neutral-100'}`}>{i.status}</span>
                <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-neutral-400">{new Date(i.createdAt).toLocaleString()}</span>
                {i.source && i.source !== 'admin' && <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-orange-600">via {i.source}</span>}
              </div>
              <div className="text-sm text-neutral-800 break-words">{i.content}</div>
              {i.notes && <div className="text-xs text-neutral-500 italic mt-1">↳ {i.notes}</div>}
              {i.articleId && <a href={`/article/${i.articleId}`} className="text-xs text-orange-600 underline mt-1 inline-block">draft created →</a>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {i.status === 'new' && (
                <button disabled={busy === i.id} onClick={() => proc(i.id)} className="inline-flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-2 text-[10px] font-mono uppercase tracking-[0.2em] rounded-sm hover:bg-orange-600 disabled:opacity-50">
                  {busy === i.id ? <Loader2 size={12} className="animate-spin" /> : <PlayCircle size={12} />} Process
                </button>
              )}
              <button onClick={() => del(i.id)} className="text-neutral-400 hover:text-red-500"><Trash2 size={14} /></button>
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
        await fetch(`/api/articles/${form.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        const r = await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const d = await r.json();
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
          <button onClick={newDraft} className="text-xs font-mono uppercase tracking-[0.2em] border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50">+ New</button>
          <select onChange={(e) => { const a = all.find((x) => x.id === e.target.value); if (a) loadIntoForm(a); }} value="" className="text-xs border border-neutral-200 rounded-sm px-2 py-1.5">
            <option value="" disabled>Open existing…</option>
            {all.map((a) => <option key={a.id} value={a.id}>{a.status} — {a.title}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <input value={form.title} onChange={set('title')} placeholder="Title" className="w-full border border-neutral-200 rounded-sm p-3 font-display text-2xl" />
          <textarea value={form.excerpt} onChange={set('excerpt')} placeholder="Excerpt (shown on cards + under the title)" rows={2} className="w-full border border-neutral-200 rounded-sm p-3 text-sm" />

          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500">Content (Markdown)</div>
            <div className="flex gap-3">
              <label className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-600 hover:text-neutral-900 cursor-pointer">
                {uploadingInline ? 'Uploading…' : 'Insert Image'}
                <input ref={inlineFileRef} type="file" accept="image/*" onChange={onInlineUpload} className="hidden" />
              </label>
              <button onClick={() => setPreview((p) => !p)} className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-600 hover:text-neutral-900">
                {preview ? 'Edit' : 'Preview'}
              </button>
            </div>
          </div>

          {preview ? (
            <div className="prose-editorial border border-neutral-200 rounded-sm p-5 min-h-[420px]" dangerouslySetInnerHTML={{ __html: renderMd(form.content) }} />
          ) : (
            <textarea ref={contentRef} value={form.content} onChange={set('content')} placeholder={'# Start writing…\n\nUse ## for headings, - for lists, > for quotes, ![alt](url) for images, [text](url) for links, ```code``` for code blocks.'} rows={22} className="w-full border border-neutral-200 rounded-sm p-3 font-mono text-sm leading-relaxed" />
          )}
          <div className="text-[11px] text-neutral-400">{form.content.split(/\s+/).filter(Boolean).length} words · supports headings, bold/italic, links, images, lists, tables, code blocks, quotes</div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500 mb-1.5">Section</div>
            <select value={form.section} onChange={set('section')} className="w-full border border-neutral-200 rounded-sm p-2.5 text-sm">
              {SECTIONS.filter((s) => s.slug !== 'archive').map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500 mb-1.5">Cover Image</div>
            {form.coverImage && <img src={form.coverImage} alt="" className="w-full aspect-[16/9] object-cover rounded-sm mb-2" />}
            <input value={form.coverImage} onChange={set('coverImage')} placeholder="Paste an image URL…" className="w-full border border-neutral-200 rounded-sm p-2 text-xs mb-2" />
            <div className="flex gap-2">
              <label className="flex-1 text-center text-xs font-mono uppercase tracking-[0.2em] border border-neutral-900 px-3 py-2 cursor-pointer hover:bg-neutral-900 hover:text-white transition-colors">
                {uploadingCover ? '…' : 'Upload'}
                <input ref={coverFileRef} type="file" accept="image/*" onChange={onCoverUpload} className="hidden" />
              </label>
              <button onClick={generateCover} disabled={genCover} className="flex-1 text-xs font-mono uppercase tracking-[0.2em] border border-neutral-200 px-3 py-2 hover:bg-neutral-50 disabled:opacity-50">{genCover ? '…' : 'Generate (AI)'}</button>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500 mb-1.5">Hashtags (comma-separated)</div>
            <input value={form.hashtagsText} onChange={set('hashtagsText')} placeholder="#hr, #analytics, #career" className="w-full border border-neutral-200 rounded-sm p-2 text-xs" />
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500 mb-1.5">SEO Title</div>
            <input value={form.seoTitle} onChange={set('seoTitle')} placeholder="Defaults to the title above" className="w-full border border-neutral-200 rounded-sm p-2 text-xs mb-3" />
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500 mb-1.5">Meta Description ({form.seoDescription.length}/160)</div>
            <textarea value={form.seoDescription} onChange={set('seoDescription')} rows={3} placeholder="Defaults to the excerpt above" className="w-full border border-neutral-200 rounded-sm p-2 text-xs" />
          </div>

          <div className="border-t border-neutral-200 pt-4 flex flex-col gap-2">
            <button onClick={() => save('draft')} disabled={saving} className="text-xs font-mono uppercase tracking-[0.2em] border border-neutral-200 px-3 py-2.5 hover:bg-neutral-50 disabled:opacity-50">{saving ? 'Saving…' : 'Save Draft'}</button>
            <button onClick={() => save('published')} disabled={saving} className="text-xs font-mono uppercase tracking-[0.2em] bg-neutral-900 text-white px-3 py-2.5 hover:bg-neutral-800 disabled:opacity-50">{saving ? '…' : form.id ? 'Save & Publish' : 'Publish'}</button>
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
          <div key={a.id} className="flex items-center gap-4 border border-neutral-200 rounded-sm p-3">
            <img src={a.coverImage} className="w-20 h-14 object-cover rounded-sm" alt="" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono uppercase tracking-[0.22em] text-neutral-500">{a.section} · {a.status}</div>
              <div className="font-display text-lg truncate">{a.title}</div>
            </div>
            <div className="flex items-center gap-2">
              {a.status !== 'published' ? (
                <button onClick={() => patch(a.id, { status: 'published', publishedAt: new Date() })} className="text-xs font-mono uppercase tracking-[0.2em] border border-neutral-900 px-3 py-1.5 hover:bg-neutral-900 hover:text-white"><Check size={12} className="inline mr-1" />Publish</button>
              ) : (
                <button onClick={() => patch(a.id, { status: 'draft' })} className="text-xs font-mono uppercase tracking-[0.2em] border border-neutral-200 px-3 py-1.5">Unpublish</button>
              )}
              <a href={`/article/${a.slug}`} target="_blank" className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-600 hover:text-neutral-900">View</a>
              <button onClick={() => del(a.id)} className="text-neutral-400 hover:text-red-500"><Trash2 size={14} /></button>
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
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500">{d}</div>
            <div className="mt-2 space-y-2">
              {arr.map((a) => (
                <div key={a.id} className="flex items-center gap-3 border border-neutral-200 rounded-sm p-3">
                  <Clock size={14} className="text-neutral-400" />
                  <div className="flex-1 truncate">
                    <div className="text-xs text-neutral-500">{a.section} · {a.status}</div>
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
  const copyUrl = async (url) => { await navigator.clipboard.writeText(url); toast.success('URL copied'); };
  return (
    <div>
      <h2 className="font-display text-3xl mb-6">Media Library</h2>
      <div className="flex gap-2 mb-3">
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Prompt an image (Pollinations AI)" className="flex-1 border border-neutral-200 rounded-sm p-2.5" />
        <button onClick={gen} disabled={busy} className="bg-neutral-900 text-white px-4 text-xs font-mono uppercase tracking-[0.2em] disabled:opacity-50">{busy ? '…' : 'Generate'}</button>
      </div>
      <div className="mb-6">
        <label className="inline-block text-xs font-mono uppercase tracking-[0.2em] border border-neutral-200 px-4 py-2.5 cursor-pointer hover:bg-neutral-50">
          {uploading ? 'Uploading…' : 'Upload Your Own Photo'}
          <input ref={fileRef} type="file" accept="image/*" onChange={upload} className="hidden" />
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {media.map((m) => (
          <div key={m.id} className="border border-neutral-200 rounded-sm overflow-hidden group relative">
            <img src={m.url} alt="" className="aspect-square object-cover w-full" />
            <div className="p-2 text-[10px] text-neutral-500 truncate">{m.prompt}</div>
            <button onClick={() => copyUrl(m.url)} className="absolute top-2 right-2 bg-white/90 text-[10px] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">Copy URL</button>
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
      <div className="text-sm text-neutral-500 mb-4">{entries.length} entries recorded.</div>
      <div className="space-y-2">
        {entries.map((e) => (
          <div key={e.id} className="flex items-center justify-between border border-neutral-200 rounded-sm p-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">{new Date(e.date || e.createdAt).toLocaleString()} · {e.mood}</div>
              <div className="font-display">{e.title || e.content?.slice(0, 60)}</div>
            </div>
            <a href="/journal" className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-600">Open →</a>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_BADGE = {
  draft:             'bg-neutral-100 text-neutral-700',
  pending_approval:  'bg-amber-100 text-amber-800',
  approved:          'bg-blue-100 text-blue-700',
  scheduled:         'bg-purple-100 text-purple-700',
  posted:            'bg-green-100 text-green-700',
  failed:            'bg-red-100 text-red-700',
  rejected:          'bg-neutral-200 text-neutral-500 line-through',
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
        <div className="text-xs text-neutral-500">Nothing posts automatically. You approve, schedule, or publish each one.</div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${filter === s ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 hover:bg-neutral-50'}`}>
            {s.replace('_', ' ')} <span className="ml-1 opacity-60">{s === 'all' ? items.length : items.filter((i) => i.status === s).length}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <div className="text-sm text-neutral-500 py-6 text-center">No items in this bucket.</div>}
        {filtered.map((i) => (
          <div key={i.id} className="border border-neutral-200 rounded-sm p-4">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-mono uppercase tracking-[0.22em] px-2 py-0.5 rounded-full bg-neutral-900 text-white">{i.platform}</span>
                <span className={`text-[9px] font-mono uppercase tracking-[0.22em] px-2 py-0.5 rounded-full ${STATUS_BADGE[i.status] || 'bg-neutral-100'}`}>{(i.status || 'draft').replace('_', ' ')}</span>
                <span className="text-[10px] text-neutral-500">{new Date(i.createdAt).toLocaleString()}</span>
                {i.scheduledAt && <span className="text-[10px] text-purple-600 inline-flex items-center gap-1"><CalendarClock size={11}/>{new Date(i.scheduledAt).toLocaleString()}</span>}
                {i.error && <span className="text-[10px] text-red-600">⚠ {i.error}</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <button title="Edit" onClick={() => setEditing(i)} className="p-1.5 border border-neutral-200 rounded-sm hover:bg-neutral-50"><Edit3 size={12} /></button>
                {i.status === 'pending_approval' && <>
                  <button disabled={busy===i.id+'approve'} onClick={() => act(i.id, 'approve')} className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] bg-blue-600 text-white px-3 py-1.5 rounded-sm hover:bg-blue-700"><CheckCircle2 size={12}/> Approve</button>
                  <button disabled={busy===i.id+'reject'} onClick={() => act(i.id, 'reject')} className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] border border-neutral-200 px-3 py-1.5 rounded-sm hover:bg-neutral-100"><XCircle size={12}/> Reject</button>
                </>}
                {(i.status === 'approved' || i.status === 'pending_approval') && (
                  <button onClick={() => {
                    const when = prompt('Schedule for (YYYY-MM-DD HH:MM, local):');
                    if (!when) return;
                    const dt = new Date(when);
                    if (isNaN(dt)) return toast.error('Invalid date');
                    act(i.id, 'schedule', { scheduledAt: dt.toISOString() });
                  }} className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] bg-purple-600 text-white px-3 py-1.5 rounded-sm hover:bg-purple-700"><CalendarClock size={12}/> Schedule</button>
                )}
                {(i.status === 'approved' || i.status === 'scheduled' || i.status === 'failed') && (
                  <button disabled={busy===i.id+'publish'} onClick={() => act(i.id, 'publish')} className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] bg-green-600 text-white px-3 py-1.5 rounded-sm hover:bg-green-700">
                    {busy===i.id+'publish' ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>} Publish Now
                  </button>
                )}
                <button onClick={() => del(i.id)} className="p-1.5 text-neutral-400 hover:text-red-500"><Trash2 size={12} /></button>
              </div>
            </div>

            {/* Preview */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500 mb-2">Caption</div>
                <div className="whitespace-pre-wrap text-sm border border-neutral-100 rounded-sm p-3 bg-neutral-50 max-h-48 overflow-y-auto">{i.content?.caption || '—'}</div>
                {i.content?.hashtags && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {i.content.hashtags.map((h, x) => <span key={x} className="text-[10px] font-mono text-neutral-500">{h}</span>)}
                  </div>
                )}
              </div>
              {i.content?.slides && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500 mb-2">Carousel (5 slides)</div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {i.content.slides.map((s, idx) => (
                      <div key={idx} className="aspect-square border border-neutral-200 rounded-sm p-2 text-[9px] flex flex-col justify-between bg-neutral-50">
                        <div className="font-mono uppercase text-neutral-400">{idx + 1}</div>
                        <div className="font-display text-[11px] leading-tight">{s.title}</div>
                        <div className="text-neutral-600 text-[9px] leading-tight line-clamp-3">{s.body}</div>
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
          <div className="bg-white rounded-sm border border-neutral-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <div>
                <Kicker>Edit · {editing.platform}</Kicker>
                <div className="font-display text-2xl">Social copy</div>
              </div>
              <button onClick={() => setEditing(null)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500 mb-1">Caption</div>
                <textarea rows={8} value={editing.content?.caption || ''} onChange={(e) => setEditing({ ...editing, content: { ...editing.content, caption: e.target.value } })} className="w-full border border-neutral-200 rounded-sm p-3 text-sm" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500 mb-1">Hashtags (comma or space separated)</div>
                <input value={(editing.content?.hashtags || []).join(' ')} onChange={(e) => setEditing({ ...editing, content: { ...editing.content, hashtags: e.target.value.split(/[\s,]+/).filter(Boolean) } })} className="w-full border border-neutral-200 rounded-sm p-2.5 text-sm" />
              </div>
              {editing.content?.slides && editing.content.slides.map((s, idx) => (
                <div key={idx} className="border border-neutral-200 rounded-sm p-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500 mb-2">Slide {idx + 1}</div>
                  <input value={s.title} onChange={(e) => { const slides=[...editing.content.slides]; slides[idx]={...slides[idx], title:e.target.value}; setEditing({...editing, content:{...editing.content, slides}}); }} className="w-full border border-neutral-100 rounded-sm p-2 text-sm mb-2" />
                  <textarea rows={2} value={s.body} onChange={(e) => { const slides=[...editing.content.slides]; slides[idx]={...slides[idx], body:e.target.value}; setEditing({...editing, content:{...editing.content, slides}}); }} className="w-full border border-neutral-100 rounded-sm p-2 text-sm" />
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="border border-neutral-200 px-4 py-2 text-xs font-mono uppercase tracking-[0.2em]">Cancel</button>
              <button onClick={saveEdit} className="bg-neutral-900 text-white px-5 py-2 text-xs font-mono uppercase tracking-[0.2em]">Save Changes</button>
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
      <p className="text-neutral-600 text-sm mb-6">RSS ingestion feeds directly into the Content Inbox. From there, you approve items to become drafts.</p>
      <div className="grid md:grid-cols-4 gap-2 mb-4">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-neutral-200 rounded-sm p-2" />
        <input placeholder="https://feed.url/rss" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="border border-neutral-200 rounded-sm p-2 md:col-span-2" />
        <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="border border-neutral-200 rounded-sm p-2">
          {SECTIONS.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
      </div>
      <button onClick={add} className="bg-neutral-900 text-white px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] mb-6">Add Source</button>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.id} className="flex items-center justify-between border border-neutral-200 rounded-sm p-3">
            <div>
              <div className="font-medium">{i.name || i.url}</div>
              <div className="text-xs text-neutral-500">{i.section} · {i.url}</div>
            </div>
            <button onClick={() => del(i.id)} className="text-neutral-400 hover:text-red-500"><Trash2 size={14} /></button>
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
          <div key={l.id} className="border-l-2 border-neutral-300 pl-3 py-1">
            <span className="text-neutral-400">{new Date(l.createdAt).toLocaleString()}</span>{' '}
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
      <label className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500">{label}</label>
      <input type={type} value={s[k] || ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} placeholder={placeholder} className="mt-1 w-full border border-neutral-200 rounded-sm p-2.5" />
      {hint && <div className="text-xs text-neutral-500 mt-1">{hint}</div>}
    </div>
  );
  return (
    <div>
      <h2 className="font-display text-3xl mb-2">Settings</h2>
      <p className="text-neutral-600 text-sm mb-8">Store your API keys and integration endpoints. Everything is optional — the site runs with demo content until you add keys.</p>
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
        <button onClick={save} disabled={saving} className="bg-neutral-900 text-white px-5 py-2.5 text-xs font-mono uppercase tracking-[0.2em] hover:bg-neutral-800 disabled:opacity-50">{saving ? 'Saving…' : 'Save Settings'}</button>
      </div>
    </div>
  );
}

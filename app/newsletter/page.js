'use client';
import { useState } from 'react';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    const r = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    setBusy(false);
    if (r.ok) { toast.success('You are on the list.'); setEmail(''); } else toast.error('Something broke.');
  };
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-[900px] mx-auto px-5 pt-16 pb-24">
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[--brand-accent-soft] text-sm text-[--brand-accent] font-medium mb-6">
            <Check size={14} /> The Sunday Dispatch
          </div>
          <h1 className="medium-hero text-[--brand-text]">A quieter kind of newsletter.</h1>
          <p className="mt-4 text-lg text-[--brand-text-secondary] leading-relaxed">One essay. Five signals. Zero noise. Delivered every Sunday morning.</p>
          <form onSubmit={submit} className="mt-8 flex gap-2 max-w-md mx-auto">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@work.com" className="flex-1 border border-[--brand-border] rounded-full px-4 py-2.5 text-sm outline-none bg-[--brand-card] text-[--brand-text] focus:border-[--brand-accent]" />
            <button disabled={busy} className="bg-[--brand-accent] text-white rounded-full px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">{busy ? <Loader2 size={16} className="animate-spin" /> : 'Subscribe'}</button>
          </form>
          <p className="mt-3 text-sm text-[--brand-text-secondary]">No spam. Ever. Unsubscribe in one click.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20 pt-12 border-t border-[--brand-border] text-center">
          {[{n:'One essay',d:'Long enough to matter. Short enough to finish.'},{n:'Five signals',d:'Curated across AI, business, and craft.'},{n:'Zero noise',d:'No sponsors. No filler. No hot takes.'}].map((x)=>(
            <div key={x.n}>
              <div className="text-lg font-bold text-[--brand-text]">{x.n}</div>
              <p className="text-sm text-[--brand-text-secondary] mt-2 leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

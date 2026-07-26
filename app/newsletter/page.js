'use client';
import { useState } from 'react';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import Kicker from '@/components/site/Kicker';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
      <main className="container pt-10 pb-24">
        <div className="max-w-2xl mx-auto text-center py-16">
          <Kicker>The Sunday Dispatch</Kicker>
          <h1 className="text-hero italic mt-4 text-[#181818]">A quieter kind of newsletter.</h1>
          <p className="mt-6 text-lead text-[#555555]">One essay. Five signals. Zero noise. Delivered every Sunday morning. Read it with coffee. Close it with a plan.</p>
          <form onSubmit={submit} className="mt-10 flex gap-2 max-w-lg mx-auto">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@work.com" className="flex-1 border border-[#181818] rounded-sm p-3 outline-none bg-white text-[#181818]" />
            <button disabled={busy} className="bg-[#181818] text-white px-6 text-eyebrow hover:bg-brand transition-colors">{busy ? <Loader2 size={14} className="animate-spin" /> : 'Subscribe'}</button>
          </form>
          <p className="mt-4 text-eyebrow text-[#555555]">No spam. Ever. Unsubscribe in one click.</p>
        </div>

        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-8 mt-16 border-t border-[#D8D3CB] pt-16 text-center">
          {[{n:'One essay',d:'Long enough to matter. Short enough to finish.'},{n:'Five signals',d:'Curated across AI, business, and craft.'},{n:'Zero noise',d:'No sponsors. No filler. No hot takes.'}].map((x)=>(
            <div key={x.n}>
              <div className="text-h4 italic text-[#181818]">{x.n}</div>
              <p className="text-meta text-[#555555] mt-2">{x.d}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

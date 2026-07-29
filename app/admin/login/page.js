'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const login = async (e) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true); setError('');
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    setBusy(false);
    if (r.ok) router.push('/admin');
    else setError('Wrong password');
  };

  return (
    <div className="min-h-screen bg-[--brand-bg] flex items-center justify-center px-5">
      <form onSubmit={login} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[--brand-accent-soft] flex items-center justify-center mx-auto mb-4">
            <Lock size={22} className="text-[--brand-accent]" />
          </div>
          <h1 className="font-display italic text-3xl text-gradient">INSIGHTS</h1>
          <p className="text-sm text-[--brand-text-secondary] mt-2">Admin &middot; Sign in</p>
        </div>
        <div className="bg-[--brand-card] border border-[--brand-border] rounded-2xl p-6 shadow-elevated">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full border border-[--brand-border] rounded-xl px-4 py-3 text-sm bg-[--brand-bg] text-[--brand-text] outline-none focus:border-[--brand-accent] focus:ring-1 focus:ring-[--brand-accent]/20 transition-all"
          />
          {error && <p className="text-sm text-red-500 mt-3 font-medium">{error}</p>}
          <button
            type="submit"
            disabled={busy || !password}
            className="w-full mt-4 bg-[--brand-accent] text-white rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 hover:shadow-md hover:shadow-black/5"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}

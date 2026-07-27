'use client';
import { useState } from 'react';
import { Loader2, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setBusy(false);
        return;
      }
      // A hard redirect (not router.push) guarantees the browser has fully
      // applied the just-set session cookie before the next request for
      // /admin goes out. router.push here can occasionally race the cookie,
      // which made middleware bounce back to /login and left this button
      // stuck mid-spin since the login page never actually unmounts.
      window.location.href = '/admin';
    } catch {
      setError('Could not reach the server');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-[var(--brand-card)] border border-[var(--brand-border)] rounded-sm p-8">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-[var(--brand-text-secondary)]">
          <Lock size={12} /> Private · Studio
        </div>
        <h1 className="font-display text-4xl tracking-tight mt-3 mb-1">Admin sign in</h1>
        <p className="text-sm text-[var(--brand-text-secondary)] mb-6">Enter the studio password to continue.</p>

        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border border-[var(--brand-border)] rounded-sm px-4 py-3 text-sm outline-none focus:border-[var(--brand-accent)] transition-colors"
        />

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <button
          type="submit"
          disabled={busy || !password}
          className="w-full mt-5 bg-brand text-white rounded-sm px-4 py-3 text-xs font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : null}
          Sign in
        </button>
      </form>
    </div>
  );
}

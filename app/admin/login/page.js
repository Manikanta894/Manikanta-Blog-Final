'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const [step, setStep] = useState('password');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [challengeToken, setChallengeToken] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [secret, setSecret] = useState('');
  const [otpauthUri, setOtpauthUri] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const submitPassword = async (e) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true); setError('');
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setError(d.error || 'Invalid credentials'); return; }
    if (d.requiresTotp) { setChallengeToken(d.challengeToken); setStep('totp'); }
    else if (d.requiresSetup) { setSetupToken(d.setupToken); setStep('setup'); }
    else router.push('/admin');
  };

  const startSetup = async () => {
    setBusy(true); setError('');
    const r = await fetch('/api/admin/totp/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ setupToken }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setError(d.error || 'Setup failed'); return; }
    setSecret(d.secret); setOtpauthUri(d.otpauthUri); setVerifyToken(d.verifyToken);
  };

  const submitSetupVerify = async (e) => {
    e.preventDefault();
    if (!code) return;
    setBusy(true); setError('');
    const r = await fetch('/api/admin/totp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, verifyToken }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setError(d.error || 'Invalid code'); return; }
    setRecoveryCodes(d.recoveryCodes || []);
    setStep('recoveryCodes');
  };

  const submitTotp = async (e) => {
    e.preventDefault();
    if (!code) return;
    setBusy(true); setError('');
    const r = await fetch('/api/admin/login/totp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, challengeToken }) });
    setBusy(false);
    if (r.ok) router.push('/admin');
    else { const d = await r.json().catch(() => ({})); setError(d.error || 'Invalid credentials'); }
  };

  const submitRecovery = async (e) => {
    e.preventDefault();
    if (!recoveryCode) return;
    setBusy(true); setError('');
    const r = await fetch('/api/admin/recovery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, recoveryCode }) });
    setBusy(false);
    if (r.ok) router.push('/admin');
    else { const d = await r.json().catch(() => ({})); setError(d.error || 'Invalid credentials'); }
  };

  return (
    <div className="min-h-screen bg-[--brand-bg] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[--brand-accent-soft] flex items-center justify-center mx-auto mb-4">
            <Lock size={22} className="text-[--brand-accent]" />
          </div>
          <h1 className="font-display italic text-3xl text-gradient">NEXT DRAFT</h1>
          <p className="text-sm text-[--brand-text-secondary] mt-2">Admin &middot; Sign in</p>
        </div>
        <div className="bg-[--brand-card] border border-[--brand-border] rounded-2xl p-6 shadow-elevated">
          {step === 'password' && (
            <form onSubmit={submitPassword}>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoFocus
                className="w-full border border-[--brand-border] rounded-xl px-4 py-3 text-sm bg-[--brand-bg] text-[--brand-text] outline-none focus:border-[--brand-accent]" />
              {error && <p className="text-sm text-red-500 mt-3 font-medium">{error}</p>}
              <button type="submit" disabled={busy || !password} className="w-full mt-4 bg-[--brand-accent] text-white rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {busy ? <Loader2 size={16} className="animate-spin" /> : null} Sign in
              </button>
            </form>
          )}
          {step === 'totp' && (
            <form onSubmit={submitTotp}>
              <p className="text-sm text-[--brand-text-secondary] mb-3">Enter the 6-digit code from your authenticator app.</p>
              <input type="text" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" autoFocus
                className="w-full border border-[--brand-border] rounded-xl px-4 py-3 text-sm bg-[--brand-bg] text-[--brand-text] outline-none focus:border-[--brand-accent] tracking-widest text-center" />
              {error && <p className="text-sm text-red-500 mt-3 font-medium">{error}</p>}
              <button type="submit" disabled={busy || !code} className="w-full mt-4 bg-[--brand-accent] text-white rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {busy ? <Loader2 size={16} className="animate-spin" /> : null} Verify
              </button>
              <button type="button" onClick={() => setStep('recovery')} className="w-full mt-2 text-xs text-[--brand-text-secondary] hover:text-[--brand-accent]">Use a recovery code</button>
            </form>
          )}
          {step === 'recovery' && (
            <form onSubmit={submitRecovery}>
              <p className="text-sm text-[--brand-text-secondary] mb-3">Enter a one-time recovery code.</p>
              <input type="text" value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value)} placeholder="XXXXX-XXXXX" autoFocus
                className="w-full border border-[--brand-border] rounded-xl px-4 py-3 text-sm bg-[--brand-bg] text-[--brand-text] outline-none focus:border-[--brand-accent]" />
              {error && <p className="text-sm text-red-500 mt-3 font-medium">{error}</p>}
              <button type="submit" disabled={busy || !recoveryCode} className="w-full mt-4 bg-[--brand-accent] text-white rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {busy ? <Loader2 size={16} className="animate-spin" /> : null} Redeem
              </button>
            </form>
          )}
          {step === 'setup' && (
            <div>
              {!secret && (
                <button onClick={startSetup} disabled={busy} className="w-full bg-[--brand-accent] text-white rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Begin 2FA enrollment
                </button>
              )}
              {secret && (
                <form onSubmit={submitSetupVerify}>
                  <p className="text-sm text-[--brand-text-secondary] mb-2">Enter this key in your authenticator app:</p>
                  <div className="bg-[--brand-bg] border border-[--brand-border] rounded-xl p-3 font-mono text-xs break-all mb-3">{secret}</div>
                  {otpauthUri && <p className="text-[10px] text-[--brand-text-secondary] break-all mb-3">{otpauthUri}</p>}
                  <input type="text" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code to verify" autoFocus
                    className="w-full border border-[--brand-border] rounded-xl px-4 py-3 text-sm bg-[--brand-bg] text-[--brand-text] outline-none focus:border-[--brand-accent] tracking-widest text-center" />
                  {error && <p className="text-sm text-red-500 mt-3 font-medium">{error}</p>}
                  <button type="submit" disabled={busy || !code} className="w-full mt-4 bg-[--brand-accent] text-white rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                    {busy ? <Loader2 size={16} className="animate-spin" /> : null} Enable 2FA
                  </button>
                </form>
              )}
            </div>
          )}
          {step === 'recoveryCodes' && (
            <div>
              <p className="text-sm font-bold mb-2">Save these recovery codes (shown once):</p>
              <div className="bg-[--brand-bg] border border-[--brand-border] rounded-xl p-3 font-mono text-xs space-y-1 mb-4">
                {recoveryCodes.map((c) => <div key={c}>{c}</div>)}
              </div>
              <button onClick={() => router.push('/admin')} className="w-full bg-[--brand-accent] text-white rounded-xl px-4 py-3 text-sm font-bold">Continue to dashboard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
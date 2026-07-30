import nodemailer from 'nodemailer';

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  const user = process.env.ZOHO_EMAIL;
  const pass = process.env.ZOHO_APP_PASSWORD;

  if (!user || !pass) {
    console.warn('[email] ZOHO_EMAIL or ZOHO_APP_PASSWORD not set — email sending disabled.');
    return null;
  }

  _transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  return _transporter;
}

export async function sendEmail({ to, subject, html }) {
  const transporter = getTransporter();
  if (!transporter) return { ok: false, error: 'Email not configured' };

  try {
    const from = process.env.ZOHO_EMAIL;
    const info = await transporter.sendMail({ from, to, subject, html });
    return { ok: true, messageId: info.messageId };
  } catch (e) {
    console.error('[email] send failed:', e.message);
    return { ok: false, error: e.message };
  }
}

export async function sendNewsletter({ subject, html }) {
  const { db } = await import('@/packages/db');
  const subs = await db.subscribers.list();
  const emails = subs.filter((s) => s.status === 'active').map((s) => s.email);

  if (emails.length === 0) return { ok: false, error: 'No subscribers' };

  const results = [];
  for (const email of emails) {
    const r = await sendEmail({ to: email, subject, html });
    results.push({ email, ...r });
  }

  return { ok: true, sent: results.filter((r) => r.ok).length, total: emails.length, results };
}

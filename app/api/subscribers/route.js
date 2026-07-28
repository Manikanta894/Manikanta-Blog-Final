import { NextResponse } from 'next/server';
import { db } from '@/packages/db';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    await db.subscribers.subscribe(email);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

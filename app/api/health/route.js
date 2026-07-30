import { NextResponse } from 'next/server';
import { driverName } from '@/packages/db';
import { validateEnv } from '@/lib/env';

export async function GET() {
  const env = validateEnv();
  const emailConfigured = !!(process.env.ZOHO_EMAIL && process.env.ZOHO_APP_PASSWORD);

  return NextResponse.json({
    status: 'ok',
    driver: driverName,
    env: env.valid ? 'ok' : `missing: ${env.missing.join(', ')}`,
    email: emailConfigured ? 'configured' : 'not configured',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

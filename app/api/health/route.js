import { NextResponse } from 'next/server';
import { driverName } from '@/packages/db';
import { validateEnv } from '@/lib/env';

export async function GET() {
  const env = validateEnv();
  return NextResponse.json({
    status: 'ok',
    driver: driverName,
    env: env.valid ? 'ok' : `missing: ${env.missing.join(', ')}`,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

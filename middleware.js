import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidSession } from '@/lib/auth';

function timingSafeEqual(a, b) {
  const sa = String(a); const sb = String(b);
  if (sa.length !== sb.length) return false;
  let result = 0;
  for (let i = 0; i < sa.length; i++) result |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  return result === 0;
}

const SELF = "'self'";

function isPublicApi(pathname, method) {
  if (pathname.startsWith('/api/articles')) {
    if (method === 'GET') return true;
    if (method === 'POST') return true;
    return false;
  }
  if (pathname === '/api/search' && method === 'GET') return true;
  if (pathname === '/api/inbox/webhook' && method === 'POST') return true;
  if (pathname === '/api/admin/login' || pathname === '/api/admin/login/totp' || pathname === '/api/admin/recovery' || pathname === '/api/admin/totp/setup' || pathname === '/api/admin/totp/verify') return true;
  if (pathname === '/api/admin/logout') return true;
  if (pathname === '/api/health') return true;
  if (pathname === '/api/og' && method === 'GET') return true;
  if (pathname === '/api/media/file' && method === 'GET') return true;
  if (pathname === '/api/subscribers' && method === 'POST') return true;
  if (pathname === '/api/newsletter' && method === 'POST') return true;
  if (pathname === '/api/newsletter/send') return true;
  return false;
}

function addSecurityHeaders(res) {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('X-XSS-Protection', '0');
  res.headers.set(
    'Content-Security-Policy',
    `default-src ${SELF}; script-src ${SELF} 'unsafe-eval' 'unsafe-inline'; style-src ${SELF} 'unsafe-inline'; img-src ${SELF} data: blob: https:; font-src ${SELF} data:; connect-src ${SELF} https:; frame-ancestors 'none'; form-action ${SELF}`
  );
  return res;
}

function addHSTS(res) {
  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  return res;
}

const noStore = (res) => { res.headers.set('Cache-Control', 'no-store, must-revalidate'); return res; };

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  // Gate the admin UI
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const valid = await isValidSession(cookieValue);
    if (!valid) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return addHSTS(addSecurityHeaders(noStore(NextResponse.redirect(url))));
    }
    return addHSTS(addSecurityHeaders(noStore(NextResponse.next())));
  }

  // Gate the API surface
  if (pathname.startsWith('/api/')) {
    if (isPublicApi(pathname, method)) return addHSTS(addSecurityHeaders(NextResponse.next()));
    const validSession = await isValidSession(cookieValue);
    if (validSession) return addHSTS(addSecurityHeaders(noStore(NextResponse.next())));
    // Allow cron/automation callers presenting a valid bearer secret
    const authHeader = request.headers.get('authorization') || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const secrets = [process.env.ARTICLES_API_SECRET, process.env.CRON_SECRET].filter(Boolean);
    let bearerOk = false;
    for (const s of secrets) {
      if (timingSafeEqual(bearer, s)) { bearerOk = true; break; }
    }
    if (bearer && bearerOk) {
      // Only automation + newsletter-send endpoints accept bearer (cron) access
      if (pathname.startsWith('/api/automation/') || pathname === '/api/newsletter/send') {
        return addHSTS(addSecurityHeaders(noStore(NextResponse.next())));
      }
    }
    return addSecurityHeaders(noStore(NextResponse.json({ error: 'unauthorized' }, { status: 401 })));
  }

  // Security headers on all responses
  const response = NextResponse.next();
  return addHSTS(addSecurityHeaders(response));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};

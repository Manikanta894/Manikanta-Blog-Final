import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidSession } from '@/lib/auth';

const SELF = "'self'";

function isPublicApi(pathname, method) {
  if (pathname.startsWith('/api/articles')) {
    if (method === 'GET') return true;
    if (method === 'POST' && pathname === '/api/articles') return true;
    return false;
  }
  if (pathname === '/api/search' && method === 'GET') return true;
  if (pathname === '/api/inbox/webhook' && method === 'POST') return true;
  if (pathname === '/api/admin/login' || pathname === '/api/admin/logout') return true;
  if (pathname === '/api/health') return true;
  if (pathname === '/api/og' && method === 'GET') return true;
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
    if (!(await isValidSession(cookieValue))) {
      return addSecurityHeaders(noStore(NextResponse.json({ error: 'unauthorized' }, { status: 401 })));
    }
    return addHSTS(addSecurityHeaders(noStore(NextResponse.next())));
  }

  // Security headers on all responses
  const response = NextResponse.next();
  return addHSTS(addSecurityHeaders(response));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};

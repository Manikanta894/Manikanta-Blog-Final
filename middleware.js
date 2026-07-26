import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidSession } from '@/lib/auth';

// Endpoints n8n / the public site call directly and must stay reachable
// without an admin session:
//  - GET  /api/articles*      → homepage, section pages, article pages
//  - GET  /api/search         → site search
//  - POST /api/articles       → n8n publishing (gated separately by the
//                                optional ARTICLES_API_SECRET header, inside
//                                the route handler itself)
//  - POST /api/inbox/webhook  → n8n/Sheets ingestion (has its own secret
//                                check inside the route handler)
function isPublicApi(pathname, method) {
  if (pathname.startsWith('/api/articles')) {
    if (method === 'GET') return true;
    if (method === 'POST' && pathname === '/api/articles') return true; // n8n publish
    return false; // PATCH/PUT/DELETE on a specific article stays admin-only
  }
  if (pathname === '/api/search' && method === 'GET') return true;
  if (pathname === '/api/inbox/webhook' && method === 'POST') return true;
  if (pathname === '/api/admin/login' || pathname === '/api/admin/logout') return true;
  return false;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  // Gate the admin UI itself (everything under /admin except the login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!(await isValidSession(cookieValue))) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Gate the rest of the API surface (settings, subscribers, media, logs,
  // stats, rss sources, social queue, inbox list, ai-queue, journal,
  // seed-demo, automation, and article edit/delete) behind the same session.
  if (pathname.startsWith('/api/')) {
    if (isPublicApi(pathname, method)) return NextResponse.next();
    if (!(await isValidSession(cookieValue))) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};

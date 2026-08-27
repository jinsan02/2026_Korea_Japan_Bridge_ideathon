/**
 * Gate for the operator surfaces.
 *
 * The demo is meant to be handed out as a public URL, and three routes should
 * not travel with it: the settings screen, the environment readout (which says
 * whether a key is configured and which models are wired up), and the event-log
 * download. POST /api/logs stays open because every screen writes to it.
 *
 * This is a shared code, not authentication. It keeps the operator surfaces off
 * the path of someone clicking around a link, and that is all it does - anyone
 * holding the code holds all of it. The event log is the only data behind it,
 * and its schema already forbids storing anything personal, so the exposure
 * being prevented is "a stranger downloads the demo's click counts", not a
 * breach. Do not put anything here that needs real access control.
 *
 * With ADMIN_CODE unset: open in development, closed in production. An
 * unconfigured deployment therefore fails shut.
 */
import { NextResponse, type NextRequest } from 'next/server';

const COOKIE = 'ai-door-admin';

export const config = {
  matcher: ['/admin/:path*', '/api/status', '/api/logs'],
};

export function middleware(request: NextRequest): NextResponse {
  // Every screen posts events; only reading them back is restricted.
  if (request.nextUrl.pathname === '/api/logs' && request.method !== 'GET') {
    return NextResponse.next();
  }

  const code = (process.env.ADMIN_CODE ?? '').trim();
  if (code === '') {
    if (process.env.NODE_ENV !== 'production') return NextResponse.next();
    return deny(request);
  }

  if (request.cookies.get(COOKIE)?.value === code) return NextResponse.next();

  const supplied =
    request.nextUrl.searchParams.get('key') ?? request.headers.get('x-admin-code');
  if (supplied === code) {
    // Remember it so the operator does not have to keep the code in the URL,
    // where it would sit in history and in any screen recording of the demo.
    const url = request.nextUrl.clone();
    url.searchParams.delete('key');
    const response =
      request.nextUrl.searchParams.has('key') && request.method === 'GET'
        ? NextResponse.redirect(url)
        : NextResponse.next();
    response.cookies.set(COOKIE, code, {
      httpOnly: true,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    return response;
  }

  return deny(request);
}

function deny(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 404 });
  }
  return NextResponse.rewrite(new URL('/', request.url));
}

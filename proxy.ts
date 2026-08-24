import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyToken } from '@/lib/adminToken';

const MAINTENANCE_BYPASS = ['/coming-soon', '/admin', '/api', '/_next', '/favicon.ico', '/links'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Modo mantenimiento: redirigir todo excepto rutas de bypass
  if (process.env.MAINTENANCE_MODE === 'true') {
    const isBypassed = MAINTENANCE_BYPASS.some((p) => pathname.startsWith(p));
    if (!isBypassed) {
      return NextResponse.redirect(new URL('/coming-soon', request.url));
    }
  }

  // Dejar pasar la página de login del admin
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Proteger todas las rutas /admin/*
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE);
    const payload = await verifyToken(session?.value);

    if (payload?.stage !== 'authenticated') {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(ADMIN_SESSION_COOKIE);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

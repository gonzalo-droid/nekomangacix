import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_COOKIE = 'neko-admin-session';

const MAINTENANCE_BYPASS = ['/coming-soon', '/admin', '/api', '/_next', '/favicon.ico', '/links'];

export function proxy(request: NextRequest) {
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
    const session = request.cookies.get(ADMIN_COOKIE);

    if (!session?.value) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar que el valor del cookie coincide con el PIN configurado.
    // El fallback '1234' solo existe en desarrollo.
    const pin = process.env.ADMIN_PIN ?? (process.env.NODE_ENV !== 'production' ? '1234' : undefined);
    if (!pin || session.value !== pin) {
      const loginUrl = new URL('/admin/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(ADMIN_COOKIE);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

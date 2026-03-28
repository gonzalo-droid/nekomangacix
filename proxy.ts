import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_COOKIE = 'neko-admin-session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

    // Verificar que el valor del cookie coincide con el PIN configurado
    const pin = process.env.ADMIN_PIN || '1234';
    if (session.value !== pin) {
      const loginUrl = new URL('/admin/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(ADMIN_COOKIE);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

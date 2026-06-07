import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const BYPASS_PATHS = ['/coming-soon', '/admin', '/api', '/_next', '/favicon.ico']

export function middleware(request: NextRequest) {
  const maintenance = process.env.MAINTENANCE_MODE === 'true'
  if (!maintenance) return NextResponse.next()

  const { pathname } = request.nextUrl
  const isBypassed = BYPASS_PATHS.some((p) => pathname.startsWith(p))
  if (isBypassed) return NextResponse.next()

  return NextResponse.redirect(new URL('/coming-soon', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

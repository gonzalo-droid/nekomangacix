import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE = 'neko-admin-session';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 horas

export async function POST(req: NextRequest) {
  const { pin } = await req.json();

  const adminPin = process.env.ADMIN_PIN || '1234';

  if (!pin || pin !== adminPin) {
    return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, adminPin, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}

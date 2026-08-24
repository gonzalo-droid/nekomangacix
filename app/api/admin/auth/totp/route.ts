import { NextRequest, NextResponse } from 'next/server';
import * as OTPAuth from 'otpauth';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_PENDING_COOKIE,
  SESSION_MAX_AGE,
  isPinStageVerified,
  signSessionToken,
  checkRateLimit,
  registerFailedAttempt,
  resetRateLimit,
  getAdminSecurityState,
  enableTotp,
} from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  if (!(await isPinStageVerified())) {
    return NextResponse.json({ error: 'Volvé a ingresar el PIN.' }, { status: 401 });
  }

  const rateLimit = await checkRateLimit();
  if (rateLimit.locked) {
    return NextResponse.json(
      { error: 'Demasiados intentos fallidos. Probá de nuevo más tarde.', retryAfterSeconds: rateLimit.retryAfterSeconds },
      { status: 429 }
    );
  }

  const { code } = await req.json();
  const security = await getAdminSecurityState();

  if (!security.totp_secret || typeof code !== 'string') {
    await registerFailedAttempt();
    return NextResponse.json({ error: 'Código incorrecto' }, { status: 401 });
  }

  const totp = new OTPAuth.TOTP({
    issuer: 'Neko Manga Cix',
    label: 'Admin',
    secret: security.totp_secret,
  });

  // window: 1 tolera hasta 30s de desfasaje de reloj hacia atrás o adelante.
  const delta = totp.validate({ token: code.trim(), window: 1 });
  if (delta === null) {
    await registerFailedAttempt();
    return NextResponse.json({ error: 'Código incorrecto' }, { status: 401 });
  }

  if (!security.totp_enabled) {
    await enableTotp();
  }
  await resetRateLimit();

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, await signSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  response.cookies.delete(ADMIN_PENDING_COOKIE);
  return response;
}

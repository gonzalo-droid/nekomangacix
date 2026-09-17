import { NextRequest, NextResponse } from 'next/server';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_PENDING_COOKIE,
  PENDING_MAX_AGE,
  SESSION_MAX_AGE,
  getAdminPin,
  isTwoFactorBypassed,
  signPendingToken,
  signSessionToken,
  checkRateLimit,
  registerFailedAttempt,
  getAdminSecurityState,
  saveTotpSecret,
} from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  const adminPin = getAdminPin();

  // Sin ADMIN_REQUIRE_2FA el PIN alcanza y se emite la sesión directo. Corta
  // antes del rate-limit a propósito: así el login no depende de la tabla
  // `admin_security`, que no está versionada en `supabase/migrations/`.
  if (isTwoFactorBypassed()) {
    if (!adminPin || !pin || pin !== adminPin) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
    }
    const response = NextResponse.json({ pinOk: true, needsSetup: false, skipped2fa: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, await signSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
    return response;
  }

  const rateLimit = await checkRateLimit();
  if (rateLimit.locked) {
    return NextResponse.json(
      { error: 'Demasiados intentos fallidos. Probá de nuevo más tarde.', retryAfterSeconds: rateLimit.retryAfterSeconds },
      { status: 429 }
    );
  }

  if (!adminPin || !pin || pin !== adminPin) {
    await registerFailedAttempt();
    return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
  }

  const security = await getAdminSecurityState();

  let needsSetup = false;
  let otpauthUrl: string | undefined;
  let qrCodeDataUrl: string | undefined;
  let secret = security.totp_secret;

  if (!security.totp_enabled) {
    needsSetup = true;
    if (!secret) {
      secret = new OTPAuth.Secret({ size: 20 }).base32;
      await saveTotpSecret(secret);
    }
    const totp = new OTPAuth.TOTP({
      issuer: 'Neko Manga Cix',
      label: 'Admin',
      secret,
    });
    otpauthUrl = totp.toString();
    qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
  }

  const response = NextResponse.json({ pinOk: true, needsSetup, otpauthUrl, qrCodeDataUrl });
  response.cookies.set(ADMIN_PENDING_COOKIE, await signPendingToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: PENDING_MAX_AGE,
    path: '/',
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  response.cookies.delete(ADMIN_PENDING_COOKIE);
  return response;
}

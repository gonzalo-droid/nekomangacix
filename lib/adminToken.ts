/**
 * Firma/verificación de tokens de sesión admin con HMAC-SHA256 (Web Crypto).
 * Sin dependencias de Node ni de `next/headers`: corre igual en rutas API
 * (Node runtime) que en `proxy.ts` (Edge runtime).
 */

export const ADMIN_SESSION_COOKIE = 'neko-admin-session';
export const ADMIN_PENDING_COOKIE = 'neko-admin-pending';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas
export const PENDING_MAX_AGE = 60 * 5; // 5 minutos para completar el segundo factor

export type TokenPayload = { stage: 'pin-verified' | 'authenticated'; exp: number };

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET
    ?? (process.env.NODE_ENV !== 'production' ? 'dev-only-insecure-secret' : undefined);
  if (!secret) throw new Error('ADMIN_SESSION_SECRET no está configurado');
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(str.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function getHmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function signToken(payload: TokenPayload): Promise<string> {
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await getHmacKey();
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return `${body}.${toBase64Url(new Uint8Array(sigBuf))}`;
}

/** Verifica firma + expiración. `crypto.subtle.verify` compara en tiempo constante. */
export async function verifyToken(token: string | undefined | null): Promise<TokenPayload | null> {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;

  let sigBytes: Uint8Array;
  try {
    sigBytes = fromBase64Url(sig);
  } catch {
    return null;
  }

  const key = await getHmacKey();
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes.buffer as ArrayBuffer, new TextEncoder().encode(body));
  if (!valid) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as TokenPayload;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function signPendingToken(): Promise<string> {
  return signToken({ stage: 'pin-verified', exp: Date.now() + PENDING_MAX_AGE * 1000 });
}

export function signSessionToken(): Promise<string> {
  return signToken({ stage: 'authenticated', exp: Date.now() + SESSION_MAX_AGE * 1000 });
}

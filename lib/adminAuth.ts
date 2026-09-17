import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_PENDING_COOKIE,
  SESSION_MAX_AGE,
  PENDING_MAX_AGE,
  verifyToken,
  signPendingToken,
  signSessionToken,
} from '@/lib/adminToken';

export { ADMIN_SESSION_COOKIE, ADMIN_PENDING_COOKIE, SESSION_MAX_AGE, PENDING_MAX_AGE, signPendingToken, signSessionToken };

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60 * 15; // 15 minutos

/** PIN de admin; el fallback '1234' solo existe en desarrollo. */
export function getAdminPin(): string | undefined {
  return process.env.ADMIN_PIN ?? (process.env.NODE_ENV !== 'production' ? '1234' : undefined);
}

/**
 * El segundo factor es opt-in: sin `ADMIN_REQUIRE_2FA=true` el PIN alcanza para
 * entrar, que es el comportamiento previo al 2FA. Ese camino no consulta
 * `admin_security`, así que tampoco aplica rate-limiting — para volver a exigir
 * TOTP y recuperar el freno a fuerza bruta, setear la variable en Vercel.
 */
export function isTwoFactorBypassed(): boolean {
  return process.env.ADMIN_REQUIRE_2FA !== 'true';
}

export async function isPinStageVerified(): Promise<boolean> {
  const cookieStore = await cookies();
  const payload = await verifyToken(cookieStore.get(ADMIN_PENDING_COOKIE)?.value);
  return payload?.stage === 'pin-verified';
}

export async function verifyAdminRequest(): Promise<
  { ok: true } | { ok: false; response: NextResponse }
> {
  const cookieStore = await cookies();
  const payload = await verifyToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (payload?.stage !== 'authenticated') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
    };
  }
  return { ok: true };
}

// --- Rate limiting + estado de TOTP, persistidos en Supabase (admin_security, fila única) ---

type AdminSecurityRow = {
  totp_secret: string | null;
  totp_enabled: boolean;
  failed_attempts: number;
  locked_until: string | null;
};

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getAdminSecurityState(): Promise<AdminSecurityRow> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('admin_security')
    .select('totp_secret, totp_enabled, failed_attempts, locked_until')
    .eq('id', 1)
    .single();
  if (error || !data) {
    throw new Error(`No se pudo leer admin_security: ${error?.message}`);
  }
  return data as AdminSecurityRow;
}

export async function checkRateLimit(): Promise<{ locked: boolean; retryAfterSeconds?: number }> {
  const state = await getAdminSecurityState();
  if (state.locked_until && new Date(state.locked_until).getTime() > Date.now()) {
    const retryAfterSeconds = Math.ceil((new Date(state.locked_until).getTime() - Date.now()) / 1000);
    return { locked: true, retryAfterSeconds };
  }
  return { locked: false };
}

export async function registerFailedAttempt(): Promise<void> {
  const supabase = getClient();
  const state = await getAdminSecurityState();
  const attempts = state.failed_attempts + 1;
  const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS
    ? new Date(Date.now() + LOCKOUT_SECONDS * 1000).toISOString()
    : state.locked_until;

  await supabase
    .from('admin_security')
    .update({ failed_attempts: attempts, locked_until: lockedUntil, updated_at: new Date().toISOString() })
    .eq('id', 1);
}

export async function resetRateLimit(): Promise<void> {
  const supabase = getClient();
  await supabase
    .from('admin_security')
    .update({ failed_attempts: 0, locked_until: null, updated_at: new Date().toISOString() })
    .eq('id', 1);
}

export async function saveTotpSecret(secret: string): Promise<void> {
  const supabase = getClient();
  await supabase
    .from('admin_security')
    .update({ totp_secret: secret, updated_at: new Date().toISOString() })
    .eq('id', 1);
}

export async function enableTotp(): Promise<void> {
  const supabase = getClient();
  await supabase
    .from('admin_security')
    .update({ totp_enabled: true, updated_at: new Date().toISOString() })
    .eq('id', 1);
}

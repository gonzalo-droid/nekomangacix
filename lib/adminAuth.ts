import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/** PIN de admin; el fallback '1234' solo existe en desarrollo. */
export function getAdminPin(): string | undefined {
  return process.env.ADMIN_PIN ?? (process.env.NODE_ENV !== 'production' ? '1234' : undefined);
}

export async function verifyAdminRequest(): Promise<
  { ok: true } | { ok: false; response: NextResponse }
> {
  const cookieStore = await cookies();
  const session = cookieStore.get('neko-admin-session');
  const pin = getAdminPin();

  if (!pin || !session?.value || session.value !== pin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
    };
  }
  return { ok: true };
}

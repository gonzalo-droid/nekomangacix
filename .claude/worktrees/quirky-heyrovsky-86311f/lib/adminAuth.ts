import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function verifyAdminRequest(): Promise<
  { ok: true } | { ok: false; response: NextResponse }
> {
  const cookieStore = await cookies();
  const session = cookieStore.get('neko-admin-session');
  const pin = process.env.ADMIN_PIN ?? '1234';

  if (!session?.value || session.value !== pin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
    };
  }
  return { ok: true };
}

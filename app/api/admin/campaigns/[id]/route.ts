import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { campaignsOverlap, type DbCampaign } from '@/lib/campaigns';

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = (await req.json()) as Partial<DbCampaign>;
  const supabase = getClient();

  const { data: current, error: currentError } = await supabase
    .from('campaigns')
    .select('country_code, starts_at, ends_at, status')
    .eq('id', id)
    .single();

  if (currentError || !current) {
    return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
  }

  const finalStatus = body.status ?? current.status;

  if (finalStatus === 'open') {
    const countryCode = body.country_code ?? current.country_code;
    const startsAt = body.starts_at ?? current.starts_at;
    const endsAt = body.ends_at ?? current.ends_at;

    if (countryCode && startsAt && endsAt) {
      const { data: existingOpen } = await supabase
        .from('campaigns')
        .select('id, name, starts_at, ends_at')
        .eq('country_code', countryCode)
        .eq('status', 'open')
        .neq('id', id);

      const conflict = (existingOpen ?? []).find((c) =>
        campaignsOverlap({ startsAt, endsAt }, { startsAt: c.starts_at, endsAt: c.ends_at })
      );
      if (conflict) {
        return NextResponse.json(
          { error: `Se superpone con la campaña abierta "${conflict.name}" (${new Date(conflict.starts_at).toLocaleDateString('es-PE', { timeZone: 'UTC' })} – ${new Date(conflict.ends_at).toLocaleDateString('es-PE', { timeZone: 'UTC' })})` },
          { status: 400 }
        );
      }
    }
  }

  const { data, error } = await supabase
    .from('campaigns')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const supabase = getClient();

  const { error } = await supabase.from('campaigns').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

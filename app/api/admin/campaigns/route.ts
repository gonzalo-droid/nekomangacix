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

export async function GET() {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const supabase = getClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('starts_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const body = (await req.json()) as Partial<DbCampaign>;
  if (!body.name || !body.country_code || !body.starts_at || !body.ends_at) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  const supabase = getClient();
  const status = body.status ?? 'open';

  if (status === 'open') {
    const { data: existingOpen } = await supabase
      .from('campaigns')
      .select('id, name, starts_at, ends_at')
      .eq('country_code', body.country_code)
      .eq('status', 'open');

    const conflict = (existingOpen ?? []).find((c) =>
      campaignsOverlap(
        { startsAt: body.starts_at!, endsAt: body.ends_at! },
        { startsAt: c.starts_at, endsAt: c.ends_at }
      )
    );
    if (conflict) {
      return NextResponse.json(
        { error: `Se superpone con la campaña abierta "${conflict.name}" (${new Date(conflict.starts_at).toLocaleDateString('es-PE')} – ${new Date(conflict.ends_at).toLocaleDateString('es-PE')})` },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert({ ...body, status })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

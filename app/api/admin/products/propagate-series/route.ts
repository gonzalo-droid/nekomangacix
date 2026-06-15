import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';

const ALLOWED_FIELDS = ['editorial', 'price_pen', 'country_code', 'stock_status', 'description', 'author', 'is_active'] as const;
type AllowedField = typeof ALLOWED_FIELDS[number];

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { series, fields, values } = body as {
    series: string;
    fields: AllowedField[];
    values: Record<string, unknown>;
  };

  if (!series || !fields?.length || !values) {
    return NextResponse.json({ error: 'series, fields y values son requeridos' }, { status: 400 });
  }

  const invalidFields = fields.filter((f) => !ALLOWED_FIELDS.includes(f));
  if (invalidFields.length) {
    return NextResponse.json({ error: `Campos no permitidos: ${invalidFields.join(', ')}` }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  for (const field of fields) {
    if (values[field] !== undefined) update[field] = values[field];
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: 'No hay valores para propagar' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('products')
    .update(update)
    .eq('series', series)
    .select('id');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, updated: data?.length ?? 0 });
}

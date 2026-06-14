import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { generateSlug } from '@/lib/products';

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
    .from('series')
    .select('*, volumes:products(id, sku, slug, title, volume_number, price_pen, stock, stock_status, images, is_active)')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });

  const supabase = getClient();
  const slug = body.slug || generateSlug(body.name);

  const { data, error } = await supabase
    .from('series')
    .insert({ ...body, slug })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

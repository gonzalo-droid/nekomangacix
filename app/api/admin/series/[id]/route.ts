import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';
import type { SeriesSharedField } from '@/lib/series';
import { revalidatePath } from 'next/cache';

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
  const body = await req.json();
  const supabase = getClient();

  const { propagate, ...seriesData } = body as { propagate?: SeriesSharedField[]; [k: string]: unknown };

  // Update series itself
  const { data, error } = await supabase
    .from('series')
    .update(seriesData)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Propagate selected fields to all volumes
  if (propagate && propagate.length > 0) {
    const productPatch: Record<string, unknown> = {};
    for (const field of propagate) {
      if (field === 'price_pen' && seriesData.base_price_pen != null) {
        productPatch['price_pen'] = seriesData.base_price_pen;
      } else if (field in seriesData) {
        productPatch[field] = seriesData[field as keyof typeof seriesData];
      }
    }
    if (Object.keys(productPatch).length > 0) {
      await supabase.from('products').update(productPatch).eq('series_id', id);
    }
    revalidatePath('/products');
    revalidatePath('/');
  }

  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const supabase = getClient();

  // Unlink products before deleting (FK is set null on delete, but let's be explicit)
  await supabase.from('products').update({ series_id: null }).eq('series_id', id);
  const { error } = await supabase.from('series').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

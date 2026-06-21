import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getEditorialsForCountry } from '@/lib/constants/editorials';
import { isCountryCode } from '@/lib/constants/countries';


function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function revalidateProductCaches(slug?: string) {
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/sitemap.xml');
  if (slug) revalidatePath(`/products/${slug}`);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json();
  const supabase = getClient();

  const update: Record<string, unknown> = { ...body };
  if (typeof update.country_code === 'string' && isCountryCode(update.country_code)) {
    if (typeof update.editorial === 'string' && update.editorial) {
      const allowed = getEditorialsForCountry(update.country_code);
      if (!allowed.includes(update.editorial)) {
        return NextResponse.json(
          { error: `Editorial "${update.editorial}" no pertenece al país seleccionado` },
          { status: 400 },
        );
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('products')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateProductCaches(data?.slug as string | undefined);
  return NextResponse.json({ data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const supabase = getClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateProductCaches();
  return NextResponse.json({ success: true });
}

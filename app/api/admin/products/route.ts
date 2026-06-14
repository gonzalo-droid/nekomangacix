import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { generateSlug } from '@/lib/products';
import { getEditorialsForCountry } from '@/lib/constants/editorials';
import { isCountryCode } from '@/lib/constants/countries';

// Validates editorial belongs to the country's allowed list.
function normalizeProductRow(input: Record<string, unknown>): { row: Record<string, unknown>; error?: string } {
  const row = { ...input };
  const cc = row.country_code;
  if (typeof cc === 'string' && isCountryCode(cc)) {
    if (typeof row.editorial === 'string' && row.editorial) {
      const allowed = getEditorialsForCountry(cc);
      if (!allowed.includes(row.editorial)) {
        return { row, error: `Editorial "${row.editorial}" no pertenece al país seleccionado` };
      }
    }
  }
  return { row };
}

// Revalidar rutas estáticas que listan productos tras mutaciones
function revalidateProductCaches() {
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/sitemap.xml');
}

function generateSku(title: string): string {
  const acronym = title
    .replace(/vol\.?\s*\d+/gi, '')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join('');
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NCM-${acronym || 'PRD'}-${suffix}`;
}

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const pageSize = parseInt(searchParams.get('pageSize') ?? '20');
  const search   = searchParams.get('search') ?? '';
  const status   = searchParams.get('status') ?? '';
  const editorial = searchParams.get('editorial') ?? '';
  const active   = searchParams.get('active'); // 'true' | 'false' | ''
  const sortField = searchParams.get('sortField') ?? 'created_at';
  const sortOrder = searchParams.get('sortOrder') ?? 'desc';

  const supabase = getClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any).from('products').select('*', { count: 'exact' });

  if (search)    query = query.or(`title.ilike.%${search}%,sku.ilike.%${search}%,editorial.ilike.%${search}%`);
  if (status)    query = query.eq('stock_status', status);
  if (editorial) query = query.eq('editorial', editorial);
  if (active === 'true')  query = query.eq('is_active', true);
  if (active === 'false') query = query.eq('is_active', false);

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query
    .order(sortField, { ascending: sortOrder === 'asc' })
    .range(from, from + pageSize - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, count, page, pageSize });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const supabase = getClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (supabase as any).from('products');

  // Bulk insert — generate sku/slug for each row
  if (body.bulk === true && Array.isArray(body.products)) {
    const rows: Record<string, unknown>[] = [];
    for (const p of body.products as Record<string, unknown>[]) {
      const { row, error } = normalizeProductRow(p);
      if (error) return NextResponse.json({ error }, { status: 400 });
      rows.push({
        ...row,
        sku: generateSku(String(row.title ?? '')),
        slug: generateSlug(String(row.title ?? '')),
      });
    }
    const { data, error } = await db.insert(rows).select('id, sku');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateProductCaches();
    return NextResponse.json({ data, inserted: data?.length ?? 0 });
  }

  // Single create — generate sku/slug
  const { bulk: _bulk, products: _products, ...productData } = body;
  const { row: normalized, error: normErr } = normalizeProductRow(productData);
  if (normErr) return NextResponse.json({ error: normErr }, { status: 400 });
  const enriched = {
    ...normalized,
    sku: generateSku(String(normalized.title ?? '')),
    slug: generateSlug(String(normalized.title ?? '')),
  };
  const { data, error } = await db.insert(enriched).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateProductCaches();
  return NextResponse.json({ data });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!q || q.length < 3) return NextResponse.json([]);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data } = await supabase
    .from('products')
    .select('id, slug, title, editorial, price_pen, stock_status, images, country_code')
    .or(`title.ilike.%${q}%,editorial.ilike.%${q}%,author.ilike.%${q}%`)
    .eq('is_active', true)
    .limit(6);

  return NextResponse.json(data ?? []);
}

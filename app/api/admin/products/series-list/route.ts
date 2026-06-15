import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function GET() {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('products')
    .select('series')
    .not('series', 'is', null)
    .neq('series', '');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const series = Array.from(new Set((data ?? []).map((r) => r.series as string))).sort();
  return NextResponse.json({ series });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { dbRowToPromotion, validateCoupon, type DbPromotion } from '@/lib/promotions';

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: 'Código requerido' }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('type', 'coupon')
    .eq('coupon_code', code.trim().toUpperCase());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const promotions = (data as DbPromotion[]).map(dbRowToPromotion);
  const matched = validateCoupon(code, promotions);

  if (!matched) return NextResponse.json({ error: 'Cupón inválido o expirado' }, { status: 404 });
  return NextResponse.json({ data: matched });
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { calculateCartTotals } from '@/lib/domain/cart/calculate';
import { dbRowToPromotion, validateCoupon, applyCouponDiscount, type DbPromotion } from '@/lib/promotions';
import { getActiveCampaignForCountry } from '@/lib/campaigns';
import type { StockStatus } from '@/lib/products';
import type { CartItem } from '@/context/CartContext';
import type { CountryCode } from '@/lib/constants/countries';

interface OrderItemInput {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  stockStatus?: StockStatus;
}

interface CreateOrderBody {
  items: OrderItemInput[];
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  couponCode?: string;
  shippingCost?: number;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreateOrderBody;
  const { items, paymentMethod, customerName, customerPhone, customerAddress, couponCode } = body;

  if (!items?.length || !paymentMethod) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('tu-proyecto')) {
    return NextResponse.json({ success: true, orderId: null, fallback: true });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();

  // Precios y estados reales desde la DB — no confiamos en los del cliente
  const productIds = items.map((i) => i.productId).filter(Boolean);
  const priceMap = new Map<string, { price: number; stockStatus: StockStatus; title: string; countryCode: CountryCode }>();
  if (productIds.length > 0) {
    const { data: dbProducts } = await supabase
      .from('products')
      .select('id, title, price_pen, stock_status, country_code')
      .in('id', productIds);
    for (const p of dbProducts ?? []) {
      priceMap.set(p.id as string, {
        price: Number(p.price_pen),
        stockStatus: p.stock_status as StockStatus,
        title: p.title as string,
        countryCode: p.country_code as CountryCode,
      });
    }
  }

  // Determinar elegibilidad primera compra en servidor (no confiamos en el cliente)
  let isFirstPurchase = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_used_first_purchase_discount')
      .eq('id', user.id)
      .single();
    isFirstPurchase = !!profile && !profile.has_used_first_purchase_discount;
  }

  const cartItems: CartItem[] = items.map((i) => {
    const db = priceMap.get(i.productId);
    return {
      productId: i.productId,
      title: db?.title ?? i.title,
      price: db?.price ?? i.price,
      quantity: i.quantity,
      editorial: '',
      stockStatus: db?.stockStatus ?? i.stockStatus,
    };
  });

  // Resolver campaña vigente para cada ítem de preventa. Si un país no tiene
  // ninguna campaña abierta ahora mismo, se rechaza el pedido completo con un
  // mensaje claro en vez de crear un ítem de preventa "huérfano".
  const campaignIdByProductId = new Map<string, string | null>();
  for (const item of cartItems) {
    if (item.stockStatus !== 'preorder') continue;
    const db = priceMap.get(item.productId);
    if (!db) continue;
    const campaign = await getActiveCampaignForCountry(db.countryCode, supabase);
    if (!campaign) {
      return NextResponse.json(
        { error: `No hay preventa abierta para ${db.countryCode} en este momento (producto: ${item.title})` },
        { status: 400 }
      );
    }
    campaignIdByProductId.set(item.productId, campaign.id);
  }

  const totals = calculateCartTotals({ items: cartItems, isFirstPurchase });

  // Validar cupón en servidor y calcular su descuento sobre el subtotal
  let couponDiscount = 0;
  let couponPromoId: string | null = null;
  if (couponCode) {
    const { data: promoRows } = await supabase
      .from('promotions')
      .select('*')
      .eq('type', 'coupon')
      .eq('coupon_code', couponCode.trim().toUpperCase());
    const matched = validateCoupon(
      couponCode,
      ((promoRows ?? []) as DbPromotion[]).map(dbRowToPromotion)
    );
    if (matched) {
      couponDiscount = Math.round((totals.subtotal - applyCouponDiscount(totals.subtotal, matched)) * 100) / 100;
      couponPromoId = matched.id;
    }
  }

  const paymentType = totals.preorderSubtotal > 0 ? 'split_preorder' : 'full';

  // Postgres exige que una fila insertada con RETURNING también pase la
  // policy de SELECT ("Users see own orders": auth.uid() = user_id). Para un
  // pedido de invitado user_id es null, así que con la anon key el RETURNING
  // siempre falla con "violates row-level security policy". Usamos service
  // role para este insert (igual que el incremento de uso de cupón más abajo).
  const admin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: user?.id ?? null,
      status: 'pending_deposit',
      payment_type: paymentType,
      subtotal_pen: totals.subtotal,
      discount_pen: Math.round((totals.discount + couponDiscount) * 100) / 100,
      shipping_cost: totals.shipping,
      deposit_pen: totals.preorderDeposit,
      balance_pen: totals.balanceDue,
      total_pen: Math.max(0, Math.round((totals.totalToPayNow - couponDiscount) * 100) / 100),
      payment_method: paymentMethod,
      customer_name: customerName || user?.user_metadata?.full_name || null,
      customer_phone: customerPhone || null,
      shipping_address: customerAddress ? { address: customerAddress } : null,
      notes: couponPromoId ? `Cupón: ${couponCode?.toUpperCase()} (-S/ ${couponDiscount.toFixed(2)})` : null,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('[orders] Error creating order:', orderError);
    return NextResponse.json({ success: true, orderId: null, fallback: true });
  }

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId || null,
    quantity: item.quantity,
    unit_price: item.price,
    title: item.title,
    item_type: item.stockStatus === 'preorder' ? 'preorder' : 'stock',
    campaign_id: campaignIdByProductId.get(item.productId) ?? null,
  }));

  await supabase.from('order_items').insert(orderItems);

  if (totals.appliedFirstPurchaseDiscount && user) {
    await supabase
      .from('profiles')
      .update({ has_used_first_purchase_discount: true })
      .eq('id', user.id);
  }

  // Incrementar uso del cupón (para que max_uses tenga efecto).
  // RLS bloquea updates con anon key, así que usamos service role.
  if (couponPromoId) {
    const { data: promo } = await admin
      .from('promotions')
      .select('uses_count')
      .eq('id', couponPromoId)
      .single();
    if (promo) {
      await admin
        .from('promotions')
        .update({ uses_count: (promo.uses_count ?? 0) + 1 })
        .eq('id', couponPromoId);
    }
  }

  return NextResponse.json({ success: true, orderId: order.id });
}

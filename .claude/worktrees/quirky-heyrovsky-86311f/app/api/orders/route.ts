import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { calculateCartTotals } from '@/lib/domain/cart/calculate';
import type { StockStatus } from '@/lib/products';
import type { CartItem } from '@/context/CartContext';

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
  shippingCost?: number;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreateOrderBody;
  const { items, paymentMethod, customerName, customerPhone } = body;

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

  const cartItems: CartItem[] = items.map((i) => ({
    productId: i.productId,
    title: i.title,
    price: i.price,
    quantity: i.quantity,
    editorial: '',
    stockStatus: i.stockStatus,
  }));

  const totals = calculateCartTotals({ items: cartItems, isFirstPurchase });

  const paymentType = totals.preorderSubtotal > 0 ? 'split_preorder' : 'full';

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user?.id ?? null,
      status: 'pending_deposit',
      payment_type: paymentType,
      subtotal_pen: totals.subtotal,
      discount_pen: totals.discount,
      shipping_cost: totals.shipping,
      deposit_pen: totals.preorderDeposit,
      balance_pen: totals.balanceDue,
      total_pen: totals.totalToPayNow,
      payment_method: paymentMethod,
      customer_name: customerName || user?.user_metadata?.full_name || null,
      customer_phone: customerPhone || null,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('[orders] Error creating order:', orderError);
    return NextResponse.json({ success: true, orderId: null, fallback: true });
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId || null,
    quantity: item.quantity,
    unit_price: item.price,
    title: item.title,
    item_type: item.stockStatus === 'preorder' ? 'preorder' : 'stock',
  }));

  await supabase.from('order_items').insert(orderItems);

  if (totals.appliedFirstPurchaseDiscount && user) {
    await supabase
      .from('profiles')
      .update({ has_used_first_purchase_discount: true })
      .eq('id', user.id);
  }

  return NextResponse.json({ success: true, orderId: order.id });
}

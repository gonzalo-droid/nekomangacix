import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface OrderItemInput {
  productId: string;
  title: string;
  quantity: number;
  price: number;
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
  const { items, paymentMethod, customerName, customerPhone, shippingCost = 15 } = body;

  if (!items?.length || !paymentMethod) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  // Verificar si Supabase está configurado
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('tu-proyecto')) {
    // Supabase no configurado: solo confirmamos sin guardar
    return NextResponse.json({ success: true, orderId: null, fallback: true });
  }

  // Cliente sin tipo genérico para evitar conflictos de versión con Supabase JS v2.100
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + shippingCost;

  // Crear la orden
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user?.id ?? null,
      total_pen: total,
      shipping_cost: shippingCost,
      payment_method: paymentMethod,
      customer_name: customerName || user?.user_metadata?.full_name || null,
      customer_phone: customerPhone || null,
      status: 'pending',
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('[orders] Error creating order:', orderError);
    // Si falla DB, dejamos continuar igual (WhatsApp es el flujo principal)
    return NextResponse.json({ success: true, orderId: null, fallback: true });
  }

  // Insertar items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId || null,
    quantity: item.quantity,
    unit_price: item.price,
    title: item.title,
  }));

  await supabase.from('order_items').insert(orderItems);

  return NextResponse.json({ success: true, orderId: order.id });
}

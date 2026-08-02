import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { calculateCartTotals } from '@/lib/domain/cart/calculate';
import { getActiveCampaignForCountry } from '@/lib/campaigns';
import { isOrderState } from '@/lib/constants/orderStates';
import type { StockStatus } from '@/lib/products';
import type { CartItem } from '@/context/CartContext';
import type { CountryCode } from '@/lib/constants/countries';

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface ManualOrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateManualOrderBody {
  items: ManualOrderItemInput[];
  status: string;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  overrideStock?: boolean;
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const body = (await req.json()) as CreateManualOrderBody;
  const { items, status, paymentMethod, customerName, customerPhone, overrideStock } = body;

  if (!items?.length || !paymentMethod) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }
  if (!isOrderState(status)) {
    return NextResponse.json({ error: 'Estado inicial inválido' }, { status: 400 });
  }

  const supabase = getClient();

  const productIds = items.map((i) => i.productId);
  const { data: dbProducts, error: productsError } = await supabase
    .from('products')
    .select('id, title, price_pen, stock, stock_status, country_code')
    .in('id', productIds);

  if (productsError) return NextResponse.json({ error: productsError.message }, { status: 500 });

  const productMap = new Map((dbProducts ?? []).map((p) => [p.id as string, p]));

  const cartItems: CartItem[] = [];
  const campaignIdByProductId = new Map<string, string | null>();

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: `Producto no encontrado: ${item.productId}` }, { status: 400 });
    }
    const stockStatus = product.stock_status as StockStatus;

    if (stockStatus === 'in_stock' && Number(product.stock) < item.quantity && !overrideStock) {
      return NextResponse.json(
        { error: `Sin stock suficiente para "${product.title}" (disponible: ${product.stock})` },
        { status: 400 }
      );
    }

    if (stockStatus === 'preorder') {
      const campaign = await getActiveCampaignForCountry(product.country_code as CountryCode, supabase);
      if (!campaign) {
        return NextResponse.json(
          { error: `No hay preventa abierta para ${product.country_code} en este momento (producto: ${product.title})` },
          { status: 400 }
        );
      }
      campaignIdByProductId.set(item.productId, campaign.id);
    }

    cartItems.push({
      productId: item.productId,
      title: product.title as string,
      price: Number(product.price_pen),
      quantity: item.quantity,
      editorial: '',
      stockStatus,
    });
  }

  const totals = calculateCartTotals({ items: cartItems, isFirstPurchase: false });
  const paymentType = totals.preorderSubtotal > 0 ? 'split_preorder' : 'full';

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: null,
      status,
      payment_type: paymentType,
      subtotal_pen: totals.subtotal,
      discount_pen: totals.discount,
      shipping_cost: totals.shipping,
      deposit_pen: totals.preorderDeposit,
      balance_pen: totals.balanceDue,
      total_pen: totals.totalToPayNow,
      payment_method: paymentMethod,
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      notes: 'Carga manual (venta presencial)',
    })
    .select('id')
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? 'Error al crear el pedido' }, { status: 500 });
  }

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.price,
    title: item.title,
    item_type: item.stockStatus === 'preorder' ? 'preorder' : 'stock',
    campaign_id: campaignIdByProductId.get(item.productId) ?? null,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

  return NextResponse.json({ success: true, orderId: order.id });
}

import { createSupabaseServerClient } from '@/core/supabase/server';
import type { Metadata } from 'next';
import type { OrderStatus } from '@/types/database.types';
import { isOrderState, type OrderState } from '@/lib/constants/orderStates';
import OrderStatusBadge from '@/components/order/OrderStatusBadge';
import OrderStatusUpdater from './OrderStatusUpdater';
import Link from 'next/link';
import { ChevronLeft, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin — Pedidos',
  robots: { index: false },
};

type OrderItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  item_type: string | null;
  estimated_arrival: string | null;
};

type OrderRow = {
  id: string;
  status: OrderStatus;
  payment_type: string | null;
  total_pen: number;
  subtotal_pen: number | null;
  discount_pen: number | null;
  deposit_pen: number | null;
  balance_pen: number | null;
  shipping_cost: number;
  estimated_arrival: string | null;
  payment_proof_url: string | null;
  payment_proof_confirmed_at: string | null;
  payment_method: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
};

function normalize(status: OrderStatus): OrderState {
  if (status === 'pending') return 'pending_deposit';
  if (status === 'paid') return 'confirmed';
  if (isOrderState(status)) return status;
  return 'pending_deposit';
}

const SUMMARY_STATES: OrderState[] = [
  'pending_deposit',
  'confirmed',
  'in_transit_to_pe',
  'available',
  'pending_balance',
  'shipped',
  'delivered',
  'cancelled',
];

const SUMMARY_LABELS: Record<OrderState, string> = {
  pending_deposit: 'Pago pendiente',
  confirmed: 'Confirmado',
  in_transit_to_pe: 'En camino',
  available: 'Disponible',
  pending_balance: 'Saldo pendiente',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export default async function AdminOrdersPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseNotConfigured = !supabaseUrl || supabaseUrl.includes('tu-proyecto');

  if (supabaseNotConfigured) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-8">
          <p className="text-amber-800 dark:text-amber-300 font-semibold mb-2">Supabase no configurado</p>
          <p className="text-amber-700 dark:text-amber-400 text-sm">
            Agrega las variables de entorno de Supabase para gestionar pedidos.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(
      'id, status, payment_type, total_pen, subtotal_pen, discount_pen, deposit_pen, balance_pen, shipping_cost, estimated_arrival, payment_proof_url, payment_proof_confirmed_at, payment_method, customer_name, customer_phone, notes, created_at, order_items(id, title, quantity, unit_price, item_type, estimated_arrival)',
    )
    .order('created_at', { ascending: false })
    .limit(100)
    .returns<OrderRow[]>();

  const statusCounts = (orders ?? []).reduce<Record<string, number>>((acc, o) => {
    const n = normalize(o.status);
    acc[n] = (acc[n] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin" className="flex items-center text-[#2b496d] dark:text-[#5a7a9e] hover:underline mb-4 text-sm">
          <ChevronLeft size={16} />
          Volver al Admin
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Pedidos</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {orders?.length ?? 0} pedidos totales
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
        {SUMMARY_STATES.map((s) => (
          <div key={s} className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts[s] ?? 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{SUMMARY_LABELS[s]}</p>
          </div>
        ))}
      </div>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <p className="text-gray-500 dark:text-gray-400">No hay pedidos registrados aún.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const normalized = normalize(order.status);
            const isPreorder = order.payment_type === 'preorder' || order.order_items?.some((i) => i.item_type === 'preorder');
            const hasDiscount = (order.discount_pen ?? 0) > 0;
            const hasDeposit = (order.deposit_pen ?? 0) > 0;
            const hasBalance = (order.balance_pen ?? 0) > 0;
            return (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-start sm:justify-between mb-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleString('es-PE')}
                    </p>
                    {order.customer_name && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 break-words">
                        {order.customer_name}
                        {order.customer_phone && ` · ${order.customer_phone}`}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <OrderStatusBadge state={normalized} />
                    <span className="font-bold text-[#2b496d] dark:text-[#5a7a9e]">
                      S/ {order.total_pen.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {order.subtotal_pen != null && (
                    <div>
                      <span className="text-gray-400 dark:text-gray-500">Subtotal:</span>{' '}
                      <span className="font-medium text-gray-700 dark:text-gray-300">S/ {order.subtotal_pen.toFixed(2)}</span>
                    </div>
                  )}
                  {hasDiscount && (
                    <div>
                      <span className="text-gray-400 dark:text-gray-500">Descuento:</span>{' '}
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">- S/ {(order.discount_pen ?? 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 dark:text-gray-500">Envío:</span>{' '}
                    <span className="font-medium text-gray-700 dark:text-gray-300">S/ {order.shipping_cost.toFixed(2)}</span>
                  </div>
                  {isPreorder && hasDeposit && (
                    <div>
                      <span className="text-gray-400 dark:text-gray-500">Depósito:</span>{' '}
                      <span className="font-medium text-gray-700 dark:text-gray-300">S/ {(order.deposit_pen ?? 0).toFixed(2)}</span>
                    </div>
                  )}
                  {hasBalance && (
                    <div>
                      <span className="text-gray-400 dark:text-gray-500">Saldo:</span>{' '}
                      <span className="font-medium text-orange-700 dark:text-orange-400">S/ {(order.balance_pen ?? 0).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {order.order_items?.length > 0 && (
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5 mb-3 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="flex flex-wrap gap-2 items-baseline">
                        <span>
                          {item.title} × {item.quantity} — S/ {(item.unit_price * item.quantity).toFixed(2)}
                        </span>
                        {item.item_type === 'preorder' && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                            Preventa
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center sm:justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-3">
                    <span>Pago: {order.payment_method ?? '—'}</span>
                    {order.payment_type && <span>Tipo: {order.payment_type}</span>}
                    {order.payment_proof_url && (
                      <a
                        href={order.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#2b496d] dark:text-[#5a7a9e] hover:underline font-medium"
                      >
                        Ver comprobante <ExternalLink size={12} />
                      </a>
                    )}
                    {order.payment_proof_confirmed_at && (
                      <span className="text-emerald-600 dark:text-emerald-400">✓ Confirmado</span>
                    )}
                  </div>
                  <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

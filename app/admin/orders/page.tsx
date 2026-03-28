import { createSupabaseServerClient } from '@/core/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import type { OrderStatus } from '@/types/database.types';
import OrderStatusUpdater from './OrderStatusUpdater';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin — Pedidos',
  robots: { index: false },
};

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
  pending:   { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  paid:      { label: 'Pagado',     color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
  shipped:   { label: 'Enviado',    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  delivered: { label: 'Entregado',  color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelado',  color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

type OrderRow = {
  id: string;
  status: string;
  total_pen: number;
  shipping_cost: number;
  payment_method: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  created_at: string;
  order_items: { id: string; title: string; quantity: number; unit_price: number }[];
};

export default async function AdminOrdersPage() {
  // La ruta ya está protegida por proxy.ts (PIN admin)
  // Verificamos Supabase configurado
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
    .select('id, status, total_pen, shipping_cost, payment_method, customer_name, customer_phone, created_at, order_items(id, title, quantity, unit_price)')
    .order('created_at', { ascending: false })
    .limit(100)
    .returns<OrderRow[]>();

  const statusCounts = (orders ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
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

      {/* Status summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
          <div key={s} className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts[s] ?? 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{STATUS_LABELS[s].label}</p>
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
            const statusInfo = STATUS_LABELS[order.status as OrderStatus] ?? STATUS_LABELS.pending;
            return (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                <div className="flex flex-wrap gap-4 items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleString('es-PE')}
                    </p>
                    {order.customer_name && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        👤 {order.customer_name}
                        {order.customer_phone && ` · ${order.customer_phone}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <span className="font-bold text-[#2b496d] dark:text-[#5a7a9e]">
                      S/ {order.total_pen.toFixed(2)}
                    </span>
                  </div>
                </div>

                {order.order_items?.length > 0 && (
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5 mb-3 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                    {order.order_items.map((item) => (
                      <li key={item.id}>
                        {item.title} × {item.quantity} — S/ {(item.unit_price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Pago: {order.payment_method ?? '—'} · Envío: S/ {order.shipping_cost.toFixed(2)}
                  </p>
                  <OrderStatusUpdater orderId={order.id} currentStatus={order.status as OrderStatus} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

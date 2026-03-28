import { createSupabaseServerClient } from '@/core/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import type { OrderStatus } from '@/types/database.types';

export const metadata: Metadata = {
  title: 'Mis Pedidos',
  robots: { index: false },
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock size={14} /> },
  confirmed: { label: 'Confirmado',  color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',       icon: <CheckCircle size={14} /> },
  paid:      { label: 'Pagado',      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: <CheckCircle size={14} /> },
  shipped:   { label: 'Enviado',     color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: <Truck size={14} /> },
  delivered: { label: 'Entregado',   color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',   icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Cancelado',   color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',           icon: <XCircle size={14} /> },
};

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/orders');
  }

  type OrderRow = {
    id: string;
    status: string;
    total_pen: number;
    shipping_cost: number;
    payment_method: string | null;
    created_at: string;
    order_items: { id: string; title: string; quantity: number; unit_price: number }[];
  };

  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total_pen, shipping_cost, payment_method, created_at, order_items(id, quantity, unit_price, title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .returns<OrderRow[]>();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Mis Pedidos</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tienes pedidos aún</p>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Cuando realices un pedido, aparecerá aquí.</p>
          <a
            href="/products"
            className="inline-block bg-[#2b496d] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#1e3550] transition-colors text-sm"
          >
            Ver Productos
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: OrderRow) => {
            const status = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG.pending;
            const itemCount = order.order_items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

            return (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex flex-wrap gap-3 items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('es-PE', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                {order.order_items && order.order_items.length > 0 && (
                  <ul className="space-y-1 mb-4">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                        <span>{item.title} × {item.quantity}</span>
                        <span>S/ {(item.unit_price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} · {order.payment_method ?? 'Sin método'}
                  </span>
                  <span className="font-bold text-[#2b496d] dark:text-[#5a7a9e]">
                    S/ {order.total_pen.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFavorites } from '@/context/FavoritesContext';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import ProfileForm from './ProfileForm';
import type { Profile, OrderStatus } from '@/types/database.types';
import {
  User,
  Heart,
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react';

type OrderRow = {
  id: string;
  status: string;
  total_pen: number;
  shipping_cost: number;
  payment_method: string | null;
  created_at: string;
  order_items: { id: string; title: string; quantity: number; unit_price: number }[];
};

type Tab = 'data' | 'favorites' | 'orders';

interface Props {
  user: { id: string; email: string; email_confirmed_at: string | null };
  profile: Profile;
  orders: OrderRow[];
  initialTab: Tab;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Procesando', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock size={14} /> },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',       icon: <CheckCircle size={14} /> },
  paid:      { label: 'Pagado',     color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: <CheckCircle size={14} /> },
  shipped:   { label: 'Enviado',    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: <Truck size={14} /> },
  delivered: { label: 'Entregado',  color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',   icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Cancelado',  color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',           icon: <XCircle size={14} /> },
};

export default function ProfileTabs({ user, profile, orders, initialTab }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(initialTab);

  const displayName = profile.full_name || user.email.split('@')[0] || 'Usuario';
  const initials = displayName.slice(0, 2).toUpperCase();

  const switchTab = (next: Tab) => {
    setTab(next);
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (next === 'data') params.delete('tab');
    else params.set('tab', next);
    const qs = params.toString();
    router.replace(`/profile${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number }>; count?: number }[] = [
    { id: 'data', label: 'Mis Datos', icon: User },
    { id: 'favorites', label: 'Mis Favoritos', icon: Heart },
    { id: 'orders', label: 'Mis Pedidos', icon: ShoppingBag, count: orders.length },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Cabecera */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 bg-gradient-to-br from-[#ec4899] to-[#06b6d4] text-white rounded-full flex items-center justify-center text-lg font-extrabold shadow-lg shadow-[#ec4899]/25">
            {initials}
          </div>
          <span
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ec4899] to-[#06b6d4] opacity-40 blur-lg -z-10"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ec4899] mb-0.5">
            {'// Mi cuenta'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white truncate">
            Hola, <span className="text-neko-gradient">{displayName}</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
        </div>
        {profile.role === 'admin' && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white px-2.5 py-1 rounded-full flex-shrink-0 shadow-md">
            Admin
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden mb-6">
        <nav
          className="flex border-b border-gray-200 dark:border-white/5 overflow-x-auto scrollbar-thin"
          aria-label="Secciones del perfil"
        >
          {tabs.map(({ id, label, icon: Icon, count }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => switchTab(id)}
                className={`relative flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'text-[#ec4899]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                aria-selected={active}
                role="tab"
              >
                <Icon size={16} />
                <span>{label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      active
                        ? 'bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white'
                        : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
                {active && (
                  <span
                    className="absolute left-4 right-4 bottom-0 h-0.5 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Contenido */}
        <div className="p-6">
          {tab === 'data' && <DataTab user={user} profile={profile} />}
          {tab === 'favorites' && <FavoritesTab />}
          {tab === 'orders' && <OrdersTab orders={orders} />}
        </div>
      </div>
    </div>
  );
}

function DataTab({ user, profile }: { user: Props['user']; profile: Profile }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          Datos personales y dirección
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Esta información se usará para coordinar tus envíos.
        </p>
        <ProfileForm profile={profile} />
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Correo electrónico</h3>
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
          <div>
            <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {user.email_confirmed_at ? '✓ Verificado' : '⚠ Sin verificar'}
            </p>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">No editable</span>
        </div>
      </div>
    </div>
  );
}

function FavoritesTab() {
  const { favorites, removeFromFavorites } = useFavorites();
  const { products, isLoading } = useProducts();

  const favoriteProducts = useMemo(
    () => products.filter((p) => favorites.includes(p.id)),
    [products, favorites]
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando tus favoritos...</p>
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Aún no tienes favoritos
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Guarda los mangas que te interesan para encontrarlos rápido después.
        </p>
        <Link
          href="/products"
          className="inline-block bg-[#2b496d] text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-[#1e3550] transition-colors text-sm"
        >
          Explorar productos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        Tienes {favoriteProducts.length} {favoriteProducts.length === 1 ? 'producto guardado' : 'productos guardados'}.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {favoriteProducts.map((p) => (
          <ProductCard
            key={p.id}
            {...p}
            variant="minimal"
            onRemove={removeFromFavorites}
          />
        ))}
      </div>
    </div>
  );
}

function OrdersTab({ orders }: { orders: OrderRow[] }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Aún no tienes pedidos
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Cuando realices una compra, verás aquí el estado de tus pedidos.
        </p>
        <Link
          href="/products"
          className="inline-block bg-[#2b496d] text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-[#1e3550] transition-colors text-sm"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const status = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG.pending;
        const itemCount = order.order_items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

        return (
          <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-[#2b496d] dark:hover:border-[#5a7a9e] transition-colors">
            <div className="flex flex-wrap gap-3 items-start justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  Pedido #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
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
              <ul className="space-y-1 mb-3 pl-1">
                {order.order_items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span className="truncate pr-3">{item.title} × {item.quantity}</span>
                    <span className="font-medium flex-shrink-0">S/ {(item.unit_price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                {order.payment_method && ` · ${order.payment_method}`}
              </span>
              <span className="font-bold text-[#2b496d] dark:text-[#5a7a9e]">
                S/ {order.total_pen.toFixed(2)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

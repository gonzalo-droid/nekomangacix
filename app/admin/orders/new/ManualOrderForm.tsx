'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import ProductPicker, { type PickableProduct } from './ProductPicker';
import { ORDER_STATES, ORDER_STATE_INFO, type OrderState } from '@/lib/constants/orderStates';
import { calculateCartTotals } from '@/lib/domain/cart/calculate';
import type { CartItem } from '@/context/CartContext';
import type { StockStatus } from '@/lib/products';

interface LineItem extends PickableProduct {
  quantity: number;
}

const PAYMENT_METHODS = ['yape', 'plin', 'transferencia', 'efectivo'];

export default function ManualOrderForm() {
  const router = useRouter();
  const [lines, setLines] = useState<LineItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [status, setStatus] = useState<OrderState>('confirmed');
  const [overrideStock, setOverrideStock] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addProduct(p: PickableProduct) {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === p.id);
      if (existing) return prev.map((l) => (l.id === p.id ? { ...l, quantity: l.quantity + 1 } : l));
      return [...prev, { ...p, quantity: 1 }];
    });
  }

  function setQuantity(id: string, quantity: number) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, quantity: Math.max(1, quantity) } : l)));
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  const totals = useMemo(() => {
    const cartItems: CartItem[] = lines.map((l) => ({
      productId: l.id,
      title: l.title,
      price: Number(l.price_pen),
      quantity: l.quantity,
      editorial: '',
      stockStatus: l.stock_status as StockStatus,
    }));
    return calculateCartTotals({ items: cartItems, isFirstPurchase: false });
  }, [lines]);

  async function submit() {
    if (lines.length === 0) { setError('Agregá al menos un producto'); return; }
    setSaving(true);
    setError(null);

    const res = await fetch('/api/admin/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: lines.map((l) => ({ productId: l.id, quantity: l.quantity })),
        status,
        paymentMethod,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        overrideStock,
      }),
    });
    const json = await res.json();
    setSaving(false);

    if (!res.ok) { setError(json.error ?? 'Error al crear el pedido'); return; }
    router.push('/admin/orders');
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

      <div>
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Productos</span>
        <div className="mt-1">
          <ProductPicker onPick={addProduct} />
        </div>

        {lines.length > 0 && (
          <ul className="mt-3 space-y-2">
            {lines.map((l) => (
              <li key={l.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                <span className="flex-1 text-sm text-gray-900 dark:text-white truncate">
                  {l.title}
                  {l.stock_status === 'preorder' && (
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                      Preventa
                    </span>
                  )}
                </span>
                <input
                  type="number"
                  min={1}
                  value={l.quantity}
                  onChange={(e) => setQuantity(l.id, Number(e.target.value))}
                  className="w-16 px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20 text-right">
                  S/ {(Number(l.price_pen) * l.quantity).toFixed(2)}
                </span>
                <button type="button" onClick={() => removeLine(l.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Nombre cliente</span>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
            placeholder="Opcional"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Teléfono</span>
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
            placeholder="Opcional"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Método de pago</span>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
          >
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Estado inicial</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderState)}
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
          >
            {ORDER_STATES.map((s) => <option key={s} value={s}>{ORDER_STATE_INFO[s].label}</option>)}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={overrideStock}
          onChange={(e) => setOverrideStock(e.target.checked)}
          className="w-4 h-4 rounded accent-[#ec4899]"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">Forzar aunque no haya stock registrado</span>
      </label>

      {lines.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>S/ {totals.subtotal.toFixed(2)}</span></div>
          {totals.preorderDeposit > 0 && (
            <div className="flex justify-between"><span className="text-gray-500">Depósito preventa (50%)</span><span>S/ {totals.preorderDeposit.toFixed(2)}</span></div>
          )}
          {totals.balanceDue > 0 && (
            <div className="flex justify-between"><span className="text-gray-500">Saldo pendiente</span><span>S/ {totals.balanceDue.toFixed(2)}</span></div>
          )}
          <div className="flex justify-between"><span className="text-gray-500">Envío</span><span>S/ {totals.shipping.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-200 dark:border-gray-700">
            <span>Total a cobrar hoy</span><span>S/ {totals.totalToPayNow.toFixed(2)}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={saving || lines.length === 0}
        className="w-full py-2.5 text-sm font-semibold bg-[#2b496d] hover:bg-[#1e3550] text-white rounded-lg disabled:opacity-50 transition-colors"
      >
        {saving ? 'Guardando...' : 'Crear pedido'}
      </button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, Plus, Minus, CheckCircle, ChevronRight } from 'lucide-react';

type PaymentMethod = 'yape' | 'plin' | 'transferencia' | null;

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51924262747';
const SHIPPING_COST = 15;

const PAYMENT_INFO = {
  yape: {
    label: 'Yape',
    number: '924 262 747',
    holder: 'NekoMangaCix',
    color: 'bg-purple-600',
    hint: 'Abre Yape, busca el número y envía el monto exacto.',
  },
  plin: {
    label: 'Plin',
    number: '924 262 747',
    holder: 'NekoMangaCix',
    color: 'bg-green-600',
    hint: 'Abre Plin, ingresa el número y transfiere el monto total.',
  },
  transferencia: {
    label: 'Transferencia BCP',
    number: '123-456789-0-12',
    holder: 'NekoMangaCix SAC',
    color: 'bg-blue-700',
    hint: 'Transfiere a la cuenta BCP indicada y guarda tu voucher.',
  },
};

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderSent, setOrderSent] = useState(false);
  const [placing, setPlacing] = useState(false);

  const subtotal = getTotalPrice();
  const shipping = subtotal > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  async function handleWhatsAppOrder() {
    if (items.length === 0 || !selectedPayment || placing) return;
    setPlacing(true);

    // 1. Guardar pedido en Supabase (best-effort, no bloquea el flujo)
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            title: i.title,
            quantity: i.quantity,
            price: i.price,
          })),
          paymentMethod: selectedPayment,
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          shippingCost: shipping,
        }),
      });
    } catch {
      // Si falla, seguimos igual — WhatsApp es el flujo principal
    }

    // 2. Abrir WhatsApp con el detalle del pedido
    const paymentLabel = PAYMENT_INFO[selectedPayment].label;
    const cartDetails = items
      .map((i) => `• ${i.title} (${i.quantity}x) — S/ ${(i.price * i.quantity).toFixed(2)}`)
      .join('\n');

    const message = [
      `Hola, quiero realizar este pedido 🛒`,
      ``,
      cartDetails,
      ``,
      `Subtotal: S/ ${subtotal.toFixed(2)}`,
      `Envío: S/ ${shipping.toFixed(2)}`,
      `*Total: S/ ${total.toFixed(2)}*`,
      ``,
      `Método de pago: ${paymentLabel}`,
      customerName ? `Nombre: ${customerName}` : '',
      customerPhone ? `Teléfono: ${customerPhone}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    clearCart();
    setPlacing(false);
    setOrderSent(true);
  }

  if (orderSent) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Pedido enviado!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Te redirigimos a WhatsApp para coordinar la entrega y confirmar el pago.
          </p>
          <Link
            href="/products"
            className="inline-block bg-[#2b496d] text-white font-semibold py-3 px-8 rounded-lg hover:bg-[#1e3550] transition-colors"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Tu carrito está vacío</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Agrega mangas desde nuestra colección.</p>
        <Link
          href="/products"
          className="inline-block bg-[#2b496d] text-white font-semibold py-3 px-8 rounded-lg hover:bg-[#1e3550] transition-colors"
        >
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
            {items.map((item) => (
              <div key={item.productId} className="p-5 flex gap-4 items-start">
                <div className="w-16 h-16 bg-gradient-to-br from-[#e8eef4] to-[#d1dce8] rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
                  📚
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.editorial}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">S/ {item.price.toFixed(2)} c/u</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Menos"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-900 dark:text-white text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Más"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="font-bold text-[#2b496d] dark:text-[#5a7a9e]">
                    S/ {(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                    aria-label={`Eliminar ${item.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/products"
            className="inline-flex items-center text-[#2b496d] dark:text-[#5a7a9e] hover:underline text-sm font-medium"
          >
            ← Continuar comprando
          </Link>
        </div>

        {/* Checkout panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Resumen */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Resumen</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Envío</span>
                <span>S/ {shipping.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-3">
              <span>Total</span>
              <span className="text-xl text-[#2b496d] dark:text-[#5a7a9e]">S/ {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Datos de contacto */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tus datos</h2>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Tu nombre (opcional)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]"
            />
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Teléfono (opcional)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]"
            />
          </div>

          {/* Método de pago */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Método de pago</h2>
            <div className="space-y-2">
              {(Object.keys(PAYMENT_INFO) as Array<keyof typeof PAYMENT_INFO>).map((method) => {
                const info = PAYMENT_INFO[method];
                const isSelected = selectedPayment === method;
                return (
                  <button
                    key={method}
                    onClick={() => setSelectedPayment(method)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-[#2b496d] dark:border-[#5a7a9e] bg-[#f0f4f8] dark:bg-gray-700'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`w-8 h-8 ${info.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {info.label.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{info.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{info.number} · {info.holder}</p>
                    </div>
                    {isSelected && <ChevronRight size={16} className="text-[#2b496d] dark:text-[#5a7a9e]" />}
                  </button>
                );
              })}
            </div>

            {selectedPayment && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  💡 {PAYMENT_INFO[selectedPayment].hint}
                </p>
                <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mt-1">
                  Monto a transferir: S/ {total.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Botón final */}
          <button
            onClick={handleWhatsAppOrder}
            disabled={!selectedPayment || placing}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
          >
            {placing ? 'Procesando...' : '💬 Confirmar por WhatsApp'}
          </button>
          {!selectedPayment && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Selecciona un método de pago para continuar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

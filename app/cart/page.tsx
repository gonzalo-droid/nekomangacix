'use client';

import { useMemo, useState } from 'react';
import { useCart, getItemPaymentSplit, DEFAULT_PREORDER_DEPOSIT } from '@/context/CartContext';
import Link from 'next/link';
import Wordmark from '@/components/Wordmark';
import CartSuggestions from './CartSuggestions';
import {
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  MessageCircle,
  ArrowLeft,
  Clock,
  Info,
} from 'lucide-react';

type PaymentMethod = 'yape' | 'plin' | 'transferencia' | null;

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51924262747';
const SHIPPING_COST = 15;

const PAYMENT_INFO = {
  yape: {
    label: 'Yape',
    number: '924 262 747',
    holder: 'NekoMangaCix',
    brand: 'bg-[#742774]',
    hint: 'Abre Yape, busca el número y envía el monto exacto.',
  },
  plin: {
    label: 'Plin',
    number: '924 262 747',
    holder: 'NekoMangaCix',
    brand: 'bg-[#00BF6F]',
    hint: 'Abre Plin, ingresa el número y transfiere el monto total.',
  },
  transferencia: {
    label: 'Transferencia BCP',
    number: '123-456789-0-12',
    holder: 'NekoMangaCix SAC',
    brand: 'bg-[#002B5C]',
    hint: 'Transfiere a la cuenta BCP indicada y guarda tu voucher.',
  },
} as const;

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderSent, setOrderSent] = useState(false);
  const [placing, setPlacing] = useState(false);

  // ── Cálculos por item + totales ────────────────────────────────────────
  const lines = useMemo(
    () => items.map((item) => ({ item, split: getItemPaymentSplit(item) })),
    [items]
  );

  const hasPreorder = lines.some((l) => l.split.isPreorder);
  const hasInStock = lines.some((l) => !l.split.isPreorder);

  const productsSubtotal = lines.reduce((t, l) => t + l.split.full, 0);
  const depositsSubtotal = lines.reduce((t, l) => t + (l.split.isPreorder ? l.split.now : 0), 0);
  const inStockSubtotal = lines.reduce((t, l) => t + (l.split.isPreorder ? 0 : l.split.now), 0);
  const pendingSubtotal = lines.reduce((t, l) => t + l.split.later, 0);

  const shipping = items.length > 0 ? SHIPPING_COST : 0;

  // Regla: si todo el carrito es preventa, el envío se cobra al llegar.
  // Si hay al menos un item en stock, el envío se cobra hoy (se envía ese paquete).
  const shippingNow = hasInStock ? shipping : 0;
  const shippingLater = hasPreorder && !hasInStock ? shipping : 0;
  // Si mezclado: un envío ahora (in-stock) + cuando llegue la preventa, el cliente puede optar
  // por un 2do envío coordinando por WhatsApp. Simplificamos mostrando shippingNow; el mensaje
  // WhatsApp aclarará la coordinación.

  const payNow = depositsSubtotal + inStockSubtotal + shippingNow;
  const payLater = pendingSubtotal + shippingLater;

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  async function handleWhatsAppOrder() {
    if (items.length === 0 || !selectedPayment || placing) return;
    setPlacing(true);

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
      /* WhatsApp es el flujo principal; silencio si falla */
    }

    const paymentLabel = PAYMENT_INFO[selectedPayment].label;
    const cartDetails = lines
      .map(({ item, split }) => {
        const base = `• ${item.title} (${item.quantity}x) — S/ ${split.full.toFixed(2)}`;
        if (split.isPreorder) {
          return `${base}\n   [Preventa] Reserva: S/ ${split.now.toFixed(2)} · Saldo: S/ ${split.later.toFixed(2)}`;
        }
        return base;
      })
      .join('\n');

    const lines_msg: (string | false)[] = [
      `Hola, quiero realizar este pedido 🛒`,
      ``,
      cartDetails,
      ``,
      `Subtotal productos: S/ ${productsSubtotal.toFixed(2)}`,
      hasInStock && `Envío hoy: S/ ${shippingNow.toFixed(2)}`,
      hasPreorder && !hasInStock && `Envío al llegar: S/ ${shippingLater.toFixed(2)}`,
      hasPreorder && `Saldo al llegar: S/ ${pendingSubtotal.toFixed(2)}`,
      ``,
      `*A pagar hoy: S/ ${payNow.toFixed(2)}*`,
      hasPreorder && `*Pendiente al llegar: S/ ${payLater.toFixed(2)}*`,
      ``,
      `Método de pago: ${paymentLabel}`,
      customerName && `Nombre: ${customerName}`,
      customerPhone && `Teléfono: ${customerPhone}`,
    ];
    const message = lines_msg.filter((l): l is string => typeof l === 'string' && l !== '').join('\n');
    // Nota: líneas vacías "" también pasan, perdemos los saltos. Re-construimos respetando vacíos:
    const finalMessage = (lines_msg as (string | false)[])
      .filter((l): l is string => l !== false)
      .join('\n');

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(finalMessage)}`,
      '_blank'
    );
    clearCart();
    setPlacing(false);
    setOrderSent(true);
  }

  // ── Estado: pedido enviado ────────────────────────────────────────────
  if (orderSent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="relative w-full max-w-lg">
          <div
            className="absolute -top-16 -left-10 w-48 h-48 rounded-full bg-[#25D366] opacity-20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-16 -right-10 w-48 h-48 rounded-full bg-[#ec4899] opacity-20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-xl p-10 text-center">
            <Wordmark size="xs" as="div" className="mb-4 opacity-70 justify-center" />
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-[#25D366] text-white mb-5 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
              ¡Pedido enviado!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Te redirigimos a WhatsApp para coordinar la entrega y confirmar el pago. Gracias por elegir{' '}
              <Wordmark size="xs" as="span" gradientAccent={false} className="!text-gray-700 dark:!text-gray-200" />.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white font-bold text-sm shadow-lg shadow-[#ec4899]/25 hover:shadow-[#ec4899]/45 hover:scale-[1.02] transition-all"
            >
              Seguir comprando <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Estado: carrito vacío ─────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#ec4899]/15 to-[#06b6d4]/15 border-2 border-[#ec4899]/20 mb-6">
            <ShoppingBag size={36} className="text-[#ec4899]" />
          </div>
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#ec4899] mb-2">
            {'// Carrito vacío'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
            Aún no tienes productos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm">
            Explora nuestro catálogo y agrega tus mangas favoritos al carrito.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white font-bold text-sm shadow-lg shadow-[#ec4899]/25 hover:shadow-[#ec4899]/45 hover:scale-[1.02] transition-all"
          >
            Ver productos <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Carrito con items ─────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 relative">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#ec4899] mb-1.5">
          {'// Checkout'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
          Tu <span className="text-neko-gradient">carrito</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {itemCount} {itemCount === 1 ? 'producto' : 'productos'} · {hasPreorder ? 'incluye preventas' : 'todo en stock'}
        </p>
        <span
          className="absolute -bottom-3 left-0 w-16 h-1 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full"
          aria-hidden="true"
        />
      </div>

      {/* Banner de preventa cuando aplica */}
      {hasPreorder && (
        <div className="mb-6 relative overflow-hidden rounded-xl border border-[#06b6d4]/30 bg-gradient-to-r from-[#06b6d4]/10 to-[#ec4899]/5 p-4 flex gap-3 animate-tilt-in">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#06b6d4]/20 text-[#06b6d4] flex items-center justify-center">
            <Clock size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              Tu carrito incluye artículos de preventa
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
              Reservas con S/ {DEFAULT_PREORDER_DEPOSIT.toFixed(2)} por unidad y pagas el saldo cuando llegue el pedido.
              Coordinamos el envío por WhatsApp apenas lo tengamos en stock.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm divide-y divide-gray-100 dark:divide-white/5 overflow-hidden">
            {lines.map(({ item, split }) => (
              <div key={item.productId} className="p-5 flex gap-4 items-start group">
                <div className="w-16 h-20 sm:w-20 sm:h-24 bg-gradient-to-br from-[#ec4899]/10 via-[#06b6d4]/5 to-[#eab308]/10 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl border border-gray-100 dark:border-white/5">
                  📚
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    {item.slug ? (
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#ec4899] transition-colors"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.title}</h3>
                    )}
                    {split.isPreorder && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/30 px-1.5 py-0.5 rounded">
                        <Clock size={10} /> Preventa
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{item.editorial}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    S/ {item.price.toFixed(2)} c/u
                  </p>

                  {split.isPreorder && (
                    <p className="text-[11px] text-[#06b6d4] mt-1 font-medium">
                      Reserva S/ {split.unitDeposit.toFixed(2)} · Saldo S/ {(item.price - split.unitDeposit).toFixed(2)} al llegar
                    </p>
                  )}

                  <div className="inline-flex items-center border border-gray-200 dark:border-white/10 rounded-lg mt-3 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 hover:bg-[#ec4899]/10 hover:text-[#ec4899] transition-colors disabled:opacity-40"
                      disabled={item.quantity <= 1}
                      aria-label="Menos"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-9 text-center font-bold text-gray-900 dark:text-white text-sm border-x border-gray-200 dark:border-white/10 py-1.5">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 hover:bg-[#ec4899]/10 hover:text-[#ec4899] transition-colors"
                      aria-label="Más"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2 flex-shrink-0">
                  {split.isPreorder ? (
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">Hoy</p>
                      <p className="font-extrabold text-[#06b6d4]">
                        S/ {split.now.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">de S/ {split.full.toFixed(2)}</p>
                    </div>
                  ) : (
                    <p className="font-extrabold text-[#2b496d] dark:text-[#5a7a9e]">
                      S/ {split.full.toFixed(2)}
                    </p>
                  )}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label={`Eliminar ${item.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-[#2b496d] dark:text-[#5a7a9e] hover:text-[#ec4899] text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={14} /> Continuar comprando
          </Link>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <ShieldCheck size={14} className="text-[#06b6d4]" />
              <span>Originales garantizados</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Truck size={14} className="text-[#ec4899]" />
              <span>Envío a todo el Perú</span>
            </div>
          </div>
        </div>

        {/* Checkout panel */}
        <aside className="lg:col-span-1 space-y-4">
          {/* Resumen */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
              Resumen
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'}
              </span>
            </h2>

            <div className="space-y-2 text-sm mb-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal productos</span>
                <span>S/ {productsSubtotal.toFixed(2)}</span>
              </div>

              {hasPreorder && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    Reservas <Clock size={11} className="text-[#06b6d4]" />
                  </span>
                  <span>S/ {depositsSubtotal.toFixed(2)}</span>
                </div>
              )}

              {hasInStock && hasPreorder && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>En stock (pago completo)</span>
                  <span>S/ {inStockSubtotal.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Envío {hasPreorder && !hasInStock ? '(al llegar)' : ''}</span>
                <span>S/ {shipping.toFixed(2)}</span>
              </div>
            </div>

            {/* A pagar hoy */}
            <div className="pt-3 border-t border-gray-100 dark:border-white/5">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-900 dark:text-white text-sm">A pagar hoy</span>
                <span className="text-2xl font-extrabold text-neko-gradient">
                  S/ {payNow.toFixed(2)}
                </span>
              </div>

              {hasPreorder && (
                <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-white/10">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-[#06b6d4]">
                      <Clock size={12} /> Pendiente al llegar
                    </span>
                    <span className="font-bold text-[#06b6d4]">
                      S/ {payLater.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-2 leading-relaxed flex gap-1.5">
                    <Info size={11} className="flex-shrink-0 mt-0.5" />
                    Coordinamos el pago del saldo y envío por WhatsApp cuando llegue el preorder.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Datos de contacto */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm p-6 space-y-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Tus datos</h2>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Tu nombre (opcional)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-all"
            />
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Teléfono (opcional)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-all"
            />
          </div>

          {/* Método de pago */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Método de pago</h2>
            <div className="space-y-2">
              {(Object.keys(PAYMENT_INFO) as Array<keyof typeof PAYMENT_INFO>).map((method) => {
                const info = PAYMENT_INFO[method];
                const isSelected = selectedPayment === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelectedPayment(method)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      isSelected
                        ? 'border-[#ec4899] bg-gradient-to-r from-[#ec4899]/10 to-transparent shadow-sm'
                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className={`w-9 h-9 ${info.brand} rounded-md flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0`}>
                      {info.label.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{info.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                        {info.number} · {info.holder}
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 size={18} className="text-[#ec4899] flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {selectedPayment && (
              <div className="mt-4 p-3 rounded-lg bg-gradient-to-br from-[#06b6d4]/10 to-[#ec4899]/5 border border-[#06b6d4]/20 animate-tilt-in">
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  {PAYMENT_INFO[selectedPayment].hint}
                </p>
                <p className="text-xs font-bold text-[#06b6d4] mt-1.5">
                  Monto a transferir hoy: S/ {payNow.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* CTA WhatsApp */}
          <button
            onClick={handleWhatsAppOrder}
            disabled={!selectedPayment || placing}
            className="w-full bg-[#25D366] hover:bg-[#1ebe5a] disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-white disabled:text-gray-500 font-bold py-3.5 rounded-xl shadow-lg shadow-[#25D366]/25 hover:shadow-[#25D366]/45 disabled:shadow-none hover:scale-[1.01] active:scale-[0.98] disabled:scale-100 transition-all flex items-center justify-center gap-2 text-base"
          >
            <MessageCircle size={18} />
            {placing ? 'Procesando...' : hasPreorder ? 'Reservar por WhatsApp' : 'Confirmar por WhatsApp'}
          </button>
          {!selectedPayment && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Selecciona un método de pago para continuar
            </p>
          )}
        </aside>
      </div>

      {/* Sugerencias — productos de misma serie/categoría que los del carrito */}
      <CartSuggestions items={items} />
    </div>
  );
}

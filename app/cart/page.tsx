'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useCart, getItemPaymentSplit } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { usePromotions } from '@/context/PromotionsContext';
import { createSupabaseClient } from '@/core/supabase/client';
import { calculateCartTotals, FREE_SHIPPING_THRESHOLD_PEN } from '@/lib/domain/cart/calculate';
import { SHIPPING_ZONES, deliveryLabel, getShippingZone } from '@/lib/domain/shipping/zones';
import { STORE, YAPE_PLIN_NUMBER } from '@/lib/site';
import {
  trackBeginCheckout,
  trackPurchase,
  trackViewCart,
  trackWhatsAppOpen,
  type AnalyticsItem,
} from '@/lib/analytics';
import { cloudinaryLoader } from '@/lib/cloudinary';
import Image from 'next/image';
import Link from 'next/link';
import Wordmark from '@/components/Wordmark';
import CartSuggestions from './CartSuggestions';
import FirstPurchaseDiscountBanner from '@/components/cart/FirstPurchaseDiscountBanner';
import {
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  Truck,
  MessageCircle,
  ArrowLeft,
  Clock,
  Info,
  Tag,
  AlertCircle,
} from 'lucide-react';

type PaymentMethod = 'yape' | 'plin' | 'transferencia' | null;

interface FormErrors {
  phone?: string;
  zone?: string;
  payment?: string;
}

interface PlacedOrder {
  /** Código corto del pedido; null si no se pudo registrar y se envía igual. */
  code: string | null;
  whatsappUrl: string;
  payment: Exclude<PaymentMethod, null>;
  totalToPayNow: number;
  balanceDue: number;
}

/** Un teléfono peruano tiene 9 dígitos; se aceptan prefijos y separadores. */
function isValidPhone(value: string): boolean {
  return value.replace(/\D/g, '').length >= 9;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51924462641';

const PAYMENT_INFO = {
  yape: {
    label: 'Yape',
    number: YAPE_PLIN_NUMBER,
    holder: 'NekoMangaCix',
    brand: 'bg-[#742774]',
    hint: 'Abre Yape, busca el número y envía el monto exacto.',
  },
  plin: {
    label: 'Plin',
    number: YAPE_PLIN_NUMBER,
    holder: 'NekoMangaCix',
    brand: 'bg-[#00BF6F]',
    hint: 'Abre Plin, ingresa el número y transfiere el monto total.',
  },
  transferencia: {
    label: 'Transferencia BCP',
    number: '41592417151054',
    holder: 'NekoMangaCix SAC',
    brand: 'bg-[#002B5C]',
    hint: 'Transfiere a la cuenta BCP indicada y guarda tu voucher. ¿Tu banco no es BCP? Usa la cuenta interbancaria (CCI): 00241519241715105488.',
  },
} as const;

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const { coupon, couponCode, couponError, isValidatingCoupon, applyCoupon, removeCoupon, getCouponDiscount } = usePromotions();
  const [couponInput, setCouponInput] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [shippingZoneId, setShippingZoneId] = useState('');
  const [placing, setPlacing] = useState(false);
  // Lo que se muestra tras guardar el pedido. Se congela aquí porque el
  // carrito se vacía en ese mismo momento.
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLSelectElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (placedOrder) successHeadingRef.current?.focus();
  }, [placedOrder]);
  const [hasUsedFirstPurchase, setHasUsedFirstPurchase] = useState<boolean | null>(null);

  // Cargar profile.has_used_first_purchase_discount cuando hay usuario
  useEffect(() => {
    if (!user) return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const configured = !!supabaseUrl && !supabaseUrl.includes('tu-proyecto');
    let mounted = true;
    if (!configured) {
      Promise.resolve().then(() => {
        if (mounted) setHasUsedFirstPurchase(false);
      });
      return () => {
        mounted = false;
      };
    }
    const supabase = createSupabaseClient();
    supabase
      .from('profiles')
      .select('has_used_first_purchase_discount')
      .eq('id', user.id)
      .single()
      .then(({ data }: { data: { has_used_first_purchase_discount: boolean } | null }) => {
        if (!mounted) return;
        setHasUsedFirstPurchase(!!data?.has_used_first_purchase_discount);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  const isFirstPurchase = !!user && hasUsedFirstPurchase === false;

  // ── Cálculos por item + totales ────────────────────────────────────────
  const lines = useMemo(
    () => items.map((item) => ({ item, split: getItemPaymentSplit(item) })),
    [items]
  );

  const shippingZone = getShippingZone(shippingZoneId);
  // Sin destino elegido todavía no hay tarifa: el total se muestra sin envío.
  const shippingRate = shippingZone?.cost ?? 0;

  const preliminaryTotals = useMemo(
    () => calculateCartTotals({ items, isFirstPurchase, shippingRate }),
    [items, isFirstPurchase, shippingRate]
  );

  const couponDiscount = useMemo(
    () => getCouponDiscount(preliminaryTotals.subtotal),
    [getCouponDiscount, preliminaryTotals.subtotal]
  );

  // El cupón se prorratea igual que el descuento de bienvenida: en preventa solo
  // afecta el depósito de hoy, el resto reduce el saldo al llegar.
  const totals = useMemo(
    () => calculateCartTotals({ items, isFirstPurchase, couponDiscount, shippingRate }),
    [items, isFirstPurchase, couponDiscount, shippingRate]
  );
  // Misma regla que `calculateCartTotals`: el umbral se mide contra el
  // subtotal menos el descuento de bienvenida, sin contar el cupón.
  const freeShipping =
    preliminaryTotals.subtotal - preliminaryTotals.welcomeDiscount >= FREE_SHIPPING_THRESHOLD_PEN;

  const hasPreorder = lines.some((l) => l.split.isPreorder);
  const hasInStock = lines.some((l) => !l.split.isPreorder);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const analyticsItems = (): AnalyticsItem[] =>
    items.map((i) => ({
      item_id: i.productId,
      item_name: i.title,
      item_brand: i.editorial,
      price: i.price,
      quantity: i.quantity,
    }));

  // Una vez por visita al carrito con productos, no en cada cambio de cantidad.
  const cartViewTracked = useRef(false);
  useEffect(() => {
    if (cartViewTracked.current || items.length === 0) return;
    cartViewTracked.current = true;
    trackViewCart(
      items.map((i) => ({
        item_id: i.productId,
        item_name: i.title,
        item_brand: i.editorial,
        price: i.price,
        quantity: i.quantity,
      })),
    );
  }, [items]);

  /** Mensaje prellenado para WhatsApp. `code` es el número de pedido guardado. */
  function buildWhatsAppUrl(code: string | null): string {
    if (!selectedPayment) return `https://wa.me/${WHATSAPP_NUMBER}`;
    const paymentLabel = PAYMENT_INFO[selectedPayment].label;

    const stockLines = lines
      .filter((l) => !l.split.isPreorder)
      .map(({ item, split }) => `• ${item.title} (${item.quantity}x) — S/ ${split.full.toFixed(2)}`);

    const preorderLines = lines
      .filter((l) => l.split.isPreorder)
      .map(
        ({ item, split }) =>
          `• ${item.title} (${item.quantity}x) — S/ ${split.full.toFixed(2)}\n   Adelanto: S/ ${split.now.toFixed(2)} · Saldo: S/ ${split.later.toFixed(2)}`
      );

    const msgParts: (string | false)[] = [
      code ? `Hola, hice el pedido #${code} 🛒` : `Hola, quiero realizar este pedido 🛒`,
      ``,
      hasInStock && `📦 EN STOCK`,
      hasInStock && stockLines.join('\n'),
      hasInStock && hasPreorder && ``,
      hasPreorder && `🕐 PREVENTA (50% adelanto)`,
      hasPreorder && preorderLines.join('\n'),
      ``,
      `Subtotal: S/ ${totals.subtotal.toFixed(2)}`,
      totals.welcomeDiscount > 0 && `Descuento bienvenida (10%): -S/ ${totals.welcomeDiscount.toFixed(2)}`,
      couponDiscount > 0 && `Cupón ${couponCode}: -S/ ${couponDiscount.toFixed(2)}`,
      shippingZone?.pickup
        ? `Recojo en tienda (${STORE.streetAddress}, ${STORE.city}): gratis`
        : totals.shipping === 0
          ? `${deliveryLabel(shippingZone)}: GRATIS 🎁`
          : `${deliveryLabel(shippingZone)}: S/ ${totals.shipping.toFixed(2)}`,
      ``,
      `💰 Total a pagar ahora: S/ ${Math.max(0, totals.totalToPayNow).toFixed(2)}`,
      hasPreorder && `💳 Saldo al llegar: S/ ${totals.balanceDue.toFixed(2)}`,
      ``,
      `Método de pago: ${paymentLabel}`,
      customerName && `Nombre: ${customerName}`,
      customerPhone && `Teléfono: ${customerPhone}`,
      !shippingZone?.pickup && customerAddress && `Dirección: ${customerAddress}`,
    ];

    const message = msgParts.filter((l): l is string => l !== false).join('\n');
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  /** Cierra el pedido en pantalla: congela el resumen y vacía el carrito. */
  function finishOrder(code: string | null) {
    if (!selectedPayment) return;
    const whatsappUrl = buildWhatsAppUrl(code);
    trackPurchase({
      orderCode: code,
      items: analyticsItems(),
      value: Math.round((totals.subtotal - totals.discount + totals.shipping) * 100) / 100,
      shipping: totals.shipping,
      coupon: coupon ? couponCode : undefined,
      paymentMethod: selectedPayment,
      shippingZone: shippingZoneId,
    });
    setPlacedOrder({
      code,
      whatsappUrl,
      payment: selectedPayment,
      totalToPayNow: Math.max(0, totals.totalToPayNow),
      balanceDue: totals.balanceDue,
    });
    clearCart();
    // Comodidad, no el camino principal: tras un `await` el navegador puede
    // bloquear la ventana (Safari en iPhone lo hace). Por eso la pantalla de
    // confirmación siempre trae el enlace de WhatsApp a la vista.
    window.open(whatsappUrl, '_blank', 'noopener');
  }

  async function handleConfirmOrder() {
    if (items.length === 0 || placing) return;

    const nextErrors: FormErrors = {};
    if (!isValidPhone(customerPhone)) nextErrors.phone = 'Escribe un teléfono de 9 dígitos para coordinar tu pedido.';
    if (!shippingZone) nextErrors.zone = 'Elige cómo recibes tu pedido.';
    if (!selectedPayment) nextErrors.payment = 'Elige un método de pago.';
    setErrors(nextErrors);
    setSubmitError(null);

    // El foco va al primer dato que falta, en el orden en que aparecen.
    if (nextErrors.phone) {
      phoneRef.current?.focus();
      return;
    }
    if (nextErrors.zone) {
      zoneRef.current?.focus();
      return;
    }
    if (nextErrors.payment) {
      paymentRef.current?.querySelector('button')?.focus();
      return;
    }

    setPlacing(true);
    trackBeginCheckout(analyticsItems(), {
      paymentMethod: selectedPayment ?? '',
      shippingZone: shippingZoneId,
    });
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            title: i.title,
            quantity: i.quantity,
            price: i.price,
            stockStatus: i.stockStatus,
          })),
          paymentMethod: selectedPayment,
          customerName: customerName || undefined,
          customerPhone,
          customerAddress: shippingZone?.pickup ? undefined : customerAddress || undefined,
          couponCode: coupon ? couponCode : undefined,
          shippingZone: shippingZoneId,
        }),
      });
      const data = (await res.json().catch(() => null)) as { orderCode?: string; error?: string } | null;

      if (!res.ok) {
        // El carrito se conserva: el pedido NO quedó registrado.
        setSubmitError(data?.error ?? 'No pudimos registrar tu pedido. Inténtalo de nuevo.');
        return;
      }
      finishOrder(data?.orderCode ?? null);
    } catch {
      setSubmitError('No pudimos conectar para registrar tu pedido. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setPlacing(false);
    }
  }

  // ── Estado: pedido registrado ─────────────────────────────────────────
  if (placedOrder) {
    const pay = PAYMENT_INFO[placedOrder.payment];
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
          <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-xl p-6 sm:p-10 text-center">
            <Wordmark size="xs" as="div" className="mb-4 opacity-70 justify-center" />
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-[#25D366] text-white mb-5 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 size={32} aria-hidden="true" />
            </div>
            {/* Recibe el foco al aparecer: así un lector de pantalla anuncia el
                resultado sin quitarle al título su rol de encabezado. */}
            <h1
              ref={successHeadingRef}
              tabIndex={-1}
              className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 focus:outline-none"
            >
              {placedOrder.code ? `Pedido #${placedOrder.code} registrado` : 'Tu pedido está listo para enviar'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
              Falta un paso: envíanos el mensaje por WhatsApp para confirmar el pago y coordinar la entrega.
            </p>

            <a
              href={placedOrder.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppOpen('order', placedOrder.code)}
              className="w-full bg-[#0b8043] hover:bg-[#09703a] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#25D366]/25 transition-all flex items-center justify-center gap-2 text-base"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Enviar pedido por WhatsApp
            </a>

            <dl className="mt-6 text-left text-sm rounded-xl border border-gray-100 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/10">
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-gray-600 dark:text-gray-400">A pagar hoy</dt>
                <dd className="font-extrabold text-gray-900 dark:text-white">S/ {placedOrder.totalToPayNow.toFixed(2)}</dd>
              </div>
              {placedOrder.balanceDue > 0 && (
                <div className="flex justify-between gap-4 px-4 py-3">
                  <dt className="text-gray-600 dark:text-gray-400">Saldo al llegar</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">S/ {placedOrder.balanceDue.toFixed(2)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-gray-600 dark:text-gray-400">{pay.label}</dt>
                <dd className="font-semibold text-gray-900 dark:text-white text-right break-all">
                  {pay.number}
                  <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">{pay.holder}</span>
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-left leading-relaxed">{pay.hint}</p>

            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-1.5 min-h-11 text-sm font-semibold text-[#2b496d] dark:text-neko-navy-ink hover:text-[#ec4899] transition-colors"
            >
              Seguir comprando <ChevronRight size={16} aria-hidden="true" />
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
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.25em] text-neko-magenta-ink mb-2">
            {'// Carrito vacío'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
            Aún no tienes productos
          </h1>
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
        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.25em] text-neko-magenta-ink mb-1.5">
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

      {/* Banner de descuento de primera compra */}
      <FirstPurchaseDiscountBanner isLoggedIn={!!user} eligible={isFirstPurchase} />

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
              Reservas con el 50% del precio por unidad y pagas el saldo cuando llegue el pedido.
              Coordinamos el envío por WhatsApp apenas lo tengamos en stock.
            </p>
          </div>
        </div>
      )}

      {/* Checkout por pasos: los pasos a la izquierda y el resumen fijo a la
          derecha. Antes los datos y el pago iban en la columna derecha y, con
          un solo producto, la izquierda quedaba casi vacía. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Paso 1: productos */}
          <section aria-labelledby="paso-productos" className="space-y-3">
            <h2 id="paso-productos" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <StepNumber n={1} />Tus productos
            </h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm divide-y divide-gray-100 dark:divide-white/5 overflow-hidden">
              {lines.map(({ item, split }) => (
                <div key={item.productId} className="p-5 flex gap-4 items-start group">
                  <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-100 dark:bg-gray-800 relative">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        loader={cloudinaryLoader}
                        className="object-contain p-1"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#ec4899]/10 via-[#06b6d4]/5 to-[#eab308]/10 flex items-center justify-center text-2xl">📚</div>
                    )}
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
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-neko-cyan-ink bg-[#06b6d4]/10 border border-[#06b6d4]/30 px-1.5 py-0.5 rounded">
                          <Clock size={10} /> Preventa
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.editorial}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      S/ {item.price.toFixed(2)} c/u
                    </p>

                    {split.isPreorder && (
                      <p className="text-[11px] text-neko-cyan-ink mt-1 font-medium">
                        Adelanto S/ {split.unitDeposit.toFixed(2)} (50%) · Saldo S/ {(item.price - split.unitDeposit).toFixed(2)} al llegar
                      </p>
                    )}

                    <div className="inline-flex items-center border border-gray-200 dark:border-white/10 rounded-lg mt-3 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-11 h-11 flex items-center justify-center hover:bg-[#ec4899]/10 hover:text-[#ec4899] transition-colors disabled:opacity-40"
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
                        className="w-11 h-11 flex items-center justify-center hover:bg-[#ec4899]/10 hover:text-[#ec4899] transition-colors"
                        aria-label="Más"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2 flex-shrink-0">
                    {split.isPreorder ? (
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-wider text-gray-600 dark:text-gray-400">Hoy</p>
                        <p className="font-extrabold text-neko-cyan-ink">
                          S/ {split.now.toFixed(2)}
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">de S/ {split.full.toFixed(2)}</p>
                      </div>
                    ) : (
                      <p className="font-extrabold text-[#2b496d] dark:text-neko-navy-ink">
                        S/ {split.full.toFixed(2)}
                      </p>
                    )}
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="w-11 h-11 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label={`Eliminar ${item.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <FreeShippingProgress
              subtotal={preliminaryTotals.subtotal - preliminaryTotals.welcomeDiscount}
              pickup={Boolean(shippingZone?.pickup)}
            />

          <Link
              href="/products"
              className="inline-flex items-center gap-1.5 min-h-11 text-[#2b496d] dark:text-neko-navy-ink hover:text-[#ec4899] text-sm font-semibold transition-colors"
            >
              <ArrowLeft size={14} /> Continuar comprando
            </Link>
          </section>

          {/* Sugerencias arriba, junto a la barra de envío gratis: es donde
              ayudan a sumar un segundo tomo. Al final de la página no las veía nadie. */}
          <CartSuggestions items={items} />

          {/* Datos de contacto */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm p-6 space-y-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2"><StepNumber n={2} />Tus datos y entrega</h2>
            <div>
              <label htmlFor="cliente-nombre" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nombre <span className="font-normal text-gray-500 dark:text-gray-400">(opcional)</span>
              </label>
              <input
                id="cliente-nombre"
                type="text"
                name="name"
                autoComplete="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-3 py-3 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-all"
              />
            </div>
            <div>
              <label htmlFor="cliente-telefono" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Teléfono o WhatsApp
              </label>
              <input
                ref={phoneRef}
                id="cliente-telefono"
                type="tel"
                name="tel"
                autoComplete="tel"
                inputMode="tel"
                required
                aria-required="true"
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errors.phone ? 'cliente-telefono-error' : 'cliente-telefono-ayuda'}
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="987 654 321"
                className="w-full px-3 py-3 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-all"
              />
              {errors.phone ? (
                <p id="cliente-telefono-error" role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.phone}</p>
              ) : (
                <p id="cliente-telefono-ayuda" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Lo usamos solo para coordinar este pedido.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="cliente-destino" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                ¿Cómo lo recibes?
              </label>
              <select
                ref={zoneRef}
                id="cliente-destino"
                name="shipping-zone"
                required
                aria-required="true"
                aria-invalid={errors.zone ? true : undefined}
                aria-describedby={errors.zone ? 'cliente-destino-error' : undefined}
                value={shippingZoneId}
                onChange={(e) => {
                  setShippingZoneId(e.target.value);
                  if (errors.zone) setErrors((prev) => ({ ...prev, zone: undefined }));
                }}
                className="w-full px-3 min-h-11 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-all"
              >
                <option value="">Elige tu destino</option>
                {SHIPPING_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.label} — {zone.costLabel} · {zone.time}
                  </option>
                ))}
              </select>
              {errors.zone && (
                <p id="cliente-destino-error" role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.zone}</p>
              )}
            </div>
            {shippingZone?.pickup ? (
              <p className="text-xs text-gray-600 dark:text-gray-400 rounded-lg bg-gray-50 dark:bg-white/5 px-3 py-2.5">
                Te esperamos en <strong className="text-gray-900 dark:text-white">{STORE.streetAddress}, {STORE.city}</strong>,
                {' '}{STORE.daysLabel.toLowerCase()}, {STORE.hoursShortLabel} Te avisamos por WhatsApp cuando tu pedido esté listo.
              </p>
            ) : (
            <div>
              <label htmlFor="cliente-direccion" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Dirección de envío <span className="font-normal text-gray-500 dark:text-gray-400">(opcional)</span>
              </label>
              <input
                id="cliente-direccion"
                type="text"
                name="street-address"
                autoComplete="street-address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Calle, número, distrito y ciudad"
                className="w-full px-3 py-3 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/30 focus:border-[#06b6d4] transition-all"
              />
            </div>
            )}
          </div>

          {/* Método de pago */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><StepNumber n={3} />Método de pago</h2>
            {errors.payment && (
              <p role="alert" className="text-xs text-red-600 dark:text-red-400 mb-2">{errors.payment}</p>
            )}
            <div ref={paymentRef} className="space-y-2">
              {(Object.keys(PAYMENT_INFO) as Array<keyof typeof PAYMENT_INFO>).map((method) => {
                const info = PAYMENT_INFO[method];
                const isSelected = selectedPayment === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setSelectedPayment(method);
                      if (errors.payment) setErrors((prev) => ({ ...prev, payment: undefined }));
                    }}
                    aria-pressed={isSelected}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      isSelected
                        ? 'border-[#ec4899] bg-gradient-to-r from-[#ec4899]/10 to-transparent shadow-sm'
                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div
                      aria-hidden="true"
                      className={`w-9 h-9 ${info.brand} rounded-md flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0`}
                    >
                      {info.label.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{info.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
                <p className="text-xs font-bold text-neko-cyan-ink mt-1.5">
                  Monto a transferir hoy: S/ {Math.max(0, totals.totalToPayNow).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Resumen fijo al bajar (escritorio) con el botón de confirmar */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24">
          {/* Resumen */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
              Resumen
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'}
              </span>
            </h2>

            {/* Cupón de descuento */}
            {!coupon && (
              <div className="mb-3">
                <form
                  onSubmit={(e) => { e.preventDefault(); applyCoupon(couponInput); }}
                  className="flex gap-2"
                >
                  <label htmlFor="cupon" className="sr-only">Código de cupón</label>
                  <input
                    id="cupon"
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Código de cupón"
                    autoComplete="off"
                    autoCapitalize="characters"
                    aria-describedby={couponError ? 'cupon-error' : undefined}
                    aria-invalid={couponError ? true : undefined}
                    className="flex-1 px-3 py-3 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ec4899]/50"
                  />
                  <button
                    type="submit"
                    disabled={isValidatingCoupon || !couponInput.trim()}
                    className="px-4 min-h-11 text-sm font-semibold bg-[#2b496d] text-white rounded-lg hover:bg-[#1e3550] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isValidatingCoupon ? '...' : 'Aplicar'}
                  </button>
                </form>
                {couponError && (
                  <p id="cupon-error" role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">{couponError}</p>
                )}
              </div>
            )}

            <div className="space-y-2 text-sm mb-3">
              {hasInStock && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal en stock</span>
                  <span>S/ {totals.stockSubtotal.toFixed(2)}</span>
                </div>
              )}

              {hasPreorder && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    Subtotal preventa <Clock size={11} className="text-[#06b6d4]" />
                  </span>
                  <span>S/ {totals.preorderSubtotal.toFixed(2)}</span>
                </div>
              )}

              {totals.welcomeDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag size={11} /> Descuento bienvenida (10%)
                  </span>
                  <span>-S/ {totals.welcomeDiscount.toFixed(2)}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag size={11} /> Cupón {couponCode}
                    <button type="button" onClick={removeCoupon} className="text-gray-400 hover:text-red-500 ml-1 text-xs">×</button>
                  </span>
                  <span>-S/ {couponDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{deliveryLabel(shippingZone)}</span>
                <span className={freeShipping || shippingZone?.pickup ? 'text-emerald-700 dark:text-emerald-400 font-bold' : ''}>
                  {shippingZone?.pickup
                    ? 'Gratis'
                    : freeShipping
                    ? 'GRATIS 🎁'
                    : shippingZone
                      ? `S/ ${totals.shipping.toFixed(2)}`
                      : 'Elige tu destino'}
                </span>
              </div>
              {shippingZone?.estimated && !freeShipping && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  En zonas alejadas la tarifa puede subir hasta S/ 25; te la confirmamos por WhatsApp.
                </p>
              )}

              {hasPreorder && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Adelanto preventa (50%)</span>
                  <span>S/ {totals.preorderDeposit.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Total a pagar hoy */}
            <div className="pt-3 border-t border-gray-100 dark:border-white/5">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-900 dark:text-white text-sm">
                  Total a pagar hoy
                  {!shippingZone && !freeShipping && (
                    <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">sin envío todavía</span>
                  )}
                </span>
                <span className="text-2xl font-extrabold text-neko-gradient">
                  S/ {Math.max(0, totals.totalToPayNow).toFixed(2)}
                </span>
              </div>

              {hasPreorder && (
                <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-white/10">
                  <div className="flex justify-between items-baseline text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Clock size={12} /> Saldo al llegar
                    </span>
                    <span className="font-bold">
                      S/ {totals.balanceDue.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed flex gap-1.5">
                    <Info size={11} className="flex-shrink-0 mt-0.5" />
                    Coordinamos el pago del saldo y envío por WhatsApp cuando llegue el preorder.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Confirmar pedido */}
          {submitError && (
            <div role="alert" className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-800 dark:text-red-200">
              <p className="flex gap-2 font-semibold">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                {submitError}
              </p>
              <p className="mt-2 text-xs">
                Tu carrito sigue intacto. Si el problema continúa, puedes{' '}
                <button
                  type="button"
                  onClick={() => finishOrder(null)}
                  disabled={!selectedPayment}
                  className="underline font-semibold disabled:opacity-60"
                >
                  enviarnos el pedido directo por WhatsApp
                </button>
                .
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleConfirmOrder}
            disabled={placing}
            className="w-full bg-[#0b8043] hover:bg-[#09703a] disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-white disabled:text-gray-500 font-bold py-3.5 rounded-xl shadow-lg shadow-[#25D366]/25 hover:shadow-[#25D366]/45 disabled:shadow-none hover:scale-[1.01] active:scale-[0.98] disabled:scale-100 transition-all flex items-center justify-center gap-2 text-base"
          >
            <MessageCircle size={18} aria-hidden="true" />
            {placing ? 'Registrando tu pedido…' : hasPreorder ? 'Confirmar reserva' : 'Confirmar pedido'}
          </button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Guardamos tu pedido y te llevamos a WhatsApp para coordinar el pago.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Número de paso del checkout. */
function StepNumber({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#be185d] text-white text-xs font-bold" aria-hidden="true">
      {n}
    </span>
  );
}

/** Barra de avance hacia el envío gratis. Con recojo en tienda no aplica. */
function FreeShippingProgress({ subtotal, pickup }: { subtotal: number; pickup: boolean }) {
  if (pickup || subtotal <= 0) return null;
  const reached = subtotal >= FREE_SHIPPING_THRESHOLD_PEN;
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD_PEN) * 100));
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 p-4">
      <p className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <Truck size={16} className="text-neko-cyan-ink flex-shrink-0" aria-hidden="true" />
        {reached ? (
          <strong className="text-neko-green-ink">Ya tienes envío gratis</strong>
        ) : (
          <span>
            Te faltan <strong className="text-gray-900 dark:text-white">S/ {(FREE_SHIPPING_THRESHOLD_PEN - subtotal).toFixed(2)}</strong> para el envío gratis
          </span>
        )}
      </p>
      <div
        className="mt-2.5 h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden"
        role="progressbar"
        aria-label="Avance hacia el envío gratis"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className={`h-full rounded-full ${reached ? 'bg-emerald-600' : 'bg-gradient-to-r from-[#ec4899] to-[#06b6d4]'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

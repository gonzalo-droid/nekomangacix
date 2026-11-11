/**
 * Medición del embudo de compra.
 *
 * Un solo punto de entrada (`trackEvent`) que reparte cada evento a:
 *  - GA4, si `NEXT_PUBLIC_GA_ID` está definida (nombres y parámetros del
 *    esquema de comercio electrónico de GA4);
 *  - Vercel Analytics, siempre (los eventos personalizados requieren plan Pro;
 *    sin él la llamada simplemente no registra nada).
 *
 * Sin `NEXT_PUBLIC_GA_ID` no se carga ningún script de Google.
 */
import { track as vercelTrack } from '@vercel/analytics';

const RAW_GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';
/** Solo ids con forma de GA4: lo que no encaje se trata como "sin GA". */
export const GA_ID = /^G-[A-Z0-9]+$/.test(RAW_GA_ID) ? RAW_GA_ID : '';

export const CURRENCY = 'PEN';

declare global {
  interface Window {
    dataLayer?: unknown[];
    __nekoGaReady?: boolean;
  }
}

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_brand?: string;
  price?: number;
  quantity?: number;
}

type Params = Record<string, unknown>;

// gtag.js espera el objeto `arguments` en la cola, no un array, así que la
// función no declara parámetros y los lee de ahí.
const gtag: (...args: unknown[]) => void = function () {
  window.dataLayer = window.dataLayer ?? [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
};

/**
 * Deja en la cola el arranque de GA antes del primer evento. Los efectos de
 * una página corren antes que los del layout, así que sin esto un `view_item`
 * podía quedar encolado por delante del `config` y perderse.
 */
export function ensureGa(): boolean {
  if (typeof window === 'undefined' || !GA_ID) return false;
  if (!window.__nekoGaReady) {
    window.__nekoGaReady = true;
    gtag('js', new Date());
    gtag('config', GA_ID);
  }
  return true;
}

/** Vercel solo acepta valores planos: se descartan arrays y objetos. */
function flatten(params: Params): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
      out[key] = value as string | number | boolean | null;
    }
  }
  return out;
}

export function trackEvent(name: string, params: Params = {}): void {
  if (typeof window === 'undefined') return;
  try {
    if (ensureGa()) gtag('event', name, params);
    vercelTrack(name, flatten(params));
  } catch {
    // La medición nunca debe romper la compra.
  }
}

// ── Eventos del embudo ──────────────────────────────────────────────────────

const itemsValue = (items: AnalyticsItem[]) =>
  Math.round(items.reduce((sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 1), 0) * 100) / 100;

export function trackViewItem(item: AnalyticsItem, stockStatus?: string) {
  trackEvent('view_item', {
    currency: CURRENCY,
    value: item.price ?? 0,
    items: [item],
    item_id: item.item_id,
    item_name: item.item_name,
    stock_status: stockStatus ?? null,
  });
}

export function trackAddToCart(item: AnalyticsItem, stockStatus?: string) {
  trackEvent('add_to_cart', {
    currency: CURRENCY,
    value: item.price ?? 0,
    items: [{ ...item, quantity: item.quantity ?? 1 }],
    item_id: item.item_id,
    item_name: item.item_name,
    stock_status: stockStatus ?? null,
  });
}

export function trackViewCart(items: AnalyticsItem[]) {
  trackEvent('view_cart', { currency: CURRENCY, value: itemsValue(items), items, item_count: items.length });
}

export function trackBeginCheckout(items: AnalyticsItem[], extra: { paymentMethod: string; shippingZone: string }) {
  trackEvent('begin_checkout', {
    currency: CURRENCY,
    value: itemsValue(items),
    items,
    payment_type: extra.paymentMethod,
    shipping_tier: extra.shippingZone,
  });
}

/** El pedido quedó guardado. `value` es el total del pedido, con envío. */
export function trackPurchase(args: {
  orderCode: string | null;
  items: AnalyticsItem[];
  value: number;
  shipping: number;
  coupon?: string;
  paymentMethod: string;
  shippingZone: string;
}) {
  trackEvent('purchase', {
    transaction_id: args.orderCode ?? `sin-registro-${Date.now()}`,
    currency: CURRENCY,
    value: args.value,
    shipping: args.shipping,
    coupon: args.coupon ?? null,
    items: args.items,
    payment_type: args.paymentMethod,
    shipping_tier: args.shippingZone,
    saved: args.orderCode !== null,
  });
}

/** El cliente tocó el botón para mandar el mensaje: el último paso real. */
export function trackWhatsAppOpen(context: 'order' | 'product' | 'support', orderCode?: string | null) {
  trackEvent('whatsapp_open', { context, transaction_id: orderCode ?? null });
}

export function trackSearch(term: string, results?: number) {
  trackEvent('search', { search_term: term, results: results ?? null });
}

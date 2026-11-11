/**
 * Tarifas de envío por destino.
 *
 * Única fuente: la leen la página `/shipping`, el carrito y `/api/orders`.
 * Antes la tabla pública decía S/ 5 para Chiclayo y el carrito cobraba S/ 15
 * fijo a todo el mundo.
 */
export interface ShippingZone {
  id: string;
  label: string;
  /** Monto que se cobra en el pedido (S/). */
  cost: number;
  /** Cómo se muestra el costo cuando no es un número cerrado. */
  costLabel: string;
  time: string;
  /** True si el monto final depende de la localidad y se confirma al coordinar. */
  estimated?: boolean;
}

export const SHIPPING_ZONES: readonly ShippingZone[] = [
  { id: 'chiclayo', label: 'Chiclayo (local)',       cost: 5,  costLabel: 'S/ 5.00',          time: '1–2 días hábiles' },
  { id: 'lima',     label: 'Lima y Callao',          cost: 15, costLabel: 'S/ 15.00',         time: '2–3 días hábiles' },
  { id: 'norte',    label: 'Norte del Perú',         cost: 15, costLabel: 'S/ 15.00',         time: '3–4 días hábiles' },
  { id: 'sur',      label: 'Sur del Perú',           cost: 15, costLabel: 'S/ 15.00',         time: '3–5 días hábiles' },
  { id: 'selva',    label: 'Selva / zonas alejadas', cost: 18, costLabel: 'S/ 18.00 – 25.00', time: '5–7 días hábiles', estimated: true },
];

export function getShippingZone(id: string | null | undefined): ShippingZone | null {
  if (!id) return null;
  return SHIPPING_ZONES.find((z) => z.id === id) ?? null;
}

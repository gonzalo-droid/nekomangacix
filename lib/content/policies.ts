/**
 * Políticas de pedido: única fuente para el home, la FAQ, Contacto, Envíos y
 * los términos. Antes cada página tenía su copia y se contradecían (envío a
 * S/ 15 fijo en los términos, "sin recojo en tienda" en la FAQ, tiempos de
 * envío distintos en cada lugar).
 */
import { COUNTRIES, type CountryCode } from '@/lib/constants/countries';
import { FREE_SHIPPING_THRESHOLD_PEN, PREORDER_DEPOSIT_RATE } from '@/lib/domain/cart/calculate';
import { deliveryDaysRange, DELIVERY_ZONES } from '@/lib/domain/shipping/zones';
import { STORE } from '@/lib/site';

export const DEPOSIT_PERCENT = Math.round(PREORDER_DEPOSIT_RATE * 100);

/** Tiempo de llegada desde el cierre de la preventa, por origen de la edición. */
export const ARRIVAL_TIMES: Record<CountryCode, string> = {
  AR: '2 a 3 semanas',
  MX: '3 a 4 semanas',
  ES: '4 a 5 semanas',
  JP: '2 a 3,5 meses',
};

/** "Argentina: 2 a 3 semanas; Japón: 2 a 3,5 meses" (solo países con productos). */
export function arrivalTimesText(countries: readonly CountryCode[]): string {
  return countries
    .filter((code) => ARRIVAL_TIMES[code])
    .map((code) => `${COUNTRIES[code].name}: ${ARRIVAL_TIMES[code]}`)
    .join('; ');
}

export const PICKUP_WINDOW_WEEKS = 3;

/** Qué puede elegir el cliente si la editorial agota un tomo separado. */
export const SELLOUT_OPTIONS = [
  'pasarlo a la siguiente preventa',
  'usar el monto en otro producto',
  'pedir la devolución',
] as const;

export const SELLOUT_TEXT = `pasarlo a la siguiente preventa, usar el monto en otro producto o pedir la devolución`;

export const RETURN_DAYS = 7;
export const REFUND_TIME = '48 a 72 horas hábiles';

export const FREE_SHIPPING_FROM = FREE_SHIPPING_THRESHOLD_PEN;
export const DELIVERY_DAYS = deliveryDaysRange();
export const CHEAPEST_DELIVERY = Math.min(...DELIVERY_ZONES.map((z) => z.cost));

export const PICKUP_TEXT = `Recojo gratis en nuestra tienda de ${STORE.streetAddress}, ${STORE.city} (${STORE.daysLabel.toLowerCase()}, ${STORE.hoursShortLabel})`;

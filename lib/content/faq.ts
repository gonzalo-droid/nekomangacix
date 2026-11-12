/**
 * Preguntas frecuentes. Las usan `/faq` (todas) y `/contact` (unas pocas, por
 * `id`). Los datos de políticas salen de `policies.ts`.
 */
import type { CountryCode } from '@/lib/constants/countries';
import { STORE, YAPE_PLIN_NUMBER } from '@/lib/site';
import {
  CHEAPEST_DELIVERY,
  DELIVERY_DAYS,
  DEPOSIT_PERCENT,
  FREE_SHIPPING_FROM,
  PICKUP_TEXT,
  PICKUP_WINDOW_WEEKS,
  REFUND_TIME,
  RETURN_DAYS,
  SELLOUT_TEXT,
  arrivalTimesText,
} from './policies';

export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

export interface FaqSection {
  category: string;
  items: FaqItem[];
}

export function getFaqSections(countries: readonly CountryCode[]): FaqSection[] {
  return [
    {
      category: 'Pedidos',
      items: [
        {
          id: 'como-pedir',
          q: '¿Cómo realizo un pedido?',
          a: 'Agrega los productos al carrito, elige cómo lo recibes (envío o recojo gratis en tienda) y tu método de pago, y confirma. Te damos un número de pedido; envíalo por WhatsApp con tu comprobante y lo confirmamos.',
        },
        {
          id: 'cancelar',
          q: '¿Puedo cancelar un pedido?',
          a: 'Puedes cancelar antes de que confirmemos el envío. Escríbenos por WhatsApp de inmediato. Si ya fue enviado, aplica la política de devoluciones.',
        },
        {
          id: 'modificar',
          q: '¿Puedo modificar mi pedido?',
          a: 'Solo antes de confirmar el pago. Escríbenos por WhatsApp de inmediato si necesitas cambios.',
        },
      ],
    },
    {
      category: 'Preventas',
      items: [
        {
          id: 'preventa',
          q: '¿Qué es una preventa?',
          a: `Son tomos que aún no llegan. Los separas pagando el ${DEPOSIT_PERCENT} % de su valor y el resto cuando llegan. Las ediciones limitadas pueden pedir otro monto.`,
        },
        {
          id: 'preventa-tiempos',
          q: '¿Cuánto demora una preventa?',
          a: `Se cuenta desde el cierre de la preventa. ${arrivalTimesText(countries)}.`,
        },
        {
          id: 'agotado',
          q: '¿Qué pasa si la editorial agota un tomo que separé?',
          a: `Tú eliges: ${SELLOUT_TEXT}.`,
        },
        {
          id: 'plazo-recojo',
          q: '¿Cuánto tiempo tengo para recoger mi pedido?',
          a: `${PICKUP_WINDOW_WEEKS} semanas desde que llega. Pasado ese plazo, lo que separaste queda como saldo a favor para otra compra.`,
        },
      ],
    },
    {
      category: 'Pagos',
      items: [
        {
          id: 'metodos-pago',
          q: '¿Qué métodos de pago aceptan?',
          a: `Yape y Plin al ${YAPE_PLIN_NUMBER}, o transferencia bancaria BCP. El pago se hace antes del envío.`,
        },
        {
          id: 'confirmar-pago',
          q: '¿Cómo confirmo mi pago?',
          a: 'Paga por Yape, Plin o transferencia y envíanos el comprobante (captura) por WhatsApp junto con tu número de pedido.',
        },
        {
          id: 'boleta',
          q: '¿Ofrecen boleta o factura?',
          a: 'Por el momento emitimos boleta de venta. Escríbenos si necesitas factura para tu empresa.',
        },
        {
          id: 'pago-seguro',
          q: '¿Es seguro pagar?',
          a: 'Sí. Yape y Plin son plataformas reguladas y nunca te pedimos datos bancarios.',
        },
      ],
    },
    {
      category: 'Envíos y recojo',
      items: [
        {
          id: 'destinos',
          q: '¿A dónde hacen envíos?',
          a: `A todo el Perú por Olva Courier o Shalom. También puedes elegir ${PICKUP_TEXT.charAt(0).toLowerCase()}${PICKUP_TEXT.slice(1)}.`,
        },
        {
          id: 'envio-tiempo',
          q: '¿Cuánto demora y cuánto cuesta el envío?',
          a: `De ${DELIVERY_DAYS} según el destino, desde S/ ${CHEAPEST_DELIVERY.toFixed(2)}. Desde S/ ${FREE_SHIPPING_FROM} de compra el envío es gratis. La tabla completa está en Políticas de envío.`,
        },
        {
          id: 'recojo',
          q: '¿Puedo recoger en tienda?',
          a: `Sí, es gratis. Elige "Recojo en tienda" en el carrito y te esperamos en ${STORE.streetAddress}, ${STORE.city} (${STORE.daysLabel.toLowerCase()}, ${STORE.hoursShortLabel})`,
        },
        {
          id: 'rastreo',
          q: '¿Cómo rastreo mi pedido?',
          a: 'Te enviamos el número de guía del courier para que hagas el seguimiento.',
        },
      ],
    },
    {
      category: 'Productos',
      items: [
        {
          id: 'originales',
          q: '¿Los mangas son originales?',
          a: 'Sí. Trabajamos solo con editoriales oficiales como Ivrea, Ovni Press y Panini.',
        },
        {
          id: 'idioma',
          q: '¿En qué idioma están los mangas?',
          a: 'Todos están en español y vienen de editoriales oficiales.',
        },
        {
          id: 'pedido-especial',
          q: '¿Puedo pedir un manga que no está en el catálogo?',
          a: 'Sí. Escríbenos por WhatsApp y lo buscamos para ti.',
        },
      ],
    },
    {
      category: 'Devoluciones',
      items: [
        {
          id: 'devolver',
          q: '¿Puedo devolver un manga?',
          a: `Sí, dentro de los ${RETURN_DAYS} días de recibido, si está en perfecto estado y con su embalaje original. Las preventas no se devuelven una vez confirmadas, salvo que la editorial agote el tomo.`,
        },
        {
          id: 'proceso-devolucion',
          q: '¿Cómo proceso una devolución?',
          a: 'Escríbenos por WhatsApp con fotos del producto y el motivo, y te indicamos los pasos.',
        },
        {
          id: 'reembolso',
          q: '¿Me devuelven el dinero?',
          a: `Sí. El reembolso completo se procesa en ${REFUND_TIME} desde que recibimos el producto.`,
        },
      ],
    },
  ];
}

/** Las preguntas que se repiten en Contacto, en ese orden. */
export function pickFaq(sections: FaqSection[], ids: readonly string[]): FaqItem[] {
  const all = sections.flatMap((s) => s.items);
  return ids.map((id) => all.find((item) => item.id === id)).filter((x): x is FaqItem => Boolean(x));
}

import type { Metadata } from 'next';
import { FaqAccordion } from './FaqAccordion';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description: 'Resolvemos todas tus dudas sobre pedidos, pagos, envíos y productos de NekoMangaCix.',
};

const faqs = [
  {
    category: 'Pedidos',
    items: [
      { q: '¿Cómo realizo un pedido?', a: 'Agrega los productos al carrito, selecciona tu método de pago y confirma el pedido por WhatsApp. Nuestro equipo coordinará contigo los detalles de la entrega.' },
      { q: '¿Puedo cancelar un pedido?', a: 'Puedes cancelar antes de que confirmemos el envío. Escríbenos por WhatsApp inmediatamente. Si ya fue enviado, aplica nuestra política de devoluciones.' },
      { q: '¿Puedo modificar mi pedido?', a: 'Solo es posible antes de confirmar el pago. Contáctanos de inmediato por WhatsApp si necesitas cambios.' },
      { q: '¿Qué significa "a pedido"?', a: 'Estos productos no están en stock físico. Los importamos especialmente para ti. El tiempo estimado es de 2-3 semanas desde la confirmación.' },
    ],
  },
  {
    category: 'Pagos',
    items: [
      { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos Yape (924 262 747), Plin (924 262 747) y transferencia bancaria BCP. El pago se realiza antes del envío.' },
      { q: '¿Cómo confirmo mi pago?', a: 'Realiza la transferencia o pago por Yape/Plin y envíanos el comprobante (screenshot) por WhatsApp para confirmar tu pedido.' },
      { q: '¿Ofrecen boleta o factura?', a: 'Por el momento emitimos boleta de venta. Contáctanos si necesitas una factura para tu empresa.' },
      { q: '¿Es seguro pagar?', a: 'Sí. Usamos Yape y Plin que son plataformas reguladas. Nunca pedimos tus datos bancarios directamente.' },
    ],
  },
  {
    category: 'Envíos',
    items: [
      { q: '¿A dónde hacen envíos?', a: 'Enviamos a todo el Perú. Coordinaremos el envío por WhatsApp una vez confirmado el pago.' },
      { q: '¿Cuánto demora el envío?', a: 'De 2 a 5 días hábiles según tu ubicación. Chiclayo y Lima tienen tiempos más cortos.' },
      { q: '¿Tienen recojo en tienda?', a: 'Por el momento operamos solo con envíos. Pronto habilitaremos recojo en Chiclayo.' },
      { q: '¿Cómo rastreo mi pedido?', a: 'Te enviaremos el número de guía del courier para que puedas hacer seguimiento.' },
    ],
  },
  {
    category: 'Productos',
    items: [
      { q: '¿Los mangas son originales?', a: 'Sí, trabajamos exclusivamente con editoriales oficiales como Ivrea, Ovni Press, Panini y Viz Media.' },
      { q: '¿En qué idioma están los mangas?', a: 'Todos los mangas son en español latino, provenientes de editoriales de Argentina y México.' },
      { q: '¿Puedo solicitar un manga que no está en el catálogo?', a: 'Sí. Escríbenos por WhatsApp y buscamos conseguirlo para ti. Manejamos pedidos personalizados.' },
      { q: '¿Qué es una preventa?', a: 'Son productos que aún no han llegado. Puedes reservarlos pagando un adelanto y el resto cuando llegue.' },
    ],
  },
  {
    category: 'Devoluciones',
    items: [
      { q: '¿Puedo devolver un manga?', a: 'Sí, dentro de los 7 días de recibido, si está en perfectas condiciones y con embalaje original.' },
      { q: '¿Cómo proceso una devolución?', a: 'Contáctanos por WhatsApp con fotos del producto y el motivo. Te indicaremos los pasos a seguir.' },
      { q: '¿Me devuelven el dinero?', a: 'Sí, procesamos el reembolso completo en 48-72 horas hábiles una vez recibamos el producto.' },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Preguntas Frecuentes</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-12">Todo lo que necesitas saber sobre NekoMangaCix.</p>

      <FaqAccordion sections={faqs} />

      <div className="mt-10 bg-[#2b496d] text-white rounded-xl p-8 text-center">
        <h3 className="text-xl font-bold mb-2">¿No encontraste tu respuesta?</h3>
        <p className="text-blue-200 mb-4 text-sm">Contáctanos directamente y te respondemos de inmediato.</p>
        <a
          href="https://wa.me/51924262747"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm"
        >
          Escribir por WhatsApp
        </a>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle, Mail, HelpCircle } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { FaqAccordion } from './FaqAccordion';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description:
    'Resolvemos todas tus dudas sobre pedidos, pagos, envíos y productos de NekoMangaCix.',
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
      { q: '¿En qué idioma están los mangas?', a: 'Todos los mangas son en español latino, provenientes de editoriales de Argentina, México y España.' },
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
  const totalQuestions = faqs.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="w-full">
      <PageHero
        eyebrow="Preguntas frecuentes"
        title={
          <>
            Resolvamos tus <span className="text-neko-gradient">dudas</span>.
          </>
        }
        subtitle={`${totalQuestions} preguntas organizadas por tema. Si no encuentras tu respuesta, escríbenos por WhatsApp.`}
      />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FaqAccordion sections={faqs} />

        {/* CTA */}
        <div className="mt-10 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0f] via-[#1e3550] to-[#0a0a0f] text-white p-6 sm:p-8">
          <div className="absolute inset-0 bg-halftone opacity-40 pointer-events-none" aria-hidden="true" />
          <div
            className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#ec4899] opacity-25 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-16 -right-12 w-56 h-56 rounded-full bg-[#25D366] opacity-25 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <HelpCircle size={18} className="text-[#ec4899]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
                  ¿Algo más?
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-1">
                ¿No encontraste tu respuesta?
              </h3>
              <p className="text-sm text-white/70 max-w-md">
                Escríbenos por WhatsApp o al correo y te respondemos rápido.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://wa.me/51924262747"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold text-sm shadow-lg shadow-[#25D366]/25 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/15 hover:bg-white/20 font-semibold text-sm transition-all"
              >
                <Mail size={16} /> Escribir
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

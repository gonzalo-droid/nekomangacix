import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin, MessageCircle } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { getFaqSections, pickFaq } from '@/lib/content/faq';
import { pageMetadata } from '@/lib/seo';
import { STORE, WHATSAPP_URL } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Contacto',
  description:
    'Escríbenos por WhatsApp: pedidos, preventas y recomendaciones de manga y coleccionables en todo el Perú.',
  path: '/contact',
});

// Las mismas respuestas que /faq: salen de una sola fuente.
const FAQS = pickFaq(getFaqSections([]), ['envio-tiempo', 'recojo', 'metodos-pago', 'devolver']);

/**
 * Atajos de WhatsApp con el mensaje ya escrito. Reemplazan al formulario de
 * correo: toda la atención es por WhatsApp (decisión del 2026-11-12).
 */
const TOPICS = [
  { label: 'Consultar mi pedido', text: 'Hola, quiero consultar por mi pedido #' },
  { label: 'Preguntar por un manga', text: 'Hola, ¿tienen o pueden conseguir este manga? ' },
  { label: 'Preventas', text: 'Hola, quiero información sobre las preventas.' },
  { label: 'Otra consulta', text: 'Hola Neko Manga Cix, tengo una consulta.' },
];

const waLink = (text: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;

export default function ContactPage() {
  return (
    <div className="w-full">
      <PageHero
        eyebrow="Contacto"
        title={
          <>
            Hablemos de <span className="text-neko-gradient">manga</span>.
          </>
        }
        subtitle="Pregunta, sigue tu pedido o pide una recomendación: te atendemos por WhatsApp."
      />

      {/* WhatsApp: el único canal para escribirnos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-10" aria-labelledby="contacto-whatsapp">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-xl shadow-gray-900/5 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#25D366]/15 text-[#047857] flex items-center justify-center" aria-hidden="true">
                <MessageCircle size={24} />
              </span>
              <div>
                <h2 id="contacto-whatsapp" className="text-2xl font-extrabold text-gray-900">Escríbenos por WhatsApp</h2>
                <p className="mt-1 text-sm text-gray-600">
                  (+51) 924 462 641 · todos los días. Elige un tema y el mensaje se abre ya escrito.
                </p>
              </div>
            </div>

            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TOPICS.map((topic) => (
                <li key={topic.label}>
                  <a
                    href={waLink(topic.text)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 min-h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 hover:border-[#047857] hover:bg-[#25D366]/10 text-sm font-semibold text-gray-900 transition-colors"
                  >
                    {topic.label}
                    <ArrowRight size={16} className="text-[#047857] transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>

            <a
              href={waLink('Hola Neko Manga Cix')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full sm:w-auto items-center justify-center gap-2 min-h-12 px-7 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold transition-colors"
            >
              <MessageCircle size={18} aria-hidden="true" /> Abrir WhatsApp
            </a>
          </div>

          {/* Tienda física */}
          <a
            href={STORE.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl bg-white border border-gray-200 shadow-xl shadow-gray-900/5 p-6 sm:p-8 hover:border-[#be185d]/40 transition-colors"
          >
            <span className="w-12 h-12 rounded-xl bg-[#ec4899]/10 text-neko-magenta-ink flex items-center justify-center" aria-hidden="true">
              <MapPin size={24} />
            </span>
            <h2 className="mt-4 text-xl font-extrabold text-gray-900">Tienda física</h2>
            <p className="mt-1 text-sm font-semibold text-gray-900">{STORE.streetAddress}, {STORE.city}</p>
            <p className="mt-1 text-sm text-gray-600 flex items-center gap-1.5">
              <Clock size={14} aria-hidden="true" /> {STORE.daysLabel}, {STORE.hoursShortLabel}
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-neko-magenta-ink">
              Cómo llegar <ArrowRight size={16} aria-hidden="true" />
            </p>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8 relative">
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.25em] text-neko-magenta-ink mb-2">
            {'// Preguntas frecuentes'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Dudas rápidas</h2>
          <span className="absolute -bottom-3 left-0 w-16 h-1 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="bg-white border border-gray-100 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-1.5">{q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          ¿No encuentras tu respuesta?{' '}
          <Link href="/faq" className="text-neko-magenta-ink font-semibold hover:underline">
            Ver todas las preguntas frecuentes
          </Link>
        </p>
      </section>
    </div>
  );
}

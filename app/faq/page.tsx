import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { MessageCircle, Mail, HelpCircle } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { FaqAccordion } from './FaqAccordion';
import { getFaqSections } from '@/lib/content/faq';
import { getAvailableCountries } from '@/lib/domain/products/availability';

export const metadata: Metadata = pageMetadata({
  title: 'Preguntas frecuentes',
  description:
    'Resolvemos tus dudas sobre pedidos, preventas, pagos y envíos de manga a todo el Perú.',
  path: '/faq',
});

export default async function FaqPage() {
  const faqs = getFaqSections(await getAvailableCountries());
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
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">
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
                href="https://wa.me/51924462641"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0b8043] hover:bg-[#09703a] text-white font-bold text-sm shadow-lg shadow-[#25D366]/25 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/15 hover:bg-white/20 font-semibold text-sm transition-all"
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

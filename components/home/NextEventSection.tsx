import Link from 'next/link';
import { ArrowRight, Instagram } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import EventCard from '@/components/events/EventCard';
import { getNextEvent } from '@/lib/events';
import { INSTAGRAM_URL } from '@/lib/site';

/** Próxima feria del home, o un aviso de "pronto" si no hay ninguna anunciada. */
export default function NextEventSection() {
  const event = getNextEvent();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14" aria-labelledby="home-eventos">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionHeader
            id="home-eventos"
            badge="// Ferias y eventos"
            title="Nos vemos en la próxima feria"
            description="Llevamos manga, figuras y coleccionables a las ferias de la región. Ven a conocernos y a recoger tus pedidos."
          />
        </div>
        <Link
          href="/events"
          className="mb-8 hidden sm:inline-flex items-center gap-1.5 min-h-11 text-sm font-bold text-neko-magenta-ink hover:underline underline-offset-4"
        >
          Ver todos los eventos <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {event ? (
        <EventCard event={event}>
          <Link
            href="/events"
            className="sm:hidden inline-flex items-center justify-center gap-1.5 min-h-12 rounded-xl border-2 border-gray-300 dark:border-white/20 text-sm font-bold text-gray-900 dark:text-white"
          >
            Ver todos los eventos <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </EventCard>
      ) : (
        <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/15 bg-white dark:bg-gray-900 p-8 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">Pronto anunciamos la próxima feria</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Síguenos en Instagram para enterarte primero.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 min-h-11 px-5 rounded-xl border-2 border-[#be185d] text-neko-magenta-ink font-bold hover:bg-[#be185d] hover:text-white transition-colors"
          >
            <Instagram size={18} aria-hidden="true" /> @neko.manga.cix
          </a>
        </div>
      )}
    </section>
  );
}

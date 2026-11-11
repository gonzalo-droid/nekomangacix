import type { Metadata } from 'next';
import { Facebook, Instagram } from 'lucide-react';
import PageHero from '@/components/PageHero';
import FairGallery from '@/components/FairGallery';
import JsonLd from '@/components/JsonLd';
import EventCard from '@/components/events/EventCard';
import { getUpcomingEvents, type SiteEvent } from '@/lib/events';
import { pageMetadata } from '@/lib/seo';
import { INSTAGRAM_URL, SITE_NAME, absoluteUrl } from '@/lib/site';

// Lo que es "próximo" depende de la fecha: se regenera cada hora.
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: 'Ferias y eventos',
  description:
    'Próximas ferias y eventos de Neko Manga Cix en Chiclayo: fechas, lugar y cómo agendarlas. Revive también nuestras ferias pasadas.',
  path: '/events',
});

const FACEBOOK_URL = 'https://www.facebook.com/people/Neko-Manga-CIX/61562296206939/';

function eventJsonLd(event: SiteEvent): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.startsAt,
    endDate: event.endsAt,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.address,
        addressLocality: event.city,
        addressCountry: 'PE',
      },
    },
    organizer: { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/') },
    url: absoluteUrl('/events'),
  };
}

export default function EventsPage() {
  const upcoming = getUpcomingEvents();

  return (
    <div className="w-full">
      {upcoming.length > 0 && <JsonLd data={upcoming.map(eventJsonLd)} />}

      <PageHero
        eyebrow="Ferias y eventos"
        title={
          <>
            Nos vemos en la <span className="text-neko-gradient">feria</span>.
          </>
        }
        subtitle="Nos encanta conectar con la comunidad en persona. Participamos en las ferias de la región para que veas los tomos de cerca, recojas tus pedidos y compartas con otros fans."
      >
        <div className="flex flex-wrap gap-3">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-11 px-5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-semibold transition-colors"
          >
            <Instagram size={18} aria-hidden="true" /> Síguenos en Instagram
          </a>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-11 px-5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-semibold transition-colors"
          >
            <Facebook size={18} aria-hidden="true" /> Facebook
          </a>
        </div>
      </PageHero>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14" aria-labelledby="proximos-eventos">
        <h2 id="proximos-eventos" className="text-xs font-bold uppercase tracking-[0.3em] text-gray-600 dark:text-gray-400 mb-6">
          Próximos eventos
        </h2>
        {upcoming.length > 0 ? (
          <div className="space-y-10">
            {upcoming.map((event) => (
              <EventCard key={event.slug} event={event} headingLevel="h3" />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/15 bg-white dark:bg-gray-900 p-8 text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">Pronto anunciamos la próxima feria</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Síguenos en Instagram para enterarte primero.</p>
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <FairGallery />
      </section>
    </div>
  );
}

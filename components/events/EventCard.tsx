import { CalendarClock, CalendarPlus, MapPin } from 'lucide-react';
import {
  eventCountdown,
  eventDateParts,
  formatEventDate,
  googleCalendarUrl,
  mapsUrl,
  type SiteEvent,
} from '@/lib/events';

interface Props {
  event: SiteEvent;
  /** Nivel del título: `h3` en el home (bajo el h2 de la sección), `h2` en /events. */
  headingLevel?: 'h2' | 'h3';
  children?: React.ReactNode;
}

/**
 * Tarjeta de un evento próximo: bloque de fecha, cuándo, dónde y el botón para
 * agendarlo en Google Calendar. `children` agrega acciones extra al final.
 */
export default function EventCard({ event, headingLevel = 'h3', children }: Props) {
  const Heading = headingLevel;
  const { day, month } = eventDateParts(event);
  const countdown = eventCountdown(event);

  return (
    <article className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-4 sm:gap-5">
      {/* Cartel */}
      <div className="relative isolate overflow-hidden rounded-3xl min-h-[15rem] sm:min-h-[19rem] p-6 sm:p-8 flex flex-col justify-between text-white bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]">
        <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-[#ec4899] opacity-35 blur-[80px] -z-10" aria-hidden="true" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-[#06b6d4] opacity-25 blur-[90px] -z-10" aria-hidden="true" />
        <div className="absolute inset-0 bg-halftone opacity-40 -z-10" aria-hidden="true" />

        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#be185d] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse motion-reduce:animate-none" aria-hidden="true" />
            {countdown}
          </span>
          {/* Fecha grande. El texto completo va en la ficha de al lado. */}
          <div className="flex-shrink-0 w-20 rounded-2xl bg-white text-gray-900 text-center overflow-hidden shadow-xl" aria-hidden="true">
            <div className="bg-gradient-to-r from-[#ec4899] to-[#06b6d4] text-white text-xs font-bold uppercase tracking-widest py-1">
              {month}
            </div>
            <div className="text-4xl font-extrabold leading-none py-2">{day}</div>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-2">Próxima feria</p>
          <Heading className="text-3xl sm:text-4xl font-extrabold leading-tight">{event.title}</Heading>
          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-md">{event.description}</p>
        </div>
      </div>

      {/* Datos y acciones */}
      <div className="flex flex-col gap-3">
        <div className="contents">
          <div className="flex items-start gap-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 p-5">
            <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#ec4899]/10 text-neko-magenta-ink flex items-center justify-center" aria-hidden="true">
              <CalendarClock size={22} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Fecha y hora</p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white first-letter:uppercase">{formatEventDate(event)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{event.hoursLabel}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 p-5">
            <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#06b6d4]/10 text-neko-cyan-ink flex items-center justify-center" aria-hidden="true">
              <MapPin size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Lugar</p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{event.venue}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {event.address}, {event.city} ·{' '}
                <a
                  href={mapsUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-neko-cyan-ink underline underline-offset-2 hover:no-underline"
                >
                  Ver en el mapa
                </a>
              </p>
            </div>
          </div>
        </div>

        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-2 min-h-12 rounded-xl bg-[#be185d] hover:bg-[#9d174d] px-6 font-bold text-white transition-colors"
        >
          <CalendarPlus size={18} aria-hidden="true" />
          Agendar en Google Calendar
        </a>
        {children}
      </div>
    </article>
  );
}

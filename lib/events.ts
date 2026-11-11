/**
 * Ferias y eventos donde está Neko Manga Cix.
 *
 * Para anunciar un evento nuevo se agrega acá y se publica: el home muestra el
 * próximo y `/events` lista todos. Las fechas van con el huso de Lima (-05:00)
 * para que el corte entre "próximo" y "pasado" sea el de Perú.
 */

export interface SiteEvent {
  slug: string;
  title: string;
  /** Inicio y fin en ISO 8601 con huso horario. */
  startsAt: string;
  endsAt: string;
  /** Horario tal como se anuncia ("10 a. m. a 8 p. m."). */
  hoursLabel: string;
  venue: string;
  address: string;
  city: string;
  description: string;
  /** Publicación con el detalle (Instagram, Facebook…), si existe. */
  infoUrl?: string;
}

export const EVENTS: readonly SiteEvent[] = [
  {
    slug: 'feriaton-cix-v-edicion',
    title: 'Feriatón Cix – V Edición',
    startsAt: '2026-11-22T10:00:00-05:00',
    endsAt: '2026-11-22T20:00:00-05:00',
    hoursLabel: '10 a. m. a 8 p. m.',
    venue: 'Ex Casa de la Cultura',
    address: 'Luis Gonzáles 345',
    city: 'Chiclayo',
    description:
      'Encuéntranos en el Feriatón Cix con manga, figuras y coleccionables. Ven a ver los tomos en persona y recoger tus pedidos.',
  },
];

const LIMA_TZ = 'America/Lima';

/** Eventos que aún no terminaron, del más cercano al más lejano. */
export function getUpcomingEvents(now: Date = new Date()): SiteEvent[] {
  return EVENTS.filter((e) => new Date(e.endsAt) > now).sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}

export function getNextEvent(now: Date = new Date()): SiteEvent | null {
  return getUpcomingEvents(now)[0] ?? null;
}

/** "domingo 22 de noviembre de 2026" */
export function formatEventDate(event: SiteEvent): string {
  return new Intl.DateTimeFormat('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: LIMA_TZ,
  }).format(new Date(event.startsAt));
}

/** Día y mes abreviado para el bloque de fecha: { day: '22', month: 'nov' } */
export function eventDateParts(event: SiteEvent): { day: string; month: string } {
  const date = new Date(event.startsAt);
  const day = new Intl.DateTimeFormat('es-PE', { day: 'numeric', timeZone: LIMA_TZ }).format(date);
  const month = new Intl.DateTimeFormat('es-PE', { month: 'short', timeZone: LIMA_TZ })
    .format(date)
    .replace('.', '');
  return { day, month };
}

/**
 * Texto de cuenta regresiva: "Hoy", "Mañana", "Faltan 11 días" o "En curso".
 * Se calcula al renderizar; el home se regenera cada pocos minutos.
 */
export function eventCountdown(event: SiteEvent, now: Date = new Date()): string {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  if (now >= start && now < end) return 'En curso';

  const dayKey = (d: Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: LIMA_TZ }).format(d); // AAAA-MM-DD
  const days = Math.round(
    (Date.parse(dayKey(start)) - Date.parse(dayKey(now))) / 86_400_000,
  );
  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  return `Faltan ${days} días`;
}

/** AAAAMMDDTHHMMSSZ, el formato que espera Google Calendar. */
function toCalendarStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Enlace para agregar el evento a Google Calendar. */
export function googleCalendarUrl(event: SiteEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.title} · Neko Manga Cix`,
    dates: `${toCalendarStamp(event.startsAt)}/${toCalendarStamp(event.endsAt)}`,
    ctz: LIMA_TZ,
    location: `${event.venue}, ${event.address}, ${event.city}, Perú`,
    details: `${event.description}\n\nhttps://www.nekomangacix.com/events`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function mapsUrl(event: SiteEvent): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.venue}, ${event.address}, ${event.city}, Perú`,
  )}`;
}

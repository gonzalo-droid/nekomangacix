/**
 * Diapositivas del hero del home.
 *
 * Las campañas salen de `public/images/banners/banners.json` (una entrada por
 * imagen de esa carpeta) y la próxima feria, de `lib/events.ts`, sin tener que
 * repetirla como banner. El JSON se importa, no se lee del disco: así viaja
 * dentro del build y el home se puede regenerar en el servidor.
 *
 * Campos de cada campaña en el JSON:
 *   kicker, title, subtitle   textos (el título es el encabezado de la diapositiva)
 *   cta, link                 botón principal
 *   secondaryCta, secondaryLink  botón secundario (opcional)
 *   alt                       descripción de la imagen
 *   imagePosition             qué parte de la imagen se ve al recortarla ("100% 50%" = la derecha)
 *   type                      preventa | feria | novedad | general (color de la etiqueta)
 *   endsAt                    cierre en ISO con huso ("2026-11-19T23:59:59-05:00"): se muestra
 *                             la fecha límite y la campaña desaparece sola al pasar
 *
 * La imagen se usa como arte, no como texto: lo que haya que leer va en los
 * campos, porque dentro de un PNG no lo lee Google ni un lector de pantalla y
 * en el celular queda ilegible.
 */
import manifest from '@/public/images/banners/banners.json';
import {
  daysUntilInLima,
  formatLimaDay,
  eventCountdown,
  eventDateParts,
  formatEventDate,
  getNextEvent,
  googleCalendarUrl,
} from '@/lib/events';

export type SlideTone = 'preventa' | 'feria' | 'novedad' | 'general';

export interface SlideAction {
  label: string;
  href: string;
  external?: boolean;
}

export interface HeroSlide {
  id: string;
  tone: SlideTone;
  kicker: string;
  title: string;
  subtitle?: string;
  primary: SlideAction;
  secondary?: SlideAction;
  image?: { src: string; alt: string; position: string };
  /** Solo en la diapositiva de evento: el arte es la fecha grande. */
  date?: { day: string; month: string };
  /** Cierre de la campaña: "Hasta el miércoles 19 de noviembre" + "faltan 7 días". */
  deadline?: { label: string; countdown: string };
}

interface CampaignEntry {
  type?: string;
  kicker?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  link?: string;
  secondaryCta?: string;
  secondaryLink?: string;
  alt?: string;
  imagePosition?: string;
  endsAt?: string;
}

const TONES: readonly SlideTone[] = ['preventa', 'feria', 'novedad', 'general'];

function toTone(value: string | undefined): SlideTone {
  return TONES.includes(value as SlideTone) ? (value as SlideTone) : 'general';
}

function deadlineFor(endsAt: string, now: Date): HeroSlide['deadline'] {
  const days = daysUntilInLima(endsAt, now);
  const countdown = days <= 0 ? 'último día' : days === 1 ? 'cierra mañana' : `faltan ${days} días`;
  return { label: `Hasta el ${formatLimaDay(endsAt)}`, countdown };
}

function campaignSlides(now: Date): HeroSlide[] {
  return Object.entries(manifest as Record<string, CampaignEntry>).flatMap(([file, entry]) => {
    // Sin título, botón y enlace no hay campaña que mostrar.
    if (!entry.title || !entry.cta || !entry.link) return [];
    // Una campaña cerrada no se anuncia.
    if (entry.endsAt && new Date(entry.endsAt) <= now) return [];
    return [{
      id: file,
      tone: toTone(entry.type),
      kicker: entry.kicker ?? 'Novedad',
      title: entry.title,
      subtitle: entry.subtitle,
      primary: { label: entry.cta, href: entry.link },
      secondary:
        entry.secondaryCta && entry.secondaryLink
          ? { label: entry.secondaryCta, href: entry.secondaryLink }
          : undefined,
      image: {
        src: `/images/banners/${file}`,
        alt: entry.alt ?? '',
        position: entry.imagePosition ?? '50% 50%',
      },
      deadline: entry.endsAt ? deadlineFor(entry.endsAt, now) : undefined,
    }];
  });
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function eventSlide(now: Date): HeroSlide | null {
  const event = getNextEvent(now);
  if (!event) return null;
  return {
    id: `evento-${event.slug}`,
    tone: 'feria',
    kicker: `Próxima feria · ${eventCountdown(event, now)}`,
    title: event.title,
    subtitle: `${capitalize(formatEventDate(event))} · ${event.hoursLabel} · ${event.venue}, ${event.city}`,
    primary: { label: 'Ver detalles', href: '/events' },
    secondary: { label: 'Agendar', href: googleCalendarUrl(event), external: true },
    date: eventDateParts(event),
  };
}

/** Si no hay campañas vigentes ni feria próxima, el hero igual dice qué es la tienda. */
const FALLBACK_SLIDE: HeroSlide = {
  id: 'catalogo',
  tone: 'general',
  kicker: 'Neko Manga Cix',
  title: 'Manga en español y coleccionables originales',
  subtitle: 'Tomos en stock y en preventa, con envíos a todo el Perú y recojo gratis en Chiclayo.',
  primary: { label: 'Ver catálogo', href: '/products' },
  secondary: { label: 'Cómo funciona', href: '#home-politicas' },
};

/** Campañas primero (la preventa manda), después la próxima feria. */
export function getHeroSlides(now: Date = new Date()): HeroSlide[] {
  const slides = campaignSlides(now);
  const event = eventSlide(now);
  const all = event ? [...slides, event] : slides;
  return all.length > 0 ? all : [FALLBACK_SLIDE];
}

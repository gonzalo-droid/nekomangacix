/**
 * Identidad del sitio y dominio canónico. Única fuente para metadata, sitemap,
 * robots y datos estructurados: antes cada archivo declaraba su propio
 * `SITE_URL` con su propio valor por defecto.
 */

const CANONICAL_HOST = 'www.nekomangacix.com';
const APEX_HOST = 'nekomangacix.com';

/**
 * El dominio sin `www` redirige al `www`. Declararle a Google el que redirige
 * (en canónicas, sitemap y `og:url`) es justo lo que hay que evitar, así que si
 * la variable de entorno apunta al dominio raíz se corrige acá en vez de
 * depender de que alguien la actualice en Vercel.
 */
function resolveSiteUrl(raw: string | undefined): string {
  const fallback = `https://${CANONICAL_HOST}`;
  if (!raw) return fallback;
  try {
    const url = new URL(raw);
    if (url.hostname === APEX_HOST) url.hostname = CANONICAL_HOST;
    return url.origin;
  } catch {
    return fallback;
  }
}

export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const SITE_NAME = 'NEKO MANGA CIX';
export const SITE_TAGLINE = 'Tu tienda de manga y coleccionables en Perú';
export const SITE_DESCRIPTION =
  'NEKO MANGA CIX — la tienda online peruana de manga en español y coleccionables originales. Envíos a todo el país desde Chiclayo.';

export const CONTACT_EMAIL = 'contacto@nekomangacix.com';
export const CONTACT_PHONE = '+51924462641';

export const SOCIAL_PROFILES: readonly string[] = [
  'https://www.instagram.com/neko.manga.cix/',
  'https://www.facebook.com/people/Neko-Manga-CIX/61562296206939/',
  'https://www.tiktok.com/@neko.manga.cix',
];

export const LOGO_PATH = '/images/brand/logo-dark-trimmed.png';

export const INSTAGRAM_URL = 'https://www.instagram.com/neko.manga.cix/';
export const INSTAGRAM_HANDLE = '@neko.manga.cix';
export const WHATSAPP_URL = 'https://wa.me/51924462641';

/** Número de Yape y Plin. Distinto del de WhatsApp. */
export const YAPE_PLIN_NUMBER = '901 148 382';

/** Tienda física. Si cambia la dirección o el horario, se cambia solo acá. */
export const STORE = {
  streetAddress: 'Av. Antenor Orrego 520',
  city: 'Chiclayo',
  region: 'Lambayeque',
  daysLabel: 'Sábados y domingos',
  hoursLabel: '10:00 a. m. – 6:00 p. m.',
  hoursShortLabel: '10 a. m. – 6 p. m.',
  /** Para datos estructurados (schema.org `openingHoursSpecification`). */
  openingHours: { days: ['Saturday', 'Sunday'], opens: '10:00', closes: '18:00' },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Av.%20Antenor%20Orrego%20520%2C%20Chiclayo%2C%20Per%C3%BA',
} as const;

/** Imagen social por defecto (1200×630). Vive en `public/`. */
export const DEFAULT_OG_IMAGE = {
  url: '/og-default.jpg',
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
} as const;

/** Convierte una ruta del sitio en URL absoluta sobre el dominio canónico. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;
  if (path === '/' || path === '') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

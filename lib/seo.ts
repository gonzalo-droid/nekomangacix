import type { Metadata } from 'next';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  DEFAULT_OG_IMAGE,
  LOGO_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_PROFILES,
  STORE,
  absoluteUrl,
} from './site';

interface SocialImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

interface PageSeo {
  /** Sin la marca: el layout raíz la agrega con su plantilla. */
  title: string;
  description: string;
  /** Ruta canónica (`/faq`). `null` = sin canónica, para vistas no indexables. */
  path: string | null;
  /** `false` agrega `noindex, follow`. */
  index?: boolean;
  image?: SocialImage;
}

/**
 * Metadata completa de una página.
 *
 * Next mezcla la metadata por claves de primer nivel: una página que solo
 * declara `title` hereda entero el `openGraph` del layout, con el título y la
 * URL del home. Por eso acá se arma todo junto: canónica, Open Graph y Twitter
 * con los datos de la propia página.
 */
export function pageMetadata({
  title,
  description,
  path,
  index = true,
  image = DEFAULT_OG_IMAGE,
}: PageSeo): Metadata {
  return {
    title,
    description,
    alternates: path ? { canonical: path } : {},
    ...(index ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type: 'website',
      locale: 'es_PE',
      siteName: SITE_NAME,
      title,
      description,
      ...(path ? { url: path } : {}),
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
  };
}

/** Metadata mínima para rutas privadas o de paso: fuera del índice. */
export function privatePageMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
    alternates: {},
  };
}

/**
 * Datos estructurados del sitio, para el home: quién es la tienda (nombre,
 * logo, contacto, redes) y cómo se llama el sitio en los resultados.
 */
export function siteJsonLd(): Record<string, unknown>[] {
  const organizationId = `${SITE_URL}/#organization`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Store',
      '@id': organizationId,
      name: SITE_NAME,
      alternateName: ['Neko Manga Cix', 'NekoMangaCix'],
      url: SITE_URL,
      logo: absoluteUrl(LOGO_PATH),
      description: SITE_DESCRIPTION,
      email: CONTACT_EMAIL,
      telephone: CONTACT_PHONE,
      address: {
        '@type': 'PostalAddress',
        streetAddress: STORE.streetAddress,
        addressLocality: STORE.city,
        addressRegion: STORE.region,
        addressCountry: 'PE',
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: STORE.openingHours.days,
        opens: STORE.openingHours.opens,
        closes: STORE.openingHours.closes,
      },
      areaServed: { '@type': 'Country', name: 'Perú' },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: CONTACT_PHONE,
        availableLanguage: 'es',
      },
      sameAs: SOCIAL_PROFILES,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: 'Neko Manga Cix',
      inLanguage: 'es-PE',
      publisher: { '@id': organizationId },
    },
  ];
}

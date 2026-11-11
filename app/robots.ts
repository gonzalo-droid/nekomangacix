import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Carrito, perfil, acceso y `/links` NO van acá: llevan `noindex`, y
        // Google solo puede leer esa etiqueta si se le permite rastrear la
        // página. Bloquearlas en robots las deja indexables "sin contenido".
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

import type { MetadataRoute } from 'next';
import { getProductSitemapEntries } from '@/lib/productsServer';
import { absoluteUrl } from '@/lib/site';

type Entry = MetadataRoute.Sitemap[number];

// Sin `lastModified`: estas páginas no tienen una fecha de cambio real, y una
// fecha inventada (la del build, igual para todas) le enseña a Google a
// ignorar el dato también donde sí es cierto.
const STATIC_ROUTES: Entry[] = [
  { url: absoluteUrl('/'),                         changeFrequency: 'daily',   priority: 1.0 },
  { url: absoluteUrl('/products'),                 changeFrequency: 'daily',   priority: 0.9 },
  { url: absoluteUrl('/products?stock=preorder'),  changeFrequency: 'daily',   priority: 0.7 },
  { url: absoluteUrl('/products?stock=in_stock'),  changeFrequency: 'daily',   priority: 0.7 },
  { url: absoluteUrl('/products?type=manga'),      changeFrequency: 'daily',   priority: 0.7 },
  { url: absoluteUrl('/products?type=figure'),     changeFrequency: 'weekly',  priority: 0.6 },
  { url: absoluteUrl('/events'),                   changeFrequency: 'weekly',  priority: 0.6 },
  { url: absoluteUrl('/about'),                    changeFrequency: 'monthly', priority: 0.5 },
  { url: absoluteUrl('/contact'),                  changeFrequency: 'monthly', priority: 0.5 },
  { url: absoluteUrl('/faq'),                      changeFrequency: 'monthly', priority: 0.4 },
  { url: absoluteUrl('/shipping'),                 changeFrequency: 'monthly', priority: 0.3 },
  { url: absoluteUrl('/terms'),                    changeFrequency: 'yearly',  priority: 0.2 },
  { url: absoluteUrl('/privacy'),                  changeFrequency: 'yearly',  priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Misma fuente que decide qué fichas existen (`generateStaticParams`).
  const products = await getProductSitemapEntries();
  const productRoutes: Entry[] = products.map(({ slug, updatedAt }) => ({
    url: absoluteUrl(`/products/${slug}`),
    ...(updatedAt ? { lastModified: updatedAt } : {}),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...STATIC_ROUTES, ...productRoutes];
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import CampaignHero from '@/components/home/CampaignHero';
import { getHeroSlides } from '@/lib/content/campaigns';
import HomeProductSections from '@/components/HomeProductSections';
import { ProductCardSkeleton } from '@/components/Skeleton';
import { getAvailableCountries } from '@/lib/domain/products/availability';
import JsonLd from '@/components/JsonLd';
import NextEventSection from '@/components/home/NextEventSection';
import OrderPoliciesSection from '@/components/home/OrderPoliciesSection';
import StoreSection from '@/components/home/StoreSection';
import { siteJsonLd } from '@/lib/seo';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site';

export const metadata: Metadata = {
  // `absolute`: el título del home ya lleva la marca; sin esto la plantilla del
  // layout la agregaba otra vez al final.
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
  description:
    'Catálogo de manga en español y figuras coleccionables originales. Compra en stock o reserva en preventa. Envíos a todo el Perú.',
  alternates: { canonical: '/' },
};

function HomeSectionsFallback() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, i) => (
        <section key={i} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8 space-y-2">
            <div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-4 w-96 max-w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 5 }).map((__, j) => (
              <ProductCardSkeleton key={j} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

export default async function Home() {
  const availableCountries = await getAvailableCountries();

  return (
    // `@container`: el carrusel de coleccionables mide sus tarjetas contra este
    // ancho para que coincidan con las de la rejilla de mangas.
    <div className="w-full @container">
      <JsonLd data={siteJsonLd()} />
      {/* El h1 no rota con las campañas: nombra la tienda para buscadores y
          lectores de pantalla; cada campaña lleva su propio h2 visible. */}
      <h1 className="sr-only">{SITE_NAME}: manga en español y coleccionables en Perú</h1>
      <CampaignHero slides={getHeroSlides()} />

      <Suspense fallback={<HomeSectionsFallback />}>
        <HomeProductSections />
      </Suspense>

      {/* Orden: primero qué comprar, luego cómo funciona el pedido (la duda que
          aparece después de ver productos), y al final dónde encontrarnos. */}
      <OrderPoliciesSection countries={availableCountries} />
      <NextEventSection />
      <StoreSection />

    </div>
  );
}

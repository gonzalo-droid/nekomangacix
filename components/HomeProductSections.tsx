import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getFeaturedProductsByCountry } from '@/lib/productsServer';
import { COUNTRIES, type CountryCode } from '@/lib/constants/countries';
import type { Product } from '@/lib/products';

function SectionHeader({ badge, title, description }: { badge: string; title: string; description: string }) {
  return (
    <div className="relative mb-8">
      <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ec4899] mb-2">
        {badge}
      </span>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
        {title}
      </h2>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
        {description}
      </p>
      <span className="absolute -bottom-3 left-0 w-16 h-1 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full" aria-hidden="true" />
    </div>
  );
}

interface SectionProps {
  products: Product[];
  badge: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}

function FeaturedSection({ products, badge, title, description, href, linkLabel }: SectionProps) {
  if (products.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader badge={badge} title={title} description={description} />
        <Link
          href={href}
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#2b496d] dark:text-[#5a7a9e] hover:text-[#ec4899] dark:hover:text-[#ec4899] transition-colors group mb-8"
        >
          {linkLabel} <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map((p, idx) => (
          <ProductCard key={p.id} {...p} variant="compact" priority={idx < 6} showQuickAdd />
        ))}
      </div>

      <div className="sm:hidden mt-6 text-center">
        <Link
          href={href}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#2b496d] to-[#3d6491] text-white text-sm font-semibold"
        >
          {linkLabel} →
        </Link>
      </div>
    </section>
  );
}

function JaponSection({ products, badge, title, description, href, linkLabel }: SectionProps) {
  if (products.length === 0) return null;
  return (
    <section className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-8">
      {/* Fondo oscuro temático */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0f0f1a]" />
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#ec4899] opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#06b6d4] opacity-10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-14">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
          <div className="relative">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#06b6d4] mb-2">
              {badge}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-white/60 mt-2 max-w-2xl">
              {description}
            </p>
            <span className="absolute -bottom-3 left-0 w-16 h-1 bg-gradient-to-r from-[#06b6d4] to-[#ec4899] rounded-full" aria-hidden="true" />
          </div>
          <Link
            href={href}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#06b6d4] hover:text-white transition-colors group mb-8"
          >
            {linkLabel} <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} variant="compact" showQuickAdd />
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link
            href={href}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#06b6d4] text-white text-sm font-semibold"
          >
            {linkLabel} →
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Copy por país. JP usa el bloque oscuro; el resto, el claro. */
const COUNTRY_SECTIONS: Record<
  CountryCode,
  { badge: string; title: string; description: string; dark?: boolean }
> = {
  AR: {
    badge: '// Editorial Argentina',
    title: 'Selección de Argentina',
    description: 'Lo mejor de Ivrea, Panini Argentina, Ovnipress y Penguin.',
  },
  MX: {
    badge: '// Editorial México',
    title: 'Selección de México',
    description: 'Ediciones mexicanas escogidas para vos.',
  },
  ES: {
    badge: '// Editorial España',
    title: 'Selección de España',
    description: 'Ediciones españolas: Planeta Cómic, Norma Editorial y más.',
  },
  JP: {
    badge: '// Japón original',
    title: 'Figuras & Coleccionables',
    description: 'Ediciones japonesas originales, figuras y coleccionables exclusivos.',
    dark: true,
  },
};

export default async function HomeProductSections() {
  const featuredByCountry = await getFeaturedProductsByCountry();

  const sections = (Object.keys(COUNTRY_SECTIONS) as CountryCode[])
    .map((code) => ({ code, products: featuredByCountry[code] ?? [] }))
    .filter(({ products }) => products.length > 0);

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map(({ code, products }) => {
        const config = COUNTRY_SECTIONS[code];
        const href = `/products?country=${code}`;
        const linkLabel = `Ver todo de ${COUNTRIES[code].name}`;

        return config.dark ? (
          <JaponSection
            key={code}
            products={products}
            badge={config.badge}
            title={config.title}
            description={config.description}
            href={href}
            linkLabel={linkLabel}
          />
        ) : (
          <FeaturedSection
            key={code}
            products={products}
            badge={config.badge}
            title={config.title}
            description={config.description}
            href={href}
            linkLabel={linkLabel}
          />
        );
      })}
    </>
  );
}

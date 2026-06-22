import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getAllActiveProducts } from '@/lib/productsServer';
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

function NovedadesSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader
          badge="// Recién llegados"
          title="Novedades"
          description="Los últimos títulos agregados a nuestro catálogo. Sé el primero en reservarlos."
        />
        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#2b496d] dark:text-[#5a7a9e] hover:text-[#ec4899] dark:hover:text-[#ec4899] transition-colors group mb-8"
        >
          Ver catálogo completo <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map((p, idx) => (
          <ProductCard key={p.id} {...p} variant="compact" priority={idx < 6} showQuickAdd />
        ))}
      </div>

      <div className="sm:hidden mt-6 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#2b496d] to-[#3d6491] text-white text-sm font-semibold"
        >
          Ver catálogo completo →
        </Link>
      </div>
    </section>
  );
}

function PreventaSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 my-4 rounded-3xl bg-gradient-to-br from-[#2b496d]/[0.04] via-transparent to-[#ec4899]/[0.05] dark:from-[#06b6d4]/[0.05] dark:to-[#ec4899]/[0.06]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader
          badge="// Reserva ahora"
          title="Preventas activas"
          description="Asegura tu tomo antes de que llegue. Reserva con 50% de depósito."
        />
        <Link
          href="/products?status=preorder"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#2b496d] dark:text-[#5a7a9e] hover:text-[#ec4899] dark:hover:text-[#ec4899] transition-colors group mb-8"
        >
          Ver todas las preventas <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} {...p} variant="compact" showQuickAdd />
        ))}
      </div>

      <div className="sm:hidden mt-6 text-center">
        <Link
          href="/products?status=preorder"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#ec4899] to-[#db2777] text-white text-sm font-semibold"
        >
          Ver todas las preventas →
        </Link>
      </div>
    </section>
  );
}

function JaponSection({ products }: { products: Product[] }) {
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
              {'// Japón original'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Figuras & Coleccionables
            </h2>
            <p className="text-sm sm:text-base text-white/60 mt-2 max-w-2xl">
              Ediciones japonesas originales. Figuras, manga en japonés y coleccionables exclusivos.
            </p>
            <span className="absolute -bottom-3 left-0 w-16 h-1 bg-gradient-to-r from-[#06b6d4] to-[#ec4899] rounded-full" aria-hidden="true" />
          </div>
          <Link
            href="/products?countryGroup=Jap%C3%B3n"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#06b6d4] hover:text-white transition-colors group mb-8"
          >
            Ver todo <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} variant="compact" showQuickAdd />
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/products?countryGroup=Jap%C3%B3n"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#06b6d4] text-white text-sm font-semibold"
          >
            Ver todo →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function HomeProductSections() {
  const products = await getAllActiveProducts();

  const MAX = 5;

  // Novedades: últimos agregados por created_at (ya vienen ordenados desc)
  const novedades = products.slice(0, MAX);

  // Preventas activas
  const preventa = products
    .filter((p) => p.stockStatus === 'preorder')
    .slice(0, MAX);

  // JP / Figuras
  const japon = products
    .filter((p) => p.countryCode === 'JP')
    .slice(0, MAX);

  return (
    <>
      <NovedadesSection products={novedades} />
      <PreventaSection products={preventa} />
      <JaponSection products={japon} />
    </>
  );
}

'use client';

import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/lib/products';

function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>
      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-grow">
        <div className="relative overflow-hidden rounded bg-gray-200 dark:bg-gray-700 h-4 w-3/4">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
        <div className="relative overflow-hidden rounded bg-gray-200 dark:bg-gray-700 h-4 w-1/2">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
        <div className="relative overflow-hidden rounded bg-gray-200 dark:bg-gray-700 h-3 w-full mt-1">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
        <div className="relative overflow-hidden rounded bg-gray-200 dark:bg-gray-700 h-7 w-1/3 mt-auto">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
        <div className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 h-10 w-full">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Heading skeleton */}
      <div className="mb-8 space-y-3">
        <div className="relative overflow-hidden rounded bg-gray-200 dark:bg-gray-700 h-8 w-64">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
        <div className="relative overflow-hidden rounded bg-gray-200 dark:bg-gray-700 h-4 w-96 max-w-full">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </div>
      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

interface ProductSectionProps {
  title: string;
  description: string;
  products: Product[];
  linkHref: string;
  linkLabel: string;
  variant?: 'default' | 'tinted';
}

function ProductSection({ title, description, products, linkHref, linkLabel, variant = 'default' }: ProductSectionProps) {
  return (
    <section
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${
        variant === 'tinted'
          ? 'bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-lg'
          : ''
      }`}
    >
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          <div className="text-center">
            <Link
              href={linkHref}
              className="inline-block bg-[#2b496d] text-white font-semibold py-3 px-8 rounded-lg hover:bg-[#1e3550] transition-colors duration-300"
            >
              {linkLabel}
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <span className="text-5xl mb-4">📦</span>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Próximamente</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Estamos preparando productos para esta sección</p>
        </div>
      )}
    </section>
  );
}

export default function HomeProductSections() {
  const { products, isLoading } = useProducts();

  if (isLoading) {
    return (
      <>
        <SectionSkeleton />
        <SectionSkeleton />
      </>
    );
  }

  const argentinaProducts = products.filter((p) => p.countryGroup === 'Argentina').slice(0, 8);
  const mexicoProducts = products.filter((p) => p.countryGroup === 'México').slice(0, 8);
  const coleccionablesProducts = products.filter((p) => p.countryGroup === 'Coleccionables').slice(0, 8);

  return (
    <>
      <ProductSection
        title="Editorial Argentina"
        description="Descubre las editoriales argentinas: Ivrea Argentina, Ovni Press y más."
        products={argentinaProducts}
        linkHref="/products?countryGroup=Argentina"
        linkLabel="Ver más manga argentino"
      />
      <ProductSection
        title="Editorial México"
        description="Explora editoriales mexicanas: Panini MX, Viz Media y otros."
        products={mexicoProducts}
        linkHref="/products?countryGroup=México"
        linkLabel="Ver más manga mexicano"
        variant="tinted"
      />
      <ProductSection
        title="Coleccionables"
        description="Figuras y artículos coleccionables de tus series favoritas."
        products={coleccionablesProducts}
        linkHref="/products?countryGroup=Coleccionables"
        linkLabel="Ver más coleccionables"
      />
    </>
  );
}

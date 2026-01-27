'use client';

import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';

export default function HomeProductSections() {
  const { products, isLoading } = useProducts();

  const argentinaProducts = products.filter((p) => p.countryGroup === 'Argentina').slice(0, 8);
  const mexicoProducts = products.filter((p) => p.countryGroup === 'México').slice(0, 8);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Editorial Argentina Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Editorial Argentina
          </h2>
          <p className="text-gray-600 dark:text-gray-300">Descubre las editoriales argentinas: Ivrea Argentina, Ovni Press y más.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {argentinaProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/products?countryGroup=Argentina"
            className="inline-block bg-[#2b496d] text-white font-semibold py-3 px-8 rounded-lg hover:bg-[#1e3550] transition-colors duration-300"
          >
            Ver más manga argentino
          </Link>
        </div>
      </section>

      {/* Editorial México Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-lg">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Editorial México
          </h2>
          <p className="text-gray-600 dark:text-gray-300">Explora editoriales mexicanas: Panini MX, Viz Media y otros.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {mexicoProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/products?countryGroup=México"
            className="inline-block bg-[#2b496d] text-white font-semibold py-3 px-8 rounded-lg hover:bg-[#1e3550] transition-colors duration-300"
          >
            Ver más manga mexicano
          </Link>
        </div>
      </section>
    </>
  );
}

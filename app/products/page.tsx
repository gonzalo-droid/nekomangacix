import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllActiveProducts } from '@/lib/productsServer';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Explora nuestro catálogo de manga y coleccionables con filtros por editorial, género y precio.',
};

// ISR: la lista cambia poco; se revalida cada 5 minutos
export const revalidate = 300;

export default async function ProductsPage() {
  const products = await getAllActiveProducts();
  const editorials = Array.from(new Set(products.map((p) => p.editorial))).sort();

  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">Cargando...</div>}>
      <ProductsClient products={products} editorials={editorials} />
    </Suspense>
  );
}

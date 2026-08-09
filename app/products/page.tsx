import type { Metadata } from 'next';
import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import ProductsClient from './ProductsClient';
import {
  ITEMS_PER_PAGE,
  isDefaultQuery,
  parseCatalogQuery,
  queryCatalogFacets,
  queryCatalogPage,
  type CatalogQuery,
} from '@/lib/domain/products/catalog';

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Explora nuestro catálogo de manga y coleccionables con filtros por editorial, género y precio.',
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function loadCatalog(query: CatalogQuery) {
  const [page, facets] = await Promise.all([
    queryCatalogPage(query),
    queryCatalogFacets(query),
  ]);
  return {
    products: page.products,
    total: page.total ?? facets.total,
    facets,
  };
}

/**
 * La vista sin filtros es la que recibe la mayor parte del tráfico y es igual
 * para todos, así que se cachea. Las combinaciones de filtros son muchas y de
 * cola larga: esas se resuelven en vivo.
 */
const loadDefaultCatalog = unstable_cache(
  async (query: CatalogQuery) => loadCatalog(query),
  ['catalog-default'],
  { revalidate: 300, tags: ['products'] },
);

export default async function ProductsPage({ searchParams }: Props) {
  const query = parseCatalogQuery(await searchParams);
  const { products, total, facets } = isDefaultQuery(query)
    ? await loadDefaultCatalog(query)
    : await loadCatalog(query);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <Suspense fallback={null}>
      <ProductsClient
        products={products}
        total={total}
        totalPages={totalPages}
        facets={facets}
        query={query}
      />
    </Suspense>
  );
}

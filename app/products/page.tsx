import type { Metadata } from 'next';
import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import ProductsClient from './ProductsClient';
import {
  ITEMS_PER_PAGE,
  parseCatalogQuery,
  queryCatalogFacets,
  queryCatalogPage,
  querySimilarProducts,
  type CatalogQuery,
} from '@/lib/domain/products/catalog';
import { describeCatalogView } from '@/lib/domain/products/catalogSeo';
import { getAvailableCountries } from '@/lib/domain/products/availability';
import { pageMetadata } from '@/lib/seo';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = parseCatalogQuery(await searchParams);
  const view = describeCatalogView(query, await getAvailableCountries());
  return pageMetadata(view);
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
 * Cualquier vista sin búsqueda de texto (sin filtros, "En stock", una
 * editorial, la página 2…) es igual para todos: se cachea 5 minutos, con la
 * consulta como clave, y el admin la invalida con la etiqueta `products`.
 * Las búsquedas son de cola larga y van en vivo.
 */
const loadCachedCatalog = unstable_cache(
  async (query: CatalogQuery) => loadCatalog(query),
  ['catalog-view'],
  { revalidate: 300, tags: ['products'] },
);

export default async function ProductsPage({ searchParams }: Props) {
  const query = parseCatalogQuery(await searchParams);
  const { products, total, facets } = query.search
    ? await loadCatalog(query)
    : await loadCachedCatalog(query);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  // Búsqueda sin coincidencias exactas: se ofrecen los más parecidos en vez
  // de una página vacía (errores de tipeo, nombres alternativos).
  const similar = query.search && total === 0 ? await querySimilarProducts(query.search) : [];
  const { heading } = describeCatalogView(query, await getAvailableCountries());

  return (
    <Suspense fallback={null}>
      <ProductsClient
        products={products}
        total={total}
        totalPages={totalPages}
        facets={facets}
        query={query}
        heading={heading}
        similar={similar}
      />
    </Suspense>
  );
}

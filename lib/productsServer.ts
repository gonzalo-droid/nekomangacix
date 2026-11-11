import { createClient } from '@supabase/supabase-js';
import type { Product } from './products';
import { products as staticProducts } from './products';
import { dbRowToProduct } from './productMappers';
import { findRelatedProducts } from './domain/products/related';
import {
  CARD_COLUMNS,
  FEATURED_FILTER,
  MAX_FEATURED_PER_COUNTRY,
  isFeatured,
} from './domain/products/featured';
import type { CountryCode } from './constants/countries';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || url.includes('tu-proyecto') || !key || key.includes('tu-anon')) return null;
  return createClient(url, key);
}

export async function getAllActiveProducts(): Promise<Product[]> {
  const supabase = getClient();
  if (!supabase) return staticProducts;

  try {
    const PAGE = 1000;
    const all: Record<string, unknown>[] = [];
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })
        .range(from, from + PAGE - 1);

      if (error || !data) break;
      all.push(...(data as Record<string, unknown>[]));
      if (data.length < PAGE) break;
      from += PAGE;
    }

    if (all.length > 0) {
      const seen = new Set<string>();
      const unique = all.filter((r) => {
        const id = r.id as string;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      return unique.map(dbRowToProduct);
    }
  } catch { /* fall through */ }

  return staticProducts;
}

/**
 * Productos destacados para el home, agrupados por país.
 *
 * Trae solo las filas marcadas con `attributes.featured` y solo las columnas
 * que renderiza la card. Antes el home pedía el catálogo completo (6k+ filas
 * con sinopsis incluidas) para quedarse con unas pocas.
 */
export async function getFeaturedProductsByCountry(): Promise<
  Record<CountryCode, Product[]>
> {
  const empty = { AR: [], MX: [], ES: [], JP: [] } as Record<CountryCode, Product[]>;
  const supabase = getClient();

  const grouped: Record<CountryCode, Product[]> = { AR: [], MX: [], ES: [], JP: [] };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(CARD_COLUMNS)
        .eq('is_active', true)
        .contains('attributes', FEATURED_FILTER)
        .order('title', { ascending: true });

      if (!error && data) {
        for (const row of data as unknown as Record<string, unknown>[]) {
          const product = dbRowToProduct(row);
          const bucket = grouped[product.countryCode];
          if (bucket && bucket.length < MAX_FEATURED_PER_COUNTRY) bucket.push(product);
        }
        return grouped;
      }
    } catch { /* fall through */ }
  }

  // Fallback sin Supabase: usar el set estático marcado como destacado
  for (const p of staticProducts) {
    if (!isFeatured(p.attributes)) continue;
    const bucket = grouped[p.countryCode];
    if (bucket && bucket.length < MAX_FEATURED_PER_COUNTRY) bucket.push(p);
  }
  return Object.values(grouped).some((v) => v.length > 0) ? grouped : empty;
}

export async function getProductBySlugServer(slug: string): Promise<Product | null> {
  const supabase = getClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      if (data) return dbRowToProduct(data as Record<string, unknown>);
    } catch { /* fall through */ }
  }
  return staticProducts.find((p) => p.slug === slug) ?? null;
}

/**
 * Ordena relacionados por score: serie (100) > demografía (30) > editorial (10) >
 * país (5) > tipo (3). Ver findRelatedProducts. Si no llega al límite, completa
 * con cualquier otro producto distinto al actual.
 */
function pickRelated(all: Product[], current: Product, limit: number): Product[] {
  const related = findRelatedProducts(current, all, limit);
  if (related.length >= limit) return related;
  const fill = all.filter(
    (p) => p.slug !== current.slug && !related.some((r) => r.id === p.id),
  );
  return [...related, ...fill].slice(0, limit);
}

export async function getRelatedProductsServer(slug: string, limit = 6): Promise<Product[]> {
  const product = await getProductBySlugServer(slug);
  if (!product) return [];

  const supabase = getClient();
  if (supabase) {
    try {
      const candidates: Record<string, unknown>[] = [];

      // 1. Same series first (all volumes)
      if (product.series) {
        const { data: seriesData } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('series', product.series)
          .neq('slug', slug);
        if (seriesData) candidates.push(...(seriesData as Record<string, unknown>[]));
      }

      // 2. Fill remaining slots with same editorial/type
      if (candidates.length < limit * 3) {
        const { data: fillData } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .neq('slug', slug)
          .eq('editorial', product.editorial)
          .limit(limit * 4);
        if (fillData) {
          const existing = new Set(candidates.map((c) => c.slug as string));
          for (const p of fillData as Record<string, unknown>[]) {
            if (!existing.has(p.slug as string)) candidates.push(p);
          }
        }
      }

      if (candidates.length > 0) {
        const all = candidates.map(dbRowToProduct);
        return pickRelated(all, product, limit);
      }
    } catch { /* fall through */ }
  }

  return pickRelated(staticProducts, product, limit);
}

export interface ProductSitemapEntry {
  slug: string;
  /** Fecha real de la última modificación del producto, si la base la da. */
  updatedAt: string | null;
}

/**
 * Slugs de todos los productos activos con su fecha de modificación.
 *
 * PostgREST devuelve como máximo 1.000 filas por consulta, así que hay que
 * pedir el catálogo por tramos: sin esto solo se prerenderizaba la primera
 * página de productos y el resto quedaba renderizándose a pedido.
 */
export async function getProductSitemapEntries(): Promise<ProductSitemapEntry[]> {
  const fallback = () => staticProducts.map((p) => ({ slug: p.slug, updatedAt: null }));
  const supabase = getClient();
  if (!supabase) return fallback();

  try {
    const PAGE = 1000;
    const entries: ProductSitemapEntry[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from('products')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('slug')
        .range(from, from + PAGE - 1);
      if (error || data === null) {
        // Si falla un tramo, es mejor devolver lo que ya se juntó que nada.
        return entries.length > 0 ? entries : fallback();
      }
      for (const row of data as { slug: string; updated_at: string | null }[]) {
        entries.push({ slug: row.slug, updatedAt: row.updated_at });
      }
      if (data.length < PAGE) return entries;
    }
  } catch {
    return fallback();
  }
}

export async function getAllProductSlugs(): Promise<string[]> {
  return (await getProductSitemapEntries()).map((entry) => entry.slug);
}

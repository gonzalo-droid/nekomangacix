import { createClient } from '@supabase/supabase-js';
import type { Product } from './products';
import { products as staticProducts } from './products';
import { dbRowToProduct } from './productMappers';
import { findRelatedProducts } from './domain/products/related';

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
        .range(from, from + PAGE - 1);

      if (error || !data) break;
      all.push(...(data as Record<string, unknown>[]));
      if (data.length < PAGE) break;
      from += PAGE;
    }

    if (all.length > 0) return all.map(dbRowToProduct);
  } catch { /* fall through */ }

  return staticProducts;
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
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .neq('slug', slug)
        .limit(limit * 6);
      if (data && data.length > 0) {
        const all = (data as Record<string, unknown>[]).map(dbRowToProduct);
        return pickRelated(all, product, limit);
      }
    } catch { /* fall through */ }
  }

  return pickRelated(staticProducts, product, limit);
}

export async function getAllProductSlugs(): Promise<string[]> {
  const supabase = getClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('slug')
        .eq('is_active', true);
      if (!error && data !== null) {
        return (data as { slug: string }[]).map((r) => r.slug);
      }
    } catch { /* fall through */ }
  }
  return staticProducts.map((p) => p.slug);
}

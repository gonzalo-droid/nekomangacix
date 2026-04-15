import { createClient } from '@supabase/supabase-js';
import type { Product } from './products';
import { products as staticProducts } from './products';
import { dbRowToProduct } from './productMappers';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || url.includes('tu-proyecto') || !key || key.includes('tu-anon')) return null;
  return createClient(url, key);
}

export async function getAllActiveProducts(): Promise<Product[]> {
  const supabase = getClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (!error && data !== null) {
        return (data as Record<string, unknown>[]).map(dbRowToProduct);
      }
    } catch { /* fall through to static */ }
  }
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
 * Ordena relacionados: primero misma serie, luego misma demografía/categoría,
 * y rellena con la misma editorial si sigue faltando. Nunca incluye el producto actual.
 */
function pickRelated(all: Product[], current: Product, limit: number): Product[] {
  const others = all.filter((p) => p.slug !== current.slug);
  const seen = new Set<string>();
  const pick = (p: Product) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  };

  const sameSeries = current.series
    ? others.filter((p) => p.series === current.series).filter(pick)
    : [];
  const sameCategory = others.filter((p) => p.category === current.category).filter(pick);
  const sameEditorial = others.filter((p) => p.editorial === current.editorial).filter(pick);

  return [...sameSeries, ...sameCategory, ...sameEditorial].slice(0, limit);
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
        const related = pickRelated(all, product, limit);
        // Si no alcanzamos limit con los filtros, rellenamos con el resto
        if (related.length < limit) {
          const fill = all.filter((p) => p.slug !== slug && !related.some((r) => r.id === p.id));
          return [...related, ...fill].slice(0, limit);
        }
        return related;
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

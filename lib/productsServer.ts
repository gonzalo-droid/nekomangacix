import { createClient } from '@supabase/supabase-js';
import type { Product, StockStatus, Category } from './products';
import { products as staticProducts } from './products';
import { getCloudinaryUrl } from './cloudinary';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || url.includes('tu-proyecto') || !key || key.includes('tu-anon')) return null;
  return createClient(url, key);
}

function dbRowToProduct(row: Record<string, unknown>): Product {
  const specs = (row.specifications as Record<string, unknown>) ?? {};
  return {
    id: row.id as string,
    sku: row.sku as string,
    slug: row.slug as string,
    title: row.title as string,
    editorial: row.editorial as string,
    author: (row.author as string) ?? '',
    pricePEN: row.price_pen as number,
    stock: row.stock as number,
    stockStatus: row.stock_status as StockStatus,
    estimatedArrival: (row.estimated_arrival as string) ?? undefined,
    preorderDeposit: (row.preorder_deposit as number) ?? undefined,
    tags: (row.tags as string[]) ?? [],
    description: (row.description as string) ?? '',
    fullDescription: (row.full_description as string) ?? '',
    specifications: {
      pages: specs.pages as number | undefined,
      format: specs.format as string | undefined,
      language: specs.language as string | undefined,
      isbn: specs.isbn as string | undefined,
      releaseDate: specs.releaseDate as string | undefined,
      dimensions: specs.dimensions as string | undefined,
      weight: specs.weight as string | undefined,
    },
    series: (row.series as string) ?? undefined,
    images: ((row.images as string[]) ?? []).map(getCloudinaryUrl).filter(Boolean),
    category: row.category as Category,
    countryGroup: row.country_group as 'Argentina' | 'México' | 'Coleccionables',
  };
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

export async function getRelatedProductsServer(slug: string, limit = 4): Promise<Product[]> {
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
        .limit(limit * 4);
      if (data && data.length > 0) {
        const all = (data as Record<string, unknown>[]).map(dbRowToProduct);
        const related = all.filter(
          (p) => p.category === product.category || p.editorial === product.editorial
        );
        return (related.length >= limit ? related : all).slice(0, limit);
      }
    } catch { /* fall through */ }
  }
  return staticProducts
    .filter((p) => p.slug !== slug && (p.category === product.category || p.editorial === product.editorial))
    .slice(0, limit);
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

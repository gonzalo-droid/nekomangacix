'use client';

import { useState, useEffect } from 'react';
import { Product, products as defaultProducts, StockStatus, Category } from '@/lib/products';
import { createSupabaseClient } from '@/core/supabase/client';

const STORAGE_KEY = 'neko-manga-uploaded-products';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && !url.includes('tu-proyecto') && key && !key.includes('tu-anon'));
}

// Mapear fila de Supabase al tipo Product del frontend
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
    images: (row.images as string[]) ?? [],
    category: row.category as Category,
    countryGroup: row.country_group as 'Argentina' | 'México',
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      // 1. Supabase es la fuente principal. Si está configurado y responde sin error,
      //    usar su resultado aunque esté vacío (productos eliminados = lista vacía).
      if (isSupabaseConfigured()) {
        try {
          const supabase = createSupabaseClient();
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (!error && data !== null) {
            setProducts(data.map(dbRowToProduct));
            setIsLoading(false);
            return;
          }
        } catch {
          // Error de red o configuración — caer al fallback
        }
      }

      // 2. Fallback solo si Supabase no está configurado o lanzó excepción
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const uploadedProducts = JSON.parse(stored) as Product[];
          if (uploadedProducts.length > 0) {
            setProducts(uploadedProducts);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // localStorage falló
      }

      // 3. Último fallback: array estático (solo si Supabase no está configurado)
      setProducts(defaultProducts);
      setIsLoading(false);
    }

    loadProducts();
  }, []);

  const getProductById = (id: string) => products.find((p) => p.id === id);
  const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug);
  const getProductsByEditorial = (editorial: string) => products.filter((p) => p.editorial === editorial);

  const searchProducts = (query: string) => {
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.editorial.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  };

  const filterProducts = (
    query?: string,
    editorial?: string,
    minPrice?: number,
    maxPrice?: number,
    inStockOnly?: boolean
  ) => {
    let filtered = [...products];
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) => p.title.toLowerCase().includes(q) || p.editorial.toLowerCase().includes(q)
      );
    }
    if (editorial) filtered = filtered.filter((p) => p.editorial === editorial);
    if (minPrice !== undefined) filtered = filtered.filter((p) => p.pricePEN >= minPrice);
    if (maxPrice !== undefined) filtered = filtered.filter((p) => p.pricePEN <= maxPrice);
    if (inStockOnly) filtered = filtered.filter((p) => p.stock > 0);
    return filtered;
  };

  const getAllEditorials = () =>
    Array.from(new Set(products.map((p) => p.editorial))).sort();

  const getRelatedProducts = (slug: string, limit = 4) => {
    const product = getProductBySlug(slug);
    if (!product) return [];
    return products
      .filter((p) => p.slug !== slug && (p.category === product.category || p.editorial === product.editorial))
      .slice(0, limit);
  };

  return {
    products,
    isLoading,
    getProductById,
    getProductBySlug,
    getProductsByEditorial,
    searchProducts,
    filterProducts,
    getAllEditorials,
    getRelatedProducts,
  };
}

export function getCategoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    shonen: 'Shonen', seinen: 'Seinen', shojo: 'Shojo', josei: 'Josei',
    kodomo: 'Kodomo', isekai: 'Isekai', slice_of_life: 'Slice of Life',
    horror: 'Horror', romance: 'Romance', action: 'Acción', comedy: 'Comedia',
    drama: 'Drama', fantasy: 'Fantasía', 'sci-fi': 'Ciencia Ficción',
    sports: 'Deportes', mystery: 'Misterio',
  };
  return labels[category] || category;
}

export function getStockStatusLabel(status: StockStatus): { label: string; color: string } {
  const statusInfo: Record<StockStatus, { label: string; color: string }> = {
    in_stock:    { label: 'En Stock',  color: 'text-green-600' },
    on_demand:   { label: 'A Pedido',  color: 'text-orange-600' },
    preorder:    { label: 'Preventa',  color: 'text-blue-600' },
    out_of_stock: { label: 'Agotado', color: 'text-red-600' },
  };
  return statusInfo[status];
}

'use client';

import { useState, useEffect } from 'react';
import { Product, products as defaultProducts, StockStatus, Category } from '@/lib/products';
import { createSupabaseClient } from '@/core/supabase/client';
import { dbRowToProduct } from '@/lib/productMappers';

const STORAGE_KEY = 'neko-manga-uploaded-products';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && !url.includes('tu-proyecto') && key && !key.includes('tu-anon'));
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
          console.warn('Error al cargar productos desde Supabase. Usando fallback.');
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
        console.warn('Error al cargar productos desde localStorage. Usando fallback estático.');
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
    categories?: string[],
    editorials?: string[],
    minPrice?: number,
    maxPrice?: number,
    author?: string,
    countryGroups?: string[],
  ) => {
    let filtered = [...products];
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.editorial.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q)
      );
    }
    if (categories && categories.length > 0)
      filtered = filtered.filter((p) => categories.includes(p.category));
    if (editorials && editorials.length > 0)
      filtered = filtered.filter((p) => editorials.includes(p.editorial));
    if (countryGroups && countryGroups.length > 0)
      filtered = filtered.filter((p) => countryGroups.includes(p.countryGroup));
    if (author) {
      const a = author.toLowerCase();
      filtered = filtered.filter((p) => p.author.toLowerCase().includes(a));
    }
    if (minPrice !== undefined) filtered = filtered.filter((p) => p.pricePEN >= minPrice);
    if (maxPrice !== undefined) filtered = filtered.filter((p) => p.pricePEN <= maxPrice);
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

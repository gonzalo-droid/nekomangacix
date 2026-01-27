'use client';

import { useState, useEffect } from 'react';
import { Product, products as defaultProducts, StockStatus, Category } from '@/lib/products';

const STORAGE_KEY = 'neko-manga-uploaded-products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const uploadedProducts = JSON.parse(stored) as Product[];
        if (uploadedProducts.length > 0) {
          setProducts(uploadedProducts);
        }
      } catch {
        // If parsing fails, use default products
        console.error('Error parsing stored products');
      }
    }
    setIsLoading(false);
  }, []);

  const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.id === id);
  };

  const getProductsByEditorial = (editorial: string): Product[] => {
    return products.filter((p) => p.editorial === editorial);
  };

  const searchProducts = (query: string): Product[] => {
    const lowerQuery = query.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.editorial.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
    );
  };

  const filterProducts = (
    query?: string,
    editorial?: string,
    minPrice?: number,
    maxPrice?: number,
    inStockOnly?: boolean
  ): Product[] => {
    let filtered = [...products];

    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.editorial.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (editorial) {
      filtered = filtered.filter((p) => p.editorial === editorial);
    }

    if (minPrice !== undefined) {
      filtered = filtered.filter((p) => p.pricePEN >= minPrice);
    }

    if (maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.pricePEN <= maxPrice);
    }

    if (inStockOnly) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    return filtered;
  };

  const getAllEditorials = (): string[] => {
    return Array.from(new Set(products.map((p) => p.editorial))).sort();
  };

  const getRelatedProducts = (productId: string, limit: number = 4): Product[] => {
    const product = getProductById(productId);
    if (!product) return [];

    return products
      .filter(p => p.id !== productId && (p.category === product.category || p.editorial === product.editorial))
      .slice(0, limit);
  };

  return {
    products,
    isLoading,
    getProductById,
    getProductsByEditorial,
    searchProducts,
    filterProducts,
    getAllEditorials,
    getRelatedProducts,
  };
}

// Helper functions that can be used without the hook (for static data)
export function getCategoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    shonen: 'Shonen',
    seinen: 'Seinen',
    shojo: 'Shojo',
    josei: 'Josei',
    kodomo: 'Kodomo',
    isekai: 'Isekai',
    slice_of_life: 'Slice of Life',
    horror: 'Horror',
    romance: 'Romance',
    action: 'Accion',
    comedy: 'Comedia',
    drama: 'Drama',
    fantasy: 'Fantasia',
    'sci-fi': 'Ciencia Ficcion',
    sports: 'Deportes',
    mystery: 'Misterio'
  };
  return labels[category] || category;
}

export function getStockStatusLabel(status: StockStatus): { label: string; color: string } {
  const statusInfo: Record<StockStatus, { label: string; color: string }> = {
    in_stock: { label: 'En Stock', color: 'text-green-600' },
    on_demand: { label: 'A Pedido', color: 'text-orange-600' },
    preorder: { label: 'Preventa', color: 'text-blue-600' },
    out_of_stock: { label: 'Agotado', color: 'text-red-600' }
  };
  return statusInfo[status];
}

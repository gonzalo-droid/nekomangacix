'use client';

import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import type { CartItem } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

interface Props {
  items: CartItem[];
}

/**
 * Sugerencias basadas en los items del carrito:
 *   1. Prioriza otras unidades de la misma serie
 *   2. Luego misma demografía/categoría
 *   3. Luego misma editorial
 * Excluye los productos que ya están en el carrito. Máx. 6.
 */
export default function CartSuggestions({ items }: Props) {
  const { products, isLoading } = useProducts();

  const suggestions = useMemo(() => {
    if (items.length === 0 || products.length === 0) return [];

    const inCartIds = new Set(items.map((i) => i.productId));
    const cartProducts = products.filter((p) => inCartIds.has(p.id));

    const seriesSet = new Set(
      cartProducts.map((p) => p.series).filter((s): s is string => Boolean(s))
    );
    const categorySet = new Set(cartProducts.map((p) => p.category));
    const editorialSet = new Set(cartProducts.map((p) => p.editorial));

    const candidates = products.filter(
      (p) => !inCartIds.has(p.id) && p.stockStatus !== 'out_of_stock'
    );

    const sameSeries = candidates.filter((p) => p.series && seriesSet.has(p.series));
    const sameCategory = candidates.filter(
      (p) => categorySet.has(p.category) && !sameSeries.some((s) => s.id === p.id)
    );
    const sameEditorial = candidates.filter(
      (p) =>
        editorialSet.has(p.editorial) &&
        !sameSeries.some((s) => s.id === p.id) &&
        !sameCategory.some((c) => c.id === p.id)
    );

    return [...sameSeries, ...sameCategory, ...sameEditorial].slice(0, 6);
  }, [items, products]);

  if (isLoading || suggestions.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-6 relative">
        <div className="inline-flex items-center gap-2 mb-1.5">
          <Sparkles size={14} className="text-[#eab308]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ec4899]">
            {'// Tal vez te interese'}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          Suma más a tu pedido
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          De la misma serie o categoría que ya elegiste.
        </p>
        <span
          className="absolute -bottom-3 left-0 w-14 h-1 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full"
          aria-hidden="true"
        />
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {suggestions.map((p) => (
          <ProductCard key={p.id} {...p} variant="compact" showQuickAdd />
        ))}
      </div>
    </section>
  );
}

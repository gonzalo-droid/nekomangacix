'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { CartItem } from '@/context/CartContext';
import type { Product } from '@/lib/products';
import ProductCarousel from '@/components/ProductCarousel';
import { createSupabaseClient } from '@/core/supabase/client';
import { dbRowToProduct } from '@/lib/productMappers';
import { CARD_COLUMNS } from '@/lib/domain/products/featured';

interface Props {
  items: CartItem[];
}

const MAX_SUGGESTIONS = 12;

/**
 * "Completa tu pedido": primero otros tomos de las series que ya están en el
 * carrito, después de las mismas editoriales. Sin agotados ni lo que ya está
 * en el carrito.
 *
 * Antes descargaba los 1.000 productos más recientes con todas sus columnas y
 * buscaba ahí los del carrito: con 6.000 en el catálogo, la mayoría de las
 * veces no los encontraba y no sugería nada. Ahora son dos consultas chicas.
 */
export default function CartSuggestions({ items }: Props) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  // Clave estable: solo se vuelve a consultar si cambia qué hay en el carrito,
  // no la cantidad de cada producto.
  const key = useMemo(
    () => items.map((i) => i.productId).sort().join(',') + '|' + [...new Set(items.map((i) => i.editorial))].sort().join(','),
    [items],
  );

  useEffect(() => {
    const [idList, editorialList] = key.split('|');
    const ids = idList ? idList.split(',') : [];
    const editorials = editorialList ? editorialList.split(',') : [];
    if (ids.length === 0) return;

    let cancelled = false;
    const supabase = createSupabaseClient();
    const exclude = `(${ids.join(',')})`;

    (async () => {
      const { data: inCart } = await supabase.from('products').select('series').in('id', ids);
      // Los tipos generados de la base no incluyen `series`: se lee como fila genérica.
      const inCartRows = (inCart ?? []) as unknown as { series: string | null }[];
      const series = [...new Set(inCartRows.map((r) => r.series).filter((s): s is string => Boolean(s)))];

      const query = (column: 'series' | 'editorial', values: string[]) =>
        values.length === 0
          ? Promise.resolve({ data: [] as Record<string, unknown>[] })
          : supabase
              .from('products')
              .select(CARD_COLUMNS)
              .eq('is_active', true)
              .neq('stock_status', 'out_of_stock')
              .in(column, values)
              .not('id', 'in', exclude)
              .order('title')
              .limit(MAX_SUGGESTIONS);

      const [bySeries, byEditorial] = await Promise.all([query('series', series), query('editorial', editorials)]);
      if (cancelled) return;

      const seen = new Set<string>();
      const rows = [...(bySeries.data ?? []), ...(byEditorial.data ?? [])] as unknown as Record<string, unknown>[];
      const products = rows
        .filter((r) => {
          const id = r.id as string;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        })
        .slice(0, MAX_SUGGESTIONS)
        .map(dbRowToProduct);
      setSuggestions(products);
    })().catch(() => {
      if (!cancelled) setSuggestions([]);
    });

    return () => {
      cancelled = true;
    };
  }, [key]);

  if (suggestions.length === 0) return null;

  return (
    <section aria-labelledby="carrito-sugerencias" className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
        <Sparkles size={16} className="text-[#a16207]" aria-hidden="true" />
        <h2 id="carrito-sugerencias" className="text-base font-bold text-gray-900 dark:text-white">
          Completa tu pedido
        </h2>
        <span className="text-xs text-gray-600 dark:text-gray-400">· de la misma serie o editorial</span>
      </div>
      <ProductCarousel products={suggestions} label="Productos sugeridos" />
    </section>
  );
}

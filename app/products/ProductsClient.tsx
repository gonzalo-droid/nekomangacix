'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';
import type { Product } from '@/lib/products';
import type { CountryCode } from '@/lib/constants/countries';
import type { ProductType } from '@/lib/constants/productTypes';
import type { Demographic } from '@/lib/constants/demographics';
import {
  ITEMS_PER_PAGE,
  MIN_SEARCH_LENGTH,
  DEFAULT_SORT,
  type CatalogQuery,
  type FacetCounts,
  type SortOption,
} from '@/lib/domain/products/catalog';
import { SlidersHorizontal, X, Loader2 } from 'lucide-react';

interface Props {
  products: Product[];
  total: number;
  totalPages: number;
  facets: FacetCounts;
  query: CatalogQuery;
}

const SORT_LABELS: Record<SortOption, string> = {
  name_asc: 'Nombre A–Z',
  newest: 'Más recientes',
  price_asc: 'Precio: menor a mayor',
  price_desc: 'Precio: mayor a menor',
};

/** Espera antes de mandar el texto a la URL (y por tanto a la base). */
const TEXT_DEBOUNCE_MS = 350;
const PRICE_DEBOUNCE_MS = 400;

export default function ProductsClient({ products, total, totalPages, facets, query }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);

  /**
   * Todo el estado vive en la URL: el servidor la lee, consulta esa página y
   * devuelve solo esas filas. Antes el filtrado ocurría en memoria sobre el
   * catálogo completo, que había que mandar entero al navegador.
   */
  const syncUrl = useCallback(
    (patch: Record<string, string | string[] | number | null>, opts?: { keepPage?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        const isEmpty =
          v === null || v === '' || (Array.isArray(v) && v.length === 0);
        if (isEmpty) params.delete(k);
        else params.set(k, Array.isArray(v) ? v.join(',') : String(v));
      }
      // Cualquier cambio de filtro invalida la página actual
      if (!opts?.keepPage) params.delete('page');

      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) params.delete('page');
      else params.set('page', String(page));
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },
    [router, pathname, searchParams],
  );

  // ── Inputs de texto: se escriben libres y se mandan a la URL con retardo ──
  const debouncedPush = useDebouncedCallback(syncUrl, TEXT_DEBOUNCE_MS);
  const debouncedPrice = useDebouncedCallback(syncUrl, PRICE_DEBOUNCE_MS);

  /**
   * Por debajo del mínimo el filtro se quita en vez de mantenerse: si el
   * usuario borra "naruto" hasta "na", ver resultados de naruto sería
   * desconcertante. Menos de 3 caracteres = sin búsqueda.
   */
  const handleSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      debouncedPush({ search: trimmed.length >= MIN_SEARCH_LENGTH ? trimmed : null });
    },
    [debouncedPush],
  );

  const handleAuthor = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      debouncedPush({ author: trimmed.length >= MIN_SEARCH_LENGTH ? trimmed : null });
    },
    [debouncedPush],
  );

  const handlePrice = useCallback(
    (min: number, max: number) => {
      debouncedPrice({
        min: min > 0 ? min : null,
        max: Number.isFinite(max) ? max : null,
      });
    },
    [debouncedPrice],
  );

  const filterProps = {
    onSearch: handleSearch,
    onAuthorChange: handleAuthor,
    onPriceChange: handlePrice,
    onTypeChange: (types: ProductType[]) => {
      // Si "manga" deja de estar seleccionado, la demografía no aplica
      const keepsDemographic = types.length === 0 || types.includes('manga');
      syncUrl(
        keepsDemographic ? { type: types } : { type: types, demographic: [] },
      );
    },
    onDemographicChange: (v: Demographic[]) => syncUrl({ demographic: v }),
    onCountryChange: (v: CountryCode[]) => syncUrl({ country: v }),
    onEditorialChange: (v: string[]) => syncUrl({ editorial: v }),
    onStockChange: (v: string[]) => syncUrl({ stock: v }),
    selectedType: query.types,
    selectedDemographic: query.demographics,
    selectedCountry: query.countries,
    selectedEditorial: query.editorials,
    selectedStock: query.stock,
    initialSearch: query.search,
    initialAuthor: query.author,
    initialMinPrice: query.minPrice,
    initialMaxPrice: query.maxPrice,
    typeCounts: facets.type,
    demographicCounts: facets.demographic,
    countryCounts: facets.country,
    editorialCounts: facets.editorial,
    stockCounts: facets.stock,
  };

  const hasActiveFilters =
    query.types.length > 0 || query.stock.length > 0 || query.countries.length > 0 ||
    query.editorials.length > 0 || query.demographics.length > 0;

  const firstShown = products.length > 0 ? (query.page - 1) * ITEMS_PER_PAGE + 1 : 0;
  const lastShown = (query.page - 1) * ITEMS_PER_PAGE + products.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 relative">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ec4899] mb-2">
          {'// Catálogo completo'}
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
          Explora todos los <span className="text-neko-gradient">productos</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-3">
          {total} título{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''} · filtra por editorial, género o precio.
        </p>
        <span className="absolute -bottom-3 left-0 w-20 h-1 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full" aria-hidden="true" />
      </div>

      {/* Mobile: botón flotante de filtros */}
      <div className="md:hidden fixed bottom-6 left-4 z-40">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#2b496d] text-white font-semibold text-sm shadow-xl shadow-[#2b496d]/30 hover:bg-[#1e3550] transition-all active:scale-95"
        >
          <SlidersHorizontal size={16} />
          Filtros
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#ec4899] ml-0.5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {filtersOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5 z-10">
              <h2 className="font-bold text-gray-900 dark:text-white">Filtros</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors"
                aria-label="Cerrar filtros"
              >
                <X size={18} />
              </button>
            </div>
            <Filters {...filterProps} />
            <div className="p-4 border-t border-gray-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="w-full py-3 rounded-xl bg-[#2b496d] text-white font-bold text-sm hover:bg-[#1e3550] transition-colors"
              >
                Ver {total} resultado{total !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
        <aside className="hidden md:block md:col-span-1">
          <Filters {...filterProps} />
        </aside>

        <main className="md:col-span-3">
          <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
              {isPending && <Loader2 size={14} className="animate-spin text-[#ec4899]" />}
              Mostrando <span className="font-semibold">{firstShown}</span> a{' '}
              <span className="font-semibold">{lastShown}</span> de{' '}
              <span className="font-semibold">{total}</span> productos
            </p>
            <div className="flex items-center gap-2">
              {query.series && (
                <button
                  type="button"
                  onClick={() => syncUrl({ series: null })}
                  className="text-xs font-semibold text-[#2b496d] dark:text-blue-400 hover:underline"
                >
                  Quitar serie: {query.series} ×
                </button>
              )}
              <select
                value={query.sort}
                onChange={(e) => syncUrl({ sort: e.target.value === DEFAULT_SORT ? null : e.target.value })}
                className="text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#ec4899]/30 cursor-pointer"
                aria-label="Ordenar resultados"
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <option key={key} value={key}>{SORT_LABELS[key]}</option>
                ))}
              </select>
            </div>
          </div>

          {products.length > 0 ? (
            <>
              <div
                className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-5 mb-8 transition-opacity ${
                  isPending ? 'opacity-60' : 'opacity-100'
                }`}
              >
                {products.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    priority={idx < 4}
                    showFavoriteToggle
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  totalPages={totalPages}
                  currentPage={query.page}
                  onChange={goToPage}
                />
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </div>
  );
}

/** Agrupa ráfagas de cambios (teclado, slider) en una sola navegación. */
function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number,
): (...args: A) => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(fn);

  useEffect(() => { latest.current = fn; }, [fn]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return useCallback(
    (...args: A) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => latest.current(...args), delay);
    },
    [delay],
  );
}

function Pagination({
  totalPages,
  currentPage,
  onChange,
}: {
  totalPages: number;
  currentPage: number;
  onChange: (p: number) => void;
}) {
  const pages = useMemo(() => {
    const out: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) out.push(i);
    } else {
      out.push(1);
      if (currentPage > 3) out.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        out.push(i);
      }
      if (currentPage < totalPages - 2) out.push('...');
      out.push(totalPages);
    }
    return out;
  }, [totalPages, currentPage]);

  return (
    <div className="flex justify-center gap-2 mt-12 flex-wrap">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Página anterior"
      >
        ← Anterior
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={`w-10 h-10 rounded-lg text-sm transition-colors ${
                currentPage === p
                  ? 'bg-[#2b496d] text-white font-semibold'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              aria-current={currentPage === p ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Próxima página"
      >
        Siguiente →
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
      <div className="text-5xl mb-4 opacity-60">🔍</div>
      <p className="text-gray-700 dark:text-gray-200 text-lg font-semibold mb-1">
        No se encontraron productos
      </p>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Intenta ajustar los filtros o la búsqueda.
      </p>
    </div>
  );
}

'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';
import type { Product } from '@/lib/products';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { isCountryCode, type CountryCode } from '@/lib/constants/countries';
import { isProductType, type ProductType } from '@/lib/constants/productTypes';
import { isDemographic, type Demographic } from '@/lib/constants/demographics';
import { SlidersHorizontal, X } from 'lucide-react';

const ITEMS_PER_PAGE = 18;

interface Props {
  products: Product[];
}

function parseArrayParam(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').filter(Boolean);
}

interface StructuralFilterState {
  type: ProductType[];
  countryCode: CountryCode[];
  editorial: string[];
  demographic: Demographic[];
  stockStatus: string[];
}

type StructuralField = keyof StructuralFilterState;

function matchesNonStructural(
  p: Product,
  dSearch: string,
  dAuthor: string,
  dMin: number,
  dMax: number
): boolean {
  if (dSearch) {
    const q = dSearch.toLowerCase();
    const hit =
      p.title.toLowerCase().includes(q) ||
      p.editorial.toLowerCase().includes(q) ||
      (p.author ?? '').toLowerCase().includes(q);
    if (!hit) return false;
  }
  if (dAuthor && !(p.author ?? '').toLowerCase().includes(dAuthor.toLowerCase())) {
    return false;
  }
  if (p.pricePEN < dMin || p.pricePEN > dMax) return false;
  return true;
}

function matchesStructural(
  p: Product,
  filters: StructuralFilterState,
  exclude?: StructuralField
): boolean {
  if (exclude !== 'type' && filters.type.length > 0 && !filters.type.includes(p.type)) {
    return false;
  }
  if (
    exclude !== 'countryCode' &&
    filters.countryCode.length > 0 &&
    !filters.countryCode.includes(p.countryCode)
  ) {
    return false;
  }
  if (
    exclude !== 'editorial' &&
    filters.editorial.length > 0 &&
    !filters.editorial.includes(p.editorial)
  ) {
    return false;
  }
  if (
    exclude !== 'demographic' &&
    filters.demographic.length > 0 &&
    (p.demographic === undefined || !filters.demographic.includes(p.demographic))
  ) {
    return false;
  }
  if (
    exclude !== 'stockStatus' &&
    filters.stockStatus.length > 0 &&
    !filters.stockStatus.includes(p.stockStatus)
  ) {
    return false;
  }
  return true;
}

function tally<T extends string>(
  list: Product[],
  getValue: (p: Product) => T | undefined
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of list) {
    const v = getValue(p);
    if (v === undefined) continue;
    counts[v] = (counts[v] ?? 0) + 1;
  }
  return counts;
}

export default function ProductsClient({ products }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get('search') ?? '';
  const urlType = parseArrayParam(searchParams.get('type'));
  const urlCountry = parseArrayParam(searchParams.get('country'));
  const urlEditorial = parseArrayParam(searchParams.get('editorial'));
  const urlDemographic = parseArrayParam(searchParams.get('demographic'));
  const urlSeries = searchParams.get('series');
  const urlStock = parseArrayParam(searchParams.get('stock'));

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [authorQuery, setAuthorQuery] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'name_asc'>('relevance');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // La URL es la fuente de verdad de los filtros estructurales (compartibles)
  const selectedType = useMemo(() => urlType.filter(isProductType) as ProductType[], [urlType]);
  const selectedCountryCode = useMemo(
    () => urlCountry.filter(isCountryCode) as CountryCode[],
    [urlCountry]
  );
  const selectedEditorial = urlEditorial;
  const selectedDemographic = useMemo(
    () => urlDemographic.filter(isDemographic) as Demographic[],
    [urlDemographic]
  );
  const selectedSeries: string | null = urlSeries;
  const selectedStock = urlStock;

  // Sincroniza filtros activos a la URL para que sean compartibles/bookmarkeables
  const syncUrl = useCallback(
    (patch: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        const isEmpty = v === null || v === '' || (Array.isArray(v) && v.length === 0);
        if (isEmpty) params.delete(k);
        else params.set(k, Array.isArray(v) ? v.join(',') : v);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const dSearch = useDebouncedValue(searchQuery, 250);
  const dAuthor = useDebouncedValue(authorQuery, 250);
  const dMin = useDebouncedValue(minPrice, 150);
  const dMax = useDebouncedValue(maxPrice, 150);

  const structuralFilters: StructuralFilterState = useMemo(
    () => ({
      type: selectedType,
      countryCode: selectedCountryCode,
      editorial: selectedEditorial,
      demographic: selectedDemographic,
      stockStatus: selectedStock,
    }),
    [selectedType, selectedCountryCode, selectedEditorial, selectedDemographic, selectedStock]
  );

  const filtered = useMemo(() => {
    let list = products.filter((p) => matchesNonStructural(p, dSearch, dAuthor, dMin, dMax));
    list = list.filter((p) => matchesStructural(p, structuralFilters));
    if (selectedSeries) list = list.filter((p) => p.series === selectedSeries);

    if (sortBy === 'price_asc') list = [...list].sort((a, b) => a.pricePEN - b.pricePEN);
    else if (sortBy === 'price_desc') list = [...list].sort((a, b) => b.pricePEN - a.pricePEN);
    else if (sortBy === 'name_asc') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'es'));

    return list;
  }, [products, dSearch, dAuthor, dMin, dMax, structuralFilters, selectedSeries, sortBy]);

  const facetCounts = useMemo(() => {
    const base = products.filter((p) => matchesNonStructural(p, dSearch, dAuthor, dMin, dMax));
    return {
      type: tally(base.filter((p) => matchesStructural(p, structuralFilters, 'type')), (p) => p.type),
      countryCode: tally(
        base.filter((p) => matchesStructural(p, structuralFilters, 'countryCode')),
        (p) => p.countryCode
      ),
      editorial: tally(
        base.filter((p) => matchesStructural(p, structuralFilters, 'editorial')),
        (p) => p.editorial
      ),
      demographic: tally(
        base.filter((p) => matchesStructural(p, structuralFilters, 'demographic')),
        (p) => p.demographic
      ),
      stockStatus: tally(
        base.filter((p) => matchesStructural(p, structuralFilters, 'stockStatus')),
        (p) => p.stockStatus
      ),
    };
  }, [products, dSearch, dAuthor, dMin, dMax, structuralFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const resetPage = () => setCurrentPage(1);

  const handleTypeChange = (types: ProductType[]) => {
    // Al quitar "manga" de la selección, descartar demografía (no aplica)
    const stillApplicable = types.length === 0 || types.includes('manga');
    if (!stillApplicable && selectedDemographic.length > 0) {
      syncUrl({ type: types, demographic: [] });
    } else {
      syncUrl({ type: types });
    }
    resetPage();
  };

  const handleDemographicChange = (demographics: Demographic[]) => {
    syncUrl({ demographic: demographics });
    resetPage();
  };

  const handleCountryChange = (countries: CountryCode[]) => {
    syncUrl({ country: countries });
    resetPage();
  };

  const handleEditorialChange = (editorials: string[]) => {
    syncUrl({ editorial: editorials });
    resetPage();
  };

  const handleStockChange = (stocks: string[]) => {
    syncUrl({ stock: stocks });
    resetPage();
  };

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
          {products.length} título{products.length !== 1 ? 's' : ''} disponible{products.length !== 1 ? 's' : ''} · filtra por editorial, género o precio.
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
          {(selectedType.length > 0 ||
            selectedStock.length > 0 ||
            selectedCountryCode.length > 0 ||
            selectedEditorial.length > 0 ||
            selectedDemographic.length > 0) && (
            <span className="w-2 h-2 rounded-full bg-[#ec4899] ml-0.5" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {filtersOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
            aria-hidden="true"
          />
          {/* Sheet */}
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
            <Filters
              onSearch={(q) => { setSearchQuery(q); resetPage(); }}
              onAuthorChange={(v) => { setAuthorQuery(v); resetPage(); }}
              onPriceChange={(mn, mx) => { setMinPrice(mn); setMaxPrice(mx); resetPage(); }}
              onTypeChange={handleTypeChange}
              onDemographicChange={handleDemographicChange}
              onCountryChange={handleCountryChange}
              onEditorialChange={handleEditorialChange}
              onStockChange={handleStockChange}
              selectedType={selectedType}
              selectedDemographic={selectedDemographic}
              selectedCountry={selectedCountryCode}
              selectedEditorial={selectedEditorial}
              selectedStock={selectedStock}
              typeCounts={facetCounts.type}
              demographicCounts={facetCounts.demographic}
              countryCounts={facetCounts.countryCode}
              editorialCounts={facetCounts.editorial}
              stockCounts={facetCounts.stockStatus}
            />
            <div className="p-4 border-t border-gray-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="w-full py-3 rounded-xl bg-[#2b496d] text-white font-bold text-sm hover:bg-[#1e3550] transition-colors"
              >
                Ver {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
        <aside className="hidden md:block md:col-span-1">
          <Filters
            onSearch={(q) => { setSearchQuery(q); resetPage(); }}
            onAuthorChange={(v) => { setAuthorQuery(v); resetPage(); }}
            onPriceChange={(mn, mx) => { setMinPrice(mn); setMaxPrice(mx); resetPage(); }}
            onTypeChange={handleTypeChange}
            onDemographicChange={handleDemographicChange}
            onCountryChange={handleCountryChange}
            onEditorialChange={handleEditorialChange}
            onStockChange={handleStockChange}
            selectedType={selectedType}
            selectedDemographic={selectedDemographic}
            selectedCountry={selectedCountryCode}
            selectedEditorial={selectedEditorial}
            selectedStock={selectedStock}
            typeCounts={facetCounts.type}
            demographicCounts={facetCounts.demographic}
            countryCounts={facetCounts.countryCode}
            editorialCounts={facetCounts.editorial}
            stockCounts={facetCounts.stockStatus}
          />
        </aside>

        <main className="md:col-span-3">
          <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Mostrando{' '}
              <span className="font-semibold">
                {paginated.length > 0 ? (safePage - 1) * ITEMS_PER_PAGE + 1 : 0}
              </span>{' '}
              a{' '}
              <span className="font-semibold">
                {Math.min(safePage * ITEMS_PER_PAGE, filtered.length)}
              </span>{' '}
              de <span className="font-semibold">{filtered.length}</span> productos
            </p>
            <div className="flex items-center gap-2">
              {selectedSeries && (
                <button
                  type="button"
                  onClick={() => { syncUrl({ series: null }); resetPage(); }}
                  className="text-xs font-semibold text-[#2b496d] dark:text-blue-400 hover:underline"
                >
                  Quitar serie: {selectedSeries} ×
                </button>
              )}
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as typeof sortBy); resetPage(); }}
                className="text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#ec4899]/30 cursor-pointer"
              >
                <option value="relevance">Relevancia</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="name_asc">Nombre A–Z</option>
              </select>
            </div>
          </div>

          {paginated.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
                {paginated.map((product, idx) => (
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
                  currentPage={safePage}
                  onChange={setCurrentPage}
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

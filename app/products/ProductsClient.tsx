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

const ITEMS_PER_PAGE = 18;

interface Props {
  products: Product[];
}

export default function ProductsClient({ products }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get('search') ?? '';
  const urlType = searchParams.get('type');
  const urlCountry = searchParams.get('country');
  const urlEditorial = searchParams.get('editorial');
  const urlDemographic = searchParams.get('demographic');
  const urlSeries = searchParams.get('series');
  const urlStock = searchParams.get('stock') ?? '';

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [authorQuery, setAuthorQuery] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'name_asc'>('relevance');

  // La URL es la fuente de verdad de los filtros estructurales (compartibles)
  const selectedType: ProductType | null = urlType && isProductType(urlType) ? urlType : null;
  const selectedCountryCode: CountryCode | null =
    urlCountry && isCountryCode(urlCountry) ? urlCountry : null;
  const selectedEditorial: string | null = urlEditorial;
  const selectedDemographic: Demographic | null =
    urlDemographic && isDemographic(urlDemographic) ? urlDemographic : null;
  const selectedSeries: string | null = urlSeries;
  const selectedStock: string = urlStock;

  // Sincroniza filtros activos a la URL para que sean compartibles/bookmarkeables
  const syncUrl = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === '') params.delete(k);
        else params.set(k, v);
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

  const filtered = useMemo(() => {
    let list = products;

    if (dSearch) {
      const q = dSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.editorial.toLowerCase().includes(q) ||
          (p.author ?? '').toLowerCase().includes(q)
      );
    }
    if (selectedType) list = list.filter((p) => p.type === selectedType);
    if (selectedCountryCode) list = list.filter((p) => p.countryCode === selectedCountryCode);
    if (selectedEditorial) list = list.filter((p) => p.editorial === selectedEditorial);
    if (selectedDemographic) list = list.filter((p) => p.demographic === selectedDemographic);
    if (selectedSeries) list = list.filter((p) => p.series === selectedSeries);
    if (selectedStock) list = list.filter((p) => p.stockStatus === selectedStock);
    if (dAuthor) {
      const a = dAuthor.toLowerCase();
      list = list.filter((p) => (p.author ?? '').toLowerCase().includes(a));
    }
    list = list.filter((p) => p.pricePEN >= dMin && p.pricePEN <= dMax);

    if (sortBy === 'price_asc') list = [...list].sort((a, b) => a.pricePEN - b.pricePEN);
    else if (sortBy === 'price_desc') list = [...list].sort((a, b) => b.pricePEN - a.pricePEN);
    else if (sortBy === 'name_asc') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'es'));

    return list;
  }, [
    products,
    dSearch,
    dAuthor,
    dMin,
    dMax,
    selectedType,
    selectedCountryCode,
    selectedEditorial,
    selectedDemographic,
    selectedSeries,
    selectedStock,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const resetPage = () => setCurrentPage(1);

  const handleTypeChange = (t: ProductType | null) => {
    // Al cambiar a un tipo distinto de manga, descartar demografía (no aplica)
    if (t !== null && t !== 'manga' && selectedDemographic !== null) {
      syncUrl({ type: t, demographic: null });
    } else {
      syncUrl({ type: t });
    }
    resetPage();
  };

  const handleDemographicChange = (d: Demographic | null) => {
    syncUrl({ demographic: d });
    resetPage();
  };

  const handleCountryEditorialChange = ({
    country,
    editorial,
  }: {
    country: CountryCode | null;
    editorial: string | null;
  }) => {
    syncUrl({ country, editorial });
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
        <aside className="md:col-span-1">
          <Filters
            onSearch={(q) => { setSearchQuery(q); resetPage(); }}
            onAuthorChange={(v) => { setAuthorQuery(v); resetPage(); }}
            onPriceChange={(mn, mx) => { setMinPrice(mn); setMaxPrice(mx); resetPage(); }}
            onTypeChange={handleTypeChange}
            onDemographicChange={handleDemographicChange}
            onCountryEditorialChange={handleCountryEditorialChange}
            onStockChange={(s) => { syncUrl({ stock: s }); resetPage(); }}
            selectedType={selectedType}
            selectedDemographic={selectedDemographic}
            selectedCountry={selectedCountryCode}
            selectedEditorial={selectedEditorial}
            selectedStock={selectedStock}
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

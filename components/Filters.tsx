'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import MultiSelectFilterGroup from './filters/MultiSelectFilterGroup';
import { COUNTRY_CODES, COUNTRIES, type CountryCode } from '@/lib/constants/countries';
import { ALL_EDITORIALS, EDITORIALS_BY_COUNTRY } from '@/lib/constants/editorials';
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS, type ProductType } from '@/lib/constants/productTypes';
import { DEMOGRAPHICS, DEMOGRAPHIC_LABELS, type Demographic } from '@/lib/constants/demographics';

const PRICE_MIN = 0;
const PRICE_MAX = 300;

const STOCK_OPTIONS = [
  { value: 'in_stock', label: 'En stock' },
  { value: 'preorder', label: 'Preventa' },
  { value: 'out_of_stock', label: 'Agotado' },
];

const TYPE_ICONS: Record<string, string> = {
  manga: '📖',
  figure: '🗿',
  special_edition: '⭐',
  merch: '🎁',
  comic: '💬',
  protective_sleeve: '🛡️',
};

const DEMO_ICONS: Record<string, string> = {
  shonen: '⚡',
  seinen: '🔥',
  shojo: '🌸',
  josei: '💜',
  kodomo: '🌟',
};

interface FiltersProps {
  onSearch: (query: string) => void;
  onAuthorChange: (author: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onTypeChange: (types: ProductType[]) => void;
  onDemographicChange: (demographics: Demographic[]) => void;
  onCountryChange: (countries: CountryCode[]) => void;
  onEditorialChange: (editorials: string[]) => void;
  onStockChange: (stocks: string[]) => void;
  selectedType: ProductType[];
  selectedDemographic: Demographic[];
  selectedCountry: CountryCode[];
  selectedEditorial: string[];
  selectedStock: string[];
  /** Valores iniciales de los inputs libres, para reflejar la URL al cargar */
  initialSearch?: string;
  initialAuthor?: string;
  initialMinPrice?: number | null;
  initialMaxPrice?: number | null;
  typeCounts: Record<string, number>;
  demographicCounts: Record<string, number>;
  countryCounts: Record<string, number>;
  editorialCounts: Record<string, number>;
  stockCounts: Record<string, number>;
}

function Section({
  id, title, badge, children, defaultOpen = true,
}: {
  id: string; title: string; badge?: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-gray-700/60 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center py-3.5 px-1 group"
        aria-expanded={open}
      >
        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
          {title}
          {badge != null && badge > 0 && (
            <span className="text-[10px] font-bold bg-[#ec4899] text-white rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {badge}
            </span>
          )}
        </span>
        <ChevronDown
          size={15}
          className={`transition-transform duration-200 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="pb-4 px-1">{children}</div>}
    </div>
  );
}

export default function Filters({
  onSearch, onAuthorChange, onPriceChange, onTypeChange,
  onDemographicChange, onCountryChange, onEditorialChange, onStockChange,
  selectedType, selectedDemographic, selectedCountry, selectedEditorial, selectedStock,
  typeCounts, demographicCounts, countryCounts, editorialCounts, stockCounts,
  initialSearch = '', initialAuthor = '', initialMinPrice = null, initialMaxPrice = null,
}: FiltersProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [authorQuery, setAuthorQuery] = useState(initialAuthor);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialMinPrice ?? PRICE_MIN,
    initialMaxPrice ?? PRICE_MAX,
  ]);

  const activeCount =
    (searchQuery ? 1 : 0) +
    selectedStock.length +
    selectedType.length +
    selectedDemographic.length +
    selectedCountry.length +
    selectedEditorial.length +
    (authorQuery ? 1 : 0) +
    (priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX ? 1 : 0);

  const clearAll = () => {
    setSearchQuery(''); setAuthorQuery(''); setPriceRange([PRICE_MIN, PRICE_MAX]);
    onSearch(''); onAuthorChange(''); onPriceChange(PRICE_MIN, Infinity);
    onTypeChange([]); onDemographicChange([]);
    onCountryChange([]); onEditorialChange([]);
    onStockChange([]);
  };

  const minPct = ((priceRange[0] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPct = ((priceRange[1] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const typeOptions = useMemo(
    () =>
      PRODUCT_TYPES.map((t) => ({
        value: t,
        label: `${TYPE_ICONS[t] ?? '📦'} ${PRODUCT_TYPE_LABELS[t]}`,
        count: typeCounts[t] ?? 0,
      })),
    [typeCounts]
  );

  const demographicOptions = useMemo(
    () =>
      DEMOGRAPHICS.map((d) => ({
        value: d,
        label: `${DEMO_ICONS[d] ?? '📚'} ${DEMOGRAPHIC_LABELS[d]}`,
        count: demographicCounts[d] ?? 0,
      })),
    [demographicCounts]
  );

  const stockOptions = useMemo(
    () =>
      STOCK_OPTIONS.map((s) => ({
        value: s.value,
        label: s.label,
        count: stockCounts[s.value] ?? 0,
      })),
    [stockCounts]
  );

  const countryOptions = useMemo(
    () =>
      COUNTRY_CODES.map((code) => ({
        value: code,
        label: `${COUNTRIES[code].flag} ${COUNTRIES[code].name}`,
        count: countryCounts[code] ?? 0,
      })),
    [countryCounts]
  );

  const editorialOptions = useMemo(() => {
    const pool =
      selectedCountry.length > 0
        ? selectedCountry.flatMap((code) => EDITORIALS_BY_COUNTRY[code])
        : ALL_EDITORIALS;
    const unique = Array.from(new Set(pool));
    return unique.map((ed) => ({
      value: ed,
      label: ed,
      count: editorialCounts[ed] ?? 0,
    }));
  }, [selectedCountry, editorialCounts]);

  const showDemographic = selectedType.length === 0 || selectedType.includes('manga');

  return (
    <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/80 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">Filtros</h2>
          {activeCount > 0 && (
            <span className="text-xs font-bold bg-[#2b496d] text-white rounded-full px-2 py-0.5">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs font-semibold text-[#ec4899] hover:text-[#db2777] transition-colors"
          >
            <X size={12} /> Limpiar todo
          </button>
        )}
      </div>

      <div className="px-4 py-1 divide-y divide-gray-100 dark:divide-gray-700/60">

        {/* 1. Búsqueda */}
        <Section id="search" title="Búsqueda">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Título, editorial, autor..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); onSearch(e.target.value); }}
              className="w-full pl-8 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b496d]/40 focus:border-[#2b496d] transition-all"
            />
          </div>
        </Section>

        {/* 2. Disponibilidad */}
        <Section id="stock" title="Disponibilidad" badge={selectedStock.length}>
          <MultiSelectFilterGroup
            options={stockOptions}
            selected={selectedStock}
            onChange={onStockChange}
            searchable={false}
          />
        </Section>

        {/* 3. Tipo */}
        <Section id="type" title="Tipo" badge={selectedType.length}>
          <MultiSelectFilterGroup
            options={typeOptions}
            selected={selectedType}
            onChange={(next) => onTypeChange(next as ProductType[])}
            searchPlaceholder="Buscar tipo..."
          />
        </Section>

        {/* 4. Demografía — solo para manga */}
        {showDemographic && (
          <Section id="demographic" title="Demografía" badge={selectedDemographic.length}>
            <MultiSelectFilterGroup
              options={demographicOptions}
              selected={selectedDemographic}
              onChange={(next) => onDemographicChange(next as Demographic[])}
              searchPlaceholder="Buscar demografía..."
            />
          </Section>
        )}

        {/* 5. País */}
        <Section id="country" title="País" badge={selectedCountry.length} defaultOpen={false}>
          <MultiSelectFilterGroup
            options={countryOptions}
            selected={selectedCountry}
            onChange={(next) => onCountryChange(next as CountryCode[])}
            searchable={false}
          />
        </Section>

        {/* 6. Editorial */}
        <Section id="editorial" title="Editorial" badge={selectedEditorial.length} defaultOpen={false}>
          <MultiSelectFilterGroup
            options={editorialOptions}
            selected={selectedEditorial}
            onChange={onEditorialChange}
            searchPlaceholder="Buscar editorial..."
          />
        </Section>

        {/* 7. Precio */}
        <Section id="price" title="Precio" defaultOpen={false}>
          <div className="px-1">
            <div className="flex justify-between text-sm font-bold text-[#2b496d] dark:text-blue-300 mb-4">
              <span className="bg-[#2b496d]/10 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">
                S/ {priceRange[0]}
              </span>
              <span className="bg-[#2b496d]/10 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">
                {priceRange[1] >= PRICE_MAX ? `S/ ${PRICE_MAX}+` : `S/ ${priceRange[1]}`}
              </span>
            </div>
            <div className="relative h-5 flex items-center mb-2">
              <div className="absolute w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-600" />
              <div
                className="absolute h-1.5 rounded-full bg-gradient-to-r from-[#2b496d] to-[#ec4899]"
                style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
              />
              <input type="range" min={PRICE_MIN} max={PRICE_MAX} value={priceRange[0]}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), priceRange[1] - 1);
                  const next: [number, number] = [val, priceRange[1]];
                  setPriceRange(next);
                  onPriceChange(next[0], next[1] >= PRICE_MAX ? Infinity : next[1]);
                }}
                className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer price-range-input"
                aria-label="Precio mínimo"
              />
              <input type="range" min={PRICE_MIN} max={PRICE_MAX} value={priceRange[1]}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), priceRange[0] + 1);
                  const next: [number, number] = [priceRange[0], val];
                  setPriceRange(next);
                  onPriceChange(next[0], next[1] >= PRICE_MAX ? Infinity : next[1]);
                }}
                className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer price-range-input"
                aria-label="Precio máximo"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>S/ {PRICE_MIN}</span><span>S/ {PRICE_MAX}+</span>
            </div>
          </div>
        </Section>

        {/* 8. Autor */}
        <Section id="author" title="Autor" defaultOpen={false}>
          <input
            type="text"
            placeholder="Nombre del autor..."
            value={authorQuery}
            onChange={(e) => { setAuthorQuery(e.target.value); onAuthorChange(e.target.value); }}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b496d]/40 focus:border-[#2b496d] transition-all"
          />
        </Section>

      </div>

      <style>{`
        .price-range-input::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: #2b496d; border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3); cursor: pointer; pointer-events: all;
        }
        .price-range-input::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: #2b496d; border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3); cursor: pointer; pointer-events: all;
        }
        .price-range-input { pointer-events: none; }
      `}</style>
    </div>
  );
}

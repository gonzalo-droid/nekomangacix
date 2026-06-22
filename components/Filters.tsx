'use client';

import { useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import HierarchicalCountryFilter from './filters/HierarchicalCountryFilter';
import type { CountryCode } from '@/lib/constants/countries';
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS, type ProductType } from '@/lib/constants/productTypes';
import { DEMOGRAPHICS, DEMOGRAPHIC_LABELS, type Demographic } from '@/lib/constants/demographics';

const PRICE_MIN = 0;
const PRICE_MAX = 300;

const STOCK_OPTIONS = [
  { value: 'in_stock',    label: 'En stock',  color: 'bg-emerald-500', dot: 'bg-emerald-400' },
  { value: 'preorder',    label: 'Preventa',  color: 'bg-blue-500',    dot: 'bg-blue-400' },
  { value: 'on_demand',   label: 'A pedido',  color: 'bg-orange-500',  dot: 'bg-orange-400' },
  { value: 'out_of_stock',label: 'Agotado',   color: 'bg-red-500',     dot: 'bg-red-400' },
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
  onTypeChange: (type: ProductType | null) => void;
  onDemographicChange: (demographic: Demographic | null) => void;
  onCountryEditorialChange: (next: { country: CountryCode | null; editorial: string | null }) => void;
  onStockChange: (stock: string) => void;
  selectedType: ProductType | null;
  selectedDemographic: Demographic | null;
  selectedCountry: CountryCode | null;
  selectedEditorial: string | null;
  selectedStock: string;
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
  onDemographicChange, onCountryEditorialChange, onStockChange,
  selectedType, selectedDemographic, selectedCountry, selectedEditorial, selectedStock,
}: FiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [authorQuery, setAuthorQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);

  const activeCount = [
    searchQuery, selectedStock, selectedType, selectedDemographic,
    selectedCountry, selectedEditorial, authorQuery,
    priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX ? 'price' : null,
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearchQuery(''); setAuthorQuery(''); setPriceRange([PRICE_MIN, PRICE_MAX]);
    onSearch(''); onAuthorChange(''); onPriceChange(PRICE_MIN, Infinity);
    onTypeChange(null); onDemographicChange(null);
    onCountryEditorialChange({ country: null, editorial: null });
    onStockChange('');
  };

  const minPct = ((priceRange[0] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPct = ((priceRange[1] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

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
        <Section id="stock" title="Disponibilidad" badge={selectedStock ? 1 : 0}>
          <div className="grid grid-cols-2 gap-2">
            {STOCK_OPTIONS.map(({ value, label, color, dot }) => {
              const active = selectedStock === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onStockChange(active ? '' : value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                    active
                      ? `${color} text-white border-transparent shadow-md scale-[1.02]`
                      : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700/50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-white/70' : dot}`} />
                  {label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* 3. Tipo */}
        <Section id="type" title="Tipo" badge={selectedType ? 1 : 0}>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onTypeChange(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                selectedType === null
                  ? 'bg-[#2b496d] text-white border-[#2b496d]'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              Todos
            </button>
            {PRODUCT_TYPES.map((t) => {
              const active = selectedType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTypeChange(active ? null : t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all flex items-center gap-1 ${
                    active
                      ? 'bg-[#2b496d] text-white border-[#2b496d] shadow-sm'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#2b496d]/40 hover:text-[#2b496d] dark:hover:text-white'
                  }`}
                >
                  <span>{TYPE_ICONS[t] ?? '📦'}</span>
                  {PRODUCT_TYPE_LABELS[t]}
                </button>
              );
            })}
          </div>
        </Section>

        {/* 4. Demografía — solo para manga */}
        {(selectedType === null || selectedType === 'manga') && (
          <Section id="demographic" title="Demografía" badge={selectedDemographic ? 1 : 0}>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onDemographicChange(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                  selectedDemographic === null
                    ? 'bg-[#ec4899] text-white border-[#ec4899]'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                }`}
              >
                Todas
              </button>
              {DEMOGRAPHICS.map((d) => {
                const active = selectedDemographic === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onDemographicChange(active ? null : d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all flex items-center gap-1 ${
                      active
                        ? 'bg-[#ec4899] text-white border-[#ec4899] shadow-sm'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#ec4899]/40 hover:text-[#ec4899]'
                    }`}
                  >
                    <span>{DEMO_ICONS[d] ?? '📚'}</span>
                    {DEMOGRAPHIC_LABELS[d]}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* 5. Origen y editorial */}
        <Section
          id="country"
          title="Origen y editorial"
          badge={(selectedCountry ? 1 : 0) + (selectedEditorial ? 1 : 0)}
          defaultOpen={false}
        >
          <HierarchicalCountryFilter
            selectedCountry={selectedCountry}
            selectedEditorial={selectedEditorial}
            onChange={onCountryEditorialChange}
          />
        </Section>

        {/* 6. Precio */}
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

        {/* 7. Autor */}
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

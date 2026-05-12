'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import HierarchicalCountryFilter from './filters/HierarchicalCountryFilter';
import type { CountryCode } from '@/lib/constants/countries';
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS, type ProductType } from '@/lib/constants/productTypes';
import { DEMOGRAPHICS, DEMOGRAPHIC_LABELS, type Demographic } from '@/lib/constants/demographics';

interface SectionHeaderProps {
  id: string;
  title: string;
  badge?: number;
  open: boolean;
  onToggle: (id: string) => void;
}

function SectionHeader({ id, title, badge, open, onToggle }: SectionHeaderProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className="w-full flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 -mx-2"
      aria-expanded={open}
    >
      <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        {title}
        {badge != null && badge > 0 && (
          <span className="text-xs font-bold bg-[#2b496d] text-white rounded-full px-1.5 py-0.5 leading-none">
            {badge}
          </span>
        )}
      </span>
      <ChevronDown
        size={18}
        className={`transition-transform text-gray-500 ${open ? 'rotate-180' : ''}`}
      />
    </button>
  );
}

const PRICE_MIN = 0;
const PRICE_MAX = 300;

const chipBase =
  'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap';
const chipIdle =
  'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700';
const chipActive = 'border-[#2b496d] bg-[#2b496d] text-white';

interface FiltersProps {
  onSearch: (query: string) => void;
  onAuthorChange: (author: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onTypeChange: (type: ProductType | null) => void;
  onDemographicChange: (demographic: Demographic | null) => void;
  onCountryEditorialChange: (next: { country: CountryCode | null; editorial: string | null }) => void;
  selectedType: ProductType | null;
  selectedDemographic: Demographic | null;
  selectedCountry: CountryCode | null;
  selectedEditorial: string | null;
}

export default function Filters({
  onSearch,
  onAuthorChange,
  onPriceChange,
  onTypeChange,
  onDemographicChange,
  onCountryEditorialChange,
  selectedType,
  selectedDemographic,
  selectedCountry,
  selectedEditorial,
}: FiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [authorQuery, setAuthorQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(['search', 'type', 'country', 'demographic', 'author', 'price'])
  );

  const toggle = (section: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });

  const isOpen = (section: string) => openSections.has(section);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAuthorQuery(val);
    onAuthorChange(val);
  };

  const handleMinPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), priceRange[1] - 1);
    const next: [number, number] = [val, priceRange[1]];
    setPriceRange(next);
    onPriceChange(next[0], next[1] >= PRICE_MAX ? Infinity : next[1]);
  };

  const handleMaxPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), priceRange[0] + 1);
    const next: [number, number] = [priceRange[0], val];
    setPriceRange(next);
    onPriceChange(next[0], next[1] >= PRICE_MAX ? Infinity : next[1]);
  };

  const demographicVisible = selectedType === null || selectedType === 'manga';

  const hasActiveFilters =
    searchQuery ||
    selectedType !== null ||
    selectedDemographic !== null ||
    selectedCountry !== null ||
    selectedEditorial !== null ||
    authorQuery ||
    priceRange[0] > PRICE_MIN ||
    priceRange[1] < PRICE_MAX;

  const clearFilters = () => {
    setSearchQuery('');
    setAuthorQuery('');
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    onSearch('');
    onAuthorChange('');
    onPriceChange(PRICE_MIN, Infinity);
    onTypeChange(null);
    onDemographicChange(null);
    onCountryEditorialChange({ country: null, editorial: null });
  };

  const minPct = ((priceRange[0] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPct = ((priceRange[1] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-1">
      <div className="flex justify-between items-center pb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filtros</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-[#2b496d] hover:text-[#1e3550] dark:text-blue-400 font-semibold"
          >
            Limpiar
          </button>
        )}
      </div>

      <section>
        <SectionHeader id="search" title="Búsqueda" open={isOpen('search')} onToggle={toggle} />
        {isOpen('search') && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Título, editorial..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b496d]"
            />
          </div>
        )}
      </section>

      <section>
        <SectionHeader
          id="type"
          title="Tipo"
          badge={selectedType ? 1 : 0}
          open={isOpen('type')}
          onToggle={toggle}
        />
        {isOpen('type') && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onTypeChange(null)}
              className={`${chipBase} ${selectedType === null ? chipActive : chipIdle}`}
              aria-pressed={selectedType === null}
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
                  className={`${chipBase} ${active ? chipActive : chipIdle}`}
                  aria-pressed={active}
                >
                  {PRODUCT_TYPE_LABELS[t]}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <SectionHeader
          id="country"
          title="Origen y editorial"
          badge={(selectedCountry ? 1 : 0) + (selectedEditorial ? 1 : 0)}
          open={isOpen('country')}
          onToggle={toggle}
        />
        {isOpen('country') && (
          <div className="mt-3">
            <HierarchicalCountryFilter
              selectedCountry={selectedCountry}
              selectedEditorial={selectedEditorial}
              onChange={onCountryEditorialChange}
            />
          </div>
        )}
      </section>

      {demographicVisible && (
        <section>
          <SectionHeader
            id="demographic"
            title="Demografía"
            badge={selectedDemographic ? 1 : 0}
            open={isOpen('demographic')}
            onToggle={toggle}
          />
          {isOpen('demographic') && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onDemographicChange(null)}
                className={`${chipBase} ${selectedDemographic === null ? chipActive : chipIdle}`}
                aria-pressed={selectedDemographic === null}
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
                    className={`${chipBase} ${active ? chipActive : chipIdle}`}
                    aria-pressed={active}
                  >
                    {DEMOGRAPHIC_LABELS[d]}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section>
        <SectionHeader id="author" title="Autor" open={isOpen('author')} onToggle={toggle} />
        {isOpen('author') && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Nombre del autor..."
              value={authorQuery}
              onChange={handleAuthorChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b496d]"
            />
          </div>
        )}
      </section>

      <section>
        <SectionHeader id="price" title="Precio" open={isOpen('price')} onToggle={toggle} />
        {isOpen('price') && (
          <div className="mt-4 px-1">
            <div className="flex justify-between text-sm font-semibold text-[#2b496d] dark:text-blue-300 mb-3">
              <span>S/ {priceRange[0]}</span>
              <span>{priceRange[1] >= PRICE_MAX ? `S/ ${PRICE_MAX}+` : `S/ ${priceRange[1]}`}</span>
            </div>

            <div className="relative h-5 flex items-center">
              <div className="absolute w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-600" />
              <div
                className="absolute h-1.5 rounded-full bg-[#2b496d]"
                style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
              />
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                value={priceRange[0]}
                onChange={handleMinPrice}
                className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer price-range-input"
                aria-label="Precio mínimo"
              />
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                value={priceRange[1]}
                onChange={handleMaxPrice}
                className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer price-range-input"
                aria-label="Precio máximo"
              />
            </div>

            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-2">
              <span>S/ {PRICE_MIN}</span>
              <span>S/ {PRICE_MAX}+</span>
            </div>
          </div>
        )}
      </section>

      <style>{`
        .price-range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #2b496d;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          pointer-events: all;
        }
        .price-range-input::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #2b496d;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          pointer-events: all;
        }
        .price-range-input { pointer-events: none; }
      `}</style>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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

const DEMOGRAPHICS: { value: string; label: string }[] = [
  { value: 'shonen', label: 'Shōnen' },
  { value: 'seinen', label: 'Seinen' },
  { value: 'shojo', label: 'Shōjo' },
  { value: 'josei', label: 'Josei' },
  { value: 'kodomo', label: 'Kodomo' },
  { value: 'isekai', label: 'Isekai' },
  { value: 'slice_of_life', label: 'Slice of Life' },
  { value: 'romance', label: 'Romance' },
  { value: 'action', label: 'Acción' },
  { value: 'horror', label: 'Horror' },
  { value: 'comedy', label: 'Comedia' },
  { value: 'drama', label: 'Drama' },
  { value: 'fantasy', label: 'Fantasía' },
  { value: 'sci-fi', label: 'Ciencia Ficción' },
  { value: 'sports', label: 'Deportes' },
  { value: 'mystery', label: 'Misterio' },
];

const SECTIONS = [
  { value: 'Argentina', label: 'Editorial Argentina' },
  { value: 'México', label: 'Editorial México' },
  { value: 'España', label: 'Editorial España' },
  { value: 'Japón', label: 'Editorial Japón' },
];

interface FiltersProps {
  onSearch: (query: string) => void;
  onCategoryChange: (categories: string[]) => void;
  onEditorialChange: (editorials: string[]) => void;
  onAuthorChange: (author: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onSectionChange: (sections: string[]) => void;
  editorials: string[];
}

export default function Filters({
  onSearch,
  onCategoryChange,
  onEditorialChange,
  onAuthorChange,
  onPriceChange,
  onSectionChange,
  editorials,
}: FiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedEditorials, setSelectedEditorials] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [authorQuery, setAuthorQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(['search', 'section', 'category', 'editorial', 'author', 'price'])
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

  const handleCategoryToggle = (value: string) => {
    const next = selectedCategories.includes(value)
      ? selectedCategories.filter((c) => c !== value)
      : [...selectedCategories, value];
    setSelectedCategories(next);
    onCategoryChange(next);
  };

  const handleEditorialToggle = (value: string) => {
    const next = selectedEditorials.includes(value)
      ? selectedEditorials.filter((e) => e !== value)
      : [...selectedEditorials, value];
    setSelectedEditorials(next);
    onEditorialChange(next);
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

  const handleSectionToggle = (value: string) => {
    const next = selectedSections.includes(value)
      ? selectedSections.filter((s) => s !== value)
      : [...selectedSections, value];
    setSelectedSections(next);
    onSectionChange(next);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategories.length > 0 ||
    selectedEditorials.length > 0 ||
    selectedSections.length > 0 ||
    authorQuery ||
    priceRange[0] > PRICE_MIN ||
    priceRange[1] < PRICE_MAX;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedEditorials([]);
    setSelectedSections([]);
    setAuthorQuery('');
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    onSearch('');
    onCategoryChange([]);
    onEditorialChange([]);
    onSectionChange([]);
    onAuthorChange('');
    onPriceChange(PRICE_MIN, Infinity);
  };

  const minPct = ((priceRange[0] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPct = ((priceRange[1] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-1">
      {/* Header */}
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

      {/* ── Búsqueda ── */}
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

      {/* ── Sección ── */}
      <section>
        <SectionHeader id="section" title="Sección" badge={selectedSections.length} open={isOpen('section')} onToggle={toggle} />
        {isOpen('section') && (
          <div className="mt-3 space-y-1">
            {SECTIONS.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  checked={selectedSections.includes(value)}
                  onChange={() => handleSectionToggle(value)}
                  className="w-4 h-4 rounded border-gray-300 accent-[#2b496d] cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* ── Demografía ── */}
      <section>
        <SectionHeader id="category" title="Demografía" badge={selectedCategories.length} open={isOpen('category')} onToggle={toggle} />
        {isOpen('category') && (
          <div className="mt-3 space-y-1 max-h-52 overflow-y-auto pr-1">
            {DEMOGRAPHICS.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(value)}
                  onChange={() => handleCategoryToggle(value)}
                  className="w-4 h-4 rounded border-gray-300 accent-[#2b496d] cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* ── Editorial ── */}
      <section>
        <SectionHeader id="editorial" title="Editorial" badge={selectedEditorials.length} open={isOpen('editorial')} onToggle={toggle} />
        {isOpen('editorial') && (
          <div className="mt-3 space-y-1 max-h-52 overflow-y-auto pr-1">
            {editorials.length === 0 ? (
              <p className="text-sm text-gray-400 px-2">Sin editoriales disponibles</p>
            ) : (
              editorials.map((editorial) => (
                <label
                  key={editorial}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedEditorials.includes(editorial)}
                    onChange={() => handleEditorialToggle(editorial)}
                    className="w-4 h-4 rounded border-gray-300 accent-[#2b496d] cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{editorial}</span>
                </label>
              ))
            )}
          </div>
        )}
      </section>

      {/* ── Autor ── */}
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

      {/* ── Precio ── */}
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

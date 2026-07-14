# Filtros multiselector con buscador por filtro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the product-listing filters (Tipo, Demografía, País, Editorial, Disponibilidad) from single-select pills to multi-select checkbox lists with a per-list search box and dynamic (faceted) result counts.

**Architecture:** A new reusable `MultiSelectFilterGroup` component (checkbox list + optional search + count column) replaces the pill blocks inside `components/Filters.tsx`. `app/products/ProductsClient.tsx` changes its structural filter state from single nullable values to arrays synced to the URL as comma-separated params, and gains a faceted-count calculation (one extra pass over the in-memory product list per filter group, excluding that group's own filter).

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS 4, lucide-react icons. No test framework is configured in this repo (per `CLAUDE.md`) — verification steps below use `npx tsc --noEmit`, `npm run lint`, `npm run build`, and manual checks via `npm run dev` instead of automated tests.

## Global Constraints

- No test framework is configured — do not add one; verify via type-check/lint/build/manual browser check (from spec's Testing section).
- Within one filter group, selections combine with OR; across different groups, AND (spec §1).
- Empty array in URL/state means "no filter applied" for that group (spec §1).
- Faceted counts must exclude the group's own active filter but include every other active filter, including free-text search, author, and price (spec §4).
- No "Género" filter is added — `Product` has no genre/category field (spec, "Fuera de alcance").
- Reference design doc: `docs/superpowers/specs/2026-07-14-multiselect-filters-design.md`.

---

### Task 1: `MultiSelectFilterGroup` component

**Files:**
- Create: `components/filters/MultiSelectFilterGroup.tsx`

**Interfaces:**
- Produces: `MultiSelectFilterGroup` (default export) and `MultiSelectOption` (named export type `{ value: string; label: string; count: number }`), consumed by Task 2.
  - Props: `{ options: MultiSelectOption[]; selected: string[]; onChange: (next: string[]) => void; searchable?: boolean; searchPlaceholder?: string; emptyMessage?: string }`.

- [ ] **Step 1: Create the component file**

```tsx
'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  count: number;
}

interface MultiSelectFilterGroupProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export default function MultiSelectFilterGroup({
  options,
  selected,
  onChange,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Sin resultados',
}: MultiSelectFilterGroupProps) {
  const [query, setQuery] = useState('');

  const visibleOptions =
    searchable && query.trim()
      ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
      : options;

  const toggle = (value: string) => {
    onChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    );
  };

  return (
    <div className="space-y-2">
      {searchable && (
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b496d]/40 focus:border-[#2b496d] transition-all"
          />
        </div>
      )}
      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
        {visibleOptions.length === 0 && (
          <p className="text-xs text-gray-400 py-2 px-1">{emptyMessage}</p>
        )}
        {visibleOptions.map((opt) => {
          const checked = selected.includes(opt.value);
          return (
            <label
              key={opt.value}
              className="flex items-center justify-between gap-2 px-1.5 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
            >
              <span className="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt.value)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#2b496d] focus:ring-[#2b496d]/40 flex-shrink-0"
                />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                  {opt.label}
                </span>
              </span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                {opt.count}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors referencing `MultiSelectFilterGroup.tsx` (the file is not imported anywhere yet, so it just needs to compile standalone).

- [ ] **Step 3: Lint**

Run: `npm run lint -- components/filters/MultiSelectFilterGroup.tsx`
Expected: No errors or warnings.

- [ ] **Step 4: Commit**

```bash
git add components/filters/MultiSelectFilterGroup.tsx
git commit -m "feat: add reusable MultiSelectFilterGroup component"
```

---

### Task 2: Rewrite `Filters.tsx` to use multi-select groups

**Files:**
- Modify: `components/Filters.tsx` (full rewrite)

**Interfaces:**
- Consumes: `MultiSelectFilterGroup` and `MultiSelectOption` from Task 1 (`components/filters/MultiSelectFilterGroup.tsx`).
- Produces: `Filters` default export with new props shape, consumed by Task 4 (`app/products/ProductsClient.tsx`):
  ```ts
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
    typeCounts: Record<string, number>;
    demographicCounts: Record<string, number>;
    countryCounts: Record<string, number>;
    editorialCounts: Record<string, number>;
    stockCounts: Record<string, number>;
  }
  ```

- [ ] **Step 1: Replace the full file contents**

Replace all of `components/Filters.tsx` with:

```tsx
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
  { value: 'on_demand', label: 'A pedido' },
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
}: FiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [authorQuery, setAuthorQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);

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
```

- [ ] **Step 2: Type-check (expect errors from `ProductsClient.tsx` — not fixed until Task 4)**

Run: `npx tsc --noEmit`
Expected: Errors reported for `app/products/ProductsClient.tsx` only (it still passes the old props shape to `<Filters>`), since Task 4 hasn't run yet. No errors should reference `components/Filters.tsx` itself or `components/filters/HierarchicalCountryFilter.tsx` (still present, still separately valid) — confirm by checking the error list only contains `ProductsClient.tsx` paths.

- [ ] **Step 3: Commit**

```bash
git add components/Filters.tsx
git commit -m "feat: rewrite Filters.tsx with multi-select checkbox groups"
```

---

### Task 3: Remove the now-unused hierarchical country filter

**Files:**
- Delete: `components/filters/HierarchicalCountryFilter.tsx`

**Interfaces:**
- Consumes: nothing (Task 2 already removed the only import of this file).
- Produces: nothing (deletion only).

- [ ] **Step 1: Confirm no remaining references**

Run: `grep -rln "HierarchicalCountryFilter" --include="*.ts" --include="*.tsx" . | grep -v node_modules`
Expected: Only `components/filters/HierarchicalCountryFilter.tsx` itself is listed (no other file imports it, since Task 2 replaced its usage in `Filters.tsx`).

- [ ] **Step 2: Delete the file**

```bash
git rm components/filters/HierarchicalCountryFilter.tsx
```

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove unused HierarchicalCountryFilter component"
```

---

### Task 4: Multi-select state, faceted counts, and wiring in `ProductsClient.tsx`

**Files:**
- Modify: `app/products/ProductsClient.tsx` (full rewrite)

**Interfaces:**
- Consumes: `Filters` component and `FiltersProps` shape from Task 2 (`components/Filters.tsx`).
- Produces: the page-level filtering/counting logic; nothing downstream depends on this file's internals beyond the rendered page.

- [ ] **Step 1: Replace the full file contents**

Replace all of `app/products/ProductsClient.tsx` with:

```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: No errors or warnings.

- [ ] **Step 4: Commit**

```bash
git add app/products/ProductsClient.tsx
git commit -m "feat: multi-select filter state, URL sync, and faceted counts in ProductsClient"
```

---

### Task 5: Build verification and manual walkthrough

**Files:** none (verification only).

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: Build succeeds with no type or lint errors.

- [ ] **Step 2: Start dev server**

Run: `npm run dev` (leave running in background)
Expected: Server starts on `http://localhost:3000` with no console errors.

- [ ] **Step 3: Manual walkthrough on `/products`**

Open `http://localhost:3000/products` in a browser and verify, per the spec's Testing section (`docs/superpowers/specs/2026-07-14-multiselect-filters-design.md`):

1. Marcar múltiples opciones dentro de un mismo grupo (ej. Tipo: Manga + Figura) → resultados combinan con OR (aparecen productos de ambos tipos).
2. Marcar opciones en distintos grupos (ej. Tipo: Manga + Demografía: Shonen) → resultados combinan con AND (solo mangas shonen).
3. Escribir en el buscador de "Editorial" → solo filtra las opciones visibles de esa lista, no cambia los contadores ni los resultados de la página.
4. Cambiar cualquier filtro y confirmar que los contadores de las demás listas se recalculan (ej. filtrar Tipo=Manga y ver que Demografía muestra solo conteos de mangas).
5. Marcar un País sin marcar Editorial, y viceversa; deseleccionar el País no debe borrar Editoriales ya marcadas que ya no aparezcan en la lista visible.
6. Recargar la página con filtros aplicados (URL con `?type=manga,figure&demographic=shonen`) → los checkboxes reflejan el estado de la URL.
7. Abrir el drawer de filtros en una ventana angosta (mobile) → mismo comportamiento que el sidebar desktop.
8. Pulsar "Limpiar todo" → todos los checkboxes y buscadores internos se limpian, contadores vuelven al total del catálogo.

Expected: All 8 checks pass. If any fails, fix the relevant task's code before proceeding — do not mark this step done with a known failure.

- [ ] **Step 4: Stop the dev server**

Stop the background `npm run dev` process.

- [ ] **Step 5: Final commit (only if Step 3 required fixes)**

If Step 3 required code changes, stage and commit them with a message describing the fix. If no changes were needed, skip this step — Task 4's commit is already the final state.

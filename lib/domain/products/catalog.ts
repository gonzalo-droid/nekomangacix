import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Product } from '@/lib/products';
import { dbRowToProduct } from '@/lib/productMappers';
import { CARD_COLUMNS } from './featured';
import { isCountryCode, type CountryCode } from '@/lib/constants/countries';
import { isProductType, type ProductType } from '@/lib/constants/productTypes';
import { isDemographic, type Demographic } from '@/lib/constants/demographics';

export const ITEMS_PER_PAGE = 18;

/** Mínimo de caracteres para que una búsqueda llegue a la base. */
export const MIN_SEARCH_LENGTH = 3;

export const SORT_OPTIONS = ['name_asc', 'newest', 'price_asc', 'price_desc'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
export const DEFAULT_SORT: SortOption = 'name_asc';

const STOCK_STATUSES = ['in_stock', 'preorder', 'out_of_stock'];

export interface CatalogQuery {
  search: string;
  author: string;
  minPrice: number | null;
  maxPrice: number | null;
  series: string | null;
  types: ProductType[];
  countries: CountryCode[];
  editorials: string[];
  demographics: Demographic[];
  stock: string[];
  sort: SortOption;
  page: number;
}

export interface FacetCounts {
  total: number;
  type: Record<string, number>;
  country: Record<string, number>;
  editorial: Record<string, number>;
  demographic: Record<string, number>;
  stock: Record<string, number>;
}

export const EMPTY_FACETS: FacetCounts = {
  total: 0, type: {}, country: {}, editorial: {}, demographic: {}, stock: {},
};

type RawParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function parseList(value: string | string[] | undefined): string[] {
  return firstValue(value).split(',').map((s) => s.trim()).filter(Boolean);
}

function parseNumber(value: string | string[] | undefined): number | null {
  const raw = firstValue(value);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * Comas, paréntesis y comodines rompen la sintaxis de `.or()` de PostgREST;
 * el resto viaja como parámetro ligado, no interpolado en SQL.
 */
function sanitizeText(value: string): string {
  return value.replace(/[,()%*\\]/g, ' ').trim().slice(0, 80);
}

/** Traduce los searchParams de la URL al query tipado del catálogo. */
export function parseCatalogQuery(params: RawParams): CatalogQuery {
  const rawSearch = sanitizeText(firstValue(params.search));
  const rawAuthor = sanitizeText(firstValue(params.author));
  const sortParam = firstValue(params.sort) as SortOption;
  const page = parseNumber(params.page) ?? 1;

  return {
    // Por debajo del mínimo la búsqueda se ignora en vez de filtrar por 1-2 letras
    search: rawSearch.length >= MIN_SEARCH_LENGTH ? rawSearch : '',
    author: rawAuthor.length >= MIN_SEARCH_LENGTH ? rawAuthor : '',
    minPrice: parseNumber(params.min),
    maxPrice: parseNumber(params.max),
    series: firstValue(params.series) || null,
    types: parseList(params.type).filter(isProductType),
    countries: parseList(params.country).filter(isCountryCode),
    editorials: parseList(params.editorial),
    demographics: parseList(params.demographic).filter(isDemographic),
    stock: parseList(params.stock).filter((s) => STOCK_STATUSES.includes(s)),
    sort: SORT_OPTIONS.includes(sortParam) ? sortParam : DEFAULT_SORT,
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

/** True si el usuario no filtró nada: es la vista cacheable por defecto. */
export function isDefaultQuery(q: CatalogQuery): boolean {
  return (
    !q.search && !q.author && q.minPrice === null && q.maxPrice === null &&
    !q.series && q.types.length === 0 && q.countries.length === 0 &&
    q.editorials.length === 0 && q.demographics.length === 0 &&
    q.stock.length === 0 && q.sort === DEFAULT_SORT && q.page === 1
  );
}

function getClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || url.includes('tu-proyecto') || !key || key.includes('tu-anon')) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

const SORT_COLUMNS: Record<SortOption, { column: string; ascending: boolean }> = {
  name_asc: { column: 'title', ascending: true },
  newest: { column: 'created_at', ascending: false },
  price_asc: { column: 'price_pen', ascending: true },
  price_desc: { column: 'price_pen', ascending: false },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function applyFilters(query: any, q: CatalogQuery) {
  if (q.search) {
    query = query.or(
      `title.ilike.%${q.search}%,editorial.ilike.%${q.search}%,author.ilike.%${q.search}%`,
    );
  }
  if (q.author) query = query.ilike('author', `%${q.author}%`);
  if (q.minPrice !== null) query = query.gte('price_pen', q.minPrice);
  if (q.maxPrice !== null) query = query.lte('price_pen', q.maxPrice);
  if (q.series) query = query.eq('series', q.series);
  if (q.types.length) query = query.in('type', q.types);
  if (q.countries.length) query = query.in('country_code', q.countries);
  if (q.editorials.length) query = query.in('editorial', q.editorials);
  if (q.demographics.length) query = query.in('demographic', q.demographics);
  if (q.stock.length) query = query.in('stock_status', q.stock);
  return query;
}

/**
 * Una sola página del catálogo. Solo las columnas que renderiza la card.
 */
export async function queryCatalogPage(
  q: CatalogQuery,
): Promise<{ products: Product[]; total: number | null }> {
  const supabase = getClient();
  if (!supabase) return { products: [], total: 0 };

  const sort = SORT_COLUMNS[q.sort];
  const from = (q.page - 1) * ITEMS_PER_PAGE;

  let query = (supabase as any)
    .from('products')
    .select(CARD_COLUMNS, { count: 'exact' })
    .eq('is_active', true);

  query = applyFilters(query, q);

  const { data, error, count } = await query
    .order(sort.column, { ascending: sort.ascending })
    .order('id', { ascending: true })
    .range(from, from + ITEMS_PER_PAGE - 1);

  if (error || !data) return { products: [], total: 0 };

  return {
    products: (data as Record<string, unknown>[]).map(dbRowToProduct),
    total: count ?? null,
  };
}

/**
 * Contadores de cada filtro. Usa la función `catalog_facets` (migración 013).
 *
 * Si la función todavía no está aplicada en la base, cae a un conteo en el
 * servidor leyendo solo las 5 columnas de faceta — más lento, pero mantiene
 * el panel funcionando en vez de romperlo.
 */
export async function queryCatalogFacets(q: CatalogQuery): Promise<FacetCounts> {
  const supabase = getClient();
  if (!supabase) return EMPTY_FACETS;

  const { data, error } = await (supabase as any).rpc('catalog_facets', {
    p_search: q.search || null,
    p_author: q.author || null,
    p_min_price: q.minPrice,
    p_max_price: q.maxPrice,
    p_series: q.series,
    p_types: q.types.length ? q.types : null,
    p_countries: q.countries.length ? q.countries : null,
    p_editorials: q.editorials.length ? q.editorials : null,
    p_demographics: q.demographics.length ? q.demographics : null,
    p_stock: q.stock.length ? q.stock : null,
  });

  if (!error && data) return { ...EMPTY_FACETS, ...(data as FacetCounts) };

  return facetsFallback(supabase, q);
}

/** Conteo en memoria cuando la RPC no existe. Ver nota en queryCatalogFacets. */
async function facetsFallback(supabase: SupabaseClient, q: CatalogQuery): Promise<FacetCounts> {
  // Los filtros estructurales se aplican después, en memoria: cada faceta
  // necesita el conteo *sin* su propia dimensión.
  const nonStructural: CatalogQuery = {
    ...q,
    types: [], countries: [], editorials: [], demographics: [], stock: [],
  };

  type Row = {
    type: string; country_code: string; editorial: string;
    demographic: string | null; stock_status: string;
  };

  // PostgREST corta en 1.000 filas por respuesta (`max-rows`), así que hay que
  // paginar o los conteos salen truncados.
  const PAGE = 1000;
  const rows: Row[] = [];
  for (let from = 0; from < 50_000; from += PAGE) {
    let query = (supabase as any)
      .from('products')
      .select('type,country_code,editorial,demographic,stock_status')
      .eq('is_active', true);
    query = applyFilters(query, nonStructural);

    const { data, error } = await query.range(from, from + PAGE - 1);
    if (error || !data) break;
    rows.push(...(data as Row[]));
    if (data.length < PAGE) break;
  }
  if (rows.length === 0) return EMPTY_FACETS;

  const matches = (r: Row, skip: keyof FacetCounts) =>
    (skip === 'type' || !q.types.length || q.types.includes(r.type as ProductType)) &&
    (skip === 'country' || !q.countries.length || q.countries.includes(r.country_code as CountryCode)) &&
    (skip === 'editorial' || !q.editorials.length || q.editorials.includes(r.editorial)) &&
    (skip === 'demographic' || !q.demographics.length ||
      (r.demographic !== null && q.demographics.includes(r.demographic as Demographic))) &&
    (skip === 'stock' || !q.stock.length || q.stock.includes(r.stock_status));

  const tally = (skip: keyof FacetCounts, get: (r: Row) => string | null) => {
    const out: Record<string, number> = {};
    for (const r of rows) {
      if (!matches(r, skip)) continue;
      const k = get(r);
      if (k == null) continue;
      out[k] = (out[k] ?? 0) + 1;
    }
    return out;
  };

  return {
    total: rows.filter((r) => matches(r, 'total')).length,
    type: tally('type', (r) => r.type),
    country: tally('country', (r) => r.country_code),
    editorial: tally('editorial', (r) => r.editorial),
    demographic: tally('demographic', (r) => r.demographic),
    stock: tally('stock', (r) => r.stock_status),
  };
}

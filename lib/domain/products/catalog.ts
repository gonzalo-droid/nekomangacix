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

/**
 * `recommended`: primero lo que está en stock (se entrega ya), después las
 * preventas y al final los agotados; dentro de cada grupo, por título.
 * Antes el orden por defecto era alfabético y el catálogo abría con 18
 * preventas y una imagen rota, mientras los 155 productos en stock solo
 * aparecían si alguien filtraba. "Más recientes" se quitó: el catálogo se
 * importó en bloque y la fecha de alta no dice nada.
 */
export const SORT_OPTIONS = ['recommended', 'name_asc', 'price_asc', 'price_desc'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
export const DEFAULT_SORT: SortOption = 'recommended';

/** Orden de los grupos en `recommended`. */
const STOCK_STATUSES = ['in_stock', 'preorder', 'out_of_stock'];

/** Palabras que no ayudan a buscar y, solas, coinciden con casi todo. */
const STOPWORDS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'en', 'the', 'of', 'vol', 'tomo']);

/**
 * Parte la búsqueda en palabras. Cada palabra se busca por separado (en
 * título, editorial, autor o serie) y todas tienen que aparecer, en cualquier
 * orden. Así "one piece 16" encuentra "ONE PIECE 016" y "spy x family"
 * encuentra "SPY×FAMILY 01": antes se buscaba la frase exacta y ambas daban 0.
 *
 * Los números se aceptan aunque tengan un dígito; las letras sueltas y las
 * palabras vacías se descartan. Se quitan las tildes, igual que en la columna
 * `search_text` de la base (migración 014), así "pokemon" encuentra
 * "POKÉMON". Solo quedan letras y números, así que nada de lo que llega rompe
 * la sintaxis de los filtros de PostgREST.
 */
export function searchTokens(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(' ')
    .filter((t) => t && !STOPWORDS.has(t) && (t.length >= 2 || /^\d+$/.test(t)))
    .slice(0, 6);
}

/**
 * Cada palabra tiene que aparecer en `search_text` (título, serie, autor y
 * editorial en minúsculas y sin tildes; migración 014, con índice trigram).
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function applySearch(query: any, text: string) {
  for (const token of searchTokens(text)) {
    query = query.ilike('search_text', `%${token}%`);
  }
  return query;
}

/**
 * Productos parecidos a lo buscado, para cuando la búsqueda exacta da 0:
 * tolera errores de tipeo ("atack on titan") y usa la tabla de sinónimos
 * ("shingeki" → Attack on Titan). Función `search_products_fuzzy` (migración
 * 014); en stock primero.
 */
export async function querySimilarProducts(text: string, limit = 18): Promise<Product[]> {
  const supabase = getClient();
  if (!supabase || searchTokens(text).length === 0) return [];
  const { data, error } = await supabase.rpc('search_products_fuzzy', {
    p_query: text,
    p_limit: limit,
  });
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(dbRowToProduct);
}

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
  recommended: { column: 'title', ascending: true },
  name_asc: { column: 'title', ascending: true },
  price_asc: { column: 'price_pen', ascending: true },
  price_desc: { column: 'price_pen', ascending: false },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function applyFilters(query: any, q: CatalogQuery) {
  if (q.search) query = applySearch(query, q.search);
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
  if (q.sort === 'recommended') return queryRecommendedPage(supabase, q);

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
 * Orden recomendado sin tocar la base: PostgREST no ordena por una expresión,
 * así que el catálogo se trata como grupos consecutivos (en stock, preventa,
 * agotado), cada uno por título. Se cuenta cada grupo y se pide solo el tramo
 * que cae en la página; una página puede juntar el final de un grupo con el
 * principio del siguiente.
 */
async function queryRecommendedPage(
  supabase: SupabaseClient,
  q: CatalogQuery,
): Promise<{ products: Product[]; total: number | null }> {
  const groups = q.stock.length ? STOCK_STATUSES.filter((st) => q.stock.includes(st)) : STOCK_STATUSES;
  // Los filtros se aplican después de `select`: es el constructor que los tiene.
  const base = (columns: string, options?: { count: 'exact'; head: true }) =>
    applyFilters((supabase as any).from('products').select(columns, options), { ...q, stock: [] });

  const counts = await Promise.all(
    groups.map(async (status) => {
      const { count, error } = await base('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('stock_status', status);
      return error ? 0 : (count ?? 0);
    }),
  );
  const total = counts.reduce((sum, c) => sum + c, 0);

  let from = (q.page - 1) * ITEMS_PER_PAGE;
  let remaining = ITEMS_PER_PAGE;
  const products: Product[] = [];

  for (let i = 0; i < groups.length && remaining > 0; i++) {
    if (from >= counts[i]) {
      from -= counts[i];
      continue;
    }
    const to = Math.min(counts[i], from + remaining) - 1;
    const { data, error } = await base(CARD_COLUMNS)
      .eq('is_active', true)
      .eq('stock_status', groups[i])
      .order('title', { ascending: true })
      .order('id', { ascending: true })
      .range(from, to);
    if (error || !data) break;
    products.push(...(data as Record<string, unknown>[]).map(dbRowToProduct));
    remaining -= data.length;
    from = 0;
  }

  return { products, total };
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

  // La RPC `catalog_facets` busca la frase completa y la página busca palabra
  // por palabra: con búsqueda, los contadores se calculan con los mismos
  // filtros que la página para que no digan 0 donde hay resultados.
  if (q.search) return facetsFallback(supabase, q);

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

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MIN_SEARCH_LENGTH, applySearch, searchTokens } from '@/lib/domain/products/catalog';

const STOCK_RANK: Record<string, number> = { in_stock: 0, preorder: 1, out_of_stock: 2 };
const SUGGESTIONS = 6;

/**
 * Menor es mejor. Primero el tomo exacto que se pidió ("jujutsu kaisen 1"
 * trae el 01, no el 10), después los títulos que empiezan con lo buscado
 * ("naruto" trae NARUTO 01 antes que "La historia secreta de Gaara (Naruto)").
 */
function relevance(title: string, query: string): number {
  const tokens = searchTokens(query);
  const words = searchTokens(title);
  const numbers = tokens.filter((t) => /^\d+$/.test(t)).map(Number);
  const text = tokens.filter((t) => !/^\d+$/.test(t));
  let score = 0;
  if (numbers.length && words.some((w) => /^\d+$/.test(w) && numbers.includes(Number(w)))) score -= 2;
  if (text.length && title.toLowerCase().startsWith(text.join(' '))) score -= 1;
  return score;
}

/**
 * Sugerencias del buscador del encabezado. Busca igual que el catálogo
 * (palabra por palabra) y muestra primero lo que está en stock, por título:
 * antes buscaba la frase exacta, sin orden, y "naruto" mostraba los tomos
 * 55, 56 y 57 en vez del 1.
 *
 * Si no hay coincidencias exactas, devuelve los productos más parecidos.
 *
 * Usa la clave pública: es una lectura de productos activos, no necesita la
 * de servicio.
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim();
  if (q.length < MIN_SEARCH_LENGTH || searchTokens(q).length === 0) return NextResponse.json([]);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );

  const query = applySearch(
    supabase
      .from('products')
      .select('id, slug, title, editorial, price_pen, stock_status, images, country_code'),
    q,
  );
  const { data } = await query.eq('is_active', true).order('title').limit(40);

  const rows = (data ?? []) as { stock_status: string; title: string }[];
  const ordered = [...rows]
    .sort((a, b) => relevance(a.title, q) - relevance(b.title, q) || (STOCK_RANK[a.stock_status] ?? 3) - (STOCK_RANK[b.stock_status] ?? 3))
    .slice(0, SUGGESTIONS);

  if (ordered.length > 0) return NextResponse.json(ordered);

  // Sin coincidencias exactas: lo más parecido (errores de tipeo, sinónimos
  // como "shingeki" → Attack on Titan). Función de la migración 014.
  const { data: similar } = await supabase.rpc('search_products_fuzzy', { p_query: q, p_limit: SUGGESTIONS });
  const fields = ['id', 'slug', 'title', 'editorial', 'price_pen', 'stock_status', 'images', 'country_code'] as const;
  const rowsSimilar = ((similar ?? []) as Record<string, unknown>[]).map((r) =>
    Object.fromEntries(fields.map((f) => [f, r[f]])),
  );
  return NextResponse.json(rowsSimilar);
}

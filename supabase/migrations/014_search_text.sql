-- ============================================
-- NekoMangaCix - 014: Búsqueda tolerante (tildes, errores y sinónimos)
--
-- El buscador busca palabra por palabra con ILIKE (ver catalog.ts). Eso ya
-- resuelve "one piece 16" o "spy x family", pero no:
--   · tildes: "pokemon" no encuentra "POKÉMON";
--   · errores de tipeo: "atack on titan", "chainsow";
--   · nombres alternativos: "shingeki" → Attack on Titan.
--
-- Esta migración NO cambia datos existentes: agrega una columna calculada,
-- un índice, una tabla de sinónimos y una función de solo lectura.
-- Se puede revertir con el bloque del final.
-- ============================================

-- ── Extensiones (Supabase las instala en el esquema `extensions`) ──────────
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm  with schema extensions;

-- `unaccent()` no es IMMUTABLE y una columna generada lo exige: se envuelve
-- fijando el diccionario, que es lo que lo vuelve determinista.
create or replace function public.f_unaccent(text)
returns text
language sql
immutable
parallel safe
strict
set search_path = extensions, public
as $$ select extensions.unaccent('extensions.unaccent', $1) $$;

-- ── Texto de búsqueda: título + serie + autor + editorial, sin tildes ──────
alter table public.products
  add column if not exists search_text text
  generated always as (
    lower(public.f_unaccent(
      coalesce(title, '') || ' ' || coalesce(series, '') || ' ' ||
      coalesce(author, '') || ' ' || coalesce(editorial, '')
    ))
  ) stored;

-- Trigramas: ILIKE '%palabra%' usa el índice y permite medir parecido para
-- tolerar errores de tipeo.
create index if not exists products_search_text_trgm_idx
  on public.products using gin (search_text extensions.gin_trgm_ops)
  where is_active;

-- ── Sinónimos: lo que la gente escribe → cómo se llama en el catálogo ──────
create table if not exists public.search_synonyms (
  term       text primary key,          -- en minúsculas y sin tildes
  expands_to text not null              -- texto que se busca en su lugar
);

alter table public.search_synonyms enable row level security;
drop policy if exists "search_synonyms_read" on public.search_synonyms;
create policy "search_synonyms_read" on public.search_synonyms for select using (true);

insert into public.search_synonyms (term, expands_to) values
  ('shingeki no kyojin', 'attack on titan'),
  ('shingeki',           'attack on titan'),
  ('snk',                'attack on titan'),
  ('kimetsu no yaiba',   'demon slayer'),
  ('kimetsu',            'demon slayer'),
  ('boku no hero',       'my hero academia'),
  ('bnha',               'my hero academia'),
  ('mha',                'my hero academia'),
  ('jjk',                'jujutsu kaisen'),
  ('csm',                'chainsaw man'),
  ('kny',                'demon slayer'),
  ('hxh',                'hunter x hunter')
on conflict (term) do nothing;

-- ── Sugerencias con tolerancia a errores ────────────────────────────────────
-- Se usa cuando la búsqueda normal da 0 resultados. Cada palabra de 3 letras
-- o más tiene que parecerse (≥ 0.5) a alguna palabra del producto: así
-- "atack on titan" o "chainsow man" encuentran el tomo correcto, pero
-- "berserk deluxe" no devuelve otras ediciones deluxe solo por compartir esa
-- palabra. Pasa antes por los sinónimos. En stock primero. Solo lectura;
-- respeta el RLS.
--
-- Aplicada en dos pasos el 2026-11-12: `search_text` y luego
-- `search_fuzzy_all_words`, que endureció esta función a la versión de abajo.
create or replace function public.search_products_fuzzy(
  p_query text,
  p_limit int default 18
)
returns setof public.products
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with q as (
    select lower(public.f_unaccent(
      coalesce((select expands_to from public.search_synonyms
                where term = lower(public.f_unaccent(trim(p_query)))), p_query)
    )) as text
  )
  select p.*
  from public.products p, q
  where p.is_active
    and (select bool_and(extensions.word_similarity(tok, p.search_text) >= 0.5)
         from unnest(string_to_array(q.text, ' ')) tok
         where length(tok) >= 3)
  order by
    case p.stock_status when 'in_stock' then 0 when 'preorder' then 1 else 2 end,
    extensions.word_similarity(q.text, p.search_text) desc,
    p.title
  limit greatest(1, least(p_limit, 50));
$$;

grant execute on function public.search_products_fuzzy(text, int) to anon, authenticated;

-- ── Para revertir ───────────────────────────────────────────────────────────
-- drop function if exists public.search_products_fuzzy(text, int);
-- drop table if exists public.search_synonyms;
-- drop index if exists products_search_text_trgm_idx;
-- alter table public.products drop column if exists search_text;
-- drop function if exists public.f_unaccent(text);

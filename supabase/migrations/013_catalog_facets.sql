-- ============================================
-- NekoMangaCix - 013: Facetas del catálogo en una sola consulta
--
-- El catálogo público paginaba en el cliente: /products mandaba las 6.015
-- filas al navegador (6.8 MB) y ahí filtraba, ordenaba y contaba facetas.
-- Con paginación en servidor el cliente ya no tiene el set completo, así que
-- los contadores de cada filtro se calculan acá.
--
-- Cada faceta se cuenta aplicando TODOS los filtros menos el suyo — así el
-- panel sigue mostrando "cuántos habría si además marco esta opción", que es
-- el comportamiento que tenía el cálculo en cliente.
-- ============================================

-- ── Índices para ordenar y paginar ──────────────────────────────────────────
-- El orden por defecto del catálogo es alfabético; el precio es la otra
-- ordenación frecuente. Ambos parciales sobre is_active: nunca listamos
-- productos inactivos en la tienda.
create index if not exists products_active_title_idx
  on public.products (title) where is_active;

create index if not exists products_active_price_idx
  on public.products (price_pen) where is_active;

create index if not exists products_active_created_idx
  on public.products (created_at desc) where is_active;

-- ── Función de facetas ──────────────────────────────────────────────────────
-- Devuelve jsonb:
--   { "total": 123,
--     "type": {"manga": 100, ...}, "country": {...},
--     "editorial": {...}, "demographic": {...}, "stock": {...} }
--
-- Un array vacío o null en los parámetros significa "sin filtrar por esa
-- dimensión". `security invoker` mantiene el RLS de la tabla.
create or replace function public.catalog_facets(
  p_search       text    default null,
  p_author       text    default null,
  p_min_price    numeric default null,
  p_max_price    numeric default null,
  p_series       text    default null,
  p_types        text[]  default null,
  p_countries    text[]  default null,
  p_editorials   text[]  default null,
  p_demographics text[]  default null,
  p_stock        text[]  default null
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with base as (
    select type, country_code, editorial, demographic, stock_status
    from public.products
    where is_active
      and (p_search    is null or title ilike '%' || p_search || '%'
                               or editorial ilike '%' || p_search || '%'
                               or author ilike '%' || p_search || '%')
      and (p_author    is null or author ilike '%' || p_author || '%')
      and (p_min_price is null or price_pen >= p_min_price)
      and (p_max_price is null or price_pen <= p_max_price)
      and (p_series    is null or series = p_series)
  ),
  -- Cada CTE omite deliberadamente el filtro de su propia dimensión
  f_type as (
    select type as k, count(*) as n from base
    where (p_countries    is null or country_code = any(p_countries))
      and (p_editorials   is null or editorial    = any(p_editorials))
      and (p_demographics is null or demographic  = any(p_demographics))
      and (p_stock        is null or stock_status = any(p_stock))
    group by type
  ),
  f_country as (
    select country_code as k, count(*) as n from base
    where (p_types        is null or type        = any(p_types))
      and (p_editorials   is null or editorial   = any(p_editorials))
      and (p_demographics is null or demographic = any(p_demographics))
      and (p_stock        is null or stock_status= any(p_stock))
    group by country_code
  ),
  f_editorial as (
    select editorial as k, count(*) as n from base
    where (p_types        is null or type         = any(p_types))
      and (p_countries    is null or country_code = any(p_countries))
      and (p_demographics is null or demographic  = any(p_demographics))
      and (p_stock        is null or stock_status = any(p_stock))
    group by editorial
  ),
  f_demographic as (
    select demographic as k, count(*) as n from base
    where demographic is not null
      and (p_types      is null or type         = any(p_types))
      and (p_countries  is null or country_code = any(p_countries))
      and (p_editorials is null or editorial    = any(p_editorials))
      and (p_stock      is null or stock_status = any(p_stock))
    group by demographic
  ),
  f_stock as (
    select stock_status as k, count(*) as n from base
    where (p_types        is null or type         = any(p_types))
      and (p_countries    is null or country_code = any(p_countries))
      and (p_editorials   is null or editorial    = any(p_editorials))
      and (p_demographics is null or demographic  = any(p_demographics))
    group by stock_status
  ),
  -- Total con TODOS los filtros aplicados: es el nº de resultados y la base
  -- del cálculo de páginas, así evitamos un count() extra por request.
  f_total as (
    select count(*) as n from base
    where (p_types        is null or type         = any(p_types))
      and (p_countries    is null or country_code = any(p_countries))
      and (p_editorials   is null or editorial    = any(p_editorials))
      and (p_demographics is null or demographic  = any(p_demographics))
      and (p_stock        is null or stock_status = any(p_stock))
  )
  select jsonb_build_object(
    'total',       (select n from f_total),
    'type',        coalesce((select jsonb_object_agg(k, n) from f_type        where k is not null), '{}'::jsonb),
    'country',     coalesce((select jsonb_object_agg(k, n) from f_country     where k is not null), '{}'::jsonb),
    'editorial',   coalesce((select jsonb_object_agg(k, n) from f_editorial   where k is not null), '{}'::jsonb),
    'demographic', coalesce((select jsonb_object_agg(k, n) from f_demographic where k is not null), '{}'::jsonb),
    'stock',       coalesce((select jsonb_object_agg(k, n) from f_stock       where k is not null), '{}'::jsonb)
  );
$$;

-- La tienda pública consulta sin sesión: el rol anon necesita ejecutarla.
grant execute on function public.catalog_facets(
  text, text, numeric, numeric, text, text[], text[], text[], text[], text[]
) to anon, authenticated;


-- ── OPCIONAL — solo cuando el catálogo crezca ───────────────────────────────
-- Hoy `ilike '%texto%'` sobre 6k filas responde en ~360 ms (dominado por
-- latencia de red, no por Postgres), así que esto no hace falta todavía.
-- A partir de ~50k productos el escaneo secuencial sí se nota; entonces:
--
--   create extension if not exists pg_trgm;
--   create index products_title_trgm_idx on public.products
--     using gin (title gin_trgm_ops) where is_active;
--   create index products_author_trgm_idx on public.products
--     using gin (author gin_trgm_ops) where is_active;

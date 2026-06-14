-- ============================================
-- NekoMangaCix - 010: Product model refactor
-- Adds attributes jsonb, drops deprecated scalar columns (volume_number,
-- language, figure_scale, manufacturer, category, specifications).
-- Adds protective_sleeve to type enum.
-- Updates series_status enum.
-- ============================================

-- 1. Add attributes jsonb column
alter table public.products
  add column if not exists attributes jsonb not null default '{}';

-- 2. Migrate existing scalar fields into attributes for rows that have them
update public.products
set attributes = attributes ||
  jsonb_strip_nulls(jsonb_build_object(
    'volume',        volume_number,
    'language',      language,
    'figure_scale',  figure_scale,
    'manufacturer',  manufacturer,
    'category',      category
  ))
where
  volume_number is not null
  or language is not null
  or figure_scale is not null
  or manufacturer is not null
  or category is not null;

-- Also migrate specifications into attributes (merge, don't overwrite existing keys)
update public.products
set attributes = specifications || attributes
where specifications is not null and specifications != '{}'::jsonb
  and (attributes = '{}' or attributes is null);

-- 3. Drop deprecated columns
alter table public.products
  drop column if exists volume_number,
  drop column if exists language,
  drop column if exists figure_scale,
  drop column if exists manufacturer,
  drop column if exists category,
  drop column if exists specifications;

-- 4. Expand type enum to include protective_sleeve
alter table public.products drop constraint if exists products_type_check;
alter table public.products
  add constraint products_type_check
  check (type in ('manga','figure','special_edition','merch','protective_sleeve'));

-- 5. Add series_status column if not present
alter table public.products
  add column if not exists series_status text
  check (series_status in ('single','ongoing','completed'));

-- 6. Index on attributes for common lookups
create index if not exists products_attributes_idx on public.products using gin (attributes);

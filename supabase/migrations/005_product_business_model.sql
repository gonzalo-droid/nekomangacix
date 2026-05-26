-- ============================================
-- NekoMangaCix - 005: Product business model
-- Adds: type, country_code, series, volume_number, demographic, language, eta_text,
--       figure_scale, manufacturer. Backfills from legacy country_group.
-- Relaxes stock_status to 3 values: in_stock | preorder | out_of_stock.
-- ============================================

alter table public.products
  add column if not exists type           text default 'manga'
    check (type in ('manga','figure','special_edition','merch')),
  add column if not exists country_code   text
    check (country_code in ('AR','MX','ES','JP')),
  add column if not exists series         text,
  add column if not exists volume_number  integer,
  add column if not exists demographic    text
    check (demographic in ('shonen','seinen','shojo','josei','kodomo')),
  add column if not exists language       text default 'es'
    check (language in ('es','jp')),
  add column if not exists eta_text       text,
  add column if not exists figure_scale   text,
  add column if not exists manufacturer   text;

-- Backfill country_code from legacy country_group
update public.products set country_code = 'AR' where country_group = 'Argentina' and country_code is null;
update public.products set country_code = 'MX' where country_group = 'México'    and country_code is null;

-- Default type for legacy rows
update public.products set type = 'manga' where type is null;

-- Migrate stock_status enum values: 'on_demand' -> 'preorder'
update public.products set stock_status = 'preorder' where stock_status = 'on_demand';

-- Replace constraint with new enum
alter table public.products drop constraint if exists products_stock_status_check;
alter table public.products
  add constraint products_stock_status_check
  check (stock_status in ('in_stock','preorder','out_of_stock'));

-- Helpful indices
create index if not exists products_type_idx        on public.products (type);
create index if not exists products_country_idx     on public.products (country_code);
create index if not exists products_series_idx      on public.products (series);
create index if not exists products_demographic_idx on public.products (demographic);

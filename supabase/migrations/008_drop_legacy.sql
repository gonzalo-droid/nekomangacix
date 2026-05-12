-- ============================================
-- NekoMangaCix - 008: Drop legacy columns and status values
-- Run only after verifying that 005-007 are deployed and the app is working
-- with the new fields (country_code, new order statuses, etc.).
-- ============================================

-- Make country_code mandatory now that everything has been backfilled
update public.products set country_code = 'AR' where country_code is null;
alter table public.products alter column country_code set not null;

-- Drop legacy country_group column
alter table public.products drop constraint if exists products_country_group_check;
alter table public.products drop column if exists country_group;

-- Tighten order_status enum to only the new 8 values
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in (
    'pending_deposit','confirmed','in_transit_to_pe','available',
    'pending_balance','shipped','delivered','cancelled'
  ));

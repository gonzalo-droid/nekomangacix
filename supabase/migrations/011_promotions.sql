-- ============================================
-- NekoMangaCix - 011: Promotions system
-- Types: per_product (A), coupon (C), per_product_type (D)
-- All with date ranges and manual active toggle.
-- ============================================

create table if not exists public.promotions (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null check (type in ('per_product', 'per_product_type', 'coupon')),
  is_active     boolean not null default true,
  starts_at     timestamptz,
  ends_at       timestamptz,

  -- discount configuration
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null check (discount_value > 0),

  -- scope: per_product -> product_ids, per_product_type -> product_types, coupon -> coupon_code
  product_ids   uuid[],
  product_types text[],
  coupon_code   text unique,

  -- usage limit for coupons
  max_uses      integer,
  uses_count    integer not null default 0,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Trigger to keep updated_at current
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger promotions_updated_at
  before update on public.promotions
  for each row execute function public.set_updated_at();

-- RLS: only service role (admin) can write; anon can read active ones
alter table public.promotions enable row level security;

create policy "promotions_read_active"
  on public.promotions for select
  using (is_active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));

create policy "promotions_admin_all"
  on public.promotions for all
  using (auth.role() = 'service_role');

-- Index for coupon lookup
create index if not exists promotions_coupon_idx on public.promotions (coupon_code) where coupon_code is not null;
create index if not exists promotions_type_idx   on public.promotions (type);
create index if not exists promotions_active_idx on public.promotions (is_active, starts_at, ends_at);

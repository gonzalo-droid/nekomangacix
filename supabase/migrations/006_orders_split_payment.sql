-- ============================================
-- NekoMangaCix - 006: Orders split-payment model
-- Adds split-payment fields to orders, snapshot fields to order_items,
-- first-purchase discount flag to profiles, and extends order status enum.
-- ============================================

-- Split payment fields on orders
alter table public.orders
  add column if not exists payment_type        text default 'full'
    check (payment_type in ('full','split_preorder')),
  add column if not exists subtotal_pen        numeric(10,2),
  add column if not exists discount_pen        numeric(10,2) default 0,
  add column if not exists deposit_pen         numeric(10,2) default 0,
  add column if not exists balance_pen         numeric(10,2) default 0,
  add column if not exists deposit_paid_at     timestamptz,
  add column if not exists balance_paid_at     timestamptz,
  add column if not exists estimated_arrival   text,
  add column if not exists payment_proof_url   text,
  add column if not exists payment_proof_confirmed_at timestamptz;

-- Replace order status constraint with new flow (keep legacy values for backwards compat
-- until cleanup migration 008 drops them).
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in (
    'pending_deposit','confirmed','in_transit_to_pe','available',
    'pending_balance','shipped','delivered','cancelled',
    'pending','paid'
  ));

-- Migrate legacy statuses
update public.orders set status = 'pending_deposit' where status = 'pending';
update public.orders set status = 'confirmed'       where status = 'paid';

-- Per-line snapshot on order_items
alter table public.order_items
  add column if not exists item_type        text default 'stock'
    check (item_type in ('stock','preorder')),
  add column if not exists estimated_arrival text;

-- First-purchase discount tracking on profiles
alter table public.profiles
  add column if not exists has_used_first_purchase_discount boolean default false;

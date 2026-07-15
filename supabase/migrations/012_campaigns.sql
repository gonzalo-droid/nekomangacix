-- ============================================
-- NekoMangaCix - 012: Preventa campaigns
-- Time-boxed monthly preorder windows, one open window per
-- country at a time. order_items link to the campaign that
-- was open when a preorder line was created, so a single
-- order can mix stock items (no campaign) with preorder
-- items from a campaign.
-- ============================================

create table if not exists public.campaigns (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  country_code  text not null check (country_code in ('AR','MX','ES','JP')),
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  status        text not null default 'open' check (status in ('open','closed')),
  notes         text,
  created_at    timestamptz not null default now()
);

alter table public.order_items
  add column if not exists campaign_id uuid references public.campaigns(id);

create index if not exists campaigns_country_status_idx
  on public.campaigns (country_code, status);

create index if not exists order_items_campaign_idx
  on public.order_items (campaign_id);

alter table public.campaigns enable row level security;

-- Público (checkout) puede leer campañas abiertas para calcular
-- si hay preventa vigente antes de armar el pedido.
create policy "campaigns_read_open"
  on public.campaigns for select
  using (status = 'open');

-- Solo el service role (rutas /api/admin/**) puede crear/editar/cerrar.
create policy "campaigns_admin_all"
  on public.campaigns for all
  using (auth.role() = 'service_role');

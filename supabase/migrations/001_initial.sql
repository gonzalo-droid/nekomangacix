-- ============================================
-- NekoMangaCix - Migración inicial
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- PROFILES (extiende auth.users)
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  phone       text,
  address     jsonb,
  role        text not null default 'customer'
                check (role in ('customer', 'admin')),
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Admins can read all profiles"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- PRODUCTS
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  sku               text unique not null,
  slug              text unique not null,
  title             text not null,
  editorial         text not null,
  author            text,
  price_pen         numeric(10,2) not null check (price_pen > 0),
  stock             integer not null default 0 check (stock >= 0),
  stock_status      text not null default 'in_stock'
                      check (stock_status in ('in_stock','on_demand','preorder','out_of_stock')),
  estimated_arrival text,
  preorder_deposit  numeric(10,2),
  description       text,
  full_description  text,
  specifications    jsonb,
  images            text[] default '{}',
  category          text not null,
  country_group     text not null check (country_group in ('Argentina','México')),
  tags              text[] default '{}',
  is_active         boolean default true,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.products enable row level security;

create policy "Anyone can read active products"
  on products for select using (is_active = true);
create policy "Admins manage products"
  on products for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create index if not exists products_slug_idx on products (slug);
create index if not exists products_category_idx on products (category);
create index if not exists products_editorial_idx on products (editorial);
create index if not exists products_active_idx on products (is_active);


-- ORDERS
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id),
  status           text not null default 'pending'
                     check (status in ('pending','confirmed','paid','shipped','delivered','cancelled')),
  total_pen        numeric(10,2) not null,
  shipping_cost    numeric(10,2) default 15.00,
  shipping_address jsonb,
  payment_method   text,
  payment_proof    text,
  customer_name    text,
  customer_phone   text,
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references orders(id) on delete cascade not null,
  product_id  uuid references products(id),
  quantity    integer not null check (quantity > 0),
  unit_price  numeric(10,2) not null,
  title       text not null
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Users see own orders"
  on orders for select using (auth.uid() = user_id);
create policy "Guests and users can insert orders"
  on orders for insert with check (true);
create policy "Admins manage all orders"
  on orders for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users see items of own orders"
  on order_items for select using (
    exists (select 1 from orders where id = order_id and user_id = auth.uid())
  );
create policy "Anyone can insert order items"
  on order_items for insert with check (true);
create policy "Admins manage all order items"
  on order_items for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create index if not exists orders_user_idx on orders (user_id);
create index if not exists orders_status_idx on orders (status);
create index if not exists order_items_order_idx on order_items (order_id);


-- AUTO updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

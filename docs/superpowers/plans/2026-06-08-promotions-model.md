# Promotions Model & Business Logic — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear el tipo `Promotion`, la función `getDiscountedPrice()`, la tabla en Supabase, y las API routes necesarias para gestionar promociones.

**Architecture:** `lib/promotions.ts` define los tipos y la lógica de cálculo de precios. La migración `011_promotions.sql` crea la tabla en Supabase. Las API routes en `app/api/admin/promotions/` exponen CRUD protegido por sesión admin. Este plan no toca la UI — eso es Plan C y D.

**Tech Stack:** TypeScript, Next.js 15 App Router, Supabase (PostgreSQL)

**Prerequisito:** Plan A (product-model-refactor) debe estar aplicado.

---

## Files

- Create: `lib/promotions.ts`
- Create: `supabase/migrations/011_promotions.sql`
- Create: `app/api/admin/promotions/route.ts`
- Create: `app/api/admin/promotions/[id]/route.ts`
- Create: `app/api/promotions/active/route.ts`

---

### Task 1: Tipos y lógica de negocio — `lib/promotions.ts`

**Files:**
- Create: `lib/promotions.ts`

- [ ] **Step 1: Crear el archivo**

```ts
export type PromotionType = 'percent' | 'fixed';
export type PromotionScope = 'product' | 'product_type' | 'global';

export interface Promotion {
  id: string;
  name: string;
  code?: string | null;
  type: PromotionType;
  value: number;
  scope: PromotionScope;
  productIds?: string[] | null;
  productTypes?: string[] | null;
  startDate?: string | null;
  endDate?: string | null;
  active: boolean;
  maxUses?: number | null;
  usedCount: number;
}

export interface DiscountResult {
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountPercent: number;
  promotionName: string | null;
}

function isPromotionActive(promo: Promotion, now: Date): boolean {
  if (!promo.active) return false;
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) return false;
  if (promo.startDate && new Date(promo.startDate) > now) return false;
  if (promo.endDate && new Date(promo.endDate) < now) return false;
  return true;
}

function appliesTo(
  promo: Promotion,
  productId: string,
  productType: string,
  couponCode?: string,
): boolean {
  if (promo.code) {
    // cupón: solo aplica si el código coincide
    return promo.code.toUpperCase() === (couponCode ?? '').toUpperCase();
  }
  if (promo.scope === 'global') return true;
  if (promo.scope === 'product') return (promo.productIds ?? []).includes(productId);
  if (promo.scope === 'product_type') return (promo.productTypes ?? []).includes(productType);
  return false;
}

function calculateFinalPrice(price: number, promo: Promotion): number {
  if (promo.type === 'percent') {
    return Math.round(price * (1 - promo.value / 100) * 100) / 100;
  }
  return Math.max(0, Math.round((price - promo.value) * 100) / 100);
}

/**
 * Devuelve el mejor descuento aplicable a un producto dado.
 * Si se pasa couponCode, solo evalúa promociones tipo cupón.
 */
export function getDiscountedPrice(
  price: number,
  productId: string,
  productType: string,
  promotions: Promotion[],
  couponCode?: string,
): DiscountResult {
  const now = new Date();
  const applicable = promotions.filter(
    (p) => isPromotionActive(p, now) && appliesTo(p, productId, productType, couponCode),
  );

  if (applicable.length === 0) {
    return {
      originalPrice: price,
      finalPrice: price,
      discountAmount: 0,
      discountPercent: 0,
      promotionName: null,
    };
  }

  // Elegir la promoción que da el mayor descuento
  const best = applicable.reduce((prev, curr) => {
    const prevFinal = calculateFinalPrice(price, prev);
    const currFinal = calculateFinalPrice(price, curr);
    return currFinal < prevFinal ? curr : prev;
  });

  const finalPrice = calculateFinalPrice(price, best);
  const discountAmount = Math.round((price - finalPrice) * 100) / 100;
  const discountPercent = Math.round((discountAmount / price) * 100);

  return {
    originalPrice: price,
    finalPrice,
    discountAmount,
    discountPercent,
    promotionName: best.name,
  };
}
```

- [ ] **Step 2: Verificar que compila**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add lib/promotions.ts
git commit -m "feat: add Promotion types and getDiscountedPrice logic"
```

---

### Task 2: Migración de base de datos — tabla `promotions`

**Files:**
- Create: `supabase/migrations/011_promotions.sql`

- [ ] **Step 1: Crear el archivo de migración**

```sql
-- ============================================
-- NekoMangaCix - 011: Promotions table
-- Soporta: descuento por producto (A), cupones (C), descuento por tipo (D)
-- ============================================

create table if not exists public.promotions (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  code          text unique,
  type          text not null check (type in ('percent', 'fixed')),
  value         numeric(10,2) not null check (value > 0),
  scope         text not null check (scope in ('product', 'product_type', 'global')),
  product_ids   text[] default null,
  product_types text[] default null,
  start_date    timestamptz default null,
  end_date      timestamptz default null,
  active        boolean not null default true,
  max_uses      integer default null check (max_uses is null or max_uses > 0),
  used_count    integer not null default 0 check (used_count >= 0),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.promotions enable row level security;

-- Cualquiera puede leer promociones activas (necesario para storefront)
create policy "Anyone can read active promotions"
  on promotions for select
  using (active = true);

-- Solo admins pueden crear/editar/borrar
create policy "Admins manage promotions"
  on promotions for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create index if not exists promotions_active_idx on promotions (active);
create index if not exists promotions_code_idx on promotions (code) where code is not null;
create index if not exists promotions_scope_idx on promotions (scope);

-- Trigger para updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger promotions_updated_at
  before update on public.promotions
  for each row execute procedure public.update_updated_at();
```

- [ ] **Step 2: Aplicar en Supabase**

Ejecutar en el SQL Editor de Supabase (https://supabase.com/dashboard/project/qimkmifmkiikoaewxfbx/sql) o via CLI:

```bash
npx supabase db push
```

- [ ] **Step 3: Verificar tabla creada**

```bash
npx supabase db query "select column_name, data_type from information_schema.columns where table_name = 'promotions';" --project-ref qimkmifmkiikoaewxfbx
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/011_promotions.sql
git commit -m "feat: add promotions table migration (011)"
```

---

### Task 3: API routes admin — CRUD de promociones

**Files:**
- Create: `app/api/admin/promotions/route.ts`
- Create: `app/api/admin/promotions/[id]/route.ts`

- [ ] **Step 1: Crear `app/api/admin/promotions/route.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/core/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from('promotions')
    .insert({
      name:          body.name,
      code:          body.code ?? null,
      type:          body.type,
      value:         body.value,
      scope:         body.scope,
      product_ids:   body.productIds ?? null,
      product_types: body.productTypes ?? null,
      start_date:    body.startDate ?? null,
      end_date:      body.endDate ?? null,
      active:        body.active ?? true,
      max_uses:      body.maxUses ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
```

- [ ] **Step 2: Crear `app/api/admin/promotions/[id]/route.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/core/supabase/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from('promotions')
    .update({
      name:          body.name,
      code:          body.code ?? null,
      type:          body.type,
      value:         body.value,
      scope:         body.scope,
      product_ids:   body.productIds ?? null,
      product_types: body.productTypes ?? null,
      start_date:    body.startDate ?? null,
      end_date:      body.endDate ?? null,
      active:        body.active,
      max_uses:      body.maxUses ?? null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase.from('promotions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Crear `app/api/promotions/active/route.ts`** (endpoint público para storefront)

```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/core/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .is('code', null); // excluir cupones del fetch público

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
```

- [ ] **Step 4: Verificar build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/promotions/ app/api/promotions/
git commit -m "feat: add promotions CRUD API routes"
```

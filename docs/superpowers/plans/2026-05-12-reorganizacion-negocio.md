# Plan: Reorganización del modelo de negocio (multi-tipo + preventa 50%)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar el catálogo para soportar 4 tipos de producto (manga, figura, edición especial, merch) con país/editorial/serie/demografía, y rediseñar el flujo de pedidos con preventa 50%, descuento de primera compra, envío gratis sobre S/100, y comprobante de pago en Supabase Storage.

**Architecture:** Modelo `products` extendido con campos opcionales por tipo (sin tablas auxiliares: países y editoriales se mantienen como constantes en código). Carrito separa visualmente stock vs preventa y calcula deposit/balance. Pedidos guardan snapshot por ítem y se mueven por un enum de 8 estados con timeline visible al usuario. Comprobantes de pago se suben a Supabase Storage con doble confirmación.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Supabase (Postgres + Storage + RLS), Cloudinary, sin framework de tests (verificación con `npm run build` + `npm run lint` + verificación manual en navegador).

---

## Convenciones del plan

- **Verificación en cada fase**: `npm run lint` y `npm run build` deben pasar. UI se verifica manualmente abriendo el navegador en `/`, `/products`, `/cart`, `/profile/orders`, `/admin`.
- **Commits frecuentes**: al final de cada Task. Mensaje en español: `feat(scope): ...`, `refactor(scope): ...`, `fix(scope): ...`.
- **Migraciones SQL**: archivos nuevos en `supabase/migrations/00X_*.sql`. Ejecutar manualmente en SQL Editor de Supabase. NO usar `apply_migration` MCP en producción sin que el usuario lo apruebe.
- **Tipos**: mantener `types/database.types.ts` sincronizado tras cada migración (regenerar con `supabase gen types` si está disponible, o editar a mano).
- **Backwards compatibility durante la migración**: agregar columnas nuevas como nullable, eliminar las viejas solo en la fase final de cleanup.

---

## Mapa de archivos (qué se crea, qué se modifica)

### Archivos nuevos
- `lib/constants/countries.ts` — códigos AR/MX/ES/JP + nombre + flag emoji
- `lib/constants/editorials.ts` — editoriales por país
- `lib/constants/demographics.ts` — shonen/seinen/shojo/josei/kodomo
- `lib/constants/orderStates.ts` — 8 estados con label/color/orden
- `lib/constants/productTypes.ts` — manga/figure/special_edition/merch
- `lib/domain/cart/calculate.ts` — split stock/preventa, descuento, envío
- `lib/domain/orders/states.ts` — helpers de transición de estados
- `lib/domain/products/related.ts` — relacionados por serie → demografía → editorial
- `lib/storage/paymentProof.ts` — subida a Supabase Storage
- `supabase/migrations/005_product_business_model.sql`
- `supabase/migrations/006_orders_split_payment.sql`
- `supabase/migrations/007_payment_proof_storage.sql`
- `components/cart/CartSplit.tsx`
- `components/cart/DepositSummary.tsx`
- `components/cart/FirstPurchaseDiscountBanner.tsx`
- `components/order/OrderStatusBadge.tsx`
- `components/order/OrderTimeline.tsx`
- `components/order/PaymentProofUploader.tsx`
- `components/product/RelatedProducts.tsx`
- `components/product/ReserveButton.tsx`
- `components/filters/HierarchicalCountryFilter.tsx`

### Archivos modificados
- `lib/products.ts` — extender interface `Product`
- `lib/productMappers.ts` — mapear nuevos campos
- `lib/productsServer.ts` — incluir nuevos campos en select
- `types/database.types.ts` — añadir columnas nuevas
- `app/admin/products/page.tsx` (o equivalente) — form con nuevos campos
- `app/products/page.tsx` + `ProductsClient.tsx` — filtros nuevos
- `app/products/[slug]/page.tsx` + `ProductDetailClient.tsx` — relacionados + reserve
- `app/cart/page.tsx` — split stock/preventa + descuento + envío
- `app/profile/orders/page.tsx` — timeline + uploader
- `app/api/orders/route.ts` — calcular deposit/balance, descuento
- `context/CartContext.tsx` — capturar `item_type` por línea
- `components/Filters.tsx` — incorporar filtro jerárquico
- `lib/excelParser.ts` — mapear nuevas columnas opcionales

---

## Fase 1: Constantes de dominio

Objetivo: centralizar países, editoriales, demografías, tipos de producto y estados de pedido en código TypeScript con type-safety.

### Task 1.1: Crear constantes de países

**Files:**
- Create: `lib/constants/countries.ts`

- [ ] **Step 1: Crear el archivo con las constantes**

```ts
// lib/constants/countries.ts

export const COUNTRY_CODES = ['AR', 'MX', 'ES', 'JP'] as const;
export type CountryCode = (typeof COUNTRY_CODES)[number];

export const COUNTRIES: Record<CountryCode, { name: string; flag: string }> = {
  AR: { name: 'Argentina', flag: '🇦🇷' },
  MX: { name: 'México',    flag: '🇲🇽' },
  ES: { name: 'España',    flag: '🇪🇸' },
  JP: { name: 'Japón',     flag: '🇯🇵' },
};

export function getCountryName(code: CountryCode | null | undefined): string {
  if (!code) return '';
  return COUNTRIES[code]?.name ?? '';
}

export function getCountryFlag(code: CountryCode | null | undefined): string {
  if (!code) return '';
  return COUNTRIES[code]?.flag ?? '';
}

export function isCountryCode(value: string): value is CountryCode {
  return (COUNTRY_CODES as readonly string[]).includes(value);
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add lib/constants/countries.ts
git commit -m "feat(constants): add countries catalog (AR/MX/ES/JP)"
```

### Task 1.2: Crear constantes de editoriales

**Files:**
- Create: `lib/constants/editorials.ts`

- [ ] **Step 1: Crear el archivo**

```ts
// lib/constants/editorials.ts
import type { CountryCode } from './countries';

export const EDITORIALS_BY_COUNTRY: Record<CountryCode, readonly string[]> = {
  AR: ['Ivrea', 'Ovnipress', 'Panini Argentina', 'Utopía Editorial'],
  MX: ['Panini México', 'Kamite', 'Distrito Manga'],
  ES: ['Ivrea España', 'Planeta Cómic', 'Norma Editorial', 'Milky Way', 'ECC Ediciones'],
  JP: ['Shueisha', 'Kodansha', 'Shogakukan', 'Kadokawa', 'Square Enix'],
};

export const ALL_EDITORIALS: readonly string[] = Object.values(EDITORIALS_BY_COUNTRY).flat();

export function getEditorialsForCountry(code: CountryCode | null | undefined): readonly string[] {
  if (!code) return ALL_EDITORIALS;
  return EDITORIALS_BY_COUNTRY[code] ?? [];
}

export function getCountryForEditorial(editorial: string): CountryCode | null {
  for (const [code, list] of Object.entries(EDITORIALS_BY_COUNTRY) as [CountryCode, readonly string[]][]) {
    if (list.includes(editorial)) return code;
  }
  return null;
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add lib/constants/editorials.ts
git commit -m "feat(constants): add editorials per country"
```

### Task 1.3: Crear constantes de demografías y tipos

**Files:**
- Create: `lib/constants/demographics.ts`
- Create: `lib/constants/productTypes.ts`

- [ ] **Step 1: Crear demographics.ts**

```ts
// lib/constants/demographics.ts

export const DEMOGRAPHICS = ['shonen', 'seinen', 'shojo', 'josei', 'kodomo'] as const;
export type Demographic = (typeof DEMOGRAPHICS)[number];

export const DEMOGRAPHIC_LABELS: Record<Demographic, string> = {
  shonen: 'Shōnen',
  seinen: 'Seinen',
  shojo:  'Shōjo',
  josei:  'Josei',
  kodomo: 'Kodomo',
};
```

- [ ] **Step 2: Crear productTypes.ts**

```ts
// lib/constants/productTypes.ts

export const PRODUCT_TYPES = ['manga', 'figure', 'special_edition', 'merch'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  manga:           'Manga',
  figure:          'Figura',
  special_edition: 'Edición especial',
  merch:           'Merchandising',
};

export const LANGUAGES = ['es', 'jp'] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, string> = {
  es: 'Español',
  jp: 'Japonés',
};
```

- [ ] **Step 3: Verificar y commit**

```bash
npx tsc --noEmit
git add lib/constants/demographics.ts lib/constants/productTypes.ts
git commit -m "feat(constants): add demographics, product types and languages"
```

### Task 1.4: Crear constantes de estados de pedido

**Files:**
- Create: `lib/constants/orderStates.ts`

- [ ] **Step 1: Crear el archivo**

```ts
// lib/constants/orderStates.ts

export const ORDER_STATES = [
  'pending_deposit',
  'confirmed',
  'in_transit_to_pe',
  'available',
  'pending_balance',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderState = (typeof ORDER_STATES)[number];

type StateInfo = {
  label: string;
  description: string;
  color: 'amber' | 'blue' | 'indigo' | 'emerald' | 'orange' | 'cyan' | 'green' | 'red';
  order: number;
  isFinal: boolean;
};

export const ORDER_STATE_INFO: Record<OrderState, StateInfo> = {
  pending_deposit:  { label: 'Pago pendiente',   description: 'Esperando comprobante de pago',           color: 'amber',   order: 1, isFinal: false },
  confirmed:        { label: 'Confirmado',       description: 'Pago verificado, pedido reservado',       color: 'blue',    order: 2, isFinal: false },
  in_transit_to_pe: { label: 'En camino a Perú', description: 'Preventa en proceso de importación',      color: 'indigo',  order: 3, isFinal: false },
  available:        { label: 'Disponible',       description: 'Pedido listo en nuestro almacén',         color: 'emerald', order: 4, isFinal: false },
  pending_balance:  { label: 'Saldo pendiente',  description: 'Esperando pago del 50% restante',         color: 'orange',  order: 5, isFinal: false },
  shipped:          { label: 'Enviado',          description: 'Pedido en camino al cliente',             color: 'cyan',    order: 6, isFinal: false },
  delivered:        { label: 'Entregado',        description: 'Pedido entregado al cliente',             color: 'green',   order: 7, isFinal: true  },
  cancelled:        { label: 'Cancelado',        description: 'Pedido cancelado',                        color: 'red',     order: 99, isFinal: true },
};

export function isFinalState(state: OrderState): boolean {
  return ORDER_STATE_INFO[state].isFinal;
}
```

- [ ] **Step 2: Verificar y commit**

```bash
npx tsc --noEmit
git add lib/constants/orderStates.ts
git commit -m "feat(constants): add order states catalog with metadata"
```

---

## Fase 2: Migración de schema en Supabase

Objetivo: extender `products`, `orders` y `profiles` con nuevos campos sin romper datos existentes.

### Task 2.1: Migración de productos

**Files:**
- Create: `supabase/migrations/005_product_business_model.sql`

- [ ] **Step 1: Escribir la migración**

```sql
-- supabase/migrations/005_product_business_model.sql

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

-- Backfill: country_code desde country_group
update public.products set country_code = 'AR' where country_group = 'Argentina' and country_code is null;
update public.products set country_code = 'MX' where country_group = 'México'    and country_code is null;

-- Backfill: type='manga' donde sea null
update public.products set type = 'manga' where type is null;

-- Relax stock_status: solo 3 valores ahora
alter table public.products drop constraint if exists products_stock_status_check;
alter table public.products
  add constraint products_stock_status_check
  check (stock_status in ('in_stock','preorder','out_of_stock'));

-- Mapear estados viejos
update public.products set stock_status = 'preorder' where stock_status = 'on_demand';

create index if not exists products_type_idx       on public.products (type);
create index if not exists products_country_idx    on public.products (country_code);
create index if not exists products_series_idx     on public.products (series);
create index if not exists products_demographic_idx on public.products (demographic);
```

- [ ] **Step 2: Ejecutar en Supabase**

Abrir SQL Editor de Supabase, pegar y ejecutar. Verificar que `select count(*) from products where country_code is null;` devuelva 0.

- [ ] **Step 3: Regenerar tipos**

Editar `types/database.types.ts` añadiendo las nuevas columnas a `products.Row`, `products.Insert`, `products.Update`. Mantener `country_group` como deprecated por ahora.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/005_product_business_model.sql types/database.types.ts
git commit -m "feat(db): add product business model fields (type, country_code, series, demographic)"
```

### Task 2.2: Migración de orders y profiles

**Files:**
- Create: `supabase/migrations/006_orders_split_payment.sql`

- [ ] **Step 1: Escribir la migración**

```sql
-- supabase/migrations/006_orders_split_payment.sql

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

-- Nuevos estados
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in (
    'pending_deposit','confirmed','in_transit_to_pe','available',
    'pending_balance','shipped','delivered','cancelled',
    'pending','paid'  -- legacy compat
  ));

-- Migrar estados legacy
update public.orders set status = 'pending_deposit' where status = 'pending';
update public.orders set status = 'confirmed'       where status = 'paid';

-- Snapshot por ítem
alter table public.order_items
  add column if not exists item_type        text default 'stock'
    check (item_type in ('stock','preorder')),
  add column if not exists estimated_arrival text;

-- Profiles: descuento primera compra
alter table public.profiles
  add column if not exists has_used_first_purchase_discount boolean default false;
```

- [ ] **Step 2: Ejecutar en Supabase y verificar**

Tras ejecutar, validar:
```sql
select status, count(*) from public.orders group by status;
```
Ningún resultado con valor antiguo (`pending`, `paid`) si la migración funcionó.

- [ ] **Step 3: Actualizar types**

Editar `types/database.types.ts` con los nuevos campos.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/006_orders_split_payment.sql types/database.types.ts
git commit -m "feat(db): add split payment fields to orders and first-purchase flag to profiles"
```

### Task 2.3: Bucket de Supabase Storage para comprobantes

**Files:**
- Create: `supabase/migrations/007_payment_proof_storage.sql`

- [ ] **Step 1: Crear bucket y políticas**

```sql
-- supabase/migrations/007_payment_proof_storage.sql

-- Crear bucket privado para comprobantes
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Solo el dueño del pedido puede subir/leer
create policy "Users upload own payment proof"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users read own payment proof"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins read all payment proofs"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
```

> Convención de path: `payment-proofs/{user_id}/{order_id}.{ext}`

- [ ] **Step 2: Ejecutar en Supabase, verificar bucket creado**

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/007_payment_proof_storage.sql
git commit -m "feat(db): add payment-proofs storage bucket with RLS"
```

---

## Fase 3: Tipos y mappers actualizados

### Task 3.1: Extender `Product` interface

**Files:**
- Modify: `lib/products.ts`

- [ ] **Step 1: Actualizar la interface**

Reemplazar la interface `Product` en `lib/products.ts` por:

```ts
import type { ProductType, Language } from './constants/productTypes';
import type { CountryCode } from './constants/countries';
import type { Demographic } from './constants/demographics';

export type StockStatus = 'in_stock' | 'preorder' | 'out_of_stock';

export interface Product {
  id: string;
  sku: string;
  slug: string;
  title: string;
  type: ProductType;
  editorial: string;
  countryCode: CountryCode;
  series?: string;
  volumeNumber?: number;
  demographic?: Demographic;
  language: Language;
  author?: string;
  pricePEN: number;
  stockStatus: StockStatus;
  etaText?: string;
  preorderDeposit?: number;
  description?: string;
  fullDescription?: string;
  specifications?: Record<string, string>;
  images: string[];
  category: string;
  tags: string[];
  figureScale?: string;
  manufacturer?: string;
}

// Helper (compat)
export function generateSlug(title: string): string {
  return title.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
```

- [ ] **Step 2: Eliminar (o vaciar) el array estático de productos si ya no se usa, o adaptarlo a la nueva forma**

Si `lib/products.ts` contiene un array `PRODUCTS` hardcoded, mapearlo manualmente al nuevo shape (asignar `type: 'manga'`, `countryCode` derivado de `countryGroup`, `language: 'es'`).

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: errores **esperados** en archivos consumidores (mappers, admin, cards). Anótalos.

- [ ] **Step 4: Commit**

```bash
git add lib/products.ts
git commit -m "refactor(products): extend Product interface with new business fields"
```

### Task 3.2: Actualizar mappers

**Files:**
- Modify: `lib/productMappers.ts`
- Modify: `lib/productsServer.ts`

- [ ] **Step 1: Mapear nuevas columnas DB → frontend**

En `lib/productMappers.ts`, asegurar que la función `mapRowToProduct` (o equivalente) lea: `type`, `country_code`, `series`, `volume_number`, `demographic`, `language`, `eta_text`, `figure_scale`, `manufacturer`. Si alguno es null, dar default (`type='manga'`, `language='es'`).

```ts
// Ejemplo del bloque relevante en lib/productMappers.ts
export function mapRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    title: row.title,
    type: (row.type ?? 'manga') as ProductType,
    editorial: row.editorial,
    countryCode: (row.country_code ?? 'AR') as CountryCode,
    series: row.series ?? undefined,
    volumeNumber: row.volume_number ?? undefined,
    demographic: (row.demographic ?? undefined) as Demographic | undefined,
    language: (row.language ?? 'es') as Language,
    author: row.author ?? undefined,
    pricePEN: Number(row.price_pen),
    stockStatus: row.stock_status as StockStatus,
    etaText: row.eta_text ?? row.estimated_arrival ?? undefined,
    preorderDeposit: row.preorder_deposit ? Number(row.preorder_deposit) : undefined,
    description: row.description ?? undefined,
    fullDescription: row.full_description ?? undefined,
    specifications: (row.specifications as Record<string, string>) ?? undefined,
    images: row.images ?? [],
    category: row.category,
    tags: row.tags ?? [],
    figureScale: row.figure_scale ?? undefined,
    manufacturer: row.manufacturer ?? undefined,
  };
}
```

- [ ] **Step 2: Actualizar selects en `lib/productsServer.ts`**

Asegurar que cada `from('products').select(...)` incluye los nuevos campos. Si usa `*`, no hace falta.

- [ ] **Step 3: Verificar**

```bash
npx tsc --noEmit
npm run build
```
Expected: build OK.

- [ ] **Step 4: Commit**

```bash
git add lib/productMappers.ts lib/productsServer.ts
git commit -m "refactor(mappers): map new product fields from DB"
```

### Task 3.3: Actualizar excelParser

**Files:**
- Modify: `lib/excelParser.ts`

- [ ] **Step 1: Añadir columnas opcionales del Excel**

Aceptar columnas adicionales del archivo Excel: `tipo`, `pais` (código o nombre), `serie`, `tomo`, `demografia`, `idioma`, `eta`, `escala_figura`, `fabricante`. Si no están, usar defaults (`tipo='manga'`, `idioma='es'`, `pais` inferido del valor antiguo de país si existía).

- [ ] **Step 2: Validar contra constantes**

Importar `EDITORIALS_BY_COUNTRY` y `DEMOGRAPHICS` y rechazar filas con valores no válidos, agregando la fila al array de errores que ya retorna el parser.

- [ ] **Step 3: Verificar y commit**

```bash
npx tsc --noEmit
git add lib/excelParser.ts
git commit -m "feat(excel): support new product columns (type, country, series, demographic)"
```

---

## Fase 4: Admin — CRUD de productos actualizado

### Task 4.1: Form de producto con campos nuevos

**Files:**
- Modify: form de admin de productos (buscar con `grep -r "country_group" app/admin` para localizarlo)

- [ ] **Step 1: Localizar el form**

Run:
```bash
grep -rn "editorial" app/admin --include="*.tsx" | head -20
```
Identificar el archivo del form de producto (probablemente `app/admin/products/[id]/page.tsx` o `app/admin/products/new/page.tsx`).

- [ ] **Step 2: Añadir campos al form**

En el form, agregar (en este orden visual):

1. **Tipo de producto** — `<select>` con opciones de `PRODUCT_TYPE_LABELS`
2. **País de origen** — `<select>` con `COUNTRIES` (mostrando flag + nombre)
3. **Editorial** — `<select>` dependiente del país (se rellena con `getEditorialsForCountry(countryCode)`)
4. **Serie** — `<input type="text">` con autocompletado simple (sugerencias de series ya existentes en DB)
5. **Tomo** — `<input type="number">` solo si `type === 'manga'`
6. **Demografía** — `<select>` con `DEMOGRAPHIC_LABELS` solo si `type === 'manga'`
7. **Idioma** — `<select>` con `LANGUAGE_LABELS` solo si `type === 'manga' || type === 'special_edition'`
8. **ETA** — `<input type="text">` (ej: "Fin de mayo 2026")
9. **Escala** — `<input type="text">` solo si `type === 'figure'`
10. **Fabricante** — `<input type="text">` solo si `type === 'figure'`

- [ ] **Step 3: Validación al guardar**

Antes de enviar al endpoint, validar:
- `editorial` debe estar dentro de `getEditorialsForCountry(countryCode)`.
- `demographic` solo permitido si `type === 'manga'`.
- Mostrar errores in-line.

- [ ] **Step 4: Verificar manualmente**

`npm run dev`, ir a `/admin`, autenticar con PIN, crear un producto tipo "figure" y un manga. Verificar que se guardan.

- [ ] **Step 5: Commit**

```bash
git add app/admin
git commit -m "feat(admin): product form with type, country, editorial, series, demographic"
```

### Task 4.2: API de productos acepta nuevos campos

**Files:**
- Modify: `app/api/admin/products/route.ts`
- Modify: `app/api/admin/products/[id]/route.ts`

- [ ] **Step 1: Pasar nuevos campos al insert/update**

En el POST y PATCH, incluir `type`, `country_code`, `series`, `volume_number`, `demographic`, `language`, `eta_text`, `figure_scale`, `manufacturer` del body al insert/update de Supabase.

- [ ] **Step 2: Verificar manualmente**

Crear producto desde admin, verificar en SQL Editor que los nuevos campos se guardaron correctamente.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/products
git commit -m "feat(api): accept new product fields in admin endpoints"
```

---

## Fase 5: Filtros públicos jerárquicos

### Task 5.1: Componente HierarchicalCountryFilter

**Files:**
- Create: `components/filters/HierarchicalCountryFilter.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
'use client';

import { COUNTRIES, COUNTRY_CODES, type CountryCode } from '@/lib/constants/countries';
import { getEditorialsForCountry } from '@/lib/constants/editorials';

type Props = {
  selectedCountry: CountryCode | null;
  selectedEditorial: string | null;
  onChange: (next: { country: CountryCode | null; editorial: string | null }) => void;
};

export function HierarchicalCountryFilter({ selectedCountry, selectedEditorial, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-foreground/70 mb-2">País</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ country: null, editorial: null })}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              selectedCountry === null ? 'bg-foreground text-background border-foreground' : 'border-foreground/20 hover:border-foreground/40'
            }`}
          >
            Todos
          </button>
          {COUNTRY_CODES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => onChange({ country: code, editorial: null })}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                selectedCountry === code ? 'bg-foreground text-background border-foreground' : 'border-foreground/20 hover:border-foreground/40'
              }`}
            >
              {COUNTRIES[code].flag} {COUNTRIES[code].name}
            </button>
          ))}
        </div>
      </div>

      {selectedCountry && (
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-foreground/70 mb-2">Editorial</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChange({ country: selectedCountry, editorial: null })}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                selectedEditorial === null ? 'bg-foreground text-background border-foreground' : 'border-foreground/20 hover:border-foreground/40'
              }`}
            >
              Todas
            </button>
            {getEditorialsForCountry(selectedCountry).map((ed) => (
              <button
                key={ed}
                type="button"
                onClick={() => onChange({ country: selectedCountry, editorial: ed })}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  selectedEditorial === ed ? 'bg-foreground text-background border-foreground' : 'border-foreground/20 hover:border-foreground/40'
                }`}
              >
                {ed}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/filters/HierarchicalCountryFilter.tsx
git commit -m "feat(filters): add hierarchical country → editorial filter"
```

### Task 5.2: Integrar en `Filters.tsx`

**Files:**
- Modify: `components/Filters.tsx`
- Modify: `app/products/ProductsClient.tsx`

- [ ] **Step 1: Reemplazar el filtro plano de editorial por el jerárquico**

En `Filters.tsx`, importar `HierarchicalCountryFilter` y reemplazar el bloque actual de editorial/país. Añadir también:
- Filtro de **tipo de producto** (chips: Todos / Manga / Figura / Edición especial / Merch).
- Filtro de **demografía** visible solo cuando `type === 'manga'` o `type === null`.

- [ ] **Step 2: Pasar params nuevos al state y a la URL**

En `ProductsClient.tsx`, añadir `type`, `countryCode`, `editorial`, `demographic`, `series` al sync con URL params. Aplicar filtros en el `useMemo` que filtra productos.

```ts
const filteredProducts = useMemo(() => {
  return products.filter((p) => {
    if (type && p.type !== type) return false;
    if (countryCode && p.countryCode !== countryCode) return false;
    if (editorial && p.editorial !== editorial) return false;
    if (demographic && p.demographic !== demographic) return false;
    if (series && p.series !== series) return false;
    // ... resto de filtros existentes
    return true;
  });
}, [products, type, countryCode, editorial, demographic, series /* ... */]);
```

- [ ] **Step 3: Verificar manualmente**

`npm run dev`, ir a `/products`, filtrar por país → ver que las editoriales se restringen. Filtrar por tipo → ver que demografía aparece/desaparece.

- [ ] **Step 4: Commit**

```bash
git add components/Filters.tsx app/products/ProductsClient.tsx
git commit -m "feat(filters): hierarchical filters with type/country/editorial/demographic"
```

---

## Fase 6: Producto agotado → reserva

### Task 6.1: Componente ReserveButton

**Files:**
- Create: `components/product/ReserveButton.tsx`
- Modify: `app/products/[slug]/ProductDetailClient.tsx`
- Modify: `components/ProductCard.tsx`

- [ ] **Step 1: Crear ReserveButton**

```tsx
'use client';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/lib/products';

type Props = { product: Product };

export function ReserveButton({ product }: Props) {
  const { addToCart } = useCart();
  const handleReserve = () => {
    addToCart({ product, itemType: 'preorder', quantity: 1 });
  };
  return (
    <button
      type="button"
      onClick={handleReserve}
      className="w-full rounded-xl bg-gradient-to-r from-magenta-600 to-orange-500 px-6 py-3 font-semibold text-white shadow hover:opacity-95 transition"
    >
      Reservar (preventa con 50%)
    </button>
  );
}
```

- [ ] **Step 2: Mostrar reserveButton cuando `stockStatus === 'out_of_stock'`**

En `ProductDetailClient.tsx` y `ProductCard.tsx`: cambiar la lógica de botones. Si `stockStatus === 'out_of_stock'`, renderizar `<ReserveButton />` en lugar del estado "Agotado" pasivo.

| stockStatus | Botón |
|---|---|
| `in_stock` | "Agregar al carrito" (item_type='stock') |
| `preorder` | "Pre-ordenar (50% adelanto)" (item_type='preorder') |
| `out_of_stock` | "Reservar" (item_type='preorder', vía ReserveButton) |

- [ ] **Step 3: Verificar manualmente**

Crear un producto con `stock_status='out_of_stock'` en admin, ir al detalle público → ver botón Reservar. Click → ítem se añade al carrito como preorder.

- [ ] **Step 4: Commit**

```bash
git add components/product/ReserveButton.tsx app/products/[slug] components/ProductCard.tsx
git commit -m "feat(product): reserve flow for out-of-stock items"
```

### Task 6.2: CartContext acepta `itemType`

**Files:**
- Modify: `context/CartContext.tsx`

- [ ] **Step 1: Extender el shape de cart item**

```ts
// context/CartContext.tsx — fragmento clave
export type CartItem = {
  product: Product;
  quantity: number;
  itemType: 'stock' | 'preorder';
};

type AddArgs = { product: Product; quantity?: number; itemType?: 'stock' | 'preorder' };

// En la función addToCart:
function addToCart({ product, quantity = 1, itemType }: AddArgs) {
  const resolvedType: 'stock' | 'preorder' =
    itemType ?? (product.stockStatus === 'in_stock' ? 'stock' : 'preorder');
  // ... resto del código, persistir en localStorage incluyendo itemType
}
```

- [ ] **Step 2: Migrar entradas existentes de localStorage**

Al hidratar desde localStorage, si una entrada no tiene `itemType`, derivarlo de `product.stockStatus` (default `'stock'` para `in_stock`, `'preorder'` para el resto).

- [ ] **Step 3: Verificar y commit**

```bash
npx tsc --noEmit
git add context/CartContext.tsx
git commit -m "feat(cart): track itemType (stock/preorder) per line"
```

---

## Fase 7: Carrito split + descuento + envío

### Task 7.1: Lógica de cálculo

**Files:**
- Create: `lib/domain/cart/calculate.ts`

- [ ] **Step 1: Crear el helper de cálculo**

```ts
// lib/domain/cart/calculate.ts
import type { CartItem } from '@/context/CartContext';

export const FREE_SHIPPING_THRESHOLD_PEN = 100;
export const STANDARD_SHIPPING_PEN = 15;
export const FIRST_PURCHASE_DISCOUNT_RATE = 0.10;
export const PREORDER_DEPOSIT_RATE = 0.50;

export type CartTotals = {
  stockSubtotal: number;
  preorderSubtotal: number;
  subtotal: number;
  discount: number;
  shipping: number;
  preorderDeposit: number;
  balanceDue: number;          // queda pendiente cuando llegue la preventa
  totalToPayNow: number;       // stock + deposit + envío − descuento
  appliedFirstPurchaseDiscount: boolean;
};

type Args = {
  items: CartItem[];
  isFirstPurchase: boolean;
};

export function calculateCartTotals({ items, isFirstPurchase }: Args): CartTotals {
  const stockItems    = items.filter((i) => i.itemType === 'stock');
  const preorderItems = items.filter((i) => i.itemType === 'preorder');

  const sumItems = (list: CartItem[]) =>
    list.reduce((sum, i) => sum + i.product.pricePEN * i.quantity, 0);

  const stockSubtotal    = sumItems(stockItems);
  const preorderSubtotal = sumItems(preorderItems);
  const subtotal         = stockSubtotal + preorderSubtotal;

  const discount = isFirstPurchase ? round2(subtotal * FIRST_PURCHASE_DISCOUNT_RATE) : 0;
  const subtotalAfterDiscount = subtotal - discount;

  const shipping = subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD_PEN ? 0 : STANDARD_SHIPPING_PEN;

  const preorderDeposit = round2(preorderSubtotal * PREORDER_DEPOSIT_RATE);
  const balanceDue      = round2(preorderSubtotal - preorderDeposit);

  // Descuento se reparte proporcional entre stock y preorder
  const stockShare    = subtotal === 0 ? 0 : stockSubtotal    / subtotal;
  const preorderShare = subtotal === 0 ? 0 : preorderSubtotal / subtotal;
  const discountOnStock    = round2(discount * stockShare);
  const discountOnPreorder = round2(discount * preorderShare);

  const totalToPayNow = round2(
    stockSubtotal - discountOnStock + preorderDeposit - (discountOnPreorder * PREORDER_DEPOSIT_RATE) + shipping
  );

  return {
    stockSubtotal,
    preorderSubtotal,
    subtotal,
    discount,
    shipping,
    preorderDeposit,
    balanceDue,
    totalToPayNow,
    appliedFirstPurchaseDiscount: isFirstPurchase && subtotal > 0,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
```

> **Nota:** El descuento se aplica sobre el subtotal completo (stock + preventa) como pediste. La parte que paga ahora considera el descuento proporcional sobre stock y sobre el 50% del depósito de preventa.

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add lib/domain/cart/calculate.ts
git commit -m "feat(cart): split totals with discount and free-shipping rules"
```

### Task 7.2: Componente CartSplit y DepositSummary

**Files:**
- Create: `components/cart/CartSplit.tsx`
- Create: `components/cart/DepositSummary.tsx`

- [ ] **Step 1: Crear CartSplit (renderiza dos listas)**

```tsx
'use client';
import type { CartItem } from '@/context/CartContext';
import Image from 'next/image';

type Props = { items: CartItem[]; onRemove: (productId: string) => void; onQtyChange: (productId: string, qty: number) => void };

export function CartSplit({ items, onRemove, onQtyChange }: Props) {
  const stock    = items.filter((i) => i.itemType === 'stock');
  const preorder = items.filter((i) => i.itemType === 'preorder');

  return (
    <div className="space-y-8">
      {stock.length > 0 && (
        <Section title="En stock — pago completo" badge="📦" tone="emerald" items={stock} onRemove={onRemove} onQtyChange={onQtyChange} />
      )}
      {preorder.length > 0 && (
        <Section
          title="Preventa — 50% ahora, 50% al llegar"
          badge="🕐"
          tone="amber"
          items={preorder}
          onRemove={onRemove}
          onQtyChange={onQtyChange}
          footnote="El saldo se cobra cuando el producto llegue a Perú."
        />
      )}
    </div>
  );
}

function Section({ title, badge, tone, items, onRemove, onQtyChange, footnote }: any) {
  return (
    <section className={`rounded-2xl border border-${tone}-200/40 bg-${tone}-50/30 p-5`}>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <span>{badge}</span> {title}
      </h3>
      <ul className="space-y-3">
        {items.map((it: CartItem) => (
          <li key={it.product.id} className="flex items-center gap-3">
            <Image src={it.product.images[0] ?? '/placeholder.png'} alt="" width={56} height={80} className="rounded object-cover" />
            <div className="flex-1">
              <p className="font-medium">{it.product.title}</p>
              {it.product.etaText && <p className="text-xs text-foreground/60">Llega: {it.product.etaText}</p>}
            </div>
            <input
              type="number"
              min={1}
              value={it.quantity}
              onChange={(e) => onQtyChange(it.product.id, Math.max(1, Number(e.target.value)))}
              className="w-16 rounded border px-2 py-1 text-sm"
            />
            <p className="w-24 text-right font-semibold">S/ {(it.product.pricePEN * it.quantity).toFixed(2)}</p>
            <button onClick={() => onRemove(it.product.id)} className="text-foreground/50 hover:text-red-600">✕</button>
          </li>
        ))}
      </ul>
      {footnote && <p className="mt-3 text-xs text-foreground/60">{footnote}</p>}
    </section>
  );
}
```

- [ ] **Step 2: Crear DepositSummary (panel de totales)**

```tsx
'use client';
import type { CartTotals } from '@/lib/domain/cart/calculate';

export function DepositSummary({ totals }: { totals: CartTotals }) {
  return (
    <div className="space-y-3 rounded-2xl border border-foreground/10 bg-background p-5">
      <Row label="Subtotal en stock"    value={totals.stockSubtotal} />
      <Row label="Subtotal preventa"    value={totals.preorderSubtotal} />
      {totals.appliedFirstPurchaseDiscount && (
        <Row label="🎉 Descuento 10% bienvenida" value={-totals.discount} className="text-emerald-600 font-semibold" />
      )}
      <Row label={totals.shipping === 0 ? 'Envío 🎁 GRATIS' : 'Envío'} value={totals.shipping} />
      <hr className="border-foreground/10" />
      <Row label="Adelanto preventa (50%)" value={totals.preorderDeposit} muted />
      <Row label="A pagar al llegar"       value={totals.balanceDue}      muted />
      <hr className="border-foreground/10" />
      <Row label="Total a pagar ahora"     value={totals.totalToPayNow}   bold xl />
    </div>
  );
}

function Row({ label, value, muted = false, bold = false, xl = false, className = '' }: any) {
  return (
    <div className={`flex items-center justify-between ${muted ? 'text-foreground/60 text-sm' : ''} ${bold ? 'font-bold' : ''} ${xl ? 'text-lg' : ''} ${className}`}>
      <span>{label}</span>
      <span>S/ {Number(value).toFixed(2)}</span>
    </div>
  );
}
```

- [ ] **Step 3: Verificar y commit**

```bash
npx tsc --noEmit
git add components/cart/CartSplit.tsx components/cart/DepositSummary.tsx
git commit -m "feat(cart): split UI and deposit summary components"
```

### Task 7.3: Integrar en `app/cart/page.tsx`

**Files:**
- Modify: `app/cart/page.tsx`

- [ ] **Step 1: Reemplazar la lista actual por CartSplit + DepositSummary**

Importar `useAuth` y leer `profile.has_used_first_purchase_discount`. Si el usuario no está logueado → `isFirstPurchase = false` (el descuento solo aplica tras registro/login). Pasar `isFirstPurchase` a `calculateCartTotals`.

- [ ] **Step 2: Mensaje de WhatsApp incluye desglose**

Construir el mensaje de WhatsApp con:
```
Hola NekoManga, quiero confirmar mi pedido:

📦 EN STOCK
- [título] x[qty] — S/ XX.XX
...

🕐 PREVENTA (50% adelanto)
- [título] x[qty] — S/ XX.XX (depósito S/ XX.XX)
...

🎉 Descuento bienvenida: -S/ XX.XX
🚚 Envío: GRATIS / S/ 15.00

💰 Total a pagar ahora: S/ XX.XX
💳 Saldo al llegar preventa: S/ XX.XX
```

- [ ] **Step 3: Verificar manualmente**

Probar con: solo stock, solo preventa, mixto, primer login con descuento, sobre S/100 con envío gratis.

- [ ] **Step 4: Commit**

```bash
git add app/cart/page.tsx
git commit -m "feat(cart): split checkout with deposit, discount and free-shipping rules"
```

---

## Fase 8: Banner descuento primera compra

### Task 8.1: Componente FirstPurchaseDiscountBanner

**Files:**
- Create: `components/cart/FirstPurchaseDiscountBanner.tsx`
- Modify: `app/cart/page.tsx`

- [ ] **Step 1: Crear el banner**

```tsx
'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

type Props = { profile: { has_used_first_purchase_discount: boolean } | null };

export function FirstPurchaseDiscountBanner({ profile }: Props) {
  const { user } = useAuth();
  const isLogged = !!user;
  const eligible = isLogged && profile && !profile.has_used_first_purchase_discount;

  if (eligible) {
    return (
      <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 p-4 shadow-sm dark:border-emerald-700 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-950">
        <p className="text-center font-semibold text-emerald-800 dark:text-emerald-200">
          ✨ ¡Descuento de bienvenida aplicado! <span className="ml-1 font-bold">10% OFF en tu primera compra</span> ✨
        </p>
      </div>
    );
  }

  if (!isLogged) {
    return (
      <div className="rounded-2xl border-2 border-orange-300 bg-gradient-to-r from-orange-50 via-amber-100 to-orange-50 p-4 shadow-sm dark:border-orange-700 dark:from-orange-950 dark:via-amber-900 dark:to-orange-950">
        <p className="text-center text-orange-900 dark:text-orange-200">
          🎉 <Link href="/auth/register" className="font-bold underline underline-offset-4 hover:no-underline">Regístrate</Link> y obtén <span className="font-bold">10% OFF</span> en tu primera compra
        </p>
      </div>
    );
  }

  return null;
}
```

- [ ] **Step 2: Insertar arriba del carrito**

En `app/cart/page.tsx`, colocar `<FirstPurchaseDiscountBanner profile={profile} />` justo encima de `<CartSplit />`. Cargar `profile` desde Supabase usando el cliente del browser cuando haya usuario logueado.

- [ ] **Step 3: Verificar manualmente**

Cerrar sesión → ver banner naranja "Regístrate y obtén 10%". Login con usuario nuevo → ver banner verde con animación de aplicación.

- [ ] **Step 4: Commit**

```bash
git add components/cart/FirstPurchaseDiscountBanner.tsx app/cart/page.tsx
git commit -m "feat(cart): first-purchase discount banner (logged/guest variants)"
```

---

## Fase 9: Mis pedidos — timeline y comprobante

### Task 9.1: Componente OrderStatusBadge y OrderTimeline

**Files:**
- Create: `components/order/OrderStatusBadge.tsx`
- Create: `components/order/OrderTimeline.tsx`

- [ ] **Step 1: Crear OrderStatusBadge**

```tsx
import { ORDER_STATE_INFO, type OrderState } from '@/lib/constants/orderStates';

const toneClasses: Record<string, string> = {
  amber:   'bg-amber-100 text-amber-800 border-amber-300',
  blue:    'bg-blue-100 text-blue-800 border-blue-300',
  indigo:  'bg-indigo-100 text-indigo-800 border-indigo-300',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  orange:  'bg-orange-100 text-orange-800 border-orange-300',
  cyan:    'bg-cyan-100 text-cyan-800 border-cyan-300',
  green:   'bg-green-100 text-green-800 border-green-300',
  red:     'bg-red-100 text-red-800 border-red-300',
};

export function OrderStatusBadge({ state }: { state: OrderState }) {
  const info = ORDER_STATE_INFO[state];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClasses[info.color]}`}>
      {info.label}
    </span>
  );
}
```

- [ ] **Step 2: Crear OrderTimeline (vertical, marca el step activo)**

```tsx
import { ORDER_STATES, ORDER_STATE_INFO, type OrderState } from '@/lib/constants/orderStates';

const FLOW: OrderState[] = ['pending_deposit','confirmed','in_transit_to_pe','available','pending_balance','shipped','delivered'];

export function OrderTimeline({ current }: { current: OrderState }) {
  if (current === 'cancelled') {
    return <p className="text-red-600 font-medium">❌ Pedido cancelado</p>;
  }
  const currentOrder = ORDER_STATE_INFO[current].order;
  return (
    <ol className="space-y-3">
      {FLOW.map((state) => {
        const info = ORDER_STATE_INFO[state];
        const isDone   = info.order < currentOrder;
        const isActive = info.order === currentOrder;
        const isFuture = info.order > currentOrder;
        return (
          <li key={state} className="flex items-start gap-3">
            <span className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              isDone ? 'bg-emerald-600 text-white' :
              isActive ? 'bg-blue-600 text-white animate-pulse' :
              'bg-foreground/10 text-foreground/40'
            }`}>
              {isDone ? '✓' : info.order}
            </span>
            <div className={isFuture ? 'opacity-50' : ''}>
              <p className="font-medium">{info.label}</p>
              <p className="text-xs text-foreground/60">{info.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/order/OrderStatusBadge.tsx components/order/OrderTimeline.tsx
git commit -m "feat(order): status badge and timeline components"
```

### Task 9.2: Subida de comprobante a Supabase Storage

**Files:**
- Create: `lib/storage/paymentProof.ts`
- Create: `components/order/PaymentProofUploader.tsx`

- [ ] **Step 1: Helper de subida**

```ts
// lib/storage/paymentProof.ts
import { createBrowserClient } from '@/core/supabase/client';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

export type UploadResult =
  | { ok: true; path: string; publicUrl: string }
  | { ok: false; error: string };

export async function uploadPaymentProof(args: {
  userId: string;
  orderId: string;
  file: File;
}): Promise<UploadResult> {
  if (args.file.size > MAX_BYTES) return { ok: false, error: 'El archivo supera 5 MB' };
  if (!ALLOWED_MIME.includes(args.file.type)) return { ok: false, error: 'Solo se permiten imágenes JPG/PNG/WebP' };

  const ext = args.file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${args.userId}/${args.orderId}.${ext}`;
  const supabase = createBrowserClient();

  const { error } = await supabase.storage
    .from('payment-proofs')
    .upload(path, args.file, { upsert: true, contentType: args.file.type });

  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from('payment-proofs').getPublicUrl(path);
  return { ok: true, path, publicUrl: data.publicUrl };
}
```

- [ ] **Step 2: Componente uploader con doble confirmación**

```tsx
'use client';
import { useState } from 'react';
import { uploadPaymentProof } from '@/lib/storage/paymentProof';
import { createBrowserClient } from '@/core/supabase/client';

type Props = { userId: string; orderId: string; currentUrl?: string | null; onUploaded?: () => void };

export function PaymentProofUploader({ userId, orderId, currentUrl, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : currentUrl ?? null);
    setConfirmed(false);
    setError(null);
  }

  async function handleConfirm() {
    if (!file) return;
    setBusy(true);
    setError(null);
    const result = await uploadPaymentProof({ userId, orderId, file });
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    const supabase = createBrowserClient();
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_proof_url: result.publicUrl,
        payment_proof_confirmed_at: new Date().toISOString(),
        status: 'confirmed',
      })
      .eq('id', orderId);

    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }
    setConfirmed(true);
    setBusy(false);
    onUploaded?.();
  }

  return (
    <div className="space-y-3 rounded-2xl border border-foreground/10 bg-background p-5">
      <h4 className="font-semibold">Comprobante de pago (opcional)</h4>
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} className="block w-full text-sm" />
      {preview && <img src={preview} alt="Comprobante" className="max-h-64 rounded border" />}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {file && !confirmed && (
        <button
          onClick={handleConfirm}
          disabled={busy}
          className="w-full rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? 'Subiendo…' : '✓ Confirmar comprobante'}
        </button>
      )}
      {confirmed && <p className="text-sm text-emerald-700 font-medium">✅ Comprobante recibido. Pedido confirmado automáticamente.</p>}
    </div>
  );
}
```

- [ ] **Step 3: Verificar tipos y commit**

```bash
npx tsc --noEmit
git add lib/storage/paymentProof.ts components/order/PaymentProofUploader.tsx
git commit -m "feat(order): payment proof uploader with double confirmation"
```

### Task 9.3: Integrar en `app/profile/orders`

**Files:**
- Modify: `app/profile/orders/page.tsx` (y posibles `[id]/page.tsx` si existe)

- [ ] **Step 1: Cargar pedidos del usuario con campos nuevos**

```ts
const { data: orders } = await supabase
  .from('orders')
  .select(`
    id, status, payment_type, total_pen, subtotal_pen, discount_pen,
    deposit_pen, balance_pen, shipping_pen, estimated_arrival,
    payment_proof_url, payment_proof_confirmed_at, created_at,
    order_items ( id, title, quantity, unit_price, item_type, estimated_arrival )
  `)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

- [ ] **Step 2: Renderizar cada pedido con OrderTimeline + PaymentProofUploader + aviso "Sin devoluciones"**

```tsx
<article className="space-y-4 rounded-2xl border border-foreground/10 p-5">
  <header className="flex items-center justify-between">
    <h3 className="font-semibold">Pedido #{order.id.slice(0, 8)}</h3>
    <OrderStatusBadge state={order.status} />
  </header>

  <OrderTimeline current={order.status} />

  {order.status === 'pending_deposit' && (
    <PaymentProofUploader userId={user.id} orderId={order.id} currentUrl={order.payment_proof_url} />
  )}

  <p className="rounded bg-amber-50 px-3 py-2 text-xs text-amber-900">
    ⚠️ Política de cancelación: no se aceptan devoluciones una vez confirmado el pedido.
  </p>
</article>
```

- [ ] **Step 3: Verificar manualmente**

Crear un pedido, ver en `/profile/orders` el timeline. Subir un comprobante → estado pasa a `confirmed` y aparece checkmark.

- [ ] **Step 4: Commit**

```bash
git add app/profile/orders
git commit -m "feat(profile): orders timeline with payment proof uploader"
```

### Task 9.4: API de orders calcula deposit/discount

**Files:**
- Modify: `app/api/orders/route.ts`

- [ ] **Step 1: Aplicar `calculateCartTotals` en el server**

Recibir items con `itemType` en el body. Calcular totales con el helper. Validar que `has_used_first_purchase_discount` del profile coincida con lo enviado (no confiar en el cliente).

- [ ] **Step 2: Insertar orden con todos los campos**

```ts
const totals = calculateCartTotals({ items, isFirstPurchase });
const { data: order, error } = await supabase.from('orders').insert({
  user_id: user.id,
  status: 'pending_deposit',
  payment_type: totals.preorderSubtotal > 0 ? 'split_preorder' : 'full',
  subtotal_pen: totals.subtotal,
  discount_pen: totals.discount,
  shipping_pen: totals.shipping,
  deposit_pen: totals.preorderDeposit,
  balance_pen: totals.balanceDue,
  total_pen: totals.totalToPayNow,
  estimated_arrival: derivedEta,
  customer_name, customer_phone, shipping_address, payment_method, notes,
}).select('id').single();
```

- [ ] **Step 3: Insertar `order_items` con `item_type` y `estimated_arrival`**

- [ ] **Step 4: Marcar `has_used_first_purchase_discount = true` si aplicó**

```ts
if (totals.appliedFirstPurchaseDiscount) {
  await supabase.from('profiles')
    .update({ has_used_first_purchase_discount: true })
    .eq('id', user.id);
}
```

- [ ] **Step 5: Verificar manualmente y commit**

```bash
git add app/api/orders/route.ts
git commit -m "feat(api/orders): compute split totals server-side and flag first-purchase"
```

---

## Fase 10: Admin — gestión de pedidos

### Task 10.1: Vista de admin con comprobante y cambio de estado

**Files:**
- Modify: `app/admin/orders/...` (localizar con `grep -r "orders" app/admin`)

- [ ] **Step 1: Listar pedidos con comprobante visible**

Mostrar tabla: ID, cliente, fecha, total, estado (badge), botón "Ver comprobante" (abre la imagen), `<select>` para cambiar de estado.

- [ ] **Step 2: Endpoint PATCH para cambiar estado**

`app/api/admin/orders/[id]/route.ts` (crear si no existe) — valida que el usuario sea admin, recibe `{ status: OrderState }`, actualiza la orden, devuelve la actualización.

```ts
// Validar transición (opcional): impedir saltos hacia atrás excepto cancellation
import { ORDER_STATE_INFO, type OrderState } from '@/lib/constants/orderStates';

const allowed: OrderState[] = ['pending_deposit','confirmed','in_transit_to_pe','available','pending_balance','shipped','delivered','cancelled'];
if (!allowed.includes(body.status)) {
  return Response.json({ error: 'Estado inválido' }, { status: 400 });
}
```

- [ ] **Step 3: Verificar manualmente y commit**

`npm run dev`, autenticar admin, abrir pedido, ver comprobante, cambiar estado a "Enviado" → verificar en perfil del cliente que el timeline avanzó.

```bash
git add app/admin app/api/admin
git commit -m "feat(admin): orders view with proof and state transitions"
```

---

## Fase 11: Productos relacionados

### Task 11.1: Helper de relacionados

**Files:**
- Create: `lib/domain/products/related.ts`

- [ ] **Step 1: Función de scoring**

```ts
// lib/domain/products/related.ts
import type { Product } from '@/lib/products';

export function findRelatedProducts(target: Product, pool: Product[], limit = 8): Product[] {
  const scored = pool
    .filter((p) => p.id !== target.id)
    .map((p) => {
      let score = 0;
      if (target.series      && p.series === target.series)             score += 100;
      if (target.demographic && p.demographic === target.demographic)   score += 30;
      if (p.editorial === target.editorial)                             score += 10;
      if (p.countryCode === target.countryCode)                         score += 5;
      if (p.type === target.type)                                       score += 3;
      return { p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((r) => r.p);
}
```

- [ ] **Step 2: Crear RelatedProducts component**

```tsx
// components/product/RelatedProducts.tsx
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/lib/products';
import { findRelatedProducts } from '@/lib/domain/products/related';

type Props = { product: Product; allProducts: Product[] };

export function RelatedProducts({ product, allProducts }: Props) {
  const related = findRelatedProducts(product, allProducts);
  if (related.length === 0) return null;

  const sameSeries = related.filter((p) => p.series && p.series === product.series);
  const others = related.filter((p) => !sameSeries.includes(p));

  return (
    <section className="space-y-8">
      {sameSeries.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold">Otros productos de {product.series}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {sameSeries.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
      {others.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold">Te puede gustar</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {others.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Integrar en `app/products/[slug]/page.tsx`**

Pasar todos los productos al componente (Server Component fetches once).

- [ ] **Step 4: Commit**

```bash
git add lib/domain/products/related.ts components/product/RelatedProducts.tsx app/products/[slug]
git commit -m "feat(product): related products by series, demographic and editorial"
```

---

## Fase 12: Cleanup

### Task 12.1: Eliminar `country_group` legacy

**Files:**
- Create: `supabase/migrations/008_drop_legacy.sql`
- Modify: archivos que aún referencian `countryGroup` o `country_group` (buscar con grep)

- [ ] **Step 1: Localizar referencias restantes**

```bash
grep -rn "country_group\|countryGroup" lib app components context types --include="*.ts" --include="*.tsx"
```
Reemplazar cada uso por `country_code` (DB) o `countryCode` (TS).

- [ ] **Step 2: Migración de drop**

```sql
-- supabase/migrations/008_drop_legacy.sql
alter table public.products drop constraint if exists products_country_group_check;
alter table public.products drop column if exists country_group;

-- Limpieza de estados legacy en orders (después de migrar)
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in (
    'pending_deposit','confirmed','in_transit_to_pe','available',
    'pending_balance','shipped','delivered','cancelled'
  ));
```

- [ ] **Step 3: Ejecutar en Supabase y verificar build**

```bash
npm run build
```

- [ ] **Step 4: Commit final**

```bash
git add supabase/migrations/008_drop_legacy.sql lib app components context types
git commit -m "chore: drop legacy country_group column and stale order states"
```

### Task 12.2: ~~Renombrar `proxy.ts` → `middleware.ts`~~ — OMITIDA por decisión del usuario (no romper login en pruebas)

---

## Verificación final

- [ ] `npm run lint` → 0 errores
- [ ] `npm run build` → success
- [ ] **Flujos manuales**:
  - [ ] Crear producto de cada `type` desde admin → guarda OK
  - [ ] Filtrar productos por país → editoriales se restringen
  - [ ] Producto agotado → botón Reservar agrega al carrito como preorder
  - [ ] Carrito muestra sección stock + sección preventa con totales correctos
  - [ ] Usuario no logueado ve banner naranja en carrito
  - [ ] Usuario nuevo logueado ve banner verde + descuento aplicado
  - [ ] Sobre S/100 → envío 0
  - [ ] Confirmar pedido → genera mensaje WhatsApp con desglose
  - [ ] Subir comprobante → estado pasa a `confirmed` automáticamente
  - [ ] Timeline visible en `/profile/orders`
  - [ ] Admin puede ver comprobante y cambiar estado a "Enviado"
  - [ ] `has_used_first_purchase_discount` se setea tras primer pedido → segundo pedido no aplica descuento

---

## Notas para el ejecutor

- **No saltarse tasks**: cada Task produce un estado consistente; ejecutar en orden.
- **Migraciones SQL**: pedir confirmación al usuario antes de ejecutar cada una en Supabase. NUNCA ejecutar la fase 12 (drop) hasta confirmar que todo funciona.
- **Verificación visual**: muchas tasks requieren abrir el navegador. Si trabajas como subagente sin acceso a browser MCP, reportarlo y pedir validación humana.
- **Si un test framework se agrega más tarde**, los helpers de `lib/domain/cart/calculate.ts` y `lib/domain/products/related.ts` son los primeros candidatos a cubrir con tests unitarios — son funciones puras.

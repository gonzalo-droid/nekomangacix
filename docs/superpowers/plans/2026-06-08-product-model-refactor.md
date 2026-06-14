# Product Model Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplificar el modelo `Product` eliminando campos que pasan a `attributes` (jsonb libre), y actualizar la tabla de Supabase con una migración.

**Architecture:** Se reemplaza `specifications`, `volume_number`, `language`, `figure_scale`, `manufacturer`, `category` por un único campo `attributes jsonb`. Los tipos TypeScript en `lib/products.ts`, `lib/constants/productTypes.ts` y `app/admin/products/useAdminProducts.ts` se actualizan en consecuencia. La migración `010_product_model_refactor.sql` migra datos existentes antes de dropear columnas.

**Tech Stack:** TypeScript, Next.js 15 App Router, Supabase (PostgreSQL), Tailwind CSS 4

---

## Files

- Modify: `lib/products.ts`
- Modify: `lib/constants/productTypes.ts`
- Modify: `app/admin/products/useAdminProducts.ts`
- Create: `supabase/migrations/010_product_model_refactor.sql`

---

### Task 1: Actualizar tipos TypeScript — `lib/constants/productTypes.ts`

**Files:**
- Modify: `lib/constants/productTypes.ts`

- [ ] **Step 1: Agregar `protective_sleeve` a PRODUCT_TYPES**

Reemplazar el contenido completo de `lib/constants/productTypes.ts`:

```ts
export const PRODUCT_TYPES = ['manga', 'figure', 'special_edition', 'merch', 'protective_sleeve'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  manga: 'Manga',
  figure: 'Figura',
  special_edition: 'Edición especial',
  merch: 'Merchandising',
  protective_sleeve: 'Funda protectora',
};

export function isProductType(value: string): value is ProductType {
  return (PRODUCT_TYPES as readonly string[]).includes(value);
}
```

- [ ] **Step 2: Verificar que compila**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add lib/constants/productTypes.ts
git commit -m "feat: add protective_sleeve to ProductType"
```

---

### Task 2: Actualizar interface `Product` en `lib/products.ts`

**Files:**
- Modify: `lib/products.ts`

- [ ] **Step 1: Reemplazar el contenido completo de `lib/products.ts`**

```ts
import type { CountryCode } from './constants/countries';
import type { Demographic } from './constants/demographics';
import type { ProductType } from './constants/productTypes';

export type StockStatus = 'in_stock' | 'preorder' | 'out_of_stock';
export type SeriesStatus = 'single' | 'ongoing' | 'completed';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  title: string;
  type: ProductType;
  editorial: string;
  countryCode: CountryCode;
  author?: string;
  pricePEN: number;
  stock: number;
  stockStatus: StockStatus;
  estimatedArrival?: string;
  etaText?: string;
  preorderDeposit?: number;
  tags?: string[];
  description?: string;
  fullDescription?: string;
  series?: string;
  seriesStatus?: SeriesStatus;
  demographic?: Demographic;
  images: string[];
  attributes?: Record<string, string | number | boolean>;
}

export const products: Product[] = [];

export function getStockStatusLabel(status: StockStatus | string): { label: string; color: string } {
  const statusInfo: Record<string, { label: string; color: string }> = {
    in_stock:     { label: 'En Stock',  color: 'text-green-600' },
    preorder:     { label: 'Preventa',  color: 'text-blue-600' },
    out_of_stock: { label: 'Agotado',   color: 'text-red-600' },
  };
  return statusInfo[status] ?? { label: status, color: 'text-foreground/60' };
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(slug: string, limit = 4): Product[] {
  const product = getProductBySlug(slug);
  if (!product) return [];
  return products
    .filter((p) => p.slug !== slug && p.editorial === product.editorial)
    .slice(0, limit);
}
```

- [ ] **Step 2: Verificar que compila**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Esperado: errores en archivos que usaban `category`, `specifications`, `language`, `figureScale`, `manufacturer`, `volume`, `countryGroup`. Los resolveremos en los planes B, C y D.

- [ ] **Step 3: Commit**

```bash
git add lib/products.ts
git commit -m "feat: simplify Product interface, move specs/category/volume to attributes"
```

---

### Task 3: Actualizar `AdminProduct` en `useAdminProducts.ts`

**Files:**
- Modify: `app/admin/products/useAdminProducts.ts`

- [ ] **Step 1: Reemplazar la interface `AdminProduct`**

Buscar el bloque `export interface AdminProduct {` y reemplazarlo por:

```ts
export interface AdminProduct {
  id: string;
  sku: string;
  slug: string;
  title: string;
  editorial: string;
  author: string | null;
  price_pen: number;
  stock: number;
  stock_status: string;
  estimated_arrival: string | null;
  preorder_deposit: number | null;
  description: string | null;
  full_description: string | null;
  series: string | null;
  series_status: string | null;
  images: string[];
  type: string;
  country_code: string;
  demographic: string | null;
  eta_text: string | null;
  tags: string[];
  attributes: Record<string, string | number | boolean>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Verificar que compila**

```bash
npx tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/products/useAdminProducts.ts
git commit -m "feat: update AdminProduct interface to match new product model"
```

---

### Task 4: Migración de base de datos

**Files:**
- Create: `supabase/migrations/010_product_model_refactor.sql`

- [ ] **Step 1: Crear archivo de migración**

```bash
cd /Volumes/Neko/webs/nekomangacix && npx supabase migration new product_model_refactor
```

Esto crea `supabase/migrations/<timestamp>_product_model_refactor.sql`. Renombrarlo a `010_product_model_refactor.sql` o usar el nombre generado.

- [ ] **Step 2: Escribir la migración**

```sql
-- ============================================
-- NekoMangaCix - 010: Product model refactor
-- Moves specifications, volume_number, language, figure_scale,
-- manufacturer, category into a single attributes jsonb column.
-- Adds protective_sleeve to type constraint.
-- ============================================

-- 1. Agregar columna attributes
alter table public.products
  add column if not exists attributes jsonb default '{}';

-- 2. Agregar series_status
alter table public.products
  add column if not exists series_status text
    check (series_status in ('single', 'ongoing', 'completed'));

-- 3. Migrar datos existentes a attributes
update public.products set attributes = coalesce(attributes, '{}') ||
  jsonb_strip_nulls(jsonb_build_object(
    'category',     category,
    'volume',       volume_number,
    'language',     language,
    'scale',        figure_scale,
    'brand',        manufacturer,
    'pages',        (specifications->>'pages'),
    'format',       (specifications->>'format'),
    'isbn',         (specifications->>'isbn'),
    'releaseDate',  (specifications->>'releaseDate'),
    'dimensions',   (specifications->>'dimensions'),
    'weight',       (specifications->>'weight')
  ))
where true;

-- 4. Actualizar constraint de type para incluir protective_sleeve
alter table public.products drop constraint if exists products_type_check;
alter table public.products
  add constraint products_type_check
  check (type in ('manga', 'figure', 'special_edition', 'merch', 'protective_sleeve'));

-- 5. Dropear columnas migradas
alter table public.products
  drop column if exists specifications,
  drop column if exists volume_number,
  drop column if exists language,
  drop column if exists figure_scale,
  drop column if exists manufacturer,
  drop column if exists category;

-- 6. Índice para búsquedas en attributes
create index if not exists products_attributes_idx on public.products using gin (attributes);
```

- [ ] **Step 3: Aplicar la migración en Supabase**

Ir al SQL Editor de Supabase (https://supabase.com/dashboard/project/qimkmifmkiikoaewxfbx/sql) y ejecutar el contenido del archivo, o usar el CLI:

```bash
npx supabase db push
```

- [ ] **Step 4: Verificar en Supabase**

```bash
npx supabase db query "select id, sku, attributes from products limit 3;" --project-ref qimkmifmkiikoaewxfbx
```

Esperado: filas con `attributes` conteniendo los datos migrados.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/010_product_model_refactor.sql
git commit -m "feat: migrate product columns to attributes jsonb (migration 010)"
```

---

### Task 5: Actualizar API route de productos para usar `attributes`

**Files:**
- Modify: `app/api/admin/products/route.ts`
- Modify: `app/api/admin/products/[id]/route.ts`

- [ ] **Step 1: Revisar qué campos se leen/escriben en la API**

```bash
cat /Volumes/Neko/webs/nekomangacix/app/api/admin/products/route.ts
```

- [ ] **Step 2: En el GET, quitar referencias a columnas dropeadas**

Buscar cualquier `select` que mencione `specifications`, `volume_number`, `language`, `figure_scale`, `manufacturer`, `category` y reemplazarlos por `attributes`.

Si el select es `select *`, no requiere cambio (attributes ya existe).

- [ ] **Step 3: En el POST/PUT, mapear `attributes` correctamente**

Asegurarse de que al crear/actualizar un producto se pase `attributes` como objeto JSON, no como string.

- [ ] **Step 4: Verificar build**

```bash
npm run build 2>&1 | tail -10
```

Esperado: build exitoso sin errores de TypeScript.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/products/
git commit -m "feat: update product API routes to use attributes column"
```

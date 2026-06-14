# Storefront UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar precios con descuento en `ProductCard` y `ProductDetailClient`, y agregar un campo de cupón en el carrito.

**Architecture:** Se crea un hook `usePromotions()` que fetchea las promociones activas una vez y las cachea en contexto. `ProductCard` y `ProductDetailClient` reciben las promociones y calculan el precio final con `getDiscountedPrice()`. En `/cart` se agrega un input de cupón que valida contra la API.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Next.js 15 App Router

**Prerequisito:** Plan B (promotions-model) debe estar aplicado.

---

## Files

- Create: `context/PromotionsContext.tsx`
- Modify: `app/layout.tsx`
- Modify: `components/ProductCard.tsx`
- Modify: `app/products/[slug]/ProductDetailClient.tsx`
- Modify: `app/cart/page.tsx`

---

### Task 1: Contexto de promociones activas

**Files:**
- Create: `context/PromotionsContext.tsx`

- [ ] **Step 1: Crear el contexto**

```tsx
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Promotion } from '@/lib/promotions';

interface PromotionsContextValue {
  promotions: Promotion[];
  loading: boolean;
}

const PromotionsContext = createContext<PromotionsContextValue>({
  promotions: [],
  loading: true,
});

export function PromotionsProvider({ children }: { children: ReactNode }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/promotions/active')
      .then((r) => r.json())
      .then((json) => setPromotions(json.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PromotionsContext.Provider value={{ promotions, loading }}>
      {children}
    </PromotionsContext.Provider>
  );
}

export function usePromotions() {
  return useContext(PromotionsContext);
}
```

- [ ] **Step 2: Agregar `PromotionsProvider` al layout raíz**

En `app/layout.tsx`, importar y envolver los children:

```tsx
import { PromotionsProvider } from '@/context/PromotionsContext';

// Dentro del RootLayout, dentro de <CartProvider>:
<PromotionsProvider>
  <ChromeLayout>{children}</ChromeLayout>
</PromotionsProvider>
```

- [ ] **Step 3: Verificar build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add context/PromotionsContext.tsx app/layout.tsx
git commit -m "feat: add PromotionsContext for active promotions"
```

---

### Task 2: Mostrar precio descontado en `ProductCard`

**Files:**
- Modify: `components/ProductCard.tsx`

- [ ] **Step 1: Agregar imports y usar `usePromotions`**

Al inicio del componente `ProductCard`, agregar:

```tsx
import { usePromotions } from '@/context/PromotionsContext';
import { getDiscountedPrice } from '@/lib/promotions';
```

Y dentro del componente, después de los hooks existentes:

```tsx
const { promotions } = usePromotions();
const discount = getDiscountedPrice(pricePEN, id, type ?? 'manga', promotions);
const hasDiscount = discount.discountAmount > 0;
```

Nota: `ProductCardData` necesita agregar los campos `id` y `type`:

```tsx
export interface ProductCardData {
  id: string;
  slug: string;
  title: string;
  editorial: string;
  type?: string;  // agregar
  pricePEN: number;
  // ... resto igual
}
```

- [ ] **Step 2: Reemplazar la visualización del precio en el JSX**

Buscar donde se muestra `pricePEN` y reemplazar por:

```tsx
{/* Precio con descuento */}
<div className="flex items-baseline gap-2">
  <span className="text-lg font-bold text-gray-900 dark:text-white">
    S/ {discount.finalPrice.toFixed(2)}
  </span>
  {hasDiscount && (
    <span className="text-sm text-gray-400 line-through">
      S/ {pricePEN.toFixed(2)}
    </span>
  )}
  {hasDiscount && (
    <span className="text-xs font-semibold text-green-600 dark:text-green-400">
      -{discount.discountPercent}%
    </span>
  )}
</div>
```

- [ ] **Step 3: Verificar build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add components/ProductCard.tsx
git commit -m "feat: show discounted price in ProductCard"
```

---

### Task 3: Mostrar precio descontado en `ProductDetailClient`

**Files:**
- Modify: `app/products/[slug]/ProductDetailClient.tsx`

- [ ] **Step 1: Agregar imports y cálculo**

Al inicio del componente, agregar:

```tsx
import { usePromotions } from '@/context/PromotionsContext';
import { getDiscountedPrice } from '@/lib/promotions';
```

Dentro del componente, después de los hooks existentes:

```tsx
const { promotions } = usePromotions();
const discount = getDiscountedPrice(
  product.pricePEN,
  product.id,
  product.type,
  promotions,
);
const hasDiscount = discount.discountAmount > 0;
```

- [ ] **Step 2: Reemplazar visualización del precio en el JSX**

Buscar donde se muestra el precio en la página de detalle y reemplazar por:

```tsx
<div className="flex items-baseline gap-3">
  <span className="text-3xl font-bold text-gray-900 dark:text-white">
    S/ {discount.finalPrice.toFixed(2)}
  </span>
  {hasDiscount && (
    <>
      <span className="text-xl text-gray-400 line-through">
        S/ {product.pricePEN.toFixed(2)}
      </span>
      <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-semibold">
        -{discount.discountPercent}% · {discount.promotionName}
      </span>
    </>
  )}
</div>
```

- [ ] **Step 3: Pasar `discount.finalPrice` al carrito**

En `addToCart` y `handleBuyNow`, usar `discount.finalPrice` en lugar de `product.pricePEN`:

```tsx
addToCart(product.id, product.title, discount.finalPrice, product.editorial, {
  stockStatus: product.stockStatus,
  preorderDeposit: product.preorderDeposit,
  slug: product.slug,
});
```

- [ ] **Step 4: Verificar build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
git add app/products/\[slug\]/ProductDetailClient.tsx
git commit -m "feat: show discounted price in product detail page"
```

---

### Task 4: Input de cupón en el carrito

**Files:**
- Modify: `app/cart/page.tsx`

- [ ] **Step 1: Agregar estado y lógica del cupón**

Al inicio del componente de carrito, agregar:

```tsx
import { getDiscountedPrice, type Promotion } from '@/lib/promotions';

const [couponInput, setCouponInput] = useState('');
const [couponPromo, setCouponPromo] = useState<Promotion | null>(null);
const [couponError, setCouponError] = useState('');
const [couponLoading, setCouponLoading] = useState(false);

async function applyCoupon() {
  if (!couponInput.trim()) return;
  setCouponLoading(true);
  setCouponError('');
  const res = await fetch(`/api/promotions/coupon?code=${couponInput.trim().toUpperCase()}`);
  const json = await res.json();
  setCouponLoading(false);
  if (!res.ok || !json.data) {
    setCouponError('Cupón inválido o expirado');
    setCouponPromo(null);
    return;
  }
  setCouponPromo(json.data);
}

function removeCoupon() {
  setCouponPromo(null);
  setCouponInput('');
  setCouponError('');
}
```

- [ ] **Step 2: Agregar endpoint de validación de cupón**

Crear `app/api/promotions/coupon/route.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/core/supabase/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 });

  if (data.max_uses != null && data.used_count >= data.max_uses) {
    return NextResponse.json({ error: 'Cupón agotado' }, { status: 400 });
  }

  return NextResponse.json({ data });
}
```

- [ ] **Step 3: Agregar el UI del cupón en el carrito**

En el JSX del carrito, antes del total, agregar:

```tsx
{/* Cupón */}
<div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
  {!couponPromo ? (
    <div className="flex gap-2">
      <input
        className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2b496d]"
        placeholder="Código de cupón"
        value={couponInput}
        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
      />
      <button
        onClick={applyCoupon}
        disabled={couponLoading}
        className="px-4 py-2 text-sm bg-[#2b496d] hover:bg-[#1e3550] text-white rounded-lg disabled:opacity-50"
      >
        {couponLoading ? '…' : 'Aplicar'}
      </button>
    </div>
  ) : (
    <div className="flex items-center justify-between text-sm bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
      <span className="text-green-700 dark:text-green-400 font-medium">
        ✓ {couponPromo.name} aplicado
      </span>
      <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500 text-xs">
        Quitar
      </button>
    </div>
  )}
  {couponError && <p className="text-red-500 text-xs">{couponError}</p>}
</div>
```

- [ ] **Step 4: Verificar build completo**

```bash
npm run build 2>&1 | tail -15
```

Esperado: build exitoso sin errores.

- [ ] **Step 5: Commit final**

```bash
git add app/cart/page.tsx app/api/promotions/
git commit -m "feat: add coupon input to cart with validation"
```

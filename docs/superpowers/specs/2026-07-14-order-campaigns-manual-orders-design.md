# Gestión de pedidos: campañas de preventa + carga manual — Design

## Contexto

Hoy `/admin/orders` ya muestra los pedidos que llegan automáticamente desde el checkout web (`app/api/orders/route.ts`) y permite cambiar su estado. `order_items` ya distingue `item_type: 'stock' | 'preorder'`, así que un mismo pedido ya puede mezclar productos en stock y en preventa.

Lo que falta:

1. **Campañas de preventa**: la preventa se abre mensualmente con una ventana de fecha inicio/fin, y puede haber varias campañas abiertas en paralelo (una por país). No existe hoy ningún concepto de "campaña" en el schema.
2. **Carga manual de pedidos**: no hay forma de registrar desde el admin una venta presencial/directa que no pasó por el checkout web.

## Alcance

Dentro de esta spec:
- Tabla `campaigns` y columna `order_items.campaign_id`.
- Lógica de asignación automática de campaña por país al crear un ítem de preventa (compartida entre el checkout web y la carga manual).
- Admin: página de gestión de campañas (`/admin/campaigns`).
- Admin: filtro por campaña y visualización de campaña por ítem en `/admin/orders`.
- Admin: página de carga manual de pedidos (`/admin/orders/new`) + endpoint `POST /api/admin/orders`.

Fuera de alcance (no se toca en esta spec):
- Cambios al cálculo de depósito (sigue siendo 50% fijo, `PREORDER_DEPOSIT_RATE` en `lib/domain/cart/calculate.ts`).
- El gap existente de que las páginas de `/admin/**` no están gateadas server-side (solo las rutas API mutantes llaman `verifyAdminRequest()`) — se mantiene el patrón actual, no se corrige acá.
- Reasignación retroactiva de `campaign_id` en ítems ya creados al editar una campaña.

## Modelo de datos

```sql
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_code text not null check (country_code in ('AR','MX','ES','JP')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'open' check (status in ('open','closed')),
  notes text,
  created_at timestamptz default now()
);

create index campaigns_country_status_idx on campaigns (country_code, status);

alter table order_items add column campaign_id uuid references campaigns(id);
```

- `country_code` usa el mismo enum que `products.country_code` (`'AR'|'MX'|'ES'|'JP'`, ver `supabase/migrations/005_product_business_model.sql:12` y `008_drop_legacy.sql:9`).
- `status` es el cierre manual: permite cerrar una campaña antes de `ends_at` (ej. se agotó cupo).
- `campaign_id` vive en `order_items`, no en `orders` — la campaña se asocia por ítem, no por pedido completo. Ítems `item_type = 'stock'` siempre quedan con `campaign_id = null`.

**RLS**: política "admins manage all" (igual que `orders`/`promotions`) más una política de lectura pública para campañas `status = 'open'`, ya que el checkout web necesita poder consultar la campaña vigente al armar el pedido.

## Lógica de asignación de campaña

Helper compartido en `lib/domain/campaigns.ts`:

```ts
async function getActiveCampaignForCountry(countryCode: CountryCode, supabase: SupabaseClient): Promise<Campaign | null>
```

Busca `campaigns` con `country_code = countryCode`, `status = 'open'`, y `now()` entre `starts_at` y `ends_at`. Devuelve la campaña o `null`.

Se invoca al crear cada `order_item` cuyo producto tenga `stockStatus === 'preorder'`, tanto en:
- `app/api/orders/route.ts` (flujo web existente, checkout público) — se agrega la llamada antes del insert de `order_items` (`:138-145` actualmente).
- El nuevo `app/api/admin/orders/route.ts` (carga manual).

**Si no hay campaña activa para el país de ese producto → se rechaza ese ítem** con un error explícito ("No hay preventa abierta para Argentina en este momento"), sin afectar el resto de los ítems del pedido (los de stock siguen procesándose normalmente). Esto aplica igual en el checkout web que en la carga manual.

## Admin: gestión de campañas (`/admin/campaigns`)

Nueva sección siguiendo el patrón de `PromotionsManager.tsx`/`BannersManager.tsx`:

- **Listado**: nombre, país, ventana (inicio–fin), estado (abierta/cerrada), notas.
- **Cerrar campaña**: botón que pasa `status → 'closed'` sin esperar a `ends_at`.
- **Alta/edición** (modal): nombre, país, fecha/hora inicio, fecha/hora fin, notas.
- **Validación de solapamiento**: al crear/editar una campaña con `status = 'open'`, si ya existe otra campaña `open` para el mismo `country_code` cuya ventana `[starts_at, ends_at]` se superpone, se rechaza la operación con un mensaje indicando cuál campaña choca. Esto refleja la regla de negocio de "una sola campaña abierta a la vez por país".
- Endpoints: `app/api/admin/campaigns/route.ts` (GET lista, POST crear) y `app/api/admin/campaigns/[id]/route.ts` (PATCH editar/cerrar), ambos protegidos con `verifyAdminRequest()`.

## Admin: cambios en `/admin/orders`

- **Filtro por campaña**: dropdown adicional junto a los filtros existentes, para ver solo pedidos que tengan al menos un ítem de la campaña seleccionada.
- **Visualización por ítem**: cada línea de ítem de preventa dentro de un pedido muestra el nombre de la campaña asociada (o "sin campaña" si es `null`, caso legado o de un ítem que se creó antes de este cambio).

## Admin: carga manual de pedidos (`/admin/orders/new`)

Nueva página, protegida por el mismo patrón de sesión admin que el resto de `/admin/**`.

**Formulario:**
- Buscador de productos (reutilizando el patrón de `ComboBox.tsx` de `app/admin/products/`) para agregar ítems reales del catálogo, con cantidad por ítem.
- Nombre y teléfono de cliente (opcionales — puede ser venta presencial sin esos datos).
- Selector de método de pago (mismas opciones que el checkout: yape/plin/transferencia).
- **Selector de estado inicial** del pedido (cualquier valor de `ORDER_STATES`: `pending_deposit`, `confirmed`, `pending_balance`, etc.) — el admin lo elige según corresponda a la venta real.
- Checkbox **"forzar aunque no haya stock"** (`overrideStock`): por defecto los productos `stockStatus = 'in_stock'` con `stock = 0` se rechazan igual que en el checkout público; este flag permite al admin cargar la venta igual cuando sabe que el inventario del sistema está desactualizado.
- Preview de totales en vivo, reutilizando `calculateCartTotals` (mismo cálculo de depósito 50% para ítems de preventa que usa el carrito web).

**Endpoint `POST /api/admin/orders`** (`app/api/admin/orders/route.ts`), protegido con `verifyAdminRequest()`:
1. Revalida precio y stock de cada producto contra la DB (mismo principio de no confiar en el cliente que ya usa `app/api/orders/route.ts:49-64`), respetando `overrideStock` para el chequeo de stock.
2. Para cada ítem con `stockStatus === 'preorder'`, aplica `getActiveCampaignForCountry` y rechaza si no hay campaña abierta para ese país (misma regla que el flujo web).
3. Inserta `orders` con el `status` elegido por el admin (en vez del `pending_deposit` fijo que usa el flujo web) y `order_items` con su `campaign_id` correspondiente.
4. No pasa por WhatsApp ni aplica cupones/descuento de primera compra (fuera de alcance para carga manual).

## Manejo de errores y casos borde

- **Sin campaña abierta para el país de un ítem de preventa**: se rechaza solo ese ítem, con mensaje claro. Aplica igual en checkout web y carga manual.
- **Ventanas de campaña superpuestas para el mismo país**: bloqueado al crear/editar con mensaje indicando la campaña en conflicto.
- **Campaña cerrada con ítems ya asignados**: los `order_items` existentes conservan su `campaign_id` — cerrar una campaña solo afecta asignaciones *futuras*.
- **Edición de fechas de una campaña ya usada**: permitido, es solo metadata; no reasigna ítems existentes.
- **Pedido manual con producto sin stock**: rechazado salvo `overrideStock = true`.

## Testing

No hay framework de test configurado en el proyecto (confirmado en `CLAUDE.md`). La verificación será manual: correr el flujo de checkout web con preventa activa/inactiva, y el flujo de carga manual, contra un entorno de desarrollo con Supabase local o de staging.

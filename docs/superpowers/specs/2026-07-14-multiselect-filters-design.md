# Filtros multiselector con buscador por filtro

**Fecha:** 2026-07-14
**Estado:** Aprobado, pendiente de plan de implementación

## Contexto

Los filtros de `/products` (componente `components/Filters.tsx`, usado tanto en el sidebar desktop
como en el drawer mobile de `app/products/ProductsClient.tsx`) son actualmente de selección única:
Tipo, Demografía, País/Editorial (jerárquico vía `components/filters/HierarchicalCountryFilter.tsx`)
y Disponibilidad son cada uno un valor nullable (`ProductType | null`, etc.) sincronizado a la URL.
No existe buscador dentro de las listas de opciones ni contador de resultados por opción.

Se pidió llevar estos filtros a selección múltiple, con un buscador de texto independiente dentro
de cada lista de opciones y, adicionalmente, mostrar cuántos productos coinciden con cada opción
(conteo dinámico/faceted).

## Objetivo

Convertir Tipo, Demografía, País, Editorial y Disponibilidad de selección única a selección
múltiple, con lista tipo checkbox, buscador propio por filtro (donde aplique) y contador dinámico
por opción, manteniendo el patrón existente de estado sincronizado a la URL.

## Fuera de alcance

- Precio y Autor (siguen como inputs de texto/rango tal cual están).
- Búsqueda global de texto (título/editorial/autor) — sin cambios.
- Filtro de "Género" (Acción, Aventura, etc.): no existe un campo `genre`/`category` en `Product`
  (`lib/products.ts:22-45`), por lo que no se agrega. Si en el futuro se agrega un campo de género,
  este mismo diseño de `MultiSelectFilterGroup` se puede reutilizar.

## Diseño

### 1. Estado y sincronización con URL

Los filtros estructurales pasan de valor único nullable a array:

- `type: ProductType | null` → `type: ProductType[]`
- `demographic: Demographic | null` → `demographic: Demographic[]`
- `countryCode: CountryCode | null` → `countryCode: CountryCode[]`
- `editorial: string | null` → `editorial: string[]`
- `stockStatus: StockStatus | null` → `stockStatus: StockStatus[]`

Se mantiene el patrón actual de `syncUrl` en `ProductsClient.tsx` (líneas ~25-63), serializando cada
array como parámetro separado por comas, ej.: `?type=manga,figura&demographic=shonen,seinen`.
Dentro de un mismo grupo la lógica es OR (Tipo = Manga **o** Figura); entre grupos distintos sigue
siendo AND, igual que hoy.

La lógica de filtrado en el `useMemo` de `ProductsClient.tsx` (líneas ~70-112) cambia de comparación
por igualdad (`product.type === filters.type`) a pertenencia (`filters.type.length === 0 ||
filters.type.includes(product.type)`) — array vacío significa "sin filtro aplicado", igual que
`null` hoy.

### 2. Componente nuevo: `MultiSelectFilterGroup`

Nuevo componente en `components/filters/MultiSelectFilterGroup.tsx`. Props:

```ts
interface MultiSelectFilterGroupProps {
  title: string;
  options: Array<{ value: string; label: string; count: number }>;
  selected: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean; // default true
}
```

Renderiza:
- Input de texto de búsqueda arriba (solo si `searchable`), que filtra la lista **visible** en
  cliente (no afecta los conteos, que siempre reflejan el catálogo con los demás filtros aplicados).
- Lista vertical de checkboxes: nombre a la izquierda, contador a la derecha (ej. "Shonen 45").
- Scroll interno (`max-height` + `overflow-y-auto`) cuando hay muchas opciones, como en la
  referencia visual.

Este componente reemplaza los bloques de pills existentes en `Filters.tsx` para Tipo, Demografía,
Editorial y Disponibilidad. Disponibilidad usa `searchable={false}` (solo 4 opciones fijas: en
stock, a pedido, preventa, agotado).

### 3. País → Editorial (jerarquía)

Se elimina `components/filters/HierarchicalCountryFilter.tsx` y se reemplaza por dos instancias de
`MultiSelectFilterGroup`:

- **"País"**: `searchable={false}` (pocas opciones), opciones = `COUNTRIES`.
- **"Editorial"**: `searchable={true}`, opciones derivadas de `EDITORIALS_BY_COUNTRY` filtradas
  según los países actualmente marcados (`filters.countryCode`). Si no hay país marcado, se
  muestran todas las editoriales de todos los países. Este filtrado de opciones (no de conteo) se
  calcula con un `useMemo` local en `Filters.tsx`.

Marcar un país no deselecciona editoriales ya marcadas que dejen de pertenecer a la lista visible;
simplemente la opción deja de listarse mientras el país esté deseleccionado (comportamiento
estándar de filtros jerárquicos en e-commerce, evita pérdida de estado sorpresiva).

### 4. Contadores dinámicos (faceted)

Para cada grupo de filtro, el contador de cada opción se calcula aplicando **todos los demás
filtros activos excepto el propio grupo** sobre el catálogo completo — patrón estándar de faceted
search (ej. Mercado Libre / Amazon): si el usuario ya filtró Tipo = Manga, el contador de "Shonen"
en Demografía refleja solo mangas shonen, no el total general de shonen.

Implementación: en `ProductsClient.tsx`, un `useMemo` por grupo (o una función `computeCounts(field,
excludeField)` reutilizada por los 5 grupos) que recorre el array de productos ya cargado en
cliente aplicando el resto de predicados de filtro. Como los productos completos ya están en
memoria (no hay refetch), esto es una pasada adicional en cliente por grupo — sin cambios en
`lib/productsServer.ts` ni llamadas de red adicionales.

### 5. Mobile

`Filters.tsx` se usa tal cual tanto en el sidebar desktop como en el drawer mobile de
`ProductsClient.tsx` (líneas ~177-223 y ~226-241). Al rediseñar el componente una sola vez, el
nuevo comportamiento aplica automáticamente a ambas vistas sin lógica condicional adicional.

## Testing

No hay framework de test configurado en el proyecto (ver CLAUDE.md). Verificación manual vía
`npm run dev`:

- Marcar múltiples opciones dentro de un mismo grupo → resultados combinan con OR.
- Marcar opciones en distintos grupos → resultados combinan con AND.
- Buscador dentro de un grupo filtra solo las opciones visibles, no afecta el conteo.
- Contadores se recalculan al cambiar cualquier otro filtro.
- Marcar país sin editorial y viceversa; deseleccionar país no debe borrar editoriales ya
  marcadas.
- Filtros persisten correctamente en la URL al recargar / compartir el link.
- Drawer mobile y sidebar desktop se comportan igual.

# Manejador de Excel del proveedor (Entelequia)

**Fecha:** 2026-09-17
**Estado:** aprobado, pendiente de plan de implementación

## Problema

El proveedor argentino (Entelequia) manda una planilla mensual con todo lo que
tiene disponible. Hoy no hay forma de cruzarla contra el catálogo: para saber
qué entró nuevo hay que comparar a ojo ~6.500 filas contra 6.015 productos.

El importador que ya existe (`lib/excelParser.ts` + `app/admin/products/ExcelImportPanel.tsx`)
no sirve para esto: lee la plantilla propia del proyecto, con columnas
`title` / `editorial` / `pricePEN` en una sola hoja. La planilla del proveedor
tiene 11 hojas, cada una con encabezados y columnas distintas.

## Alcance

Detectar **únicamente los ingresos nuevos** y darlos de alta como borrador.

Fuera de alcance, decidido explícitamente:

- No se actualizan precios de productos existentes.
- No se marca como no disponible lo que desapareció de la planilla.
- No se persiste la sesión de importación ni queda historial.
- No se soportan otros proveedores.

## Datos medidos sobre el archivo real

Medido contra `ENTELEQUIA DISTRIBUCIÓN 11-9.xlsx` (1,2 MB) y el catálogo de
producción (6.015 productos, 2.665 con `attributes.isbn`).

| Hoja | Filas de producto | Editorial destino |
|---|---:|---|
| Ivrea | 3.144 | Ivrea |
| Panini-Utopia | 1.797 | Panini Argentina + Utopía Editorial |
| Ovnipress | 832 | Ovnipress |
| Penguin | 710 | Penguin |
| **Total procesado** | **6.483** | |

Hojas ignoradas por no tener editorial equivalente en el catálogo: V&R (697),
Planeta (579), Otras (266), Deux-PopFiction (207), Hotel de las Ideas (122),
Merchandising (117). Total ignorado: 1.988 filas.

Resultado del cruce, corriendo la lógica definitiva de este spec:

| Grupo | Filas |
|---|---:|
| Ya existen | 5.894 |
| Nuevos | 569 |
| A revisar | 20 |
| **Total** | **6.483** |

Nuevos por editorial: Penguin 412, Ivrea 115, Ovnipress 39, Panini Argentina 2,
Utopía Editorial 1. Penguin domina porque el catálogo tiene 296 títulos de esa
editorial contra 710 en la planilla.

## Arquitectura

Pestaña **"Proveedor"** en `/admin`, junto a Productos. Flujo de cuatro pasos:
Subir → Analizar → Revisar → Dar de alta.

```
SupplierImportPanel (cliente)
  │ 1. parseEntelequiaWorkbook(ArrayBuffer)        lib/suppliers/entelequia.ts
  │    └─> SupplierRow[] + descartes + hojas ignoradas
  │ 2. POST /api/admin/suppliers/analyze
  │         └─> matchRows(rows, catálogo)          lib/suppliers/match.ts
  │             └─> { nuevos, yaExisten, aRevisar }
  │ 3. el admin tilda y ajusta el divisor
  │ 4. POST /api/admin/suppliers/import
             └─> inserta en products (is_active=false)
```

El parseo ocurre en el cliente porque `xlsx` ya es dependencia y el importador
actual funciona así. El matching ocurre en el servidor porque ahí está el
catálogo; el POST de análisis ronda los 800 KB, aceptable para una acción de
admin mensual.

Ambos endpoints usan `verifyAdminRequest()`, como el resto de `/api/admin`.

## Módulos

### `lib/suppliers/types.ts`

```ts
interface SupplierRow {
  sheet: string;
  editorial: string;
  title: string;
  isbn: string | null;
  author: string | null;
  priceArs: number;
  excelRow: number;      // para reportar descartes
}

interface DiscardedRow { sheet: string; excelRow: number; reason: string; }

interface ParseResult {
  rows: SupplierRow[];
  discarded: DiscardedRow[];
  ignoredSheets: { sheet: string; rows: number }[];
}
```

### `lib/suppliers/entelequia.ts`

Perfil declarativo por hoja:

```ts
const SHEET_PROFILES = {
  'Ivrea':         { editorial: 'Ivrea',            title: /titulo/i, isbn: /^ean$|isbn/i, price: /precio/i },
  'Ovnipress':     { editorial: 'Ovnipress',        title: /t.tulo/i, isbn: /isbn/i,       price: /pvp|precio/i },
  'Panini-Utopia': { editorial: 'Panini Argentina', title: /titulo/i, isbn: /isbn/i,       price: /precio/i, code: /c.digo/i },
  'Penguin':       { editorial: 'Penguin',          title: /nombre|titulo/i, isbn: /isbn/i, price: /pvp|precio/i, author: /autor/i },
};
```

Reglas de parseo, todas derivadas del archivo real:

1. **Lectura con `raw: true`.** Con `raw: false`, ~10% de los ISBN se
   entregan como `"9.78608E+12"` porque la celda es numérica con formato
   general. En crudo el valor está completo (`9786076384664`). Leer formateado
   baja el match por ISBN de 99,8% a ~90%.
2. **Encabezado buscado por regex** en las primeras 40 filas, no por índice
   fijo: está en la fila 1, 2 o 3 según la hoja, y Panini trae una columna
   extra sin nombre útil (`"Columna 1"`).
3. **Se descartan** filas sin título, sin precio, con título de menos de 2
   caracteres, encabezados de sección (`NOVEDADES`, `LANZAMIENTOS`,
   `REEDICIONES`) y separadores tipo `**PANINI MANGA**`. Cada descarte se
   registra con hoja, fila y motivo.
4. **Panini-Utopia se parte en dos editoriales** según el prefijo del código:
   `UTP*` → `Utopía Editorial`, el resto → `Panini Argentina`.
5. **Títulos**: se recorta el padding (la hoja de Panini trae títulos con
   cientos de espacios de relleno) y se colapsan espacios múltiples.
6. **Precios**: vienen como número o como texto (`" $ 12,000.00 "`). Se parsea
   ambos; una fila sin precio numérico se descarta.
7. Si una hoja no tiene encabezado reconocible, se reporta como hoja no
   reconocida en lugar de abortar la importación.

### `lib/suppliers/match.ts`

Normalización de ISBN: solo dígitos y `X`, en mayúsculas. Longitud 10 o 13.

Normalización de título, en este orden:

1. Quitar acentos (`NFD` + strip de diacríticos) y pasar a mayúsculas.
2. Quitar prefijos de sello: `DC`, `MARVEL`, `KODANSHA`, `IMAGE`,
   `DARK HORSE`, `BOOM`, `IDW`, `DYNAMITE`, `BLACK LABEL`, seguidos de `-` o `:`.
3. **Quitar sufijo de reedición** `(Nra edición)` / `(Nda Edición)`.
4. Quitar `VOL` / `TOMO` / `Nº` / `NRO`.
5. Reemplazar puntuación por espacios y colapsar.
6. Quitar ceros a la izquierda de los números (`ONE PIECE 016` → `ONE PIECE 16`).

El paso 3 es el que evita 6 duplicados confirmados en el archivo de prueba
(`NieR:Automata Vol. 1 (2da edición)`, `Absolute Batman Vol. 1 (5ta Edición)`,
`Absolute Wonder Woman Vol 01 (3ra Edición)`, `Batman: El Mundo (2da Edición)`,
`TMNT: El Último Ronin (2da edición)`, `Attack on Titan Vol. 01 (Edición
Deluxe) (2da Edición)`).

Clasificación de cada fila:

- **`yaExiste`** — el ISBN normalizado está en el catálogo, o el par
  (editorial, título normalizado) está en el catálogo.
- **`aRevisar`** — no matcheó, pero el título trae marca de edición especial:
  `(Nra edición)`, `KANZENBAN`, `EDICIÓN REMIX`, `DELUXE`, `OMNIBUS`,
  `INTEGRAL`, `EDICIÓN ESPECIAL`. Se adjunta el producto más parecido del
  catálogo dentro de la misma editorial como referencia visual.
- **`nuevo`** — el resto.

`aRevisar` existe porque la normalización cubre los patrones observados en un
archivo, y el del mes que viene puede traer otros. Es más barato mandar 20
filas a revisión manual que descubrir duplicados en la tienda.

Este grupo tiene falsos positivos por diseño: `POKEMON. SUPER MEGA ULTRA DELUXE
GUIA ESENCIAL` cae ahí por la palabra "deluxe" y es un título genuinamente
nuevo. El costo de revisarlo a mano es trivial frente al de publicar un
duplicado.

### `app/api/admin/suppliers/analyze/route.ts`

`POST` con `{ rows: SupplierRow[] }`. Carga del catálogo solo la proyección
necesaria (`id, title, editorial, attributes->isbn`) paginando de a 1.000, y
devuelve los tres grupos. No escribe nada.

### `app/api/admin/suppliers/import/route.ts`

`POST` con `{ rows: SupplierRow[], divisor: number }`. Por cada fila:

```
sku: generateSku(title)          // reusa app/api/admin/products/route.ts
slug: generateSlug(title)        // con sufijo si colisiona
title, editorial, author
price_pen: Math.round(priceArs / divisor)
stock: 0
stock_status: 'preorder'
country_code: 'AR'
type: 'manga'
series: título sin el número de tomo
is_active: false
attributes: {
  isbn, supplier: 'Entelequia',
  supplier_price_ars: priceArs,
  supplier_file: <nombre del archivo>,
  imported_at: <ISO>
}
```

Validaciones: `divisor` numérico y `> 0`; `price_pen` resultante `> 0` (la
tabla tiene `check (price_pen > 0)`), fila rechazada con motivo si da 0.
Inserción por lotes de 500, con conteo de insertados y lista de fallidos.
Al terminar llama a `revalidateProductCaches()` igual que el endpoint de
productos.

Como los productos entran con `is_active: false`, no aparecen en la tienda
hasta que se completen manualmente (imagen, sinopsis, precio final).

### `app/admin/suppliers/SupplierImportPanel.tsx`

Resumen: filas leídas, ya existentes, nuevas, a revisar, descartes y hojas
ignoradas con su conteo.

Tabla de nuevos agrupada por editorial, con buscador y "tildar todo" por grupo.
Columnas: título, autor, ISBN, precio ARS, precio S/ calculado.

**Campo editable del divisor, con `260` por defecto**, que recalcula la columna
de soles en vivo. No va hardcodeado porque el tipo de cambio se mueve mes a
mes.

Sección aparte para `aRevisar`, **destildada por defecto**, con el producto
parecido del catálogo al lado.

## Fórmula de precio

```
price_pen = Math.round(precio_tapa_ARS / divisor)     // divisor por defecto: 260
```

Sin descuento de editorial ni margen: decisión del usuario. El precio ARS
original queda guardado en `attributes.supplier_price_ars` para poder rehacer
el cálculo más adelante.

## Testing

Se agrega **Vitest** como devDependency, con script `npm test`. Alcance:
`lib/suppliers/`, que son funciones puras.

Casos derivados del archivo real:

**Parser**
- ISBN numérico en notación científica se recupera completo.
- ISBN ausente (`"ISBN A CONFINRMAR"`, `"S/D"`) devuelve `null`, no descarta la fila.
- Filas `NOVEDADES` / `**PANINI MANGA**` se descartan y se registran.
- Código `UTP*` clasifica en `Utopía Editorial`; el resto en `Panini Argentina`.
- Título con padding masivo queda recortado.
- Precio texto (`" $ 12,000.00 "`) y numérico dan el mismo resultado.
- Hoja sin encabezado reconocible se reporta, no rompe.

**Matcher**
- Match por ISBN con y sin guiones.
- `ONE PIECE 016` matchea `ONE PIECE 16`.
- `DC - BATMAN: HUSH 2` matchea `BATMAN: HUSH 2`.
- `NieR:Automata Vol. 1 (2da edición)` clasifica como `yaExiste`, no como nuevo.
- `BLUE BOX 15` con `BLUE BOX 12` en catálogo clasifica como `nuevo`
  (tomos distintos de la misma serie no son duplicados).
- Título con `KANZENBAN` sin match clasifica como `aRevisar`, no como `nuevo`.

**Fixture.** No se versiona el Excel del proveedor: son 1,2 MB de listas de
precios comerciales que quedarían en el repo para siempre. En su lugar,
`lib/suppliers/__fixtures__/build-fixture.ts` genera con `XLSX.write` una
planilla chica que reproduce cada estructura problemática observada (las cuatro
hojas con sus encabezados en filas distintas, un ISBN numérico, un
`"ISBN A CONFINRMAR"`, una fila `NOVEDADES`, un separador `**PANINI MANGA**`,
un código `UTP*`, un título con padding y un precio como texto).

El caso "conteos por hoja" contra el archivo real queda como script manual
aparte, no como test, porque depende de un archivo que no está en el repo.

## Decisiones tomadas

| Decisión | Elegida | Motivo |
|---|---|---|
| Alcance | Solo detectar nuevos | El usuario no quiere que el importador toque precios ni disponibilidad de lo existente |
| Alta | Borrador (`is_active: false`) | Falta imagen, sinopsis y precio final antes de publicar |
| Matching | ISBN, y si no, título + editorial | El ISBN solo cubre el 44% del catálogo |
| Proveedores | Solo Entelequia | Perfiles por hoja dejan la puerta abierta sin costo hoy |
| Editoriales | Solo las 4 existentes | No sumar editoriales al catálogo público por ahora |
| Precio | `round(tapa / 260)`, divisor editable | Fórmula del usuario; el tipo de cambio cambia mes a mes |
| Persistencia | Ninguna | 569 nuevos es una revisión de una sentada; agregar historial es problema futuro |
| Tests | Vitest sobre `lib/suppliers/` | Parser y matcher son funciones puras |

## Riesgos

- **La planilla del mes que viene cambia de formato.** Mitigado con búsqueda
  de encabezado por regex y reporte de hoja no reconocida en vez de fallo duro.
- **Reediciones no contempladas se cargan duplicadas.** Mitigado con el grupo
  `aRevisar` destildado por defecto.
- **El divisor mal tipeado carga 600 productos con precio absurdo.** Mitigado
  porque entran inactivos y el precio calculado se ve en pantalla antes de
  confirmar.

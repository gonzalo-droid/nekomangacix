# Manejador de Excel del proveedor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que desde `/admin` se pueda subir la planilla mensual de Entelequia, ver qué títulos son ingresos nuevos respecto del catálogo, y darlos de alta como borrador.

**Architecture:** El `.xlsx` se parsea en el navegador con `xlsx` (ya es dependencia). Las filas normalizadas se mandan a `POST /api/admin/suppliers/analyze`, que las cruza contra el catálogo de Supabase y las clasifica en `yaExiste` / `nuevo` / `aRevisar`. El admin tilda lo que quiere y `POST /api/admin/suppliers/import` las inserta con `is_active: false`. Toda la lógica de parseo, normalización, clasificación y armado de filas vive en `lib/suppliers/` como funciones puras, testeadas con Vitest.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase, `xlsx` 0.18, Vitest (nuevo), Tailwind 4.

**Spec:** [docs/superpowers/specs/2026-09-17-manejador-excel-proveedor-design.md](../specs/2026-09-17-manejador-excel-proveedor-design.md)

## Global Constraints

- **Editoriales soportadas:** solo `Ivrea`, `Ovnipress`, `Panini Argentina`, `Utopía Editorial`, `Penguin`. Cualquier otra rompe la validación de `normalizeProductRow` en el endpoint de productos — ver `lib/constants/editorials.ts`.
- **Hojas procesadas:** solo `Ivrea`, `Ovnipress`, `Panini-Utopia`, `Penguin`. El resto se reporta como ignorado, nunca se parsea.
- **Lectura del workbook siempre con `{ raw: true }`.** Con `raw: false` los ISBN numéricos llegan como `"9.78608E+12"` y se pierde el 10% del match.
- **Divisor de precio por defecto: `260`.** `price_pen = Math.round(priceArs / divisor)`. Nunca hardcodeado fuera de la constante `DEFAULT_DIVISOR`.
- **Productos nuevos se insertan con `is_active: false`, `stock_status: 'preorder'`, `stock: 0`, `country_code: 'AR'`, `type: 'manga'`.**
- **Todo endpoint bajo `/api/admin/` empieza con `const auth = await verifyAdminRequest(); if (!auth.ok) return auth.response;`**
- **La tabla `products` tiene `slug unique` y `check (price_pen > 0)`.** Ambas se violan con datos reales si no se dedupe el slug y no se filtran precios que redondean a 0.
- **Comentarios y textos de UI en español**, como el resto del proyecto.
- **No versionar el Excel del proveedor.** El fixture de tests se genera por código.

---

### Task 1: Vitest + normalizadores

Arranca la infraestructura de tests y las funciones de normalización que todo lo demás usa.

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/suppliers/types.ts`
- Create: `lib/suppliers/normalize.ts`
- Create: `lib/suppliers/normalize.test.ts`
- Modify: `package.json` (devDependency `vitest`, script `test`)

**Interfaces:**
- Consumes: nada.
- Produces:
  - `normalizeIsbn(value: unknown): string | null`
  - `normalizeTitle(title: string): string`
  - `hasSpecialEditionMark(title: string): boolean`
  - `interface SupplierRow`, `interface DiscardedRow`, `interface ParseResult`, `interface CatalogEntry`

- [ ] **Step 1: Instalar Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Crear `vitest.config.ts`**

Entorno `node` a propósito: todo lo que se testea en este plan son funciones puras, no componentes. Sin jsdom ni testing-library.

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});
```

- [ ] **Step 3: Agregar el script `test` a `package.json`**

En el bloque `"scripts"`, junto a `lint`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Crear `lib/suppliers/types.ts`**

```ts
/** Una fila de producto leída de la planilla del proveedor. */
export interface SupplierRow {
  /** Hoja de origen, para poder rastrear la fila en el archivo. */
  sheet: string;
  /** Editorial del catálogo a la que corresponde esta fila. */
  editorial: string;
  title: string;
  isbn: string | null;
  author: string | null;
  priceArs: number;
  /** Número de fila en el Excel (1-indexado), para reportar descartes. */
  excelRow: number;
}

/** Fila que el parser no pudo interpretar, con el motivo. */
export interface DiscardedRow {
  sheet: string;
  excelRow: number;
  reason: string;
}

export interface ParseResult {
  rows: SupplierRow[];
  discarded: DiscardedRow[];
  /** Hojas del workbook que no se procesan, con su conteo de filas. */
  ignoredSheets: { sheet: string; rows: number }[];
}

/** Proyección mínima del catálogo que necesita el matcher. */
export interface CatalogEntry {
  title: string;
  editorial: string;
  isbn: string | null;
}
```

- [ ] **Step 5: Escribir los tests de normalización (fallan)**

`lib/suppliers/normalize.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { normalizeIsbn, normalizeTitle, hasSpecialEditionMark } from './normalize';

describe('normalizeIsbn', () => {
  it('saca guiones y espacios', () => {
    expect(normalizeIsbn('978-987-819-681-7')).toBe('9789878196817');
  });

  it('acepta un número (así llegan las celdas numéricas del Excel)', () => {
    expect(normalizeIsbn(9786076384664)).toBe('9786076384664');
  });

  it('acepta ISBN-10 y respeta la X final', () => {
    expect(normalizeIsbn('84-7888-333-x')).toBe('847888333X');
  });

  it('devuelve null si no llega a 10 ni 13 dígitos', () => {
    expect(normalizeIsbn('ISBN A CONFINRMAR')).toBeNull();
    expect(normalizeIsbn('S/D')).toBeNull();
    expect(normalizeIsbn(null)).toBeNull();
    expect(normalizeIsbn('')).toBeNull();
  });
});

describe('normalizeTitle', () => {
  it('saca acentos y pasa a mayúsculas', () => {
    expect(normalizeTitle('Edición Única')).toBe('EDICION UNICA');
  });

  it('saca el prefijo de sello', () => {
    expect(normalizeTitle('DC - BATMAN: HUSH 2')).toBe('BATMAN HUSH 2');
  });

  it('saca sellos encadenados', () => {
    expect(normalizeTitle('DC - BLACK LABEL - SANDMAN: MUERTE')).toBe('SANDMAN MUERTE');
  });

  it('saca el sufijo de reedición', () => {
    expect(normalizeTitle('NieR:AUTOMATA Vol. 1 (2da edición)')).toBe('NIER AUTOMATA 1');
  });

  it('saca VOL / TOMO / Nº', () => {
    expect(normalizeTitle('LECTOR OMNISCIENTE Nº 04')).toBe('LECTOR OMNISCIENTE 4');
  });

  it('saca los ceros a la izquierda del número de tomo', () => {
    expect(normalizeTitle('ONE PIECE 016')).toBe('ONE PIECE 16');
  });

  it('colapsa el padding de espacios', () => {
    expect(normalizeTitle('BAKEMONOGATARI 04          ')).toBe('BAKEMONOGATARI 4');
  });

  it('no confunde tomos distintos de la misma serie', () => {
    expect(normalizeTitle('BLUE BOX 15')).not.toBe(normalizeTitle('BLUE BOX 12'));
  });
});

describe('hasSpecialEditionMark', () => {
  it.each([
    'KODANSHA - AKIRA Vol. 01 (4ta Edición)',
    'BAKI THE GRAPPLER KANZENBAN 16',
    'BLEACH EDICIÓN REMIX 17',
    'GANTZ -DELUXE EDITION- 17',
    'EL PISTOLERO - LA TORRE OSCURA INTEGRAL 2',
    'DEMON SLAYER - KIMETSU NO YAIBA 23 EDICION ESPECIAL',
  ])('marca %s', (title) => {
    expect(hasSpecialEditionMark(title)).toBe(true);
  });

  it.each([
    'ONE PIECE 016',
    'BLUE BOX 15',
    'KAGURABACHI 10',
  ])('no marca %s', (title) => {
    expect(hasSpecialEditionMark(title)).toBe(false);
  });
});
```

- [ ] **Step 6: Correr los tests para verificar que fallan**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./normalize"`

- [ ] **Step 7: Implementar `lib/suppliers/normalize.ts`**

```ts
/**
 * Normalizadores compartidos por el parser y el matcher.
 *
 * Las reglas de acá salieron de medir el archivo real del proveedor: cada una
 * corrige un patrón concreto que, sin tratar, produce falsos "nuevos".
 */

/** Sellos que el proveedor antepone al título y el catálogo no guarda. */
const IMPRINT_PREFIX =
  /^(DC|MARVEL|KODANSHA|IMAGE|DARK HORSE|BOOM|IDW|IDW COMICS|DYNAMITE|BLACK LABEL)\s*[-:]\s*/;

/** "(2da edición)", "(4ta Edición)", "( 3ra edicion )". */
const REISSUE_SUFFIX = /\(\s*\d+\s*(RA|DA|TA|MA|ER)?\s*EDICION\s*\)/g;

/** Palabras que delatan una edición especial o reedición. */
const SPECIAL_EDITION =
  /(\d+\s*(ra|da|ta|ma|er)?\s*edici|reedici|remix|deluxe|kanzenban|omnibus|integral|edicion especial|edición especial)/i;

/**
 * Devuelve el ISBN como dígitos (más la X final del ISBN-10), o null si no
 * tiene largo de ISBN. Acepta números porque las celdas numéricas del Excel
 * llegan así — `String(9786076384664)` conserva el valor, pero un float con
 * notación científica no, de ahí el `Math.round`.
 */
export function normalizeIsbn(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const raw = typeof value === 'number' ? String(Math.round(value)) : String(value);
  const clean = raw.replace(/[^\dXx]/g, '').toUpperCase();
  return clean.length === 13 || clean.length === 10 ? clean : null;
}

/**
 * Lleva un título a una forma comparable entre la planilla y el catálogo.
 * El orden importa: los sellos se sacan antes de limpiar la puntuación,
 * porque el separador "-" es parte del patrón.
 */
export function normalizeTitle(title: string): string {
  let out = String(title ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase();

  // Encadenados: "DC - BLACK LABEL - SANDMAN".
  while (IMPRINT_PREFIX.test(out)) out = out.replace(IMPRINT_PREFIX, '');

  return out
    .replace(REISSUE_SUFFIX, ' ')
    .replace(/\b(VOL|TOMO|N|NO|NRO)\b\.?\s*/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b0+(\d)/g, '$1');
}

/**
 * True si el título parece una edición especial o reedición. Se usa para
 * mandar la fila a revisión manual en vez de darla de alta sola: la
 * normalización cubre los patrones de un archivo, y el del mes que viene
 * puede traer otros. Tiene falsos positivos a propósito — "POKEMON SUPER
 * MEGA ULTRA DELUXE GUIA" cae acá y es un título nuevo legítimo.
 */
export function hasSpecialEditionMark(title: string): boolean {
  return SPECIAL_EDITION.test(String(title ?? ''));
}
```

- [ ] **Step 8: Correr los tests para verificar que pasan**

Run: `npm test`
Expected: PASS — todos los tests de `normalize.test.ts` en verde.

- [ ] **Step 9: Verificar que el lint sigue limpio**

Run: `npm run lint`
Expected: sin errores.

- [ ] **Step 10: Commit**

```bash
git add vitest.config.ts package.json package-lock.json lib/suppliers/
git commit -m "feat(suppliers): normalizadores de ISBN y título + setup de Vitest

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Parser de la planilla

**Files:**
- Create: `lib/suppliers/entelequia.ts`
- Create: `lib/suppliers/__fixtures__/buildFixture.ts`
- Create: `lib/suppliers/entelequia.test.ts`

**Interfaces:**
- Consumes: `normalizeIsbn` de `lib/suppliers/normalize.ts`; `SupplierRow`, `DiscardedRow`, `ParseResult` de `lib/suppliers/types.ts`.
- Produces:
  - `parseEntelequiaWorkbook(buffer: ArrayBuffer): ParseResult`
  - `SUPPORTED_SHEETS: string[]`
  - `buildFixtureWorkbook(): ArrayBuffer` (solo para tests)

- [ ] **Step 1: Escribir el generador del fixture**

No se versiona el Excel real: son 1,2 MB de listas de precios del proveedor. Este generador arma una planilla chica que reproduce cada estructura problemática observada en el archivo real.

`lib/suppliers/__fixtures__/buildFixture.ts`:

```ts
import * as XLSX from 'xlsx';

/**
 * Arma un workbook que imita la planilla de Entelequia: encabezados en filas
 * distintas por hoja, filas de sección intercaladas, ISBN numérico, ISBN
 * ausente, títulos con padding y precios como texto.
 */
export function buildFixtureWorkbook(): ArrayBuffer {
  const wb = XLSX.utils.book_new();

  // Ivrea: encabezado en la fila 3, precede un aviso y un "NOVEDADES".
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['POR FAVOR COMPLETAR LAS REEDICIONES ARRIBA. NO EN EL FONDO!'],
    ['NOVEDADES'],
    ['TITULO', 'EAN', ' PRECIO TAPA', 'CANTIDAD', 'Subtotal'],
    ['ONE PIECE 016', 9788419010872, ' $ 12,000.00 ', null, ' $ -   '],
    ['KAGURABACHI 10', 'ISBN A CONFINRMAR', ' $ 11,000.00 ', null, ' $ -   '],
    ['REEDICIONES'],
    ['BAKI THE GRAPPLER KANZENBAN 16', 9791388355875, ' $ 29,500.00 ', null, ' $ -   '],
    [null, null, null, null, null],
  ]), 'Ivrea');

  // Ovnipress: encabezado en la fila 2, títulos con prefijo de sello.
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['NOVEDADES'],
    ['Cant. de pág', 'Título', 'ISBN', 'PVP', 'CANT', 'subtotal'],
    ['176', 'DC - BATMAN: HUSH 2', '978-987-819-681-7', '$ 28,000.00', null, ' $ -   '],
    ['176', 'KODANSHA - NieR:AUTOMATA Vol. 1 (2da edición)', '978-987-819-673-2', '$ 15,000.00', null, ' $ -   '],
  ]), 'Ovnipress');

  // Panini-Utopia: código UTP*, título con padding, ISBN numérico, separador.
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['NOVEDADES'],
    ['Código', 'Titulo', 'Isbn', ' Precio en ARS', 'Cant.', 'Subtotal', 'Columna 1'],
    ['UTPELLASCYE', 'ELLA, SU CAMARA Y SUS ESTACIONES VOL 03' + ' '.repeat(120), '9786319023008   ', '$ 12,500', null, ' $ -   ', 'NOVEDAD '],
    [null, '**PANINI MANGA **'],
    ['PCAQAADE001', 'ALL OF US ARE DEAD 01', 9786076384664, '$ 31,000.00', null, ' $ -   '],
  ]), 'Panini-Utopia');

  // Penguin: trae columna de autor.
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['NOVEDADES'],
    ['AUTOR', 'NOMBRE', 'ISBN', ' PVP', 'CANT.', 'SUBTOTAL'],
    ['Wakui, Ken', 'ASTRO ROYALE 4', '9786316657862', '16,000.00', null, ' $ -   '],
  ]), 'Penguin');

  // Hoja que no se procesa.
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['PRODUCTO', 'ISBN', 'Precio', 'Cantidad', 'Subotal'],
    ['CARTAS UNO BTS', '8879617424248', '$ 3,000', null, ' $ -   '],
    ['MONOPOLY POKEMON', '700304046215', '$ 33,000', null, ' $ -   '],
  ]), 'Merchandising');

  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return out as ArrayBuffer;
}
```

- [ ] **Step 2: Escribir los tests del parser (fallan)**

`lib/suppliers/entelequia.test.ts`:

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import * as XLSX from 'xlsx';
import { parseEntelequiaWorkbook } from './entelequia';
import { buildFixtureWorkbook } from './__fixtures__/buildFixture';
import type { ParseResult, SupplierRow } from './types';

let result: ParseResult;
const find = (title: string): SupplierRow | undefined =>
  result.rows.find((r) => r.title.startsWith(title));

beforeAll(() => {
  result = parseEntelequiaWorkbook(buildFixtureWorkbook());
});

describe('parseEntelequiaWorkbook', () => {
  it('lee las 4 hojas soportadas y ninguna más', () => {
    expect([...new Set(result.rows.map((r) => r.sheet))].sort())
      .toEqual(['Ivrea', 'Ovnipress', 'Panini-Utopia', 'Penguin']);
  });

  it('reporta las hojas ignoradas con su conteo', () => {
    expect(result.ignoredSheets).toEqual([{ sheet: 'Merchandising', rows: 3 }]);
  });

  it('encuentra el encabezado aunque esté en filas distintas por hoja', () => {
    expect(find('ONE PIECE 016')).toBeDefined();   // Ivrea, fila 3
    expect(find('DC - BATMAN')).toBeDefined();     // Ovnipress, fila 2
  });

  it('recupera el ISBN numérico completo, sin notación científica', () => {
    expect(find('ALL OF US ARE DEAD 01')?.isbn).toBe('9786076384664');
  });

  it('deja el ISBN en null cuando el proveedor no lo tiene, sin descartar la fila', () => {
    const row = find('KAGURABACHI 10');
    expect(row).toBeDefined();
    expect(row?.isbn).toBeNull();
  });

  it('descarta las filas de sección y las registra', () => {
    expect(result.rows.some((r) => /^NOVEDADES|^REEDICIONES|PANINI MANGA/.test(r.title))).toBe(false);
  });

  it('manda el código UTP* a Utopía y el resto a Panini Argentina', () => {
    expect(find('ELLA, SU CAMARA')?.editorial).toBe('Utopía Editorial');
    expect(find('ALL OF US ARE DEAD 01')?.editorial).toBe('Panini Argentina');
  });

  it('recorta el padding del título', () => {
    expect(find('ELLA, SU CAMARA')?.title).toBe('ELLA, SU CAMARA Y SUS ESTACIONES VOL 03');
  });

  it('parsea el precio venga como texto o como número', () => {
    expect(find('ONE PIECE 016')?.priceArs).toBe(12000);
    expect(find('ELLA, SU CAMARA')?.priceArs).toBe(12500);
    expect(find('ASTRO ROYALE 4')?.priceArs).toBe(16000);
  });

  it('lee la columna de autor cuando la hoja la tiene', () => {
    expect(find('ASTRO ROYALE 4')?.author).toBe('Wakui, Ken');
    expect(find('ONE PIECE 016')?.author).toBeNull();
  });

  it('registra el número de fila del Excel para poder rastrear', () => {
    expect(find('ONE PIECE 016')?.excelRow).toBe(4);
  });

  it('no tira cuando una hoja soportada no tiene encabezado reconocible', () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['sin', 'nada', 'util']]), 'Ivrea');
    const r = parseEntelequiaWorkbook(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }));
    expect(r.rows).toEqual([]);
    expect(r.discarded[0].reason).toMatch(/encabezado/i);
  });
});
```

- [ ] **Step 3: Correr los tests para verificar que fallan**

Run: `npm test -- entelequia`
Expected: FAIL — `Failed to resolve import "./entelequia"`

- [ ] **Step 4: Implementar `lib/suppliers/entelequia.ts`**

```ts
import * as XLSX from 'xlsx';
import { normalizeIsbn } from './normalize';
import type { DiscardedRow, ParseResult, SupplierRow } from './types';

/**
 * Cómo leer cada hoja. Las columnas se ubican buscando el encabezado por
 * regex y no por índice fijo, porque el proveedor arranca la tabla en la fila
 * 1, 2 o 3 según la hoja y suma columnas sueltas ("Columna 1" en Panini).
 */
interface SheetProfile {
  editorial: string;
  title: RegExp;
  isbn: RegExp;
  price: RegExp;
  author?: RegExp;
  /** Solo Panini-Utopia: la columna de código decide la editorial. */
  code?: RegExp;
}

const SHEET_PROFILES: Record<string, SheetProfile> = {
  'Ivrea': {
    editorial: 'Ivrea',
    title: /titulo/i, isbn: /^ean$|isbn/i, price: /precio/i,
  },
  'Ovnipress': {
    editorial: 'Ovnipress',
    title: /t.tulo/i, isbn: /isbn/i, price: /pvp|precio/i,
  },
  'Panini-Utopia': {
    editorial: 'Panini Argentina',
    title: /titulo/i, isbn: /isbn/i, price: /precio/i, code: /c.digo/i,
  },
  'Penguin': {
    editorial: 'Penguin',
    title: /nombre|titulo/i, isbn: /isbn/i, price: /pvp|precio/i, author: /autor/i,
  },
};

export const SUPPORTED_SHEETS = Object.keys(SHEET_PROFILES);

/** Títulos que son encabezados de sección, no productos. */
const SECTION_ROW = /^(novedades|lanzamientos|reediciones|por favor|totales)/i;

/** Cuántas filas mirar buscando el encabezado antes de rendirse. */
const HEADER_SEARCH_DEPTH = 40;

interface HeaderPositions {
  row: number; title: number; price: number;
  isbn: number; author: number; code: number;
}

function findHeader(rows: unknown[][], profile: SheetProfile): HeaderPositions | null {
  const limit = Math.min(rows.length, HEADER_SEARCH_DEPTH);
  for (let i = 0; i < limit; i++) {
    const cells = (rows[i] ?? []).map((c) => String(c ?? '').trim());
    const title = cells.findIndex((c) => profile.title.test(c));
    const price = cells.findIndex((c) => profile.price.test(c));
    if (title >= 0 && price >= 0) {
      return {
        row: i,
        title,
        price,
        isbn: cells.findIndex((c) => profile.isbn.test(c)),
        author: profile.author ? cells.findIndex((c) => profile.author!.test(c)) : -1,
        code: profile.code ? cells.findIndex((c) => profile.code!.test(c)) : -1,
      };
    }
  }
  return null;
}

/**
 * Los precios vienen como número (12000) o como texto (" $ 12,000.00 ").
 * En el texto la coma es separador de miles y el punto decimal.
 */
function parsePrice(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : null;
  const clean = String(value ?? '').replace(/[^\d.,]/g, '').replace(/,/g, '');
  const n = parseFloat(clean);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function cellText(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function parseEntelequiaWorkbook(buffer: ArrayBuffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const rows: SupplierRow[] = [];
  const discarded: DiscardedRow[] = [];
  const ignoredSheets: { sheet: string; rows: number }[] = [];

  for (const sheetName of workbook.SheetNames) {
    // `raw: true` es obligatorio: con lectura formateada, los ISBN numéricos
    // llegan como "9.78608E+12" y se pierde el 10% del match.
    const sheet = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
      header: 1, raw: true, blankrows: false,
    });

    const profile = SHEET_PROFILES[sheetName];
    if (!profile) {
      if (sheet.length > 0) ignoredSheets.push({ sheet: sheetName, rows: sheet.length });
      continue;
    }

    const header = findHeader(sheet, profile);
    if (!header) {
      discarded.push({ sheet: sheetName, excelRow: 0, reason: 'No se encontró el encabezado de la tabla' });
      continue;
    }

    for (let i = header.row + 1; i < sheet.length; i++) {
      const raw = sheet[i] ?? [];
      const excelRow = i + 1;
      const title = cellText(raw[header.title]);

      if (!title || title.length < 2) continue;              // fila vacía o separador
      if (SECTION_ROW.test(title) || /^\*+/.test(title)) continue;  // encabezado de sección

      const priceArs = parsePrice(raw[header.price]);
      if (priceArs === null) {
        discarded.push({ sheet: sheetName, excelRow, reason: `Sin precio válido: "${title}"` });
        continue;
      }

      const code = header.code >= 0 ? cellText(raw[header.code]) : '';
      rows.push({
        sheet: sheetName,
        editorial: code.toUpperCase().startsWith('UTP') ? 'Utopía Editorial' : profile.editorial,
        title,
        isbn: header.isbn >= 0 ? normalizeIsbn(raw[header.isbn]) : null,
        author: header.author >= 0 ? cellText(raw[header.author]) || null : null,
        priceArs,
        excelRow,
      });
    }
  }

  return { rows, discarded, ignoredSheets };
}
```

- [ ] **Step 5: Correr los tests para verificar que pasan**

Run: `npm test -- entelequia`
Expected: PASS — todos los tests de `entelequia.test.ts` en verde.

- [ ] **Step 6: Verificar contra el archivo real del proveedor**

Este chequeo no es un test (depende de un archivo que no está en el repo), pero confirma que el parser funciona sobre el original. Correr una sola vez:

```bash
npx tsx -e "
import { parseEntelequiaWorkbook } from './lib/suppliers/entelequia';
import { readFileSync } from 'node:fs';
const buf = readFileSync('/Volumes/Neko/Downloads/ENTELEQUIA DISTRIBUCIÓN 11-9.xlsx');
const r = parseEntelequiaWorkbook(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const porHoja: Record<string, number> = {};
r.rows.forEach(x => porHoja[x.sheet] = (porHoja[x.sheet] ?? 0) + 1);
console.log('filas:', r.rows.length, porHoja);
console.log('con ISBN:', r.rows.filter(x => x.isbn).length);
console.log('hojas ignoradas:', r.ignoredSheets.length);
"
```

Expected: `filas: 6483 { Ivrea: 3144, Ovnipress: 832, 'Panini-Utopia': 1797, Penguin: 710 }`, `con ISBN: 6470`, `hojas ignoradas: 7`.

Si los números no dan, el parser tiene un bug — no seguir al Task 3.

- [ ] **Step 7: Commit**

```bash
git add lib/suppliers/
git commit -m "feat(suppliers): parser de la planilla de Entelequia

Perfiles por hoja con búsqueda de encabezado por regex. Lectura en raw
para no perder los ISBN numéricos. Fixture sintético en vez de versionar
la lista de precios del proveedor.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Clasificador contra el catálogo

**Files:**
- Create: `lib/suppliers/match.ts`
- Create: `lib/suppliers/match.test.ts`

**Interfaces:**
- Consumes: `normalizeIsbn`, `normalizeTitle`, `hasSpecialEditionMark` de `./normalize`; `SupplierRow`, `CatalogEntry` de `./types`.
- Produces:
  - `classifyRows(rows: SupplierRow[], catalog: CatalogEntry[]): ClassifiedRows`
  - `interface ClassifiedRows { nuevos: SupplierRow[]; aRevisar: ReviewRow[]; yaExistenCount: number }`
  - `interface ReviewRow extends SupplierRow { similar: string | null }`

- [ ] **Step 1: Escribir los tests (fallan)**

`lib/suppliers/match.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { classifyRows } from './match';
import type { CatalogEntry, SupplierRow } from './types';

const row = (over: Partial<SupplierRow>): SupplierRow => ({
  sheet: 'Ivrea', editorial: 'Ivrea', title: 'X', isbn: null,
  author: null, priceArs: 10000, excelRow: 1, ...over,
});

const cat = (title: string, editorial = 'Ivrea', isbn: string | null = null): CatalogEntry =>
  ({ title, editorial, isbn });

describe('classifyRows', () => {
  it('matchea por ISBN aunque el catálogo lo guarde con guiones', () => {
    const r = classifyRows(
      [row({ title: 'CUALQUIER COSA', isbn: '9789878196817' })],
      [cat('OTRO TÍTULO DISTINTO', 'Ivrea', '978-987-819-681-7')],
    );
    expect(r.yaExistenCount).toBe(1);
    expect(r.nuevos).toHaveLength(0);
  });

  it('matchea por título cuando no hay ISBN', () => {
    const r = classifyRows([row({ title: 'ONE PIECE 016' })], [cat('ONE PIECE 16')]);
    expect(r.yaExistenCount).toBe(1);
  });

  it('matchea ignorando el prefijo de sello', () => {
    const r = classifyRows(
      [row({ title: 'DC - BATMAN: HUSH 2', editorial: 'Ovnipress' })],
      [cat('BATMAN: HUSH 2', 'Ovnipress')],
    );
    expect(r.yaExistenCount).toBe(1);
  });

  it('no matchea títulos iguales de editoriales distintas', () => {
    const r = classifyRows([row({ title: 'ONE PIECE 16' })], [cat('ONE PIECE 16', 'Penguin')]);
    expect(r.nuevos).toHaveLength(1);
  });

  it('trata la reedición como ya existente, no como nueva', () => {
    const r = classifyRows(
      [row({ title: 'KODANSHA - NieR:AUTOMATA Vol. 1 (2da edición)', editorial: 'Ovnipress' })],
      [cat('NieR:Automata 1', 'Ovnipress')],
    );
    expect(r.yaExistenCount).toBe(1);
    expect(r.nuevos).toHaveLength(0);
    expect(r.aRevisar).toHaveLength(0);
  });

  it('trata otro tomo de la misma serie como nuevo', () => {
    const r = classifyRows([row({ title: 'BLUE BOX 15' })], [cat('BLUE BOX 12')]);
    expect(r.nuevos).toHaveLength(1);
    expect(r.yaExistenCount).toBe(0);
  });

  it('manda a revisar una edición especial sin match', () => {
    const r = classifyRows([row({ title: 'BAKI THE GRAPPLER KANZENBAN 16' })], [cat('BAKI 1')]);
    expect(r.aRevisar).toHaveLength(1);
    expect(r.nuevos).toHaveLength(0);
  });

  it('adjunta el título parecido del catálogo a la fila a revisar', () => {
    const r = classifyRows(
      [row({ title: 'BAKI THE GRAPPLER KANZENBAN 16' })],
      [cat('BAKI THE GRAPPLER KANZENBAN 10'), cat('OTRA COSA')],
    );
    expect(r.aRevisar[0].similar).toBe('BAKI THE GRAPPLER KANZENBAN 10');
  });

  it('deja similar en null si no hay nada parecido en esa editorial', () => {
    const r = classifyRows([row({ title: 'AKIRA (4ta Edición)' })], [cat('ALGO TOTALMENTE AJENO')]);
    expect(r.aRevisar[0].similar).toBeNull();
  });

  it('clasifica cada fila en exactamente un grupo', () => {
    const rows = [
      row({ title: 'ONE PIECE 016' }),
      row({ title: 'BLUE BOX 15' }),
      row({ title: 'BAKI THE GRAPPLER KANZENBAN 16' }),
    ];
    const r = classifyRows(rows, [cat('ONE PIECE 16')]);
    expect(r.yaExistenCount + r.nuevos.length + r.aRevisar.length).toBe(rows.length);
  });
});
```

- [ ] **Step 2: Correr los tests para verificar que fallan**

Run: `npm test -- match`
Expected: FAIL — `Failed to resolve import "./match"`

- [ ] **Step 3: Implementar `lib/suppliers/match.ts`**

```ts
import { hasSpecialEditionMark, normalizeIsbn, normalizeTitle } from './normalize';
import type { CatalogEntry, SupplierRow } from './types';

/** Fila que necesita revisión manual, con el candidato más parecido al lado. */
export interface ReviewRow extends SupplierRow {
  similar: string | null;
}

export interface ClassifiedRows {
  nuevos: SupplierRow[];
  aRevisar: ReviewRow[];
  yaExistenCount: number;
}

/** Cuántas palabras iniciales tienen que compartir dos títulos para ser "parecidos". */
const SIMILAR_PREFIX_WORDS = 2;

/**
 * Busca en la misma editorial el título que más palabras iniciales comparte.
 * Es una pista visual para el admin, no una decisión del sistema: alcanza con
 * que sea aproximado.
 */
function findSimilar(title: string, pool: CatalogEntry[]): string | null {
  const words = normalizeTitle(title).split(' ');
  let best: string | null = null;
  let bestScore = 0;

  for (const entry of pool) {
    const other = normalizeTitle(entry.title).split(' ');
    let score = 0;
    while (score < words.length && score < other.length && words[score] === other[score]) score++;
    if (score > bestScore) { bestScore = score; best = entry.title; }
  }

  return bestScore >= SIMILAR_PREFIX_WORDS ? best : null;
}

/**
 * Cruza las filas de la planilla contra el catálogo y las parte en tres:
 *
 * - ya existen: matchean por ISBN o por (editorial, título normalizado)
 * - a revisar:  no matchean pero el título huele a reedición o edición especial
 * - nuevos:     el resto
 *
 * Las que ya existen solo se cuentan: el alcance de esta herramienta es dar de
 * alta ingresos nuevos, no tocar lo que ya está cargado.
 */
export function classifyRows(rows: SupplierRow[], catalog: CatalogEntry[]): ClassifiedRows {
  const knownIsbn = new Set<string>();
  const knownTitle = new Set<string>();
  const byEditorial = new Map<string, CatalogEntry[]>();

  for (const entry of catalog) {
    const isbn = normalizeIsbn(entry.isbn);
    if (isbn) knownIsbn.add(isbn);
    knownTitle.add(`${entry.editorial}|${normalizeTitle(entry.title)}`);
    const list = byEditorial.get(entry.editorial);
    if (list) list.push(entry); else byEditorial.set(entry.editorial, [entry]);
  }

  const nuevos: SupplierRow[] = [];
  const aRevisar: ReviewRow[] = [];
  let yaExistenCount = 0;

  for (const row of rows) {
    const isbn = normalizeIsbn(row.isbn);
    const titleKey = `${row.editorial}|${normalizeTitle(row.title)}`;

    if ((isbn && knownIsbn.has(isbn)) || knownTitle.has(titleKey)) {
      yaExistenCount++;
    } else if (hasSpecialEditionMark(row.title)) {
      aRevisar.push({ ...row, similar: findSimilar(row.title, byEditorial.get(row.editorial) ?? []) });
    } else {
      nuevos.push(row);
    }
  }

  return { nuevos, aRevisar, yaExistenCount };
}
```

- [ ] **Step 4: Correr los tests para verificar que pasan**

Run: `npm test`
Expected: PASS — los 3 archivos de test verdes.

- [ ] **Step 5: Commit**

```bash
git add lib/suppliers/
git commit -m "feat(suppliers): clasificador de filas contra el catálogo

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Armado de la fila de producto

Convierte una `SupplierRow` en la fila que se inserta en `products`, resolviendo precio, serie y colisiones de slug. El slug es `unique` en la tabla y el archivo real produce 6 colisiones: sin esto, el insert del lote entero falla.

**Files:**
- Create: `lib/suppliers/toProductRow.ts`
- Create: `lib/suppliers/toProductRow.test.ts`

**Interfaces:**
- Consumes: `generateSlug` de `@/lib/products`; `SupplierRow` de `./types`.
- Produces:
  - `DEFAULT_DIVISOR = 260`
  - `computePricePen(priceArs: number, divisor: number): number`
  - `inferSeries(title: string): string`
  - `uniqueSlug(title: string, taken: Set<string>): string`
  - `toProductRow(row: SupplierRow, opts: BuildOptions): ProductInsert`
  - `interface BuildOptions { divisor: number; supplierFile: string; takenSlugs: Set<string>; importedAt: string }`
  - `interface ProductInsert` — la forma exacta que se inserta en `products`

- [ ] **Step 1: Escribir los tests (fallan)**

`lib/suppliers/toProductRow.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computePricePen, inferSeries, uniqueSlug, toProductRow, DEFAULT_DIVISOR } from './toProductRow';
import type { SupplierRow } from './types';

const row = (over: Partial<SupplierRow> = {}): SupplierRow => ({
  sheet: 'Ivrea', editorial: 'Ivrea', title: 'ONE PIECE 016', isbn: '9789878196817',
  author: null, priceArs: 12000, excelRow: 4, ...over,
});

const opts = (over = {}) => ({
  divisor: DEFAULT_DIVISOR,
  supplierFile: 'ENTELEQUIA 11-9.xlsx',
  takenSlugs: new Set<string>(),
  importedAt: '2026-09-17T00:00:00.000Z',
  ...over,
});

describe('computePricePen', () => {
  it('divide por el divisor y redondea al entero', () => {
    expect(computePricePen(12000, 260)).toBe(46);
    expect(computePricePen(11000, 260)).toBe(42);
  });

  it('el divisor por defecto es 260', () => {
    expect(DEFAULT_DIVISOR).toBe(260);
  });

  it('respeta un divisor distinto', () => {
    expect(computePricePen(12000, 300)).toBe(40);
  });
});

describe('inferSeries', () => {
  it('saca el número de tomo del final', () => {
    expect(inferSeries('ONE PIECE 016')).toBe('ONE PIECE');
    expect(inferSeries('BLUE BOX 15')).toBe('BLUE BOX');
  });

  it('saca VOL y el número', () => {
    expect(inferSeries('BAKEMONOGATARI VOL 04')).toBe('BAKEMONOGATARI');
  });

  it('deja el título entero cuando no hay número de tomo', () => {
    expect(inferSeries('DRAGON BALL SUPER: BROLY')).toBe('DRAGON BALL SUPER: BROLY');
  });
});

describe('uniqueSlug', () => {
  it('devuelve el slug normal cuando está libre', () => {
    expect(uniqueSlug('ONE PIECE 016', new Set())).toBe('one-piece-016');
  });

  it('agrega sufijo cuando el slug ya está tomado', () => {
    expect(uniqueSlug('HOLLY', new Set(['holly']))).toBe('holly-2');
  });

  it('sigue incrementando mientras siga chocando', () => {
    expect(uniqueSlug('HOLLY', new Set(['holly', 'holly-2']))).toBe('holly-3');
  });

  it('no devuelve dos veces el mismo slug si se le pasa el mismo set', () => {
    const taken = new Set<string>();
    const a = uniqueSlug('QUINO INEDITO', taken); taken.add(a);
    const b = uniqueSlug('QUINO INEDITO', taken); taken.add(b);
    expect(a).not.toBe(b);
  });
});

describe('toProductRow', () => {
  it('arma la fila con los valores fijos del alta', () => {
    const p = toProductRow(row(), opts());
    expect(p.is_active).toBe(false);
    expect(p.stock_status).toBe('preorder');
    expect(p.stock).toBe(0);
    expect(p.country_code).toBe('AR');
    expect(p.type).toBe('manga');
    expect(p.editorial).toBe('Ivrea');
    expect(p.price_pen).toBe(46);
  });

  it('guarda la trazabilidad del proveedor en attributes', () => {
    const p = toProductRow(row(), opts());
    expect(p.attributes).toEqual({
      isbn: '9789878196817',
      supplier: 'Entelequia',
      supplier_price_ars: 12000,
      supplier_file: 'ENTELEQUIA 11-9.xlsx',
      imported_at: '2026-09-17T00:00:00.000Z',
    });
  });

  it('omite isbn de attributes cuando el proveedor no lo trae', () => {
    const p = toProductRow(row({ isbn: null }), opts());
    expect(p.attributes).not.toHaveProperty('isbn');
  });

  it('marca el slug como tomado para las filas siguientes del mismo lote', () => {
    const taken = new Set<string>();
    const a = toProductRow(row({ title: 'HOLLY' }), opts({ takenSlugs: taken }));
    const b = toProductRow(row({ title: 'HOLLY' }), opts({ takenSlugs: taken }));
    expect(a.slug).toBe('holly');
    expect(b.slug).toBe('holly-2');
  });

  it('respeta los slugs que ya están en el catálogo', () => {
    const p = toProductRow(row({ title: 'HOLLY' }), opts({ takenSlugs: new Set(['holly']) }));
    expect(p.slug).toBe('holly-2');
  });

  it('pasa el autor cuando la hoja lo trae', () => {
    expect(toProductRow(row({ author: 'Wakui, Ken' }), opts()).author).toBe('Wakui, Ken');
    expect(toProductRow(row(), opts()).author).toBeNull();
  });
});
```

- [ ] **Step 2: Correr los tests para verificar que fallan**

Run: `npm test -- toProductRow`
Expected: FAIL — `Failed to resolve import "./toProductRow"`

- [ ] **Step 3: Implementar `lib/suppliers/toProductRow.ts`**

```ts
import { generateSlug } from '@/lib/products';
import type { SupplierRow } from './types';

/**
 * Divisor por defecto para pasar de precio de tapa en ARS a soles. El admin lo
 * puede cambiar en pantalla: el tipo de cambio se mueve mes a mes y no tiene
 * sentido hardcodearlo.
 */
export const DEFAULT_DIVISOR = 260;

export const SUPPLIER_NAME = 'Entelequia';

export interface BuildOptions {
  divisor: number;
  supplierFile: string;
  /** Slugs ya usados, del catálogo y de las filas anteriores del lote. Se muta. */
  takenSlugs: Set<string>;
  importedAt: string;
}

/** La forma exacta que se inserta en `products`. */
export interface ProductInsert {
  slug: string;
  title: string;
  editorial: string;
  author: string | null;
  price_pen: number;
  stock: number;
  stock_status: 'preorder';
  country_code: 'AR';
  type: 'manga';
  series: string;
  is_active: false;
  attributes: Record<string, string | number>;
}

export function computePricePen(priceArs: number, divisor: number): number {
  return Math.round(priceArs / divisor);
}

/** "ONE PIECE 016" -> "ONE PIECE". Si no termina en número, el título entero. */
export function inferSeries(title: string): string {
  return String(title ?? '')
    .replace(/\s*\b(VOL|TOMO|N|NO|NRO)\b\.?\s*\d{1,3}\s*$/i, '')
    .replace(/\s+\d{1,3}\s*$/, '')
    .trim() || String(title ?? '').trim();
}

/**
 * Slug libre para este título. `taken` incluye los slugs del catálogo y los que
 * ya generó este mismo lote — el archivo real produce 6 colisiones, y como
 * `slug` es unique, una sola tumba el insert completo.
 */
export function uniqueSlug(title: string, taken: Set<string>): string {
  const base = generateSlug(title) || 'producto';
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export function toProductRow(row: SupplierRow, opts: BuildOptions): ProductInsert {
  const slug = uniqueSlug(row.title, opts.takenSlugs);
  opts.takenSlugs.add(slug);

  const attributes: Record<string, string | number> = {
    supplier: SUPPLIER_NAME,
    supplier_price_ars: row.priceArs,
    supplier_file: opts.supplierFile,
    imported_at: opts.importedAt,
  };
  if (row.isbn) attributes.isbn = row.isbn;

  return {
    slug,
    title: row.title,
    editorial: row.editorial,
    author: row.author,
    price_pen: computePricePen(row.priceArs, opts.divisor),
    stock: 0,
    stock_status: 'preorder',
    country_code: 'AR',
    type: 'manga',
    series: inferSeries(row.title),
    is_active: false,
    attributes,
  };
}
```

- [ ] **Step 4: Correr los tests para verificar que pasan**

Run: `npm test`
Expected: PASS — 4 archivos verdes.

- [ ] **Step 5: Commit**

```bash
git add lib/suppliers/
git commit -m "feat(suppliers): armado de la fila de producto con slug deduplicado

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Endpoint de análisis

**Files:**
- Create: `app/api/admin/suppliers/analyze/route.ts`
- Create: `lib/suppliers/catalog.ts`

**Interfaces:**
- Consumes: `verifyAdminRequest` de `@/lib/adminAuth`; `classifyRows` de `@/lib/suppliers/match`; `SupplierRow`, `CatalogEntry` de `@/lib/suppliers/types`.
- Produces:
  - `loadCatalogEntries(supabase: SupabaseClient): Promise<CatalogEntry[]>` en `lib/suppliers/catalog.ts`
  - `loadTakenSlugs(supabase: SupabaseClient): Promise<Set<string>>` en `lib/suppliers/catalog.ts` — lo consume el Task 6
  - `POST /api/admin/suppliers/analyze` → `{ nuevos: SupplierRow[]; aRevisar: ReviewRow[]; yaExistenCount: number }`

- [ ] **Step 1: Crear `lib/suppliers/catalog.ts`**

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CatalogEntry } from './types';

const PAGE = 1000;

/**
 * Trae del catálogo solo lo que el matcher necesita. Supabase corta en 1.000
 * filas por request y el catálogo pasa las 6.000, así que se pagina.
 */
export async function loadCatalogEntries(supabase: SupabaseClient): Promise<CatalogEntry[]> {
  const out: CatalogEntry[] = [];
  for (let from = 0; ; from += PAGE) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('products')
      .select('title, editorial, attributes')
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    for (const p of data) {
      out.push({
        title: p.title,
        editorial: p.editorial,
        isbn: (p.attributes?.isbn as string | undefined) ?? null,
      });
    }
    if (data.length < PAGE) break;
  }
  return out;
}

/** Slugs ya usados, para deduplicar los del lote nuevo. */
export async function loadTakenSlugs(supabase: SupabaseClient): Promise<Set<string>> {
  const out = new Set<string>();
  for (let from = 0; ; from += PAGE) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('products').select('slug').range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    for (const p of data) out.add(p.slug);
    if (data.length < PAGE) break;
  }
  return out;
}
```

- [ ] **Step 2: Crear `app/api/admin/suppliers/analyze/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { classifyRows } from '@/lib/suppliers/match';
import { loadCatalogEntries } from '@/lib/suppliers/catalog';
import type { SupplierRow } from '@/lib/suppliers/types';

/** Tope defensivo: la planilla real trae ~6.500 filas. */
const MAX_ROWS = 20000;

function isSupplierRow(value: unknown): value is SupplierRow {
  const r = value as Record<string, unknown>;
  return !!r
    && typeof r.title === 'string' && r.title.length > 0
    && typeof r.editorial === 'string' && r.editorial.length > 0
    && typeof r.priceArs === 'number' && Number.isFinite(r.priceArs)
    && (r.isbn === null || typeof r.isbn === 'string');
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const rows = (body as { rows?: unknown })?.rows;

  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: 'Falta el arreglo "rows"' }, { status: 400 });
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: `Demasiadas filas (máximo ${MAX_ROWS})` }, { status: 400 });
  }
  if (!rows.every(isSupplierRow)) {
    return NextResponse.json({ error: 'Alguna fila no tiene el formato esperado' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const catalog = await loadCatalogEntries(supabase);
    return NextResponse.json(classifyRows(rows, catalog));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al leer el catálogo' },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 3: Verificar que compila y el lint pasa**

Run: `npx tsc --noEmit && npm run lint`
Expected: sin errores.

- [ ] **Step 4: Verificar el endpoint a mano**

Arrancar el server (`npm run dev`), entrar a `/admin` para tener la cookie de sesión, y desde la consola del navegador:

```js
await (await fetch('/api/admin/suppliers/analyze', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ rows: [
    { sheet: 'Ivrea', editorial: 'Ivrea', title: 'ONE PIECE 016', isbn: null, author: null, priceArs: 12000, excelRow: 4 },
    { sheet: 'Ivrea', editorial: 'Ivrea', title: 'TITULO QUE NO EXISTE XYZ', isbn: null, author: null, priceArs: 12000, excelRow: 5 },
  ] }),
})).json()
```

Expected: `{ yaExistenCount: 1, nuevos: [ { title: 'TITULO QUE NO EXISTE XYZ', ... } ], aRevisar: [] }`

Verificar además que sin sesión devuelve 401 (abrir en ventana privada).

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/suppliers lib/suppliers/catalog.ts
git commit -m "feat(suppliers): endpoint de análisis contra el catálogo

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Endpoint de alta

**Files:**
- Create: `lib/sku.ts`
- Modify: `app/api/admin/products/route.ts` (importar `generateSku` en vez de definirlo)
- Create: `app/api/admin/suppliers/import/route.ts`

**Interfaces:**
- Consumes: `toProductRow`, `DEFAULT_DIVISOR` de `@/lib/suppliers/toProductRow`; `loadTakenSlugs` de `@/lib/suppliers/catalog`.
- Produces:
  - `generateSku(title: string): string` en `lib/sku.ts`
  - `POST /api/admin/suppliers/import` → `{ inserted: number; failed: { title: string; reason: string }[] }`

- [ ] **Step 1: Extraer `generateSku` a `lib/sku.ts`**

Hoy vive como función local en `app/api/admin/products/route.ts`. El endpoint nuevo la necesita y duplicarla haría que los SKU diverjan.

```ts
/**
 * SKU legible a partir del título: acrónimo de las primeras palabras más un
 * sufijo aleatorio para que no choque. Usado por el alta manual y por la
 * importación desde planilla del proveedor.
 */
export function generateSku(title: string): string {
  const acronym = title
    .replace(/vol\.?\s*\d+/gi, '')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join('');
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NCM-${acronym || 'PRD'}-${suffix}`;
}
```

- [ ] **Step 2: Usar el módulo compartido en el endpoint de productos**

En `app/api/admin/products/route.ts`, borrar la definición local de `generateSku` (está debajo de `revalidateProductCaches`) y agregar el import junto a los demás:

```ts
import { generateSku } from '@/lib/sku';
```

- [ ] **Step 3: Verificar que no se rompió el alta de productos**

Run: `npx tsc --noEmit && npm run lint`
Expected: sin errores. En particular, sin "generateSku is not defined".

- [ ] **Step 4: Crear `app/api/admin/suppliers/import/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { generateSku } from '@/lib/sku';
import { loadTakenSlugs } from '@/lib/suppliers/catalog';
import { toProductRow } from '@/lib/suppliers/toProductRow';
import { getEditorialsForCountry } from '@/lib/constants/editorials';
import type { SupplierRow } from '@/lib/suppliers/types';

/** Supabase se pone lento con inserts muy grandes; se manda de a tandas. */
const BATCH_SIZE = 500;

const ALLOWED_EDITORIALS = new Set(getEditorialsForCountry('AR'));

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null) as
    { rows?: SupplierRow[]; divisor?: number; supplierFile?: string } | null;

  const rows = body?.rows;
  const divisor = body?.divisor;

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'No hay filas para importar' }, { status: 400 });
  }
  if (typeof divisor !== 'number' || !Number.isFinite(divisor) || divisor <= 0) {
    return NextResponse.json({ error: 'El divisor tiene que ser un número mayor a 0' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const failed: { title: string; reason: string }[] = [];
  const toInsert: Record<string, unknown>[] = [];
  const importedAt = new Date().toISOString();
  const supplierFile = body?.supplierFile ?? 'sin nombre';

  let takenSlugs: Set<string>;
  try {
    takenSlugs = await loadTakenSlugs(supabase);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al leer los slugs existentes' },
      { status: 500 },
    );
  }

  for (const row of rows) {
    if (!ALLOWED_EDITORIALS.has(row.editorial)) {
      failed.push({ title: row.title, reason: `Editorial no permitida: ${row.editorial}` });
      continue;
    }
    const product = toProductRow(row, { divisor, supplierFile, takenSlugs, importedAt });
    // La tabla tiene check (price_pen > 0): un precio que redondea a 0 tumba el lote.
    if (product.price_pen <= 0) {
      failed.push({ title: row.title, reason: `El precio queda en 0 con divisor ${divisor}` });
      continue;
    }
    toInsert.push({ ...product, sku: generateSku(product.title) });
  }

  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('products').insert(batch).select('id');
    if (error) {
      for (const b of batch) failed.push({ title: String(b.title), reason: error.message });
      continue;
    }
    inserted += data?.length ?? 0;
  }

  if (inserted > 0) {
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/sitemap.xml');
    revalidateTag('products', 'max');
  }

  return NextResponse.json({ inserted, failed });
}
```

- [ ] **Step 5: Verificar que compila y el lint pasa**

Run: `npx tsc --noEmit && npm run lint`
Expected: sin errores.

- [ ] **Step 6: Probar el alta con una fila y borrarla**

Con el server andando y sesión de admin, desde la consola del navegador:

```js
await (await fetch('/api/admin/suppliers/import', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    divisor: 260, supplierFile: 'prueba.xlsx',
    rows: [{ sheet: 'Ivrea', editorial: 'Ivrea', title: 'PRUEBA IMPORTACION PROVEEDOR',
             isbn: '9789999999999', author: null, priceArs: 12000, excelRow: 1 }],
  }),
})).json()
```

Expected: `{ inserted: 1, failed: [] }`

Verificar en `/admin` → Productos, filtrando por inactivos, que aparece "PRUEBA IMPORTACION PROVEEDOR" con precio S/ 46, estado Preventa y sin publicar. **Borrarlo desde el panel antes de seguir.**

Probar también que un divisor inválido se rechaza:

```js
await (await fetch('/api/admin/suppliers/import', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ divisor: 0, rows: [{ sheet: 'Ivrea', editorial: 'Ivrea', title: 'X', isbn: null, author: null, priceArs: 1, excelRow: 1 }] }),
})).json()
```

Expected: `{ error: 'El divisor tiene que ser un número mayor a 0' }` con status 400.

- [ ] **Step 7: Commit**

```bash
git add lib/sku.ts lib/suppliers app/api/admin
git commit -m "feat(suppliers): endpoint de alta masiva desde la planilla

Extrae generateSku a lib/sku.ts para no duplicarlo entre el alta manual
y la importación.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Pantalla de importación

**Files:**
- Create: `app/admin/suppliers/useSupplierImport.ts`
- Create: `app/admin/suppliers/SupplierImportPanel.tsx`
- Modify: `app/admin/page.tsx` (pestaña nueva)

**Interfaces:**
- Consumes: `parseEntelequiaWorkbook` de `@/lib/suppliers/entelequia`; `DEFAULT_DIVISOR`, `computePricePen` de `@/lib/suppliers/toProductRow`; `ReviewRow` de `@/lib/suppliers/match`; los dos endpoints del Task 5 y 6.
- Produces: `<SupplierImportPanel />`, montado en la pestaña `suppliers` de `/admin`.

- [ ] **Step 1: Crear el hook `app/admin/suppliers/useSupplierImport.ts`**

```ts
'use client';

import { useCallback, useState } from 'react';
import { parseEntelequiaWorkbook } from '@/lib/suppliers/entelequia';
import { DEFAULT_DIVISOR } from '@/lib/suppliers/toProductRow';
import type { ParseResult, SupplierRow } from '@/lib/suppliers/types';
import type { ReviewRow } from '@/lib/suppliers/match';

export type Step = 'select' | 'analyzing' | 'review' | 'importing' | 'done';

interface Analysis {
  nuevos: SupplierRow[];
  aRevisar: ReviewRow[];
  yaExistenCount: number;
}

/**
 * Clave estable de una fila: hoja + número de fila del Excel. A nivel de módulo
 * y no dentro del hook, para que los useCallback no la tengan como dependencia.
 */
export const keyOf = (r: SupplierRow): string => `${r.sheet}:${r.excelRow}`;

export function useSupplierImport() {
  const [step, setStep] = useState<Step>('select');
  const [fileName, setFileName] = useState('');
  const [parse, setParse] = useState<ParseResult | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [divisor, setDivisor] = useState(DEFAULT_DIVISOR);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ inserted: number; failed: { title: string; reason: string }[] } | null>(null);

  const analyze = useCallback(async (file: File) => {
    setError(null);
    setFileName(file.name);
    setStep('analyzing');
    try {
      const parsed = parseEntelequiaWorkbook(await file.arrayBuffer());
      setParse(parsed);

      const res = await fetch('/api/admin/suppliers/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsed.rows }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error al analizar la planilla');

      setAnalysis(json);
      // Los nuevos vienen tildados; los dudosos, no.
      setSelected(new Set(json.nuevos.map(keyOf)));
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al leer el archivo');
      setStep('select');
    }
  }, []);

  const toggle = useCallback((row: SupplierRow) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const k = keyOf(row);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }, []);

  const toggleMany = useCallback((rows: SupplierRow[], on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      rows.forEach((r) => (on ? next.add(keyOf(r)) : next.delete(keyOf(r))));
      return next;
    });
  }, []);

  const runImport = useCallback(async () => {
    if (!analysis) return;
    const all = [...analysis.nuevos, ...analysis.aRevisar];
    const rows = all.filter((r) => selected.has(keyOf(r)));
    if (!rows.length) return;

    setStep('importing');
    setError(null);
    try {
      const res = await fetch('/api/admin/suppliers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, divisor, supplierFile: fileName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error al importar');
      setResult(json);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al importar');
      setStep('review');
    }
  }, [analysis, selected, divisor, fileName]);

  const reset = useCallback(() => {
    setStep('select'); setParse(null); setAnalysis(null);
    setSelected(new Set()); setResult(null); setError(null); setFileName('');
  }, []);

  return {
    step, fileName, parse, analysis, selected, divisor, error, result,
    setDivisor, analyze, toggle, toggleMany, runImport, reset,
  };
}
```

- [ ] **Step 2: Crear `app/admin/suppliers/SupplierImportPanel.tsx`**

```tsx
'use client';

import { useMemo, useRef, useState } from 'react';
import { FileSpreadsheet, Upload, Loader2, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { computePricePen } from '@/lib/suppliers/toProductRow';
import type { SupplierRow } from '@/lib/suppliers/types';
import { keyOf, useSupplierImport } from './useSupplierImport';

const card = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700';

export default function SupplierImportPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const {
    step, fileName, parse, analysis, selected, divisor, error, result,
    setDivisor, analyze, toggle, toggleMany, runImport, reset,
  } = useSupplierImport();

  /** Los nuevos agrupados por editorial, filtrados por el buscador. */
  const groups = useMemo(() => {
    if (!analysis) return [] as { editorial: string; rows: SupplierRow[] }[];
    const q = search.trim().toLowerCase();
    const map = new Map<string, SupplierRow[]>();
    for (const row of analysis.nuevos) {
      if (q && !row.title.toLowerCase().includes(q)) continue;
      const list = map.get(row.editorial);
      if (list) list.push(row); else map.set(row.editorial, [row]);
    }
    return [...map.entries()]
      .map(([editorial, rows]) => ({ editorial, rows }))
      .sort((a, b) => b.rows.length - a.rows.length);
  }, [analysis, search]);

  const selectedCount = selected.size;

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Subir */}
      {(step === 'select' || step === 'analyzing') && (
        <div
          className={`${card} border-2 border-dashed p-10 text-center cursor-pointer hover:border-[#2b496d] dark:hover:border-[#5a7a9e] transition-colors`}
          onClick={() => step === 'select' && fileRef.current?.click()}
        >
          {step === 'analyzing'
            ? <Loader2 className="mx-auto text-[#2b496d] animate-spin mb-3" size={40} />
            : <Upload className="mx-auto text-gray-400 mb-3" size={40} />}
          <p className="font-medium text-gray-600 dark:text-gray-400">
            {step === 'analyzing' ? 'Analizando la planilla...' : 'Subí la planilla del proveedor (Entelequia)'}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Se procesan las hojas Ivrea, Ovnipress, Panini-Utopia y Penguin
          </p>
          <input
            ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) analyze(f); e.target.value = ''; }}
          />
        </div>
      )}

      {/* Revisión */}
      {analysis && parse && (step === 'review' || step === 'importing') && (
        <>
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
              <FileSpreadsheet size={16} /> {fileName}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                ['Filas leídas', parse.rows.length, ''],
                ['Ya las tenés', analysis.yaExistenCount, 'text-gray-500'],
                ['Nuevas', analysis.nuevos.length, 'text-green-600 dark:text-green-400'],
                ['A revisar', analysis.aRevisar.length, 'text-amber-600 dark:text-amber-400'],
              ].map(([label, value, cls]) => (
                <div key={String(label)}>
                  <div className={`text-2xl font-bold ${cls}`}>{value as number}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{label as string}</div>
                </div>
              ))}
            </div>

            {parse.ignoredSheets.length > 0 && (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Hojas no procesadas:{' '}
                {parse.ignoredSheets.map((s) => `${s.sheet} (${s.rows})`).join(', ')}
              </p>
            )}
            {parse.discarded.length > 0 && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {parse.discarded.length} filas descartadas por no tener precio o título válido.
              </p>
            )}
          </div>

          {/* Divisor */}
          <div className={`${card} p-5 flex flex-wrap items-center gap-3`}>
            <label htmlFor="divisor" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Dividir el precio de tapa (ARS) por
            </label>
            <input
              id="divisor" type="number" min={1} value={divisor}
              onChange={(e) => setDivisor(Number(e.target.value))}
              className="w-28 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1.5 text-sm"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              para obtener el precio en soles, redondeado al entero.
            </span>
          </div>

          {/* Buscador */}
          <input
            type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-2 text-sm"
          />

          {/* Nuevos por editorial */}
          {groups.map(({ editorial, rows }) => {
            const allOn = rows.every((r) => selected.has(keyOf(r)));
            return (
              <div key={editorial} className={card}>
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {editorial} <span className="text-gray-400 font-normal">({rows.length})</span>
                  </h3>
                  <button
                    onClick={() => toggleMany(rows, !allOn)}
                    className="text-sm text-[#2b496d] dark:text-[#5a7a9e] hover:underline"
                  >
                    {allOn ? 'Destildar todo' : 'Tildar todo'}
                  </button>
                </div>
                <RowTable rows={rows} selected={selected} toggle={toggle} divisor={divisor} />
              </div>
            );
          })}

          {/* A revisar */}
          {analysis.aRevisar.length > 0 && (
            <div className={card}>
              <div className="border-b border-gray-200 dark:border-gray-700 px-5 py-3">
                <h3 className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
                  <AlertTriangle size={16} /> A revisar ({analysis.aRevisar.length})
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Parecen reediciones o ediciones especiales. Vienen destildadas: comprobá contra
                  el título parecido del catálogo antes de darlas de alta.
                </p>
              </div>
              <RowTable
                rows={analysis.aRevisar} selected={selected}
                toggle={toggle} divisor={divisor} showSimilar
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <button onClick={reset} className="text-sm text-gray-500 hover:underline">
              Empezar de nuevo
            </button>
            <button
              onClick={runImport}
              disabled={selectedCount === 0 || step === 'importing'}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2b496d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e3550] disabled:opacity-50"
            >
              {step === 'importing' && <Loader2 size={16} className="animate-spin" />}
              Dar de alta {selectedCount} como borrador
            </button>
          </div>
        </>
      )}

      {/* Resultado */}
      {step === 'done' && result && (
        <div className={`${card} p-8 text-center`}>
          <CheckCircle className="mx-auto mb-3 text-green-500" size={44} />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {result.inserted} productos creados como borrador
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No se ven en la tienda hasta que los actives desde Productos.
          </p>
          {result.failed.length > 0 && (
            <div className="mt-5 text-left">
              <p className="mb-2 text-sm font-medium text-red-600">
                {result.failed.length} no se pudieron crear:
              </p>
              <ul className="max-h-48 overflow-y-auto text-xs text-gray-500 dark:text-gray-400 space-y-1">
                {result.failed.map((f, i) => <li key={i}>{f.title} — {f.reason}</li>)}
              </ul>
            </div>
          )}
          <button onClick={reset} className="mt-6 text-sm text-[#2b496d] dark:text-[#5a7a9e] hover:underline">
            Subir otra planilla
          </button>
        </div>
      )}
    </div>
  );
}

interface RowTableProps {
  rows: (SupplierRow & { similar?: string | null })[];
  selected: Set<string>;
  toggle: (r: SupplierRow) => void;
  divisor: number;
  showSimilar?: boolean;
}

function RowTable({ rows, selected, toggle, divisor, showSimilar }: RowTableProps) {
  return (
    <div className="max-h-96 overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 text-xs uppercase text-gray-500">
          <tr>
            <th className="w-10 px-4 py-2" />
            <th className="px-4 py-2 text-left">Título</th>
            {showSimilar && <th className="px-4 py-2 text-left">Parecido en catálogo</th>}
            <th className="px-4 py-2 text-left">Autor</th>
            <th className="px-4 py-2 text-left">ISBN</th>
            <th className="px-4 py-2 text-right">ARS</th>
            <th className="px-4 py-2 text-right">S/</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={keyOf(row)} className="border-t border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2">
                <input
                  type="checkbox" checked={selected.has(keyOf(row))} onChange={() => toggle(row)}
                  aria-label={`Seleccionar ${row.title}`}
                />
              </td>
              <td className="px-4 py-2 text-gray-900 dark:text-white">{row.title}</td>
              {showSimilar && (
                <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{row.similar ?? '—'}</td>
              )}
              <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{row.author ?? '—'}</td>
              <td className="px-4 py-2 font-mono text-xs text-gray-500 dark:text-gray-400">{row.isbn ?? '—'}</td>
              <td className="px-4 py-2 text-right text-gray-500 dark:text-gray-400">
                {row.priceArs.toLocaleString('es-AR')}
              </td>
              <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">
                {computePricePen(row.priceArs, divisor)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Montar la pestaña en `app/admin/page.tsx`**

Tres cambios en el archivo:

1. En el import de `lucide-react`, agregar `FileSpreadsheet` a la lista.
2. Agregar el import del panel junto a los otros managers:

```tsx
import SupplierImportPanel from './suppliers/SupplierImportPanel';
```

3. Sumar `'suppliers'` al type de pestañas:

```tsx
type AdminTab = 'products' | 'suppliers' | 'promotions' | 'campaigns' | 'images' | 'legend' | 'banners';
```

4. Agregar el botón en el `<nav>`, justo después del de Productos:

```tsx
<button onClick={() => setActiveTab('suppliers')} className={tabClass('suppliers')}>
  <FileSpreadsheet size={18} /> Proveedor
</button>
```

5. Agregar el render condicional. En el bloque que arranca con `{/* Products Tab */}`, dejarlo así:

```tsx
        {/* Products Tab */}
        {activeTab === 'products' && <ProductsManager />}

        {/* Supplier Tab */}
        {activeTab === 'suppliers' && <SupplierImportPanel />}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && <PromotionsManager />}
```

- [ ] **Step 4: Verificar que compila y el lint pasa**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: sin errores, tests verdes.

- [ ] **Step 5: Commit**

```bash
git add app/admin
git commit -m "feat(admin): pestaña Proveedor para importar la planilla de Entelequia

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: Verificación end-to-end con el archivo real

Comprobar el flujo completo contra la planilla real antes de dar por terminado. No se inserta nada en este task salvo la prueba controlada del último paso.

**Files:** ninguno (solo verificación).

- [ ] **Step 1: Levantar el preview**

Usar la herramienta de preview del entorno (`preview_start`) con el dev server del proyecto, no `npm run dev` por Bash. Si no existe `.claude/launch.json`, crearlo:

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "nekomangacix", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 3000 }
  ]
}
```

- [ ] **Step 2: Entrar al admin y abrir la pestaña Proveedor**

Navegar a `/admin`, autenticarse con el PIN, y clickear "Proveedor".

- [ ] **Step 3: Subir el archivo real y contrastar el resumen**

Subir `/Volumes/Neko/Downloads/ENTELEQUIA DISTRIBUCIÓN 11-9.xlsx`.

Expected en el resumen:

| Métrica | Valor |
|---|---:|
| Filas leídas | 6.483 |
| Ya las tenés | 5.894 |
| Nuevas | 569 |
| A revisar | 20 |

Y en "Hojas no procesadas": Merchandising, Planeta, Deux-PopFiction, Hotel de las Ideas, V&R, Otras, Totales.

Si los números difieren, hay un bug: comparar contra el Step 6 del Task 2 para aislar si es del parser o del clasificador.

- [ ] **Step 4: Verificar los grupos por editorial**

Expected: Penguin 412, Ivrea 115, Ovnipress 39, Panini Argentina 2, Utopía Editorial 1.

- [ ] **Step 5: Verificar que el divisor recalcula en vivo**

Cambiar el divisor de 260 a 130 y confirmar que la columna S/ de la primera fila duplica su valor. Volver a 260.

- [ ] **Step 6: Verificar la sección "A revisar"**

Expected: 20 filas, todas destildadas, y `KODANSHA - AKIRA Vol. 01 (4ta Edición)` con un título parecido del catálogo en su columna.

- [ ] **Step 7: Alta controlada de una sola fila**

Destildar todo, tildar una sola fila nueva, dar de alta. Confirmar el mensaje de éxito con `1` y `failed: []`.

Ir a Productos, filtrar por inactivos, y verificar que el producto aparece con: precio en soles correcto, estado Preventa, editorial de su hoja, y el ISBN visible en el detalle. **Borrarlo después.**

- [ ] **Step 8: Verificar que no quedó nada publicado por error**

En `/products` (la tienda), buscar el título de prueba. Expected: no aparece — se creó con `is_active: false`.

- [ ] **Step 9: Correr la verificación completa**

Run: `npm test && npm run lint && npx tsc --noEmit && npm run build`
Expected: todo verde.

- [ ] **Step 10: Commit final si hubo ajustes**

```bash
git add -A
git commit -m "fix(suppliers): ajustes de la verificación end-to-end

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Notas para quien implemente

**Por qué `raw: true` no es negociable.** La planilla guarda muchos ISBN como celdas numéricas. Leyendo formateado, `xlsx` los entrega como `"9.78608E+12"` — parece un dato roto, pero el número está entero abajo. Si cambiás ese flag "porque el texto es más seguro", el match por ISBN cae del 99,8% al 90% y cientos de productos que ya existen se cargan duplicados.

**Por qué el slug se deduplica.** `products.slug` es `unique`. El archivo real produce 6 colisiones (2 contra el catálogo, 4 dentro del mismo lote). Como el insert va por tandas de 500, una sola colisión tumba 500 filas de una.

**Por qué "a revisar" tiene falsos positivos.** El filtro busca palabras como "deluxe" o "kanzenban" en el título. `POKEMON. SUPER MEGA ULTRA DELUXE GUIA ESENCIAL` cae ahí y es un título nuevo legítimo. Está bien así: revisar 20 filas a mano cuesta menos que descubrir un duplicado publicado en la tienda.

**El alcance es solo dar de alta lo nuevo.** No actualizar precios de lo existente, no desactivar lo que desapareció de la planilla, no persistir la sesión de importación. Si alguna de esas cosas parece necesaria mientras implementás, no la agregues: son decisiones que el spec descartó a propósito.

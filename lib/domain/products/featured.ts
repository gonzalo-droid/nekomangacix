/**
 * Curación del home.
 *
 * El flag vive en `products.attributes.featured` (booleano) en vez de una
 * columna propia: la migración 010 ya dejó un índice GIN sobre `attributes`,
 * así que la consulta por contención (`attributes @> {"featured": true}`)
 * lo aprovecha sin necesidad de migrar el esquema.
 *
 * El home agrupa por país, así que cada país destaca sus propios productos.
 */

export const FEATURED_ATTRIBUTE = 'featured';

/** Filtro de contención para PostgREST / supabase-js `.contains()`. */
export const FEATURED_FILTER = { [FEATURED_ATTRIBUTE]: true } as const;

/** Máximo de destacados que el home muestra por país. */
export const MAX_FEATURED_PER_COUNTRY = 10;

/**
 * Columnas que necesita `ProductCard`. Traer `*` significaba arrastrar
 * `full_description` (sinopsis largas) y specs de cada fila.
 */
export const CARD_COLUMNS = [
  'id',
  'sku',
  'slug',
  'title',
  'type',
  'editorial',
  'country_code',
  'author',
  'price_pen',
  'stock',
  'stock_status',
  'preorder_deposit',
  'estimated_arrival',
  'eta_text',
  'series',
  'series_status',
  'demographic',
  'description',
  'images',
  'tags',
  'attributes',
].join(',');

export function isFeatured(attributes: Record<string, unknown> | null | undefined): boolean {
  return attributes?.[FEATURED_ATTRIBUTE] === true;
}

/**
 * Aplica o quita el flag sin pisar el resto de atributos del producto.
 */
export function withFeaturedFlag(
  attributes: Record<string, unknown> | null | undefined,
  featured: boolean,
): Record<string, unknown> {
  const next = { ...(attributes ?? {}) };
  if (featured) {
    next[FEATURED_ATTRIBUTE] = true;
  } else {
    delete next[FEATURED_ATTRIBUTE];
  }
  return next;
}

/**
 * Opciones del catálogo que también usa el navegador. Viven aparte de
 * `catalog.ts` porque ese módulo importa el cliente de Supabase, y con solo
 * tocarlo desde un componente cliente viajaban ~50 KB a todos los visitantes.
 */

export const ITEMS_PER_PAGE = 18;

/** Mínimo de caracteres para que una búsqueda llegue a la base. */
export const MIN_SEARCH_LENGTH = 3;

/**
 * `recommended`: primero lo que está en stock (se entrega ya), después las
 * preventas y al final los agotados; dentro de cada grupo, por título.
 * Antes el orden por defecto era alfabético y el catálogo abría con 18
 * preventas y una imagen rota, mientras los 155 productos en stock solo
 * aparecían si alguien filtraba. "Más recientes" se quitó: el catálogo se
 * importó en bloque y la fecha de alta no dice nada.
 */
export const SORT_OPTIONS = ['recommended', 'name_asc', 'price_asc', 'price_desc'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
export const DEFAULT_SORT: SortOption = 'recommended';

import { unstable_cache } from 'next/cache';
import { COUNTRIES, COUNTRY_CODES, type CountryCode } from '@/lib/constants/countries';
import { parseCatalogQuery, queryCatalogFacets } from './catalog';

/**
 * Países que hoy tienen al menos un producto activo.
 *
 * Los textos del sitio nombraban Argentina, México, España y Japón aunque el
 * catálogo solo tuviera dos de ellos. Con esto un país aparece en la portada
 * cuando se le carga el primer producto, y deja de aparecer si se queda vacío.
 */
export const getAvailableCountries = unstable_cache(
  async (): Promise<CountryCode[]> => {
    const facets = await queryCatalogFacets(parseCatalogQuery({}));
    return COUNTRY_CODES.filter((code) => (facets.country[code] ?? 0) > 0);
  },
  ['catalog-available-countries'],
  { revalidate: 300, tags: ['products'] },
);

/** "Argentina", "Argentina y Japón", "Argentina, México y Japón". */
export function formatCountryNames(codes: readonly CountryCode[]): string[] {
  return codes.map((code) => COUNTRIES[code].name);
}

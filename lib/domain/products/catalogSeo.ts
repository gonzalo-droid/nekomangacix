import { COUNTRIES, type CountryCode } from '@/lib/constants/countries';
import { ALL_EDITORIALS } from '@/lib/constants/editorials';
import type { ProductType } from '@/lib/constants/productTypes';
import { DEFAULT_SORT, isDefaultQuery, type CatalogQuery } from './catalog';

export interface CatalogSeo {
  /** Sin la marca. */
  title: string;
  /** Encabezado visible de la página. `null` = el del catálogo general. */
  heading: string | null;
  description: string;
  /** Ruta canónica, o `null` cuando la vista no debe indexarse. */
  path: string | null;
  index: boolean;
}

const SHIPPING = 'Envíos a todo el Perú desde Chiclayo.';

const BASE: CatalogSeo = {
  title: 'Catálogo de manga y coleccionables',
  heading: null,
  description: `Catálogo de manga en español y coleccionables originales: filtra por editorial, tipo, precio y disponibilidad. ${SHIPPING}`,
  path: '/products',
  index: true,
};

const TYPE_VIEWS: Record<ProductType, { title: string; description: string }> = {
  manga: {
    title: 'Manga en español',
    description: `Manga en español de las principales editoriales, tomo por tomo. ${SHIPPING}`,
  },
  figure: {
    title: 'Figuras y coleccionables de anime',
    description: `Figuras y coleccionables originales de anime. ${SHIPPING}`,
  },
  special_edition: {
    title: 'Ediciones especiales de manga',
    description: `Ediciones especiales, box sets y tomos de colección. ${SHIPPING}`,
  },
  merch: {
    title: 'Merchandising de anime',
    description: `Merchandising original de anime y manga. ${SHIPPING}`,
  },
  protective_sleeve: {
    title: 'Fundas protectoras para manga',
    description: `Fundas protectoras para cuidar tu colección de manga. ${SHIPPING}`,
  },
  comic: {
    title: 'Cómics',
    description: `Cómics en español. ${SHIPPING}`,
  },
};

const STOCK_VIEWS: Record<string, { title: string; description: string }> = {
  preorder: {
    title: 'Preventas de manga',
    description: `Reserva tu manga en preventa y asegura tu tomo antes de que llegue. ${SHIPPING}`,
  },
  in_stock: {
    title: 'Manga y coleccionables en stock',
    description: `Productos en stock, listos para enviar. ${SHIPPING}`,
  },
};

/** Vista filtrada que no merece página propia en Google. */
function notIndexable(): CatalogSeo {
  return { ...BASE, path: null, index: false };
}

/**
 * Qué decirle a los buscadores sobre una vista del catálogo.
 *
 * Los filtros se combinan de miles de formas y casi todas son la misma lista
 * reordenada, así que solo se indexa el catálogo general y las vistas de un
 * único filtro que alguien buscaría por sí mismas: un tipo de producto, las
 * preventas, lo que hay en stock, una editorial o un país de origen. El resto
 * (búsquedas, combinaciones, orden, rango de precio, página 2 en adelante)
 * sale con `noindex, follow`.
 *
 * El valor del filtro llega de la URL, así que solo se aceptan valores de
 * listas conocidas: nadie debe poder fabricar una página indexable con un
 * título arbitrario enlazando `?editorial=cualquier-cosa`.
 */
export function describeCatalogView(
  q: CatalogQuery,
  availableCountries: readonly CountryCode[],
): CatalogSeo {
  if (isDefaultQuery(q)) return BASE;

  const hasFreeFilters =
    Boolean(q.search) || Boolean(q.author) || Boolean(q.series) ||
    q.minPrice !== null || q.maxPrice !== null || q.demographics.length > 0;
  const facetValues =
    q.types.length + q.countries.length + q.editorials.length + q.stock.length;

  if (hasFreeFilters || facetValues !== 1 || q.sort !== DEFAULT_SORT || q.page !== 1) {
    return notIndexable();
  }

  if (q.types.length === 1) {
    const view = TYPE_VIEWS[q.types[0]];
    return { ...view, heading: view.title, path: `/products?type=${q.types[0]}`, index: true };
  }

  if (q.stock.length === 1) {
    const view = STOCK_VIEWS[q.stock[0]];
    if (!view) return notIndexable();
    return { ...view, heading: view.title, path: `/products?stock=${q.stock[0]}`, index: true };
  }

  if (q.editorials.length === 1) {
    const editorial = q.editorials[0];
    if (!ALL_EDITORIALS.includes(editorial)) return notIndexable();
    const title = `Catálogo ${editorial} en Perú`;
    return {
      title,
      heading: `Catálogo ${editorial}`,
      description: `Todos los títulos de ${editorial} disponibles en Perú, en stock y en preventa. ${SHIPPING}`,
      path: `/products?editorial=${encodeURIComponent(editorial)}`,
      index: true,
    };
  }

  const country = q.countries[0];
  if (!country || !availableCountries.includes(country)) return notIndexable();
  const countryName = COUNTRIES[country].name;
  const title = `Manga y coleccionables de ${countryName}`;
  return {
    title,
    heading: title,
    description: `Ediciones traídas de ${countryName}: manga y coleccionables originales. ${SHIPPING}`,
    path: `/products?country=${country}`,
    index: true,
  };
}

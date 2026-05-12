import type { Product, StockStatus, Category, SeriesStatus, CountryGroupLegacy } from './products';
import type { CountryCode } from './constants/countries';
import type { Demographic } from './constants/demographics';
import type { ProductType, Language } from './constants/productTypes';
import { getCloudinaryUrl } from './cloudinary';

const COUNTRY_GROUP_TO_CODE: Record<CountryGroupLegacy, CountryCode> = {
  Argentina: 'AR',
  'México': 'MX',
  'España': 'ES',
  'Japón': 'JP',
};

const COUNTRY_CODE_TO_GROUP: Record<CountryCode, CountryGroupLegacy> = {
  AR: 'Argentina',
  MX: 'México',
  ES: 'España',
  JP: 'Japón',
};

function normalizeStockStatus(value: unknown): StockStatus {
  if (value === 'on_demand') return 'preorder';
  if (value === 'in_stock' || value === 'preorder' || value === 'out_of_stock') return value;
  return 'in_stock';
}

export function dbRowToProduct(row: Record<string, unknown>): Product {
  const specs = (row.specifications as Record<string, unknown>) ?? {};
  const rawCountryCode = row.country_code as string | null | undefined;
  const rawCountryGroup = row.country_group as CountryGroupLegacy | null | undefined;
  const countryCode: CountryCode =
    (rawCountryCode as CountryCode) ??
    (rawCountryGroup ? COUNTRY_GROUP_TO_CODE[rawCountryGroup] : 'AR');
  const countryGroup = COUNTRY_CODE_TO_GROUP[countryCode];

  return {
    id: row.id as string,
    sku: row.sku as string,
    slug: row.slug as string,
    title: row.title as string,
    type: ((row.type as ProductType) ?? 'manga'),
    editorial: row.editorial as string,
    countryCode,
    countryGroup,
    author: (row.author as string) ?? '',
    pricePEN: row.price_pen as number,
    stock: (row.stock as number) ?? 0,
    stockStatus: normalizeStockStatus(row.stock_status),
    estimatedArrival: (row.estimated_arrival as string) ?? undefined,
    etaText: ((row.eta_text as string) ?? (row.estimated_arrival as string)) ?? undefined,
    preorderDeposit: (row.preorder_deposit as number) ?? undefined,
    tags: (row.tags as string[]) ?? [],
    description: (row.description as string) ?? '',
    fullDescription: (row.full_description as string) ?? '',
    specifications: {
      pages: specs.pages as number | undefined,
      format: specs.format as string | undefined,
      language: specs.language as string | undefined,
      isbn: specs.isbn as string | undefined,
      releaseDate: specs.releaseDate as string | undefined,
      dimensions: specs.dimensions as string | undefined,
      weight: specs.weight as string | undefined,
    },
    volume: (row.volume as number) ?? (row.volume_number as number) ?? undefined,
    volumeNumber: (row.volume_number as number) ?? (row.volume as number) ?? undefined,
    series: (row.series as string) ?? undefined,
    seriesStatus: (row.series_status as SeriesStatus) ?? undefined,
    demographic: (row.demographic as Demographic) ?? undefined,
    language: ((row.language as Language) ?? 'es'),
    figureScale: (row.figure_scale as string) ?? undefined,
    manufacturer: (row.manufacturer as string) ?? undefined,
    images: ((row.images as string[]) ?? []).map(getCloudinaryUrl).filter(Boolean),
    category: row.category as Category,
  };
}

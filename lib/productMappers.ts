import type { Product, StockStatus, SeriesStatus } from './products';
import type { CountryCode } from './constants/countries';
import type { Demographic } from './constants/demographics';
import type { ProductType } from './constants/productTypes';
import { getCloudinaryUrl } from './cloudinary';

const COUNTRY_GROUP_TO_CODE: Record<string, CountryCode> = {
  Argentina: 'AR',
  'México': 'MX',
  'España': 'ES',
  'Japón': 'JP',
};

function normalizeStockStatus(value: unknown): StockStatus {
  if (value === 'on_demand') return 'preorder';
  if (value === 'in_stock' || value === 'preorder' || value === 'out_of_stock') return value;
  return 'in_stock';
}

export function dbRowToProduct(row: Record<string, unknown>): Product {
  const rawCountryCode = row.country_code as string | null | undefined;
  const rawCountryGroup = row.country_group as string | null | undefined;
  const countryCode: CountryCode =
    (rawCountryCode as CountryCode) ??
    (rawCountryGroup ? COUNTRY_GROUP_TO_CODE[rawCountryGroup] : 'AR');

  // Merge legacy specs into attributes if attributes is empty
  const rawAttributes = (row.attributes as Record<string, string | number | boolean>) ?? {};
  const specs = (row.specifications as Record<string, unknown>) ?? {};
  const attributes: Record<string, string | number | boolean> = Object.keys(rawAttributes).length
    ? rawAttributes
    : Object.fromEntries(
        Object.entries(specs)
          .filter(([, v]) => v != null && v !== '')
          .map(([k, v]) => [k, v as string | number | boolean])
      );

  return {
    id: row.id as string,
    sku: row.sku as string,
    slug: row.slug as string,
    title: row.title as string,
    type: ((row.type as ProductType) ?? 'manga'),
    editorial: row.editorial as string,
    countryCode,
    author: (row.author as string) ?? undefined,
    pricePEN: row.price_pen as number,
    stock: (row.stock as number) ?? 0,
    stockStatus: normalizeStockStatus(row.stock_status),
    estimatedArrival: (row.estimated_arrival as string) ?? undefined,
    etaText: ((row.eta_text as string) ?? undefined),
    preorderDeposit: (row.preorder_deposit as number) ?? undefined,
    tags: (row.tags as string[]) ?? [],
    description: (row.description as string) ?? undefined,
    fullDescription: (row.full_description as string) ?? undefined,
    series: (row.series as string) ?? undefined,
    seriesStatus: (row.series_status as SeriesStatus) ?? undefined,
    demographic: (row.demographic as Demographic) ?? undefined,
    images: ((row.images as string[]) ?? []).map(getCloudinaryUrl).filter(Boolean),
    attributes: Object.keys(attributes).length ? attributes : undefined,
  };
}

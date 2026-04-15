import type { Product, StockStatus, Category } from './products';
import { getCloudinaryUrl } from './cloudinary';

type CountryGroup = 'Argentina' | 'México' | 'España' | 'Coleccionables';

export function dbRowToProduct(row: Record<string, unknown>): Product {
  const specs = (row.specifications as Record<string, unknown>) ?? {};
  return {
    id: row.id as string,
    sku: row.sku as string,
    slug: row.slug as string,
    title: row.title as string,
    editorial: row.editorial as string,
    author: (row.author as string) ?? '',
    pricePEN: row.price_pen as number,
    stock: row.stock as number,
    stockStatus: row.stock_status as StockStatus,
    estimatedArrival: (row.estimated_arrival as string) ?? undefined,
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
    series: (row.series as string) ?? undefined,
    images: ((row.images as string[]) ?? []).map(getCloudinaryUrl).filter(Boolean),
    category: row.category as Category,
    countryGroup: row.country_group as CountryGroup,
  };
}

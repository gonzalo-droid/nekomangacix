import type { CountryCode } from './constants/countries';
import type { Demographic } from './constants/demographics';
import type { ProductType } from './constants/productTypes';

export type StockStatus = 'in_stock' | 'preorder' | 'out_of_stock';
export type SeriesStatus = 'single' | 'ongoing' | 'completed';
// kept for mappers that still reference legacy data
export type Category = string;
export type CountryGroupLegacy = 'Argentina' | 'México' | 'España' | 'Japón';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  title: string;
  type: ProductType;
  editorial: string;
  countryCode: CountryCode;
  author?: string;
  pricePEN: number;
  stock: number;
  stockStatus: StockStatus;
  estimatedArrival?: string;
  etaText?: string;
  preorderDeposit?: number;
  tags?: string[];
  description?: string;
  fullDescription?: string;
  series?: string;
  seriesStatus?: SeriesStatus;
  demographic?: Demographic;
  images: string[];
  attributes?: Record<string, string | number | boolean>;
}

export const products: Product[] = [];

export function getStockStatusLabel(status: StockStatus | string): { label: string; color: string } {
  const statusInfo: Record<string, { label: string; color: string }> = {
    in_stock:     { label: 'En Stock',  color: 'text-green-600' },
    preorder:     { label: 'Preventa',  color: 'text-blue-600' },
    out_of_stock: { label: 'Agotado',   color: 'text-red-600' },
    on_demand:    { label: 'Preventa',  color: 'text-blue-600' },
  };
  return statusInfo[status] ?? { label: status, color: 'text-foreground/60' };
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(slug: string, limit = 4): Product[] {
  const product = getProductBySlug(slug);
  if (!product) return [];
  return products
    .filter((p) => p.slug !== slug && p.editorial === product.editorial)
    .slice(0, limit);
}

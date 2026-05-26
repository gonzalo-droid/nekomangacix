import type { CountryCode } from './constants/countries';
import type { Demographic } from './constants/demographics';
import type { ProductType, Language } from './constants/productTypes';

export type StockStatus = 'in_stock' | 'preorder' | 'out_of_stock';
export type Category = 'shonen' | 'seinen' | 'shojo' | 'josei' | 'kodomo' | 'isekai' | 'slice_of_life' | 'horror' | 'romance' | 'action' | 'comedy' | 'drama' | 'fantasy' | 'sci-fi' | 'sports' | 'mystery';
export type SeriesStatus = 'single' | 'ongoing' | 'completed';
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
  /** @deprecated use countryCode */
  countryGroup?: CountryGroupLegacy;
  author: string;
  pricePEN: number;
  stock: number;
  stockStatus: StockStatus;
  estimatedArrival?: string;
  etaText?: string;
  preorderDeposit?: number;
  tags: string[];
  description: string;
  fullDescription: string;
  specifications: {
    pages?: number;
    format?: string;
    language?: string;
    isbn?: string;
    releaseDate?: string;
    dimensions?: string;
    weight?: string;
  };
  volume?: number;
  volumeNumber?: number;
  series?: string;
  seriesStatus?: SeriesStatus;
  demographic?: Demographic;
  language: Language;
  figureScale?: string;
  manufacturer?: string;
  images: string[];
  category: Category;
}

export const products: Product[] = [];

export function getCategoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    shonen: 'Shonen', seinen: 'Seinen', shojo: 'Shojo', josei: 'Josei',
    kodomo: 'Kodomo', isekai: 'Isekai', slice_of_life: 'Slice of Life',
    horror: 'Horror', romance: 'Romance', action: 'Acción', comedy: 'Comedia',
    drama: 'Drama', fantasy: 'Fantasía', 'sci-fi': 'Ciencia Ficción',
    sports: 'Deportes', mystery: 'Misterio',
  };
  return labels[category] || category;
}

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
    .filter((p) => p.slug !== slug && (p.category === product.category || p.editorial === product.editorial))
    .slice(0, limit);
}

export type StockStatus = 'in_stock' | 'on_demand' | 'preorder' | 'out_of_stock';
export type Category = 'shonen' | 'seinen' | 'shojo' | 'josei' | 'kodomo' | 'isekai' | 'slice_of_life' | 'horror' | 'romance' | 'action' | 'comedy' | 'drama' | 'fantasy' | 'sci-fi' | 'sports' | 'mystery';
export type SeriesStatus = 'single' | 'ongoing' | 'completed';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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
  editorial: string;
  author: string;
  pricePEN: number;
  stock: number;
  stockStatus: StockStatus;
  estimatedArrival?: string;
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
  series?: string;
  seriesStatus?: SeriesStatus;
  images: string[];
  category: Category;
  countryGroup: 'Argentina' | 'México' | 'España' | 'Japón';
}

// Fuente de datos: Supabase (ver hooks/useProducts.ts y lib/productsServer.ts)
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

export function getStockStatusLabel(status: StockStatus): { label: string; color: string } {
  const statusInfo: Record<StockStatus, { label: string; color: string }> = {
    in_stock:     { label: 'En Stock',  color: 'text-green-600' },
    on_demand:    { label: 'A Pedido',  color: 'text-orange-600' },
    preorder:     { label: 'Preventa',  color: 'text-blue-600' },
    out_of_stock: { label: 'Agotado',   color: 'text-red-600' },
  };
  return statusInfo[status];
}

// Mantenidas por compatibilidad con código existente — operan sobre array vacío
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

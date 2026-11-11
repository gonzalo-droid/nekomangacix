import type { Product } from '@/lib/products';
import { PRODUCT_TYPE_LABELS } from '@/lib/constants/productTypes';
import { SITE_NAME, absoluteUrl } from '@/lib/site';

const AVAILABILITY_TEXT: Record<Product['stockStatus'], string> = {
  in_stock: 'En stock',
  preorder: 'En preventa',
  out_of_stock: 'Agotado',
};

const AVAILABILITY_SCHEMA: Record<Product['stockStatus'], string> = {
  in_stock: 'https://schema.org/InStock',
  preorder: 'https://schema.org/PreOrder',
  out_of_stock: 'https://schema.org/OutOfStock',
};

const DESCRIPTION_BUDGET = 110;

export function productPath(slug: string): string {
  return `/products/${slug}`;
}

/** "Manga Ivrea", "Figura Banpresto" o solo el tipo si no hay editorial. */
function typeAndEditorial(product: Product): string {
  const type = PRODUCT_TYPE_LABELS[product.type] ?? 'Producto';
  const editorial = product.editorial?.trim();
  return editorial ? `${type} ${editorial}` : type;
}

/**
 * Título de la ficha, sin la marca (la agrega la plantilla del layout).
 * Lleva lo que la gente escribe al buscar un tomo: qué es, de qué editorial
 * y dónde se compra.
 */
export function productSeoTitle(product: Product): string {
  return `${product.title} — ${typeAndEditorial(product)} en Perú`;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:—-]+$/, '')}…`;
}

/**
 * Descripción real del producto, o `null` si no aporta nada: en el catálogo
 * hay cientos de productos sin sinopsis o con el título repetido como
 * descripción.
 */
function meaningfulDescription(product: Product): string | null {
  const text = product.description?.replace(/\s+/g, ' ').trim();
  if (!text) return null;
  if (text.toLowerCase() === product.title.trim().toLowerCase()) return null;
  return text;
}

export function productSeoDescription(product: Product): string {
  const price = `S/ ${product.pricePEN.toFixed(2)}`;
  const availability = AVAILABILITY_TEXT[product.stockStatus] ?? 'Disponible';
  const closing = `${availability} · ${price} · Envíos a todo el Perú.`;

  const description = meaningfulDescription(product);
  if (description) {
    const lead = truncate(description, DESCRIPTION_BUDGET);
    return `${/[.!?…]$/.test(lead) ? lead : `${lead}.`} ${closing}`;
  }
  return `Compra ${product.title} (${typeAndEditorial(product)}) en ${SITE_NAME}. ${closing}`;
}

/** Datos estructurados de producto: es lo que alimenta el precio y la disponibilidad en Google. */
export function productJsonLd(product: Product): Record<string, unknown> {
  const url = absoluteUrl(productPath(product.slug));
  const images = product.images.slice(0, 4).map((src) => absoluteUrl(src));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: meaningfulDescription(product) ?? productSeoDescription(product),
    sku: product.sku,
    category: PRODUCT_TYPE_LABELS[product.type],
    ...(images.length > 0 ? { image: images } : {}),
    ...(product.editorial?.trim()
      ? { brand: { '@type': 'Brand', name: product.editorial.trim() } }
      : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'PEN',
      price: product.pricePEN.toFixed(2),
      availability: AVAILABILITY_SCHEMA[product.stockStatus] ?? 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };
}

/** Migas: las mismas que se ven en la ficha, con el home delante. */
export function productBreadcrumbJsonLd(product: Product): Record<string, unknown> {
  const trail = [
    { name: 'Inicio', path: '/' },
    { name: 'Productos', path: '/products' },
    { name: product.title, path: productPath(product.slug) },
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

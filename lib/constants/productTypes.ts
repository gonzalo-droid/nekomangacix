export const PRODUCT_TYPES = ['manga', 'figure', 'special_edition', 'merch', 'protective_sleeve'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  manga: 'Manga',
  figure: 'Figura',
  special_edition: 'Edición especial',
  merch: 'Merchandising',
  protective_sleeve: 'Funda protectora',
};

export function isProductType(value: string): value is ProductType {
  return (PRODUCT_TYPES as readonly string[]).includes(value);
}

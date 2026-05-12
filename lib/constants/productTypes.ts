export const PRODUCT_TYPES = ['manga', 'figure', 'special_edition', 'merch'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  manga: 'Manga',
  figure: 'Figura',
  special_edition: 'Edición especial',
  merch: 'Merchandising',
};

export const LANGUAGES = ['es', 'jp'] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, string> = {
  es: 'Español',
  jp: 'Japonés',
};

export function isProductType(value: string): value is ProductType {
  return (PRODUCT_TYPES as readonly string[]).includes(value);
}

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

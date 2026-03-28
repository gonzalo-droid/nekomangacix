const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const PRODUCTS_FOLDER = 'neko-manga/products';

/**
 * Construye la URL de Cloudinary para un public_id dado.
 * Si el valor ya es una URL completa (http/https), lo retorna tal cual.
 */
export function getCloudinaryUrl(imageRef: string): string {
  if (!imageRef) return '';
  if (imageRef.startsWith('http://') || imageRef.startsWith('https://')) {
    return imageRef;
  }
  // Si es path local (/images/...), retornar tal cual
  if (imageRef.startsWith('/')) {
    return imageRef;
  }
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${PRODUCTS_FOLDER}/${imageRef}`;
}

/**
 * Resuelve un array de referencias de imagen a URLs de Cloudinary.
 */
export function resolveProductImages(images: string[]): string[] {
  return images.map(getCloudinaryUrl).filter(Boolean);
}

/**
 * Verifica si una URL es de Cloudinary.
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}

export { CLOUD_NAME, PRODUCTS_FOLDER };

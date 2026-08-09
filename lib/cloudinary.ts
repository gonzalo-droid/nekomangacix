const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

const UPLOAD_MARKER = '/image/upload/';

/**
 * Detecta si el primer segmento tras /image/upload/ es una lista de
 * transformaciones (`f_auto,q_auto,w_400`) y no parte del public_id.
 * Las transformaciones son pares `xx_valor` separados por comas.
 */
const TRANSFORM_SEGMENT = /^[a-z]{1,3}_[^/,]+(,[a-z]{1,3}_[^/,]+)*$/;

/**
 * Construye la URL de Cloudinary para un public_id dado.
 * Si el valor ya es una URL completa (http/https) o un path local (/images/...),
 * lo retorna tal cual.
 *
 * No agrega extensión: Cloudinary sirve el asset en el formato en que fue subido
 * (WebP en nuestro caso). Forzar `.png` obligaba a transcodificar y multiplicaba
 * el peso ~6x. El redimensionado lo aplica `cloudinaryLoader` en tiempo de render.
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
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${imageRef}`;
}

/**
 * Inserta (o reemplaza) las transformaciones de una URL de Cloudinary.
 * Para cualquier otra URL retorna el valor sin tocar.
 */
export function withCloudinaryTransform(url: string, transform: string): string {
  if (!isCloudinaryUrl(url)) return url;

  const markerAt = url.indexOf(UPLOAD_MARKER);
  if (markerAt === -1) return url;

  const prefix = url.slice(0, markerAt + UPLOAD_MARKER.length);
  const rest = url.slice(markerAt + UPLOAD_MARKER.length);

  const slashAt = rest.indexOf('/');
  const firstSegment = slashAt === -1 ? rest : rest.slice(0, slashAt);

  // Ya traía transformaciones: las reemplazamos por las nuestras
  if (slashAt !== -1 && TRANSFORM_SEGMENT.test(firstSegment)) {
    return `${prefix}${transform}/${rest.slice(slashAt + 1)}`;
  }

  return `${prefix}${transform}/${rest}`;
}

/**
 * Loader de next/image para assets de Cloudinary.
 *
 * Hace que el navegador pida la imagen directamente a Cloudinary ya
 * redimensionada y en el mejor formato que soporte (`f_auto` → AVIF/WebP),
 * en vez de pasar por el optimizador de Next descargando el original completo.
 *
 * `c_limit` evita escalar hacia arriba imágenes más pequeñas que el ancho pedido.
 */
export function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!isCloudinaryUrl(src)) return src;
  return withCloudinaryTransform(src, `f_auto,q_${quality ?? 'auto'},w_${width},c_limit`);
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

/**
 * URL absoluta y acotada para Open Graph / metadata social.
 * Las redes no ejecutan srcset, así que fijamos un ancho razonable.
 */
export function getSocialImageUrl(imageRef: string, width = 1200): string {
  const url = getCloudinaryUrl(imageRef);
  return withCloudinaryTransform(url, `f_auto,q_auto,w_${width},c_limit`);
}

export { CLOUD_NAME };

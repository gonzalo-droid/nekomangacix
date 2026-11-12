import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SOCIAL_IMAGE_SIZE, getSocialImageUrl } from '@/lib/cloudinary';
import {
  productBreadcrumbJsonLd,
  productJsonLd,
  productPath,
  productSeoDescription,
  productSeoTitle,
} from '@/lib/domain/products/seo';
import { pageMetadata } from '@/lib/seo';
import { DEFAULT_OG_IMAGE } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import {
  getAllProductSlugs,
  getProductBySlugServer,
  getRelatedProductsServer,
} from '@/lib/productsServer';
import ProductDetailClient from './ProductDetailClient';

type Props = { params: Promise<{ slug: string }> };

// ISR: revalida cada 60 segundos para reflejar cambios del admin sin rebuild.
// Esto sigue valiendo para los productos ya publicados: precio, stock, imágenes
// y descripción se actualizan solos dentro del minuto.
export const revalidate = 60;

// Solo existen los slugs que `generateStaticParams` devolvió en el build.
// Cualquier otro devuelve un 404 de verdad, en vez del 200 con cuerpo de 404 que
// servía Next al cachear el `notFound()` de una ruta ISR.
//
// El precio: un producto NUEVO cargado desde el admin no es alcanzable hasta el
// siguiente despliegue. Los cambios sobre productos existentes no se ven
// afectados. Decisión tomada a conciencia el 2026-11-10.
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugServer(slug);
  // Sin esto el layout aporta su `index, follow` y la respuesta sale con dos
  // meta robots contradictorios: `index, follow` y el `noindex` que agrega Next
  // al renderizar el not-found.
  if (!product) {
    return {
      title: 'Producto no encontrado',
      robots: { index: false, follow: true },
    };
  }

  const firstImage = product.images[0];
  const socialImage = firstImage ? getSocialImageUrl(firstImage) : null;

  return pageMetadata({
    title: productSeoTitle(product),
    description: productSeoDescription(product),
    path: productPath(slug),
    // Solo las imágenes de Cloudinary se pueden llevar a 1200×630; cualquier
    // otra referencia cae en la imagen de marca.
    image:
      socialImage && socialImage.startsWith('http')
        ? { url: socialImage, ...SOCIAL_IMAGE_SIZE, alt: product.title }
        : DEFAULT_OG_IMAGE,
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlugServer(slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProductsServer(slug, 12);

  return (
    <>
      <JsonLd data={[productJsonLd(product), productBreadcrumbJsonLd(product)]} />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import {
  getAllProductSlugs,
  getProductBySlugServer,
  getRelatedProductsServer,
} from '@/lib/productsServer';
import ProductDetailClient from './ProductDetailClient';

type Props = { params: Promise<{ slug: string }> };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nekomangacix.com';

// ISR: revalida cada 60 segundos para reflejar cambios del admin sin rebuild
export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugServer(slug);
  if (!product) return { title: 'Producto no encontrado — NekoMangaCix' };

  const title = `${product.title} — NekoMangaCix`;
  const description = `${product.description} | ${product.editorial} | S/ ${product.pricePEN.toFixed(2)} | Envíos a todo Perú.`;

  const firstImage = product.images[0];
  const ogImageRaw = firstImage ? getCloudinaryUrl(firstImage) : null;
  const ogImage =
    ogImageRaw && ogImageRaw.startsWith('http')
      ? ogImageRaw
      : `${SITE_URL}/og-default.jpg`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/products/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/products/${slug}`,
      siteName: 'NekoMangaCix',
      locale: 'es_PE',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: product.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlugServer(slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProductsServer(slug, 6);

  const availability =
    product.stockStatus === 'in_stock'
      ? 'https://schema.org/InStock'
      : product.stockStatus === 'out_of_stock'
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/PreOrder';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.editorial },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PEN',
      price: product.pricePEN,
      availability,
      url: `${SITE_URL}/products/${slug}`,
      seller: { '@type': 'Organization', name: 'NekoMangaCix' },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}

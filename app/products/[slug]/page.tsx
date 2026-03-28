import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products, getProductBySlug, getRelatedProducts } from '@/lib/products';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import ProductDetailClient from './ProductDetailClient';

type Props = { params: Promise<{ slug: string }> };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nekomangacix.com';

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Producto no encontrado — NekoMangaCix' };

  const title = `${product.title} — NekoMangaCix`;
  const description = `${product.description} | ${product.editorial} | S/ ${product.pricePEN.toFixed(2)} | Envíos a todo Perú.`;

  // Usar URL absoluta para OG (requerido por redes sociales)
  const firstImage = product.images[0];
  const ogImageRaw = firstImage ? getCloudinaryUrl(firstImage) : null;
  const ogImage =
    ogImageRaw && ogImageRaw.startsWith('http')
      ? ogImageRaw
      : `${SITE_URL}/og-default.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/products/${slug}`,
    },
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
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = getRelatedProducts(slug, 4);

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

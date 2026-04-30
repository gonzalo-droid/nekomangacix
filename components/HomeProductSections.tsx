import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getAllActiveProducts } from '@/lib/productsServer';
import type { Product } from '@/lib/products';

interface ProductSectionProps {
  title: string;
  description: string;
  products: Product[];
  linkHref: string;
  linkLabel: string;
  variant?: 'default' | 'tinted';
  priorityFirst?: boolean;
}

function ProductSection({
  title,
  description,
  products,
  linkHref,
  linkLabel,
  variant = 'default',
  priorityFirst = false,
}: ProductSectionProps) {
  return (
    <section
      className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 ${
        variant === 'tinted'
          ? 'my-6 rounded-3xl bg-gradient-to-br from-[#2b496d]/[0.03] via-transparent to-[#ec4899]/[0.04] dark:from-[#06b6d4]/[0.04] dark:to-[#ec4899]/[0.05]'
          : ''
      }`}
    >
      <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div className="relative">
          {/* Badge decorativo superior */}
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#ec4899] mb-2">
            {'// Catálogo'}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
            {description}
          </p>
          {/* Accent underline */}
          <span className="absolute -bottom-3 left-0 w-16 h-1 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full" aria-hidden="true" />
        </div>

        {products.length > 0 && (
          <Link
            href={linkHref}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#2b496d] dark:text-[#5a7a9e] hover:text-[#ec4899] dark:hover:text-[#ec4899] transition-colors group"
          >
            {linkLabel}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        )}
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {products.map((product, idx) => (
              <ProductCard
                key={product.id}
                {...product}
                variant="compact"
                priority={priorityFirst && idx < 6}
                showQuickAdd
              />
            ))}
          </div>

          {/* CTA mobile (para sm< donde el link del header no aparece) */}
          <div className="sm:hidden mt-6 text-center">
            <Link
              href={linkHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#2b496d] to-[#3d6491] text-white text-sm font-semibold hover:shadow-lg transition-all"
            >
              {linkLabel} →
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02]">
          <span className="text-5xl mb-4 opacity-70">📦</span>
          <p className="text-gray-700 dark:text-gray-300 font-semibold">Próximamente</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
            Estamos preparando productos para esta sección
          </p>
        </div>
      )}
    </section>
  );
}

export default async function HomeProductSections() {
  const products = await getAllActiveProducts();

  // Máximo 6 para mostrar una sola fila en xl (6 columnas)
  const argentina = products.filter((p) => p.countryGroup === 'Argentina').slice(0, 6);
  const mexico = products.filter((p) => p.countryGroup === 'México').slice(0, 6);
  const espana = products.filter((p) => p.countryGroup === 'España').slice(0, 6);
  const coleccionables = products.filter((p) => p.countryGroup === 'Coleccionables').slice(0, 6);

  return (
    <>
      <ProductSection
        title="Editorial Argentina"
        description="Descubre las editoriales argentinas: Ivrea Argentina, Ovni Press y más."
        products={argentina}
        linkHref="/products?countryGroup=Argentina"
        linkLabel="Ver más manga argentino"
        priorityFirst
      />
      <ProductSection
        title="Editorial México"
        description="Explora editoriales mexicanas: Panini MX, Viz Media y otros."
        products={mexico}
        linkHref="/products?countryGroup=M%C3%A9xico"
        linkLabel="Ver más manga mexicano"
        variant="tinted"
      />
      {espana.length > 0 && (
        <ProductSection
          title="Editorial España"
          description="Ediciones españolas: Planeta Cómic, Norma Editorial y más."
          products={espana}
          linkHref="/products?countryGroup=Espa%C3%B1a"
          linkLabel="Ver más manga español"
        />
      )}
      <ProductSection
        title="Coleccionables"
        description="Figuras y artículos coleccionables de tus series favoritas."
        products={coleccionables}
        linkHref="/products?countryGroup=Coleccionables"
        linkLabel="Ver más coleccionables"
        variant="tinted"
      />
    </>
  );
}

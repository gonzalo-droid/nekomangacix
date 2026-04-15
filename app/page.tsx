import Link from 'next/link';
import { Suspense } from 'react';
import Hero from '@/components/Hero';
import HomeProductSections from '@/components/HomeProductSections';
import { ProductCardSkeleton } from '@/components/Skeleton';
import { MessageCircle, Sparkles, BookOpenText, Truck } from 'lucide-react';

export const metadata = {
  title: 'Neko Manga Cix — Tu tienda de manga y coleccionables en Perú',
  description:
    'Catálogo de manga de editoriales Argentina, México y España, además de figuras coleccionables. Envíos a todo el Perú.',
};

function HomeSectionsFallback() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, i) => (
        <section key={i} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8 space-y-2">
            <div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-4 w-96 max-w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((__, j) => (
              <ProductCardSkeleton key={j} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

const FEATURES = [
  {
    icon: Truck,
    title: 'Envíos a todo Perú',
    desc: 'Olva Courier y Shalom. Empaque resistente que cuida cada tomo.',
    accent: 'text-[#06b6d4]',
    bg: 'bg-[#06b6d4]/10 dark:bg-[#06b6d4]/15',
    ring: 'ring-[#06b6d4]/20',
  },
  {
    icon: Sparkles,
    title: 'Obsequios sorpresa',
    desc: 'Stickers, separadores y sorpresas para fans como tú.',
    accent: 'text-[#ec4899]',
    bg: 'bg-[#ec4899]/10 dark:bg-[#ec4899]/15',
    ring: 'ring-[#ec4899]/20',
  },
  {
    icon: BookOpenText,
    title: 'Catálogo curado',
    desc: 'De shōnen clásicos a novedades. Ediciones originales y verificadas.',
    accent: 'text-[#eab308]',
    bg: 'bg-[#eab308]/10 dark:bg-[#eab308]/15',
    ring: 'ring-[#eab308]/20',
  },
];

export default function Home() {
  return (
    <div className="w-full">
      <Hero />

      <Suspense fallback={<HomeSectionsFallback />}>
        <HomeProductSections />
      </Suspense>

      {/* CTA WhatsApp — estilo oscuro con halftone */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0f] via-[#1e3550] to-[#0a0a0f] text-white">
          {/* Decor */}
          <div className="absolute inset-0 bg-halftone opacity-50 pointer-events-none" aria-hidden="true" />
          <div
            className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#ec4899] opacity-25 blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[#06b6d4] opacity-20 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative px-6 sm:px-10 py-12 sm:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight mb-3">
                ¿Dudas sobre tu pedido?
              </h2>
              <p className="text-white/75 text-base sm:text-lg">
                Escríbenos por WhatsApp y te respondemos en minutos. Productos, envíos,
                preventas — lo que necesites.
              </p>
            </div>
            <a
              href="https://wa.me/51924262747?text=Hola%20Neko%20Manga%20Cix%2C%20quiero%20consultar%20sobre%20un%20producto"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold text-base shadow-xl shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:scale-[1.03] active:scale-[0.98] transition-all whitespace-nowrap"
            >
              <MessageCircle size={20} className="transition-transform group-hover:rotate-12" />
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl p-6 hover:-translate-y-1 transition-all ring-1 ${f.ring} hover:shadow-xl`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${f.bg} ${f.accent} mb-4 transition-transform group-hover:scale-110`}
                >
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2b496d] dark:text-[#5a7a9e] hover:text-[#ec4899] dark:hover:text-[#ec4899] transition-colors"
          >
            Conoce más sobre nosotros →
          </Link>
        </div>
      </section>
    </div>
  );
}

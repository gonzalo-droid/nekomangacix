import Link from 'next/link';
import { Search, Home, BookOpenText } from 'lucide-react';

export const metadata = {
  title: 'Página no encontrada',
  description: 'La página que buscas no existe o cambió de dirección.',
  robots: { index: false, follow: true },
  // Una URL que no existe no tiene canónica que declarar.
  alternates: {},
};

const SALIDAS = [
  {
    href: '/products',
    icon: BookOpenText,
    title: 'Ver el catálogo',
    desc: 'Más de 6.000 títulos de manga y coleccionables originales.',
    accent: 'text-neko-magenta-ink',
    bg: 'bg-[#ec4899]/10',
  },
  {
    href: '/products?stock=preorder',
    icon: Search,
    title: 'Preventas activas',
    desc: 'Asegura tu ejemplar antes de que llegue.',
    accent: 'text-neko-cyan-ink',
    bg: 'bg-[#06b6d4]/10',
  },
  {
    href: '/',
    icon: Home,
    title: 'Volver al inicio',
    desc: 'Empezar de nuevo desde la portada.',
    accent: 'text-neko-navy-ink',
    bg: 'bg-[#2b496d]/10',
  },
];

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-neko-magenta-ink mb-3">
          {'// Error 404'}
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
          Esta página se fue de <span className="text-neko-gradient">aventura</span>
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          La dirección que abriste no existe o el producto ya no está publicado.
          Desde acá puedes seguir buscando.
        </p>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {SALIDAS.map(({ href, icon: Icon, title, desc, accent, bg }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-2 p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 hover:border-[#ec4899] hover:shadow-lg hover:shadow-[#ec4899]/10 transition-all"
          >
            <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${bg} ${accent}`}>
              <Icon size={20} aria-hidden="true" />
            </span>
            <span className="font-bold text-gray-900 dark:text-white group-hover:text-neko-magenta-ink transition-colors">
              {title}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</span>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400">
        ¿Buscabas algo puntual?{' '}
        <Link href="/contact" className="font-semibold text-neko-magenta-ink hover:underline">
          Escríbenos
        </Link>{' '}
        y te decimos si lo tenemos.
      </p>
    </div>
  );
}

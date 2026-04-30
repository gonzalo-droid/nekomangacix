import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import Wordmark from './Wordmark';

/**
 * Hero visual — 3 portadas flotantes (Naruto / One Piece / JJK) sobre
 * fondo oscuro con glows magenta + cyan y patrón halftone. Responsivo:
 * en mobile las portadas se ocultan para no competir con el texto.
 */

const COVERS = [
  {
    src: '/images/manga/naruto_02.png',
    alt: 'Portada Naruto',
    className:
      'absolute left-[6%] top-[12%] w-[140px] lg:w-[180px] -rotate-[10deg] animate-float-slow',
    style: { '--r': '-10deg', animationDelay: '0s' } as React.CSSProperties,
  },
  {
    src: '/images/manga/one_piece_02.png',
    alt: 'Portada One Piece',
    className:
      'absolute right-[8%] top-[8%] w-[160px] lg:w-[210px] rotate-[8deg] animate-float-slow z-10',
    style: { '--r': '8deg', animationDelay: '1.5s' } as React.CSSProperties,
  },
  {
    src: '/images/manga/jujutsu_kaisen_02.png',
    alt: 'Portada Jujutsu Kaisen',
    className:
      'absolute right-[18%] bottom-[5%] w-[130px] lg:w-[170px] -rotate-[6deg] animate-float-slow',
    style: { '--r': '-6deg', animationDelay: '3s' } as React.CSSProperties,
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#141424] to-[#0a0a0f] text-white isolate">
      {/* Halftone pattern */}
      <div className="absolute inset-0 bg-halftone opacity-60 pointer-events-none" aria-hidden="true" />

      {/* Glows decorativos */}
      <div
        className="absolute top-[-8rem] left-[-6rem] w-[28rem] h-[28rem] rounded-full bg-[#ec4899] opacity-25 blur-[80px] animate-blob pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-10rem] right-[-8rem] w-[32rem] h-[32rem] rounded-full bg-[#06b6d4] opacity-20 blur-[90px] animate-blob pointer-events-none"
        style={{ animationDelay: '3s' }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-1/3 w-[18rem] h-[18rem] rounded-full bg-[#eab308] opacity-10 blur-[70px] animate-pulse-glow pointer-events-none"
        aria-hidden="true"
      />

      {/* Portadas flotantes — desktop */}
      <div className="hidden md:block absolute inset-0 pointer-events-none" aria-hidden="true">
        {COVERS.map((cover) => (
          <div key={cover.src} className={cover.className} style={cover.style}>
            <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="220px"
                className="object-cover"
                priority
              />
              {/* Brillo tipo portada */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            </div>
          </div>
        ))}
      </div>

      {/* Contenido */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-2xl">
          {/* Wordmark de marca — firma visual prominente */}
          <div className="mb-5 animate-tilt-in">
            <Wordmark size="lg" tone="dark" className="opacity-90" as="div" />
          </div>

          {/* Etiqueta superior */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6 animate-tilt-in"
            style={{ animationDelay: '0.05s' }}
          >
            <Sparkles size={14} className="text-[#eab308]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-white/80">
              Manga original · Envíos a todo el Perú
            </span>
          </div>

          {/* Título con gradiente magenta→cyan */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight mb-5 animate-tilt-in"
            style={{ animationDelay: '0.1s' }}
          >
            Tu próxima{' '}
            <span className="text-neko-gradient">aventura manga</span>
            <br />
            empieza aquí.
          </h1>

          <p
            className="text-base sm:text-lg text-white/75 mb-8 max-w-xl leading-relaxed animate-tilt-in"
            style={{ animationDelay: '0.2s' }}
          >
            Catálogo de editoriales <strong className="text-white">Argentina</strong>,{' '}
            <strong className="text-white">México</strong>,{' '}
            <strong className="text-white">España</strong> y 
            <strong className="text-white">figuras coleccionables</strong>.
            Sumérgete en miles de historias.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap gap-3 mb-10 animate-tilt-in"
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              href="/products"
              className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#ec4899]/30 hover:shadow-[#ec4899]/50 hover:scale-[1.03] active:scale-[0.98] transition-all overflow-hidden"
            >
              {/* Sheen */}
              <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 animate-sheen" />
              <span className="relative">Explorar catálogo</span>
              <ArrowRight size={18} className="relative transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/products?countryGroup=Coleccionables"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 backdrop-blur-sm text-white border border-white/15 hover:border-[#06b6d4] hover:bg-white/10 font-semibold text-sm sm:text-base transition-all"
            >
              Ver coleccionables
            </Link>
          </div>

          {/* Trust mini-row */}
          <div
            className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70 animate-tilt-in"
            style={{ animationDelay: '0.4s' }}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#06b6d4]" />
              <span>100% originales</span>
            </span>
            <span className="flex items-center gap-2">
              <Truck size={16} className="text-[#ec4899]" />
              <span>Envíos a todo el Perú</span>
            </span>
            <span className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#eab308]" />
              <span>Obsequios en cada compra</span>
            </span>
          </div>
        </div>
      </div>

      {/* Gradiente de transición hacia la siguiente sección */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-[#0a0a0f] to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
}

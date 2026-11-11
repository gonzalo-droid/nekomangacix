'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, ShieldCheck, Truck, Pause, Play } from 'lucide-react';
import Wordmark from './Wordmark';

/** `true` cuando el sistema pide reducir el movimiento. */
function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduce;
}

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link?: string;
  type: string;
}

// Fondos sólidos y oscuros: el distintivo se apoya sobre la ilustración del
// banner, así que con opacidad el texto blanco no llegaba a 4.5:1.
const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  preventa: { label: '🔖 Preventa activa', cls: 'bg-blue-700 text-white' },
  feria:    { label: '🎪 Próxima feria',    cls: 'bg-purple-700 text-white' },
  novedad:  { label: '✨ Novedad',           cls: 'bg-pink-700 text-white' },
  general:  { label: '📢 Anuncio',           cls: 'bg-black/80 text-white border border-white/20' },
};

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'nekomangacix';
function resolveImg(ref: string) {
  if (!ref) return '';
  if (ref.startsWith('http') || ref.startsWith('/')) return ref;
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${ref}`;
}

const COVERS = [
  { src: '/images/manga/one_piece_02.png', alt: 'One Piece', cls: 'absolute right-[8%] top-[8%] w-[160px] lg:w-[210px] rotate-[8deg] animate-float-slow z-10', delay: '1.5s' },
  { src: '/images/manga/jujutsu_kaisen_01.png', alt: 'Jujutsu Kaisen', cls: 'absolute right-[18%] bottom-[5%] w-[130px] lg:w-[170px] -rotate-[6deg] animate-float-slow', delay: '3s' },
];

function StaticHero({ countryNames }: { countryNames: string[] }) {
  return (
    // El hero sigue al tema: claro sobre claro, oscuro sobre oscuro. Antes era
    // siempre oscuro, y en tema claro quedaba como un bloque negro al abrir.
    <section className="relative overflow-hidden isolate border-b border-gray-200/70 dark:border-transparent bg-gradient-to-br from-white via-[#fdf2f8] to-[#ecfeff] text-gray-900 dark:from-[#0a0a0f] dark:via-[#141424] dark:to-[#0a0a0f] dark:text-white">
      {/* Manchas de color de marca: dan cuerpo al fondo claro sin oscurecerlo. */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#ec4899] opacity-[0.12] dark:opacity-[0.07] blur-3xl pointer-events-none -z-10" aria-hidden="true" />
      <div className="absolute -bottom-32 right-[10%] w-[28rem] h-[28rem] rounded-full bg-[#06b6d4] opacity-[0.14] dark:opacity-[0.07] blur-3xl pointer-events-none -z-10" aria-hidden="true" />

      <div className="hidden md:block absolute inset-0 pointer-events-none" aria-hidden="true">
        {COVERS.map((c) => (
          <div key={c.src} className={c.cls} style={{ animationDelay: c.delay } as React.CSSProperties}>
            <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-2xl shadow-gray-900/25 dark:shadow-black/50 ring-1 ring-black/5 dark:ring-white/10">
              <Image src={c.src} alt={c.alt} fill sizes="220px" className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            </div>
          </div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-2xl">
          <div className="mb-5 animate-tilt-in">
            <Wordmark size="lg" tone="auto" className="opacity-90" as="div" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-gray-200 dark:bg-white/5 dark:border-white/10 backdrop-blur-sm mb-6 animate-tilt-in" style={{ animationDelay: '0.05s' }}>
            <Sparkles size={14} className="text-[#eab308]" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-700 dark:text-white/80">Envíos a todo el Perú</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight mb-5 animate-tilt-in" style={{ animationDelay: '0.1s' }}>
            Inicia tu colección{' '}
            <span className="text-neko-gradient">aventura manga</span>{' '}
            <br />empieza aquí.
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-white/75 mb-8 max-w-xl leading-relaxed animate-tilt-in" style={{ animationDelay: '0.2s' }}>
            {countryNames.length > 0 ? (
              <>
                Manga y coleccionables de{' '}
                {countryNames.map((name, i) => (
                  <span key={name}>
                    {i > 0 && (i === countryNames.length - 1 ? ' y ' : ', ')}
                    <strong className="text-gray-900 dark:text-white">{name}</strong>
                  </span>
                ))}
                . Sumérgete en miles de historias.
              </>
            ) : (
              'Manga en español y coleccionables originales. Sumérgete en miles de historias.'
            )}
          </p>
          <div className="flex flex-wrap gap-3 mb-10 animate-tilt-in" style={{ animationDelay: '0.3s' }}>
            <Link href="/products" className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#ec4899]/30 hover:shadow-[#ec4899]/50 hover:scale-[1.03] active:scale-[0.98] transition-all overflow-hidden">
              <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 animate-sheen" />
              <span className="relative">Explorar catálogo</span>
              <ArrowRight size={18} className="relative transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/products?type=figure" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 hover:border-[#06b6d4] dark:bg-white/5 dark:backdrop-blur-sm dark:text-white dark:border-white/15 dark:hover:bg-white/10 font-semibold text-sm sm:text-base transition-all">
              Ver coleccionables
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600 dark:text-white/70 animate-tilt-in" style={{ animationDelay: '0.4s' }}>
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#06b6d4]" /><span>100% originales</span></span>
            <span className="flex items-center gap-2"><Truck size={16} className="text-[#ec4899]" /><span>Envíos a todo el Perú</span></span>
            <span className="flex items-center gap-2"><Sparkles size={16} className="text-[#eab308]" /><span>Obsequios en cada compra</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}

function BannerHero({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  const prev = useCallback(() => setIdx((i) => (i - 1 + banners.length) % banners.length), [banners.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % banners.length), [banners.length]);

  // El avance automático se detiene si el usuario lo pausa o pide reducir el movimiento.
  useEffect(() => {
    if (banners.length <= 1 || paused || reduceMotion) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [banners.length, next, paused, reduceMotion]);

  const b = banners[idx];
  const badge = TYPE_BADGE[b.type] ?? TYPE_BADGE.general;
  const imgSrc = resolveImg(b.image_url);

  const nombreAccesible = `${b.title}. ${b.subtitle ?? ''}`.trim();
  // Con <img> a pelo el PNG del banner se servía tal cual (2,4 MB) y era el
  // elemento LCP de la portada. next/image lo reescala y lo entrega en AVIF o
  // WebP; además va perezoso, porque la franja queda bajo el hero.
  const imagen = (
    <Image
      key={b.id}
      src={imgSrc}
      alt={b.title}
      fill
      sizes="(max-width: 1280px) 100vw, 1280px"
      loading="lazy"
      className="object-cover transition-opacity duration-700"
    />
  );

  return (
    <section
      aria-label="Promociones"
      aria-roledescription="carrusel"
      className="relative overflow-hidden text-white isolate w-full rounded-2xl"
      style={{ aspectRatio: '16/5', minHeight: '180px' }}
    >
      {/* Imagen de fondo con transición */}
      {imgSrc && (
        b.link ? (
          <Link href={b.link} aria-label={nombreAccesible} className="absolute inset-0 block">
            {imagen}
          </Link>
        ) : (
          <div className="absolute inset-0 block">{imagen}</div>
        )
      )}

      {/* Distintivo del tipo de promoción, como texto y no dentro del JPG */}
      <span
        className={`absolute top-3 left-3 sm:top-4 sm:left-4 inline-block text-[11px] font-bold px-3 py-1.5 rounded-full pointer-events-none ${badge.cls}`}
      >
        {badge.label}
      </span>

      {/* Sin imagen: fondo oscuro como el hero original */}
      {!imgSrc && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#141424] to-[#0a0a0f]" />
          <div className="absolute inset-0 bg-halftone opacity-60 pointer-events-none" aria-hidden="true" />
          <div className="absolute top-[-8rem] left-[-6rem] w-[28rem] h-[28rem] rounded-full bg-[#ec4899] opacity-25 blur-[80px] animate-blob pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-[-10rem] right-[-8rem] w-[32rem] h-[32rem] rounded-full bg-[#06b6d4] opacity-20 blur-[90px] animate-blob pointer-events-none" aria-hidden="true" />
        </>
      )}


      {/* Controles de navegación */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Banner anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Banner siguiente"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>

          {/* Dots + pausa */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Ir al banner ${i + 1} de ${banners.length}`}
                aria-current={i === idx ? 'true' : undefined}
                className="h-11 min-w-11 flex items-center justify-center group"
              >
                <span
                  aria-hidden="true"
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    i === idx ? 'bg-white w-8' : 'bg-white/40 w-2 group-hover:bg-white/70'
                  }`}
                />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? 'Reanudar el cambio automático de banners' : 'Pausar el cambio automático de banners'}
              className="ml-1 w-11 h-11 rounded-full text-white/80 hover:text-white hover:bg-black/40 flex items-center justify-center transition-colors"
            >
              {paused
                ? <Play size={14} aria-hidden="true" />
                : <Pause size={14} aria-hidden="true" />}
            </button>
          </div>
        </>
      )}

    </section>
  );
}

interface HeroSliderProps {
  /** Países con productos activos; el servidor los calcula del catálogo. */
  countryNames?: string[];
}

export default function HeroSlider({ countryNames = [] }: HeroSliderProps) {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    fetch('/api/banners')
      .then((r) => r.json())
      .then((j) => setBanners(j.data ?? []))
      .catch(() => setBanners([]));
  }, []);

  // El hero de texto se renderiza siempre, en todos los anchos y también en el
  // HTML que sirve el servidor: antes dependía de `window.innerWidth`, así que
  // por encima de 768 px el mensaje solo existía dibujado dentro del banner y
  // la página se servía sin nada sobre el pliegue.
  return (
    <>
      <StaticHero countryNames={countryNames} />
      {banners.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10">
          <BannerHero banners={banners} />
        </div>
      )}
    </>
  );
}

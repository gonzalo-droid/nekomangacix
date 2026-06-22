'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import Wordmark from './Wordmark';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link?: string;
  type: string;
}

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  preventa: { label: '🔖 Preventa activa', cls: 'bg-blue-500/80 text-white' },
  feria:    { label: '🎪 Próxima feria',    cls: 'bg-purple-500/80 text-white' },
  novedad:  { label: '✨ Novedad',           cls: 'bg-pink-500/80 text-white' },
  general:  { label: '📢 Anuncio',           cls: 'bg-white/10 text-white border border-white/20' },
};

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'nekomangacix';
function resolveImg(ref: string) {
  if (!ref) return '';
  if (ref.startsWith('http') || ref.startsWith('/')) return ref;
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${ref}`;
}

const COVERS = [
  { src: '/images/manga/one_piece_02.png', alt: 'One Piece', cls: 'absolute right-[8%] top-[8%] w-[160px] lg:w-[210px] rotate-[8deg] animate-float-slow z-10', delay: '1.5s' },
  { src: '/images/manga/jujutsu_kaisen_02.png', alt: 'Jujutsu Kaisen', cls: 'absolute right-[18%] bottom-[5%] w-[130px] lg:w-[170px] -rotate-[6deg] animate-float-slow', delay: '3s' },
];

function StaticHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#141424] to-[#0a0a0f] text-white isolate">
      <div className="absolute inset-0 bg-halftone opacity-60 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-[-8rem] left-[-6rem] w-[28rem] h-[28rem] rounded-full bg-[#ec4899] opacity-25 blur-[80px] animate-blob pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-[-10rem] right-[-8rem] w-[32rem] h-[32rem] rounded-full bg-[#06b6d4] opacity-20 blur-[90px] animate-blob pointer-events-none" style={{ animationDelay: '3s' }} aria-hidden="true" />
      <div className="absolute top-1/3 right-1/3 w-[18rem] h-[18rem] rounded-full bg-[#eab308] opacity-10 blur-[70px] animate-pulse-glow pointer-events-none" aria-hidden="true" />

      <div className="hidden md:block absolute inset-0 pointer-events-none" aria-hidden="true">
        {COVERS.map((c) => (
          <div key={c.src} className={c.cls} style={{ animationDelay: c.delay } as React.CSSProperties}>
            <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
              <Image src={c.src} alt={c.alt} fill sizes="220px" className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            </div>
          </div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-2xl">
          <div className="mb-5 animate-tilt-in">
            <Wordmark size="lg" tone="dark" className="opacity-90" as="div" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6 animate-tilt-in" style={{ animationDelay: '0.05s' }}>
            <Sparkles size={14} className="text-[#eab308]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-white/80">Envíos a todo el Perú</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight mb-5 animate-tilt-in" style={{ animationDelay: '0.1s' }}>
            Inicia tu colección{' '}
            <span className="text-neko-gradient">aventura manga</span>
            <br />empieza aquí.
          </h1>
          <p className="text-base sm:text-lg text-white/75 mb-8 max-w-xl leading-relaxed animate-tilt-in" style={{ animationDelay: '0.2s' }}>
            Catálogo de editoriales <strong className="text-white">Argentina</strong>,{' '}
            <strong className="text-white">México</strong>,{' '}
            <strong className="text-white">España</strong> y{' '}
            <strong className="text-white">Japón</strong>. Sumérgete en miles de historias.
          </p>
          <div className="flex flex-wrap gap-3 mb-10 animate-tilt-in" style={{ animationDelay: '0.3s' }}>
            <Link href="/products" className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#ec4899]/30 hover:shadow-[#ec4899]/50 hover:scale-[1.03] active:scale-[0.98] transition-all overflow-hidden">
              <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 animate-sheen" />
              <span className="relative">Explorar catálogo</span>
              <ArrowRight size={18} className="relative transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/products?countryGroup=Coleccionables" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 backdrop-blur-sm text-white border border-white/15 hover:border-[#06b6d4] hover:bg-white/10 font-semibold text-sm sm:text-base transition-all">
              Ver coleccionables
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70 animate-tilt-in" style={{ animationDelay: '0.4s' }}>
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#06b6d4]" /><span>100% originales</span></span>
            <span className="flex items-center gap-2"><Truck size={16} className="text-[#ec4899]" /><span>Envíos a todo el Perú</span></span>
            <span className="flex items-center gap-2"><Sparkles size={16} className="text-[#eab308]" /><span>Obsequios en cada compra</span></span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-[#0a0a0f] to-transparent pointer-events-none" aria-hidden="true" />
    </section>
  );
}

function BannerHero({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);

  const prev = useCallback(() => setIdx((i) => (i - 1 + banners.length) % banners.length), [banners.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % banners.length), [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [banners.length, next]);

  const b = banners[idx];
  const badge = TYPE_BADGE[b.type] ?? TYPE_BADGE.general;
  const imgSrc = resolveImg(b.image_url);

  return (
    <section className="relative overflow-hidden text-white isolate" style={{ minHeight: '520px' }}>
      {/* Imagen de fondo con transición */}
      {imgSrc && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={b.id}
            src={imgSrc}
            alt={b.title}
            className="w-full h-full object-cover transition-opacity duration-700"
          />
        </div>
      )}

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
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm">
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'bg-white w-8' : 'bg-white/40 w-2'}`}
              />
            ))}
          </div>
        </>
      )}

    </section>
  );
}

export default function HeroSlider() {
  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    fetch('/api/banners')
      .then((r) => r.json())
      .then((j) => setBanners(j.data ?? []))
      .catch(() => setBanners([]));
  }, []);

  if (isMobile || banners === null || banners.length === 0) return <StaticHero />;

  return <BannerHero banners={banners} />;
}

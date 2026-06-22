'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link?: string;
  type: string;
}

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  preventa: { label: '🔖 Preventa activa', cls: 'bg-blue-500/90 text-white' },
  feria:    { label: '🎪 Próxima feria',    cls: 'bg-purple-500/90 text-white' },
  novedad:  { label: '✨ Novedad',           cls: 'bg-pink-500/90 text-white' },
  general:  { label: '📢 Anuncio',           cls: 'bg-gray-700/90 text-white' },
};

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'nekomangacix';
function resolveImg(ref: string) {
  if (!ref) return '';
  if (ref.startsWith('http')) return ref;
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${ref}`;
}

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/banners')
      .then((r) => r.json())
      .then((j) => { setBanners(j.data ?? []); setLoaded(true); });
  }, []);

  const prev = useCallback(() => setIdx((i) => (i - 1 + banners.length) % banners.length), [banners.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % banners.length), [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [banners.length, next]);

  if (!loaded || banners.length === 0) return null;

  const b = banners[idx];
  const badge = TYPE_BADGE[b.type] ?? TYPE_BADGE.general;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-2xl" style={{ minHeight: '240px' }}>
        {/* Imagen de fondo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={b.id}
          src={resolveImg(b.image_url)}
          alt={b.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-700"
        />

        {/* Overlay degradado */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        {/* Contenido */}
        <div className="relative px-8 py-10 sm:py-14 max-w-xl">
          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${badge.cls}`}>
            {badge.label}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
            {b.title}
          </h2>
          {b.subtitle && (
            <p className="text-white/80 text-sm sm:text-base mb-4">{b.subtitle}</p>
          )}
          {b.link && (
            <Link
              href={b.link}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ec4899] hover:bg-[#db2777] text-white font-bold text-sm shadow-lg transition-all hover:scale-[1.03]"
            >
              Ver más →
            </Link>
          )}
        </div>

        {/* Controles */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight size={18} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white w-5' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

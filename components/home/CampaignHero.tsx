'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarClock, ChevronLeft, ChevronRight, Pause, Play, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import type { HeroSlide, SlideAction, SlideTone } from '@/lib/content/campaigns';

const ROTATE_MS = 8000;

const TONE_BADGE: Record<SlideTone, string> = {
  preventa: 'bg-[#be185d] text-white',
  feria: 'bg-[#0e7490] text-white',
  novedad: 'bg-[#6d28d9] text-white',
  general: 'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
};

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** Preferencia del sistema; en el servidor se asume que no. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

function ActionLink({ action, primary }: { action: SlideAction; primary: boolean }) {
  const className = primary
    ? 'group inline-flex items-center justify-center gap-2 min-h-12 px-7 rounded-xl bg-[#be185d] hover:bg-[#9d174d] text-white font-bold text-base shadow-lg shadow-[#be185d]/25 transition-colors'
    : 'inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-xl border-2 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-bold text-base hover:border-[#be185d] dark:hover:border-white/50 transition-colors';
  const content = (
    <>
      {action.label}
      {primary && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />}
    </>
  );
  if (action.external) {
    return (
      <a href={action.href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }
  return (
    <Link href={action.href} className={className}>
      {content}
    </Link>
  );
}

/**
 * Arte de la diapositiva: la imagen de la campaña o, para un evento, la fecha grande.
 * La proporción 5/4 recorta el banner de 3:1 a su mitad derecha (los tomos)
 * sin que asomen las letras del diseño original.
 */
function SlideArt({ slide, priority }: { slide: HeroSlide; priority: boolean }) {
  if (slide.image) {
    return (
      <div className="relative w-full aspect-[5/4] rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl shadow-gray-900/15 dark:shadow-black/40">
        <Image
          src={slide.image.src}
          alt={slide.image.alt}
          fill
          priority={priority}
          fetchPriority={priority ? 'high' : undefined}
          sizes="(max-width: 1024px) 100vw, 640px"
          className="object-cover"
          style={{ objectPosition: slide.image.position }}
        />
      </div>
    );
  }
  return (
    <div className="relative isolate w-full aspect-[5/4] rounded-3xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] shadow-2xl shadow-gray-900/15 dark:shadow-black/40" aria-hidden="true">
      <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-[#ec4899] opacity-35 blur-[80px] -z-10" />
      <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-[#06b6d4] opacity-25 blur-[90px] -z-10" />
      <div className="absolute inset-0 bg-halftone opacity-40 -z-10" />
      {!slide.date && (
        <Image src="/images/brand/logo-dark-trimmed.png" alt="" width={260} height={260} className="w-40 sm:w-56 h-auto rounded-full bg-white p-2 shadow-2xl" />
      )}
      {slide.date && (
        <div className="w-36 sm:w-44 rounded-3xl bg-white text-gray-900 text-center overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-[#ec4899] to-[#06b6d4] text-white text-lg sm:text-xl font-bold uppercase tracking-widest py-2">
            {slide.date.month}
          </div>
          <div className="text-7xl sm:text-8xl font-extrabold leading-none py-4">{slide.date.day}</div>
        </div>
      )}
    </div>
  );
}

/**
 * Hero del home: la campaña vigente (la preventa) es lo primero que se ve, con
 * texto real y su arte al costado. Si hay más de una diapositiva rotan solas,
 * con pausa, flechas y puntos; el giro se detiene al pasar el ratón, al tener
 * el foco dentro o si el sistema pide reducir el movimiento.
 */
export default function CampaignHero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const count = slides.length;

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  const autoplay = count > 1 && !paused && !hovered && !reduceMotion;
  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => go(1), ROTATE_MS);
    return () => clearInterval(t);
  }, [autoplay, go]);

  if (count === 0) return null;
  const slide = slides[index];

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Campañas"
      className="relative overflow-hidden isolate border-b border-gray-200/70 dark:border-transparent bg-gradient-to-br from-white via-[#fdf2f8] to-[#ecfeff] text-gray-900 dark:from-[#0a0a0f] dark:via-[#141424] dark:to-[#0a0a0f] dark:text-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#ec4899] opacity-[0.12] dark:opacity-[0.07] blur-3xl pointer-events-none -z-10" aria-hidden="true" />
      <div className="absolute -bottom-32 right-[10%] w-[28rem] h-[28rem] rounded-full bg-[#06b6d4] opacity-[0.14] dark:opacity-[0.07] blur-3xl pointer-events-none -z-10" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 lg:py-14">
        <div
          key={slide.id}
          role="group"
          aria-roledescription="diapositiva"
          aria-label={`${index + 1} de ${count}: ${slide.title}`}
          aria-live={autoplay ? 'off' : 'polite'}
          className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-center animate-tilt-in motion-reduce:animate-none"
        >
          <div>
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] ${TONE_BADGE[slide.tone]}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse motion-reduce:animate-none" aria-hidden="true" />
              {slide.kicker}
            </span>
            <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-white/75 max-w-xl leading-relaxed">
                {slide.subtitle}
              </p>
            )}
            {slide.deadline && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/80 dark:bg-white/10 border border-[#be185d]/25 px-3.5 py-2 text-sm text-gray-900 dark:text-white">
                <CalendarClock size={17} className="flex-shrink-0 text-[#be185d]" aria-hidden="true" />
                <span>
                  <strong className="font-bold">{slide.deadline.label}</strong>
                  <span className="text-[#be185d] font-semibold whitespace-nowrap"> · {slide.deadline.countdown}</span>
                </span>
              </p>
            )}
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <ActionLink action={slide.primary} primary />
              {slide.secondary && <ActionLink action={slide.secondary} primary={false} />}
            </div>
          </div>

          <SlideArt slide={slide} priority={index === 0} />
        </div>

        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-5">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-white/70">
            <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#0e7490] dark:text-[#06b6d4]" aria-hidden="true" />100% originales</li>
            <li className="flex items-center gap-2"><Truck size={16} className="text-[#be185d] dark:text-[#ec4899]" aria-hidden="true" />Envíos a todo el Perú</li>
            <li className="flex items-center gap-2"><Sparkles size={16} className="text-[#a16207] dark:text-[#eab308]" aria-hidden="true" />Obsequios en cada compra</li>
          </ul>

          {count > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Campaña anterior"
                className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-300 dark:border-white/20 hover:bg-white dark:hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <div className="flex items-center">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Ver campaña ${i + 1} de ${count}: ${s.title}`}
                    aria-current={i === index ? 'true' : undefined}
                    className="w-8 h-11 flex items-center justify-center"
                  >
                    <span className={`block h-2 rounded-full transition-all ${i === index ? 'w-6 bg-[#be185d]' : 'w-2 bg-gray-400 dark:bg-white/40'}`} />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Campaña siguiente"
                className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-300 dark:border-white/20 hover:bg-white dark:hover:bg-white/10 transition-colors"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
              {!reduceMotion && (
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? 'Reanudar el cambio automático' : 'Pausar el cambio automático'}
                  className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-300 dark:border-white/20 hover:bg-white dark:hover:bg-white/10 transition-colors"
                >
                  {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

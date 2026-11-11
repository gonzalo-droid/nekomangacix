'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/products';

interface Props {
  products: Product[];
  /** Nombre del carrusel para lectores de pantalla. */
  label: string;
}

/**
 * Fila horizontal de productos.
 *
 * En táctil se desliza con el dedo; con ratón, con las flechas; con teclado,
 * tabulando por las tarjetas (el navegador desplaza la fila solo). No avanza
 * por su cuenta: no hay nada que pausar.
 */
export default function ProductCarousel({ products, label }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateArrows) : null;
    observer?.observe(el);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      observer?.disconnect();
    };
  }, [updateArrows, products.length]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // Casi un ancho completo: la última tarjeta visible queda como referencia.
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const arrowClass =
    'hidden md:flex absolute top-[38%] -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white text-gray-900 shadow-lg shadow-black/30 ring-1 ring-black/5 hover:scale-105 transition-transform';

  return (
    <div role="region" aria-roledescription="carrusel" aria-label={label} className="relative">
      {canPrev && (
        <button type="button" onClick={() => scrollByPage(-1)} aria-label="Ver anteriores" className={`${arrowClass} -left-4`}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
      )}
      {canNext && (
        <button type="button" onClick={() => scrollByPage(1)} aria-label="Ver siguientes" className={`${arrowClass} -right-4`}>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      )}

      <ul
        ref={trackRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth motion-reduce:scroll-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <li
            key={p.id}
            // El ancho deja asomar la tarjeta siguiente: es la pista de que la
            // fila continúa hacia la derecha.
            className="grid snap-start shrink-0 basis-[58%] sm:basis-[29%] md:basis-[22%] lg:basis-[17.6%]"
          >
            <ProductCard {...p} variant="compact" showQuickAdd />
          </li>
        ))}
      </ul>
    </div>
  );
}

'use client';

import { useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Precarga una ruta cuando hay intención de abrirla (puntero encima, dedo que
 * toca o foco de teclado), no al entrar en pantalla.
 *
 * Una grilla del catálogo muestra 18–24 tarjetas: precargarlas todas al
 * aparecer competiría con las imágenes por el ancho de banda del celular. Con
 * la intención basta: entre el toque y el clic hay tiempo para traer la ficha,
 * que está prerenderizada.
 */
export function usePrefetchOnIntent(href: string) {
  const router = useRouter();
  const done = useRef(false);

  return useMemo(() => {
    const prefetch = () => {
      if (done.current) return;
      done.current = true;
      router.prefetch(href);
    };
    return { onMouseEnter: prefetch, onTouchStart: prefetch, onFocus: prefetch };
  }, [router, href]);
}

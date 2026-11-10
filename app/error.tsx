'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, MessageCircle } from 'lucide-react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    // El detalle del fallo no se muestra en pantalla: al usuario no le sirve y
    // puede filtrar datos internos. Queda en la consola del servidor/navegador.
    console.error('Error no controlado en la página:', error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-neko-magenta-ink mb-3">
        {'// Algo falló'}
      </p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
        No pudimos cargar esta página
      </h1>
      <p className="text-base text-gray-600 dark:text-gray-400 mb-8">
        Fue un problema de nuestro lado, no tuyo. Puedes reintentar; si vuelve a
        pasar, escríbenos y lo revisamos.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 px-6 min-h-11 rounded-lg bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white font-bold text-sm shadow-lg shadow-[#ec4899]/25 hover:shadow-[#ec4899]/45 transition-all active:scale-95"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Reintentar
        </button>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 px-6 min-h-11 rounded-lg border border-gray-300 dark:border-white/15 text-gray-800 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <MessageCircle size={16} aria-hidden="true" />
          Reportar el problema
        </Link>
      </div>

      {error.digest && (
        <p className="mt-8 text-xs text-gray-500 dark:text-gray-400">
          Código de referencia: <span className="font-mono">{error.digest}</span>
        </p>
      )}
    </div>
  );
}

import Image from 'next/image';

interface Props {
  covers: string[];
}

/** Rota el array n posiciones para que cada fila muestre portadas distintas al inicio */
function rotateArray<T>(arr: T[], n: number): T[] {
  const shift = n % arr.length;
  return [...arr.slice(shift), ...arr.slice(0, shift)];
}

/**
 * Filas de portadas moviéndose en loop infinito, dentro de un contenedor
 * rotado y sobredimensionado (-inset) para que cubra toda la pantalla sin
 * esquinas vacías. Cada fila duplica su lista y anima translateX(0 → -50%):
 * el segundo tramo es copia idéntica del primero, así el loop no salta.
 */
export default function MangaMarqueeBackground({ covers }: Props) {
  if (covers.length === 0) return null;

  // 7 filas; cada una parte de un offset distinto del mismo set para variar.
  // 25 portadas por fila (duplicadas = 50) bastan para cubrir el ancho rotado.
  const ROW_COUNT = 8;
  const PER_ROW = Math.min(25, covers.length);
  const rows = Array.from({ length: ROW_COUNT }, (_, i) =>
    rotateArray(covers, i * 7).slice(0, PER_ROW)
  );
  const directions = ['animate-marquee-left', 'animate-marquee-right'] as const;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Sobredimensionado + rotado: cubre las esquinas que la rotación descubre */}
      <div className="absolute -inset-[30%] -rotate-12 flex flex-col justify-between gap-3">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="overflow-hidden">
            <div
              className={`flex w-max gap-4 ${directions[rowIdx % directions.length]} hover:[animation-play-state:paused]`}
              style={{ animationDelay: `${-rowIdx * 6}s` }}
            >
              {[...row, ...row].map((src, i) => (
                <div
                  key={i}
                  className="relative w-28 h-40 sm:w-32 sm:h-48 rounded-lg overflow-hidden shrink-0 shadow-2xl shadow-black/50"
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="96px" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: tinte oscuro uniforme (el panel de texto ocupa todo el ancho).
          Desktop (sm+): degradado izquierda→derecha — oscuro bajo el panel de
          texto, transparente a la derecha para que las portadas luzcan. */}
      <div className="absolute inset-0 bg-[#050508]/85 sm:hidden pointer-events-none" />
      <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#050508] from-15% via-[#050508]/60 via-40% to-transparent pointer-events-none" />
    </div>
  );
}

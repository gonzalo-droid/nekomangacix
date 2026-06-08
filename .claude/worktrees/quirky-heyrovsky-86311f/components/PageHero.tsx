import type { ReactNode } from 'react';
import Wordmark from './Wordmark';

interface Props {
  /** Etiqueta corta sobre el título, estilo `// SECCIÓN` */
  eyebrow?: string;
  /** Título principal; puede contener nodos para aplicar gradiente a una parte */
  title: ReactNode;
  /** Subtítulo opcional */
  subtitle?: ReactNode;
  /** Contenido extra (ej. CTAs) */
  children?: ReactNode;
  /** Altura vertical del hero. Default: regular */
  size?: 'sm' | 'md';
  /** Clase adicional */
  className?: string;
  /** Si es true, muestra el wordmark "NEKO · MANGA · CIX" sobre el eyebrow. Default: true */
  showWordmark?: boolean;
}

/**
 * Hero corto y consistente para páginas internas (About, Contact, Auth...).
 * Fondo oscuro con halftone + blobs magenta/cyan. Usa prop `eyebrow` para la
 * etiqueta estilo cómic y `title` para el H1 (puedes envolver una palabra en
 * <span className="text-neko-gradient">...</span>).
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  size = 'md',
  className = '',
  showWordmark = true,
}: Props) {
  const py = size === 'sm' ? 'py-12 sm:py-16' : 'py-16 sm:py-20';

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#141424] to-[#0a0a0f] text-white isolate ${className}`}
    >
      {/* Halftone pattern */}
      <div className="absolute inset-0 bg-halftone opacity-60 pointer-events-none" aria-hidden="true" />

      {/* Glows */}
      <div
        className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#ec4899] opacity-25 blur-[80px] animate-blob pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-[#06b6d4] opacity-20 blur-[90px] animate-blob pointer-events-none"
        style={{ animationDelay: '2.5s' }}
        aria-hidden="true"
      />

      {/* Gradiente inferior de transición */}
      <div
        className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-[#0a0a0f] to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${py}`}>
        {showWordmark && (
          <div className="mb-4 opacity-80">
            <Wordmark size="sm" tone="dark" as="div" />
          </div>
        )}
        {eyebrow && (
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#ec4899] mb-3">
            {`// ${eyebrow}`}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base sm:text-lg text-white/75 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}

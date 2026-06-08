import type { ReactNode } from 'react';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type Layout = 'inline' | 'stacked';
type Tone = 'dark' | 'light' | 'auto';

interface Props {
  size?: Size;
  layout?: Layout;
  /** dark = texto claro sobre fondos oscuros · light = texto oscuro sobre fondos claros · auto = respeta dark mode */
  tone?: Tone;
  /** Si es true, "MANGA" usa el gradiente magenta→cyan. Default: true */
  gradientAccent?: boolean;
  className?: string;
  /** Tag HTML para accesibilidad — usa 'span' cuando ya hay un H1 cercano */
  as?: 'span' | 'div' | 'h1' | 'p';
}

const SIZE_MAP: Record<Size, { text: string; tracking: string; gap: string; dot: string }> = {
  xs:  { text: 'text-[10px]', tracking: 'tracking-[0.22em]', gap: 'gap-1',  dot: 'w-0.5 h-0.5' },
  sm:  { text: 'text-xs',     tracking: 'tracking-[0.2em]',  gap: 'gap-1.5', dot: 'w-1 h-1' },
  md:  { text: 'text-sm',     tracking: 'tracking-[0.18em]', gap: 'gap-2',   dot: 'w-1 h-1' },
  lg:  { text: 'text-base',   tracking: 'tracking-[0.16em]', gap: 'gap-2',   dot: 'w-1.5 h-1.5' },
  xl:  { text: 'text-xl',     tracking: 'tracking-[0.14em]', gap: 'gap-2.5', dot: 'w-1.5 h-1.5' },
  '2xl': { text: 'text-3xl sm:text-4xl', tracking: 'tracking-[0.12em]', gap: 'gap-3', dot: 'w-2 h-2' },
};

function toneClasses(tone: Tone): string {
  if (tone === 'dark') return 'text-white';
  if (tone === 'light') return 'text-gray-900';
  return 'text-gray-900 dark:text-white';
}

// Hoisted (evita lint react-hooks/static-components)
function Dot({ sizeClass, color }: { sizeClass: string; color: string }) {
  return (
    <span
      className={`inline-block rounded-full ${sizeClass} ${color}`}
      aria-hidden="true"
    />
  );
}

/**
 * Wordmark oficial de la marca: "NEKO MANGA CIX" con MANGA destacado
 * en gradiente magenta→cyan. Versátil (3 layouts, 6 tamaños) para usarse
 * en navbar, hero, footer, estados vacíos, shells de auth, etc.
 */
export default function Wordmark({
  size = 'md',
  layout = 'inline',
  tone = 'auto',
  gradientAccent = true,
  className = '',
  as = 'span',
}: Props) {
  const s = SIZE_MAP[size];
  const toneClass = toneClasses(tone);
  const Tag = as;

  const middle: ReactNode = gradientAccent ? (
    <span className="text-neko-gradient">MANGA</span>
  ) : (
    <span>MANGA</span>
  );

  if (layout === 'stacked') {
    return (
      <Tag
        className={`inline-flex flex-col leading-[1] font-black ${toneClass} ${s.tracking} ${className}`}
        aria-label="Neko Manga Cix"
      >
        <span className={`${s.text}`}>NEKO</span>
        <span className={`${s.text} ${gradientAccent ? 'text-neko-gradient' : ''}`}>
          MANGA
        </span>
        <span className={`${s.text}`}>CIX</span>
      </Tag>
    );
  }

  return (
    <Tag
      className={`inline-flex items-center font-black uppercase ${s.tracking} ${s.text} ${s.gap} ${toneClass} whitespace-nowrap ${className}`}
      aria-label="Neko Manga Cix"
    >
      <span>NEKO</span>
      <Dot sizeClass={s.dot} color="bg-[#ec4899]" />
      {middle}
      <Dot sizeClass={s.dot} color="bg-[#06b6d4]" />
      <span>CIX</span>
    </Tag>
  );
}

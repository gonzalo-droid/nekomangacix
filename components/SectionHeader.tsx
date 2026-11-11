interface Props {
  badge: string;
  title: string;
  description?: string;
  /** Encabezado centrado (secciones de cierre del home). */
  centered?: boolean;
  /** id del h2, para `aria-labelledby` de la sección. */
  id?: string;
}

/** Encabezado de sección del home: etiqueta `// …`, título y bajada. */
export default function SectionHeader({ badge, title, description, centered = false, id }: Props) {
  return (
    <div className={`relative mb-8 ${centered ? 'text-center' : ''}`}>
      <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-neko-magenta-ink mb-2">
        {badge}
      </span>
      <h2 id={id} className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
        {title}
      </h2>
      {description && (
        <p className={`text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 max-w-2xl ${centered ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}
      <span
        className={`absolute -bottom-3 w-16 h-1 bg-gradient-to-r from-[#ec4899] to-[#06b6d4] rounded-full ${centered ? 'left-1/2 -translate-x-1/2' : 'left-0'}`}
        aria-hidden="true"
      />
    </div>
  );
}

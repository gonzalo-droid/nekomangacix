'use client';

import { useEffect, useState } from 'react';
import PageHero from './PageHero';
import type { ReactNode } from 'react';

interface Section {
  id: string;
  title: string;
}

interface Props {
  eyebrow: string;
  heroTitle: ReactNode;
  heroSubtitle?: string;
  updatedAt: string;
  sections: Section[];
  children: ReactNode;
}

/**
 * Shell compartido para páginas legales (Términos, Privacidad).
 * Muestra el hero de marca + un TOC sticky en desktop con highlight del
 * section activo via IntersectionObserver.
 */
export default function LegalShell({
  eyebrow,
  heroTitle,
  heroSubtitle,
  updatedAt,
  sections,
  children,
}: Props) {
  const [active, setActive] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Primera sección visible gana
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="w-full">
      <PageHero eyebrow={eyebrow} title={heroTitle} subtitle={heroSubtitle} size="sm" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-8">
          Última actualización: <strong className="text-gray-700 dark:text-gray-300">{updatedAt}</strong>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-14">
          {/* TOC sticky — desktop */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24" aria-label="Tabla de contenidos">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ec4899] mb-3">
                {'// Secciones'}
              </p>
              <ul className="space-y-1">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`block text-sm py-1.5 px-2 rounded border-l-2 transition-colors ${
                        active === s.id
                          ? 'border-[#ec4899] text-[#ec4899] bg-[#ec4899]/5 font-semibold'
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-[#ec4899] hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Contenido */}
          <article className="prose-neko max-w-none">{children}</article>
        </div>
      </section>
    </div>
  );
}

/**
 * Bloque de sección individual. Usa `id` para que el TOC enlace.
 */
export function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-lg bg-gradient-to-br from-[#ec4899]/10 to-[#06b6d4]/10 text-[#ec4899] text-xs font-extrabold">
          {number}
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      <div className="text-gray-700 dark:text-gray-300 space-y-3 text-sm sm:text-[15px] leading-relaxed pl-0 sm:pl-11">
        {children}
      </div>
    </section>
  );
}

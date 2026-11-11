'use client';

import { useEffect, useState, type RefObject } from 'react';
import { ShoppingCart } from 'lucide-react';

interface Props {
  /** Bloque con los botones de compra de la ficha: la barra aparece cuando sale de pantalla. */
  targetRef: RefObject<HTMLElement | null>;
  price: number;
  /** Segunda línea bajo el precio ("Reserva con S/ 21.50", "En stock"). */
  detail: string;
  actionLabel: string;
  added: boolean;
  onAction: () => void;
}

/** Alto de la barra, para que el aviso de "agregado" se ubique encima. */
const BAR_HEIGHT = '4.75rem';

/**
 * Precio y botón de compra fijos al pie de la pantalla en el móvil.
 *
 * Solo se muestra mientras el bloque de compra de la ficha no está a la vista
 * y el pie de página tampoco: así no duplica el botón que ya se ve ni tapa el
 * footer al llegar al final.
 */
export default function StickyBuyBar({ targetRef, price, detail, actionLabel, added, onAction }: Props) {
  const [targetVisible, setTargetVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    const footer = document.querySelector('footer');
    if (!target || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === target) setTargetVisible(entry.isIntersecting);
        else setFooterVisible(entry.isIntersecting);
      }
    });
    observer.observe(target);
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, [targetRef]);

  const visible = !targetVisible && !footerVisible;

  useEffect(() => {
    const root = document.documentElement;
    // La barra solo existe por debajo de `lg`; en escritorio no hay que correr el aviso.
    const isMobile = window.matchMedia('(max-width: 1023.98px)').matches;
    if (visible && isMobile) root.style.setProperty('--sticky-cta-h', BAR_HEIGHT);
    else root.style.removeProperty('--sticky-cta-h');
    return () => {
      root.style.removeProperty('--sticky-cta-h');
    };
  }, [visible]);

  return (
    <div
      className={`lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 dark:border-white/10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-[0_-8px_24px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)] transition-transform duration-200 motion-reduce:transition-none ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      inert={!visible}
      aria-hidden={!visible}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold leading-tight text-[#2b496d] dark:text-neko-navy-ink">
            S/ {price.toFixed(2)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{detail}</p>
        </div>
        <button
          type="button"
          onClick={onAction}
          className={`flex-shrink-0 inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-xl text-sm font-bold text-white transition-colors active:scale-[0.98] ${
            added ? 'bg-emerald-700' : 'bg-[#be185d] hover:bg-[#9d174d]'
          }`}
        >
          <ShoppingCart size={16} aria-hidden="true" />
          {added ? '¡Agregado!' : actionLabel}
        </button>
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef } from 'react';

interface Options {
  /** Si el panel está abierto. */
  open: boolean;
  /** Se llama al pedir el cierre (Escape). */
  onClose: () => void;
  /**
   * `true` para un diálogo modal (el panel de filtros): además de cerrar con
   * Escape, bloquea el scroll de fondo, mueve el foco dentro del panel y lo
   * mantiene atrapado mientras esté abierto.
   *
   * `false` (por defecto) para un panel de revelado como el menú del header,
   * que no tapa la página: solo cierra con Escape.
   */
  modal?: boolean;
  /**
   * El control que abre el panel. Conviene pasarlo cuando algo dentro del
   * panel toma el foco al montarse (un campo con `autoFocus`, por ejemplo):
   * en ese caso el elemento activo ya no es el disparador cuando el efecto
   * corre, y sin esta referencia el foco no tendría a dónde volver.
   */
  triggerRef?: { current: HTMLElement | null };
}

const FOCUSABLES =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Comportamiento de teclado y foco que se espera de cualquier panel que se
 * abre sobre la página. Devuelve el ref que hay que poner en el panel.
 *
 * Al cerrar, el foco vuelve al control que lo abrió.
 */
export function useDismissable<T extends HTMLElement = HTMLDivElement>({
  open,
  onClose,
  modal = false,
  triggerRef,
}: Options) {
  const panelRef = useRef<T>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // El callback vive en un ref para que el efecto no se reinicie en cada
  // render del componente padre (lo que robaría el foco constantemente).
  // Se actualiza en un efecto, no durante el render: tocar un ref mientras
  // se renderiza rompe las garantías de React.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const focusFirst = useCallback(() => {
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLES)?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    openerRef.current = triggerRef?.current ?? (document.activeElement as HTMLElement | null);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (!modal || event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusables = [...panel.querySelectorAll<HTMLElement>(FOCUSABLES)].filter(
        (el) => el.offsetParent !== null
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    let previousOverflow = '';
    let raf = 0;
    if (modal) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      raf = requestAnimationFrame(focusFirst);
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (modal) {
        document.body.style.overflow = previousOverflow;
        cancelAnimationFrame(raf);
      }
      // Devuelve el foco a quien abrió el panel, si sigue en el documento.
      const opener = openerRef.current;
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [open, modal, focusFirst, triggerRef]);

  return panelRef;
}

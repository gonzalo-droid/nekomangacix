'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Truck, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { FREE_SHIPPING_THRESHOLD_PEN } from '@/lib/domain/cart/calculate';

interface Toast {
  id: number;
  title: string;
  editorial?: string;
  imageUrl?: string;
  isPreorder?: boolean;
}

interface ToastContextType {
  showCartToast: (opts: { title: string; editorial?: string; imageUrl?: string; isPreorder?: boolean }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

let idCounter = 0;

/**
 * Línea de envío gratis del aviso. Se calcula sobre el subtotal de lo que hay
 * en el carrito: el descuento de primera compra se descuenta recién en el
 * carrito, que es donde se da la cifra exacta.
 */
function FreeShippingHint() {
  const { getTotalPrice } = useCart();
  const subtotal = getTotalPrice();
  const missing = FREE_SHIPPING_THRESHOLD_PEN - subtotal;
  return (
    <p className="flex items-start gap-1.5 text-xs leading-snug text-gray-600 dark:text-gray-300">
      <Truck size={14} className="flex-shrink-0 mt-px text-neko-cyan-ink" aria-hidden="true" />
      <span>
        {missing > 0
          ? <>Te faltan <strong className="whitespace-nowrap text-gray-900 dark:text-white">S/ {missing.toFixed(2)}</strong> para el envío gratis</>
          : <strong className="text-neko-green-ink">Ya tienes envío gratis</strong>}
      </span>
    </p>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showCartToast = useCallback(
    (opts: { title: string; editorial?: string; imageUrl?: string; isPreorder?: boolean }) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev.slice(-2), { id, ...opts }]);
      // Con un enlace adentro, 3,5 s no alcanzan para leer y decidir.
      setTimeout(() => dismiss(id), 6000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showCartToast }}>
      {children}

      {/* Avisos. `--sticky-cta-h` lo fija la barra de compra de la ficha en el
          móvil, para que el aviso no quede debajo de ella. */}
      <div
        className="fixed right-4 sm:right-6 bottom-[calc(1.5rem+var(--sticky-cta-h,0px))] z-[200] flex flex-col gap-2 items-end pointer-events-none"
        role="status"
        aria-live="polite"
        aria-label="Notificaciones"
      >
        {toasts.map((toast, idx) => (
          <div
            key={toast.id}
            className="pointer-events-auto w-[min(20rem,calc(100vw-2rem))] bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 p-3 animate-slide-up"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative">
                {toast.imageUrl ? (
                  <Image src={toast.imageUrl} alt="" fill className="object-contain p-0.5" sizes="40px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg" aria-hidden="true">📚</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <CheckCircle2 size={13} className={toast.isPreorder ? 'text-blue-700 dark:text-blue-400' : 'text-emerald-700 dark:text-emerald-400'} aria-hidden="true" />
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${toast.isPreorder ? 'text-blue-700 dark:text-blue-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {toast.isPreorder ? 'Reservado' : 'Agregado al carrito'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">{toast.title}</p>
                {toast.editorial && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{toast.editorial}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="self-start -mr-1 -mt-1 w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                aria-label="Cerrar notificación"
              >
                <X size={16} />
              </button>
            </div>

            {/* Solo el último aviso lleva el cierre de compra: con tres
                apilados, repetirlo en cada uno es ruido. */}
            {idx === toasts.length - 1 && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
                <FreeShippingHint />
                <Link
                  href="/cart"
                  onClick={() => dismiss(toast.id)}
                  className="flex-shrink-0 inline-flex items-center min-h-11 px-3 rounded-lg text-sm font-bold text-white bg-[#be185d] hover:bg-[#9d174d] transition-colors"
                >
                  Ver carrito
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

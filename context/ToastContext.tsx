'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, CheckCircle2, X } from 'lucide-react';

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

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showCartToast = useCallback(
    (opts: { title: string; editorial?: string; imageUrl?: string; isPreorder?: boolean }) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev.slice(-2), { id, ...opts }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showCartToast }}>
      {children}

      {/* Toast container */}
      <div
        className="fixed bottom-6 right-4 sm:right-6 z-[200] flex flex-col gap-2 items-end pointer-events-none"
        aria-live="polite"
        aria-label="Notificaciones"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 px-4 py-3 max-w-xs w-full animate-slide-up"
          >
            {/* Imagen o ícono */}
            <div className="w-10 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative">
              {toast.imageUrl ? (
                <Image src={toast.imageUrl} alt={toast.title} fill className="object-contain p-0.5" sizes="40px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg">📚</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <CheckCircle2 size={13} className={toast.isPreorder ? 'text-blue-500' : 'text-emerald-500'} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${toast.isPreorder ? 'text-blue-500' : 'text-emerald-500'}`}>
                  {toast.isPreorder ? 'Reservado' : 'Agregado'}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">{toast.title}</p>
              {toast.editorial && (
                <p className="text-[11px] text-gray-400 truncate">{toast.editorial}</p>
              )}
            </div>

            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#ec4899]/10 flex items-center justify-center">
                <ShoppingCart size={14} className="text-[#ec4899]" />
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                aria-label="Cerrar notificación"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

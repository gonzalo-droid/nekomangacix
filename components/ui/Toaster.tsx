'use client';

import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import type { Toast, ToastType } from '@/hooks/useToast';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-green-500 flex-shrink-0" />,
  error: <XCircle size={18} className="text-red-500 flex-shrink-0" />,
  info: <Info size={18} className="text-blue-500 flex-shrink-0" />,
};

const borders: Record<ToastType, string> = {
  success: 'border-green-200 dark:border-green-800',
  error: 'border-red-200 dark:border-red-800',
  info: 'border-blue-200 dark:border-blue-800',
};

interface Props {
  toasts: Toast[];
  dismiss: (id: string) => void;
}

export default function Toaster({ toasts, dismiss }: Props) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 bg-white dark:bg-gray-800 border ${borders[t.type]} rounded-lg shadow-xl px-4 py-3 min-w-[280px] max-w-sm`}
        >
          {icons[t.type]}
          <p className="flex-1 text-sm text-gray-800 dark:text-gray-200">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

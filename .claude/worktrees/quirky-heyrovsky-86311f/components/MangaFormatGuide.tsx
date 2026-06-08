'use client';

import { useEffect, useState } from 'react';
import { Ruler, X } from 'lucide-react';

type Row = {
  label: string;
  tankoubon: string;
  b6: string;
  b6Double: string;
  a5: string;
  kanzenban: string;
};

const ROWS: Row[] = [
  { label: 'Alto (cm)',             tankoubon: '17',      b6: '18',       b6Double: '18',     a5: '21',       kanzenban: '21' },
  { label: 'Ancho (cm)',            tankoubon: '11.5',    b6: '13',       b6Double: '13',     a5: '15',       kanzenban: '15' },
  { label: 'Grosor aprox. (cm)',    tankoubon: '1.5–2',   b6: '1.5–2',    b6Double: '3–3.5',  a5: '1.5–2.5',  kanzenban: '2.5–3.5' },
  { label: 'Páginas típicas',       tankoubon: '180–220', b6: '180–220',  b6Double: '360–420', a5: '180–250', kanzenban: '350–450' },
  { label: 'Peso orientativo (g)',  tankoubon: '250–300', b6: '250–300',  b6Double: '350–450', a5: '350–450', kanzenban: '500–700' },
  { label: 'Uso más común',         tankoubon: 'Shonen',  b6: 'Seinen/Shojo', b6Double: '2-en-1', a5: 'Ed. grande', kanzenban: 'Kanzenban/Lujo' },
];

interface Props {
  variant?: 'primary' | 'ghost';
  floating?: boolean;
  className?: string;
}

export default function MangaFormatGuide({ variant = 'primary', floating = false, className = '' }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const buttonBase = 'inline-flex items-center gap-2 font-semibold rounded-lg transition-all active:scale-95';
  const variants = {
    primary: 'px-4 py-2.5 bg-[#2b496d] text-white hover:bg-[#1e3550] shadow-md hover:shadow-lg',
    ghost:   'px-3 py-2 text-[#2b496d] dark:text-[#5a7a9e] hover:bg-[#2b496d]/10 border border-[#2b496d]/30',
  };
  const floatingClass = floating
    ? 'fixed bottom-20 right-6 z-40 px-4 py-3 bg-[#2b496d] text-white hover:bg-[#1e3550] shadow-xl'
    : '';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${buttonBase} ${floating ? floatingClass : variants[variant]} ${className}`}
        aria-label="Abrir guía de formatos de manga"
      >
        <Ruler size={18} />
        <span className="whitespace-nowrap">Guía de Formatos</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="format-guide-title"
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#2b496d] to-[#1e3550] text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Ruler size={22} />
                </div>
                <div>
                  <h2 id="format-guide-title" className="text-xl font-bold">Guía de Formatos de Manga</h2>
                  <p className="text-sm text-white/80 mt-0.5">Compara medidas, páginas y peso</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-auto p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="sticky left-0 bg-gray-50 dark:bg-gray-800 text-left font-semibold text-gray-700 dark:text-gray-200 px-3 py-3 border-b border-gray-200 dark:border-gray-700">
                        Especificación
                      </th>
                      {['Tankoubon', 'B6', 'B6 Doble', 'A5', 'Kanzenban/Deluxe'].map((h) => (
                        <th
                          key={h}
                          className="text-center font-semibold text-[#2b496d] dark:text-[#5a7a9e] px-3 py-3 border-b border-gray-200 dark:border-gray-700 min-w-[120px]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row, i) => (
                      <tr
                        key={row.label}
                        className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'}
                      >
                        <td className="sticky left-0 bg-inherit font-medium text-gray-900 dark:text-white px-3 py-3 border-b border-gray-100 dark:border-gray-800">
                          {row.label}
                        </td>
                        <td className="text-center text-gray-700 dark:text-gray-300 px-3 py-3 border-b border-gray-100 dark:border-gray-800">{row.tankoubon}</td>
                        <td className="text-center text-gray-700 dark:text-gray-300 px-3 py-3 border-b border-gray-100 dark:border-gray-800">{row.b6}</td>
                        <td className="text-center text-gray-700 dark:text-gray-300 px-3 py-3 border-b border-gray-100 dark:border-gray-800">{row.b6Double}</td>
                        <td className="text-center text-gray-700 dark:text-gray-300 px-3 py-3 border-b border-gray-100 dark:border-gray-800">{row.a5}</td>
                        <td className="text-center text-gray-700 dark:text-gray-300 px-3 py-3 border-b border-gray-100 dark:border-gray-800">{row.kanzenban}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 p-4 rounded-lg bg-[#2b496d]/5 dark:bg-[#5a7a9e]/10 border border-[#2b496d]/20 dark:border-[#5a7a9e]/20">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-[#2b496d] dark:text-[#5a7a9e]">Nota:</span> las medidas son aproximadas y pueden variar según la editorial. Si dudas entre dos formatos, fíjate primero en <strong>alto</strong> y <strong>ancho</strong>.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 py-2 bg-[#2b496d] text-white font-semibold rounded-lg hover:bg-[#1e3550] transition-colors text-sm"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

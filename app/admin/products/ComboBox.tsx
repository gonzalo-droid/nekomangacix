'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  emptyLabel?: string;
}

/**
 * Input tipo buscador + selector:
 * - Al enfocar muestra toda la lista de opciones.
 * - Escribir filtra la lista, pero el valor libre siempre se acepta (no restringe a las opciones).
 * - Seleccionar una opción la aplica y cierra el dropdown.
 * - Vacío es un valor válido (no fuerza selección).
 */
export default function ComboBox({ value, onChange, options, placeholder, className, emptyLabel }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = value.trim()
    ? options.filter((o) => o.toLowerCase().includes(value.trim().toLowerCase()))
    : options;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          className={className}
          value={value}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
          tabIndex={-1}
          aria-label="Mostrar opciones"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 shadow-xl">
          {value.trim() && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/5"
            >
              {emptyLabel ?? '— Dejar vacío —'}
            </button>
          )}
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-[#ec4899]/10 dark:hover:bg-[#ec4899]/10 transition-colors"
              >
                {opt}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-gray-400">
              Sin coincidencias — se usará &ldquo;{value}&rdquo; como nuevo valor
            </p>
          )}
        </div>
      )}
    </div>
  );
}

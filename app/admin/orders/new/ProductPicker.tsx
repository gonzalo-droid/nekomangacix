'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Plus } from 'lucide-react';

export interface PickableProduct {
  id: string;
  title: string;
  price_pen: number;
  stock: number;
  stock_status: string;
  country_code: string;
}

interface Props {
  onPick: (product: PickableProduct) => void;
}

export default function ProductPicker({ onPick }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PickableProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams({ page: '1', pageSize: '10', search: query, category: '', status: '', editorial: '', country_code: '', active: 'true' });
      const res = await fetch(`/api/admin/products?${params}`);
      const json = await res.json();
      setResults(json.data ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar producto por título o SKU..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ec4899]/50"
        />
      </div>
      {open && query.trim().length >= 2 && (
        <div className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 shadow-xl">
          {loading ? (
            <p className="px-3 py-2 text-sm text-gray-400">Buscando...</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { onPick(p); setQuery(''); setResults([]); setOpen(false); }}
                className="w-full flex items-center justify-between gap-3 text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-[#ec4899]/10 transition-colors"
              >
                <span className="truncate">
                  {p.title}
                  <span className="text-xs text-gray-400 ml-2">
                    {p.stock_status === 'preorder' ? 'Preventa' : `Stock: ${p.stock}`}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-[#2b496d] dark:text-[#5a7a9e] shrink-0">
                  <Plus size={12} /> S/ {Number(p.price_pen).toFixed(2)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  editorial: string;
  price_pen: number;
  stock_status: string;
  images?: string[];
  country_code?: string;
}

const STOCK_LABEL: Record<string, { label: string; cls: string }> = {
  in_stock:     { label: 'En stock',  cls: 'text-emerald-500' },
  preorder:     { label: 'Preventa',  cls: 'text-blue-500' },
  out_of_stock: { label: 'Agotado',   cls: 'text-red-500' },
};

interface Props {
  onClose?: () => void;
  autoFocus?: boolean;
  className?: string;
}

export default function SearchDropdown({ onClose, autoFocus, className = '' }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(query, 220);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      setResults([]); setOpen(false); return;
    }
    setLoading(true);
    fetch(`/api/products/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => { setResults(data); setOpen(true); setActiveIdx(-1); })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Cierre al click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goToSearch = useCallback(() => {
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    setQuery(''); setOpen(false); onClose?.();
  }, [query, router, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, -1)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) {
        router.push(`/products/${results[activeIdx].slug}`);
        setQuery(''); setOpen(false); onClose?.();
      } else {
        goToSearch();
      }
    }
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative group">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#06b6d4] transition-colors pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Buscar manga, autor..."
          autoFocus={autoFocus}
          autoComplete="off"
          className="w-full pl-8 pr-8 py-2 bg-gray-100/80 dark:bg-white/5 border border-transparent rounded-full text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all"
          aria-label="Buscar manga"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-gray-100 dark:border-white/10 overflow-hidden z-50">
          {loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">Buscando...</div>
          )}

          {!loading && results.length === 0 && debouncedQuery.length >= 3 && (
            <div className="px-4 py-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Sin resultados para <span className="font-semibold text-gray-700 dark:text-gray-200">&ldquo;{debouncedQuery}&rdquo;</span></p>
            </div>
          )}

          {results.length > 0 && (
            <ul role="listbox">
              {results.map((item, idx) => {
                const imgUrl = item.images?.[0] ? getCloudinaryUrl(item.images[0]) : null;
                const stock = STOCK_LABEL[item.stock_status];
                const isActive = idx === activeIdx;
                return (
                  <li key={item.id} role="option" aria-selected={isActive}>
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => { setQuery(''); setOpen(false); onClose?.(); }}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        isActive
                          ? 'bg-[#ec4899]/8 dark:bg-[#ec4899]/10'
                          : 'hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="w-10 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative">
                        {imgUrl ? (
                          <Image src={imgUrl} alt={item.title} fill className="object-contain p-0.5" sizes="40px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">📚</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 truncate">{item.editorial}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-bold text-[#2b496d] dark:text-[#5a7a9e]">S/ {item.price_pen.toFixed(2)}</p>
                        {stock && <p className={`text-[10px] font-semibold ${stock.cls}`}>{stock.label}</p>}
                      </div>
                    </Link>
                  </li>
                );
              })}

              {/* Ver todos */}
              <li className="border-t border-gray-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={goToSearch}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#ec4899] hover:bg-[#ec4899]/5 transition-colors"
                >
                  Ver todos los resultados de &ldquo;{query}&rdquo;
                  <ArrowRight size={14} />
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

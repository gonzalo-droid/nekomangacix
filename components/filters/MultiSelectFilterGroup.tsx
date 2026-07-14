'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  count: number;
}

interface MultiSelectFilterGroupProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export default function MultiSelectFilterGroup({
  options,
  selected,
  onChange,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Sin resultados',
}: MultiSelectFilterGroupProps) {
  const [query, setQuery] = useState('');

  const visibleOptions =
    searchable && query.trim()
      ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
      : options;

  const toggle = (value: string) => {
    onChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    );
  };

  return (
    <div className="space-y-2">
      {searchable && (
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b496d]/40 focus:border-[#2b496d] transition-all"
          />
        </div>
      )}
      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
        {visibleOptions.length === 0 && (
          <p className="text-xs text-gray-400 py-2 px-1">{emptyMessage}</p>
        )}
        {visibleOptions.map((opt) => {
          const checked = selected.includes(opt.value);
          return (
            <label
              key={opt.value}
              className="flex items-center justify-between gap-2 px-1.5 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
            >
              <span className="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt.value)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#2b496d] focus:ring-[#2b496d]/40 flex-shrink-0"
                />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                  {opt.label}
                </span>
              </span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                {opt.count}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

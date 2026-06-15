'use client';

import { useState, useEffect } from 'react';
import { X, GitMerge } from 'lucide-react';

interface Props {
  series: string[];
  onClose: () => void;
}

const FIELDS: { key: string; label: string; type: 'text' | 'number' | 'select' }[] = [
  { key: 'editorial', label: 'Editorial', type: 'text' },
  { key: 'price_pen', label: 'Precio (PEN)', type: 'number' },
  { key: 'country_code', label: 'País', type: 'select' },
  { key: 'stock_status', label: 'Estado de stock', type: 'select' },
  { key: 'author', label: 'Autor', type: 'text' },
  { key: 'description', label: 'Descripción', type: 'text' },
];

const STOCK_STATUS_OPTIONS = ['in_stock', 'on_demand', 'preorder', 'out_of_stock'];
const COUNTRY_OPTIONS = ['AR', 'MX', 'ES', 'JP'];

export default function SeriesPropagateModal({ series: seriesProp, onClose }: Props) {
  const [allSeries, setAllSeries] = useState<string[]>(seriesProp);
  const [selectedSeries, setSelectedSeries] = useState('');
  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; updated?: number; error?: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/products/series-list')
      .then((r) => r.json())
      .then((data) => { if (data.series) setAllSeries(data.series); })
      .catch(() => {});
  }, []);

  function toggleField(key: string) {
    setEnabledFields((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function setValue(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handlePropagate() {
    if (!selectedSeries) return;
    const fields = Object.entries(enabledFields).filter(([, on]) => on).map(([k]) => k);
    if (!fields.length) return;

    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      payload[f] = f === 'price_pen' ? Number(values[f]) : values[f];
    }

    setLoading(true);
    setResult(null);
    const res = await fetch('/api/admin/products/propagate-series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ series: selectedSeries, fields, values: payload }),
    });
    const json = await res.json();
    setLoading(false);
    setResult(res.ok ? { ok: true, updated: json.updated } : { ok: false, error: json.error });
  }

  const activeFields = Object.entries(enabledFields).filter(([, on]) => on).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitMerge size={18} className="text-[#2b496d] dark:text-[#5a7a9e]" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Propagar a serie</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        {/* Serie */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
            Serie
          </label>
          <select
            value={selectedSeries}
            onChange={(e) => setSelectedSeries(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]/40"
          >
            <option value="">Seleccionar serie...</option>
            {allSeries.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Campos */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Campos a propagar
          </p>
          {FIELDS.map((f) => (
            <div key={f.key} className="flex items-center gap-3">
              <input
                type="checkbox"
                id={`field-${f.key}`}
                checked={!!enabledFields[f.key]}
                onChange={() => toggleField(f.key)}
                className="w-4 h-4 rounded accent-[#2b496d] flex-shrink-0"
              />
              <label htmlFor={`field-${f.key}`} className="text-sm text-gray-700 dark:text-gray-300 w-32 flex-shrink-0 cursor-pointer">
                {f.label}
              </label>
              {enabledFields[f.key] && (
                f.key === 'stock_status' ? (
                  <select
                    value={values[f.key] ?? ''}
                    onChange={(e) => setValue(f.key, e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]/40"
                  >
                    <option value="">Seleccionar...</option>
                    {STOCK_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.key === 'country_code' ? (
                  <select
                    value={values[f.key] ?? ''}
                    onChange={(e) => setValue(f.key, e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]/40"
                  >
                    <option value="">Seleccionar...</option>
                    {COUNTRY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    value={values[f.key] ?? ''}
                    onChange={(e) => setValue(f.key, e.target.value)}
                    placeholder={f.label}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]/40"
                  />
                )
              )}
            </div>
          ))}
        </div>

        {result && (
          result.ok
            ? <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
                ✓ {result.updated} producto{result.updated !== 1 ? 's' : ''} actualizados
              </p>
            : <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                {result.error}
              </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handlePropagate}
            disabled={!selectedSeries || !activeFields || loading}
            className="flex-1 py-2 text-sm font-semibold bg-[#2b496d] hover:bg-[#1e3550] text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            {loading ? 'Propagando...' : `Propagar${activeFields ? ` (${activeFields} campo${activeFields !== 1 ? 's' : ''})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

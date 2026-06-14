'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, BookOpen, Layers } from 'lucide-react';
import type { Series, SeriesStatus, SeriesSharedField } from '@/lib/series';
import { COUNTRY_CODES, COUNTRIES } from '@/lib/constants/countries';
import { DEMOGRAPHICS, DEMOGRAPHIC_LABELS } from '@/lib/constants/demographics';
import { generateSlug } from '@/lib/products';

const STATUS_LABELS: Record<SeriesStatus, string> = {
  ongoing: 'En curso',
  completed: 'Completada',
  single: 'Tomo único',
};

const EMPTY_FORM = {
  name: '',
  description: '',
  full_description: '',
  author: '',
  editorial: '',
  country_code: '',
  demographic: '',
  series_status: 'ongoing' as SeriesStatus,
  cover_image: '',
  base_price_pen: '',
};

type FormState = typeof EMPTY_FORM;
type RawVolume = {
  id: string; sku: string; slug: string; title: string;
  volume_number?: number; price_pen: number; stock: number;
  stock_status: string; images: string[]; is_active: boolean;
};
type RawSeries = Series & { volumes?: RawVolume[] };

const PROPAGABLE: { field: SeriesSharedField; label: string }[] = [
  { field: 'description', label: 'Descripción' },
  { field: 'full_description', label: 'Descripción completa' },
  { field: 'author', label: 'Autor' },
  { field: 'editorial', label: 'Editorial' },
  { field: 'country_code', label: 'País' },
  { field: 'demographic', label: 'Demografía' },
  { field: 'price_pen', label: 'Precio (S/)' },
];

export default function SeriesManager() {
  const [series, setSeries] = useState<RawSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [propagate, setPropagate] = useState<Set<SeriesSharedField>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/series');
    const json = await res.json();
    setSeries(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditing(null);
    setPropagate(new Set());
    setError(null);
    setShowForm(true);
  }

  function openEdit(s: RawSeries) {
    setForm({
      name: s.name,
      description: s.description ?? '',
      full_description: s.fullDescription ?? '',
      author: s.author ?? '',
      editorial: s.editorial ?? '',
      country_code: s.countryCode ?? '',
      demographic: s.demographic ?? '',
      series_status: s.seriesStatus,
      cover_image: s.coverImage ?? '',
      base_price_pen: s.basePricePen ? String(s.basePricePen) : '',
    });
    setEditing(s.id);
    setPropagate(new Set());
    setError(null);
    setShowForm(true);
  }

  async function save() {
    if (!form.name.trim()) { setError('El nombre es requerido'); return; }
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      slug: generateSlug(form.name),
      description: form.description || null,
      full_description: form.full_description || null,
      author: form.author || null,
      editorial: form.editorial || null,
      country_code: form.country_code || null,
      demographic: form.demographic || null,
      series_status: form.series_status,
      cover_image: form.cover_image || null,
      base_price_pen: form.base_price_pen ? Number(form.base_price_pen) : null,
      ...(propagate.size > 0 && { propagate: Array.from(propagate) }),
    };

    const url = editing ? `/api/admin/series/${editing}` : '/api/admin/series';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();

    if (!res.ok) { setError(json.error ?? 'Error al guardar'); setSaving(false); return; }
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function remove(s: RawSeries) {
    if (!confirm(`¿Eliminar la serie "${s.name}"? Los tomos quedarán sin serie asignada.`)) return;
    await fetch(`/api/admin/series/${s.id}`, { method: 'DELETE' });
    load();
  }

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const toggleProp = (field: SeriesSharedField) =>
    setPropagate((prev) => { const n = new Set(prev); n.has(field) ? n.delete(field) : n.add(field); return n; });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Layers size={20} /> Series
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#2b496d] hover:bg-[#1e3550] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Nueva serie
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : series.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No hay series aún.</p>
      ) : (
        <div className="space-y-3">
          {series.map((s) => {
            const vols = s.volumes ?? [];
            const isOpen = expanded.has(s.id);
            return (
              <div key={s.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                {/* Series header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <button type="button" onClick={() => toggleExpand(s.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <BookOpen size={16} className="text-[#2b496d] dark:text-[#5a7a9e] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white">{s.name}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        s.seriesStatus === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : s.seriesStatus === 'single' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {STATUS_LABELS[s.seriesStatus]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {s.author && <span>{s.author} · </span>}
                      {s.editorial && <span>{s.editorial} · </span>}
                      <span>{vols.length} tomo{vols.length !== 1 ? 's' : ''}</span>
                      {s.basePricePen && <span> · S/ {s.basePricePen.toFixed(2)} base</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-[#2b496d] transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button type="button" onClick={() => remove(s)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Volumes list */}
                {isOpen && (
                  <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                    {vols.length === 0 ? (
                      <p className="text-xs text-gray-400 px-10 py-3">Sin tomos asignados aún.</p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                            <th className="px-10 py-2 text-left">Tomo</th>
                            <th className="px-4 py-2 text-left">Título</th>
                            <th className="px-4 py-2 text-left">Precio</th>
                            <th className="px-4 py-2 text-left">Stock</th>
                            <th className="px-4 py-2 text-left">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                          {vols
                            .sort((a, b) => (a.volume_number ?? 0) - (b.volume_number ?? 0))
                            .map((v) => (
                              <tr key={v.id} className="hover:bg-white dark:hover:bg-gray-800/50">
                                <td className="px-10 py-2 font-mono text-gray-500 dark:text-gray-400">
                                  {v.volume_number != null ? `#${v.volume_number}` : '—'}
                                </td>
                                <td className="px-4 py-2 text-gray-800 dark:text-gray-200 max-w-[200px] truncate">{v.title}</td>
                                <td className="px-4 py-2 font-semibold text-[#2b496d] dark:text-[#5a7a9e]">S/ {Number(v.price_pen).toFixed(2)}</td>
                                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{v.stock}</td>
                                <td className="px-4 py-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    v.stock_status === 'in_stock' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : v.stock_status === 'preorder' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  }`}>
                                    {v.stock_status === 'in_stock' ? 'Stock' : v.stock_status === 'preorder' ? 'Preventa' : 'Agotado'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editing ? 'Editar serie' : 'Nueva serie'}
            </h3>

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Nombre *</span>
                <input type="text" value={form.name} onChange={(e) => set({ name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]/50"
                  placeholder="Ej: Jujutsu Kaisen" />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Autor</span>
                  <input type="text" value={form.author} onChange={(e) => set({ author: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                    placeholder="Gege Akutami" />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Editorial</span>
                  <input type="text" value={form.editorial} onChange={(e) => set({ editorial: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                    placeholder="Ivrea" />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Estado</span>
                  <select value={form.series_status} onChange={(e) => set({ series_status: e.target.value as SeriesStatus })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none">
                    <option value="ongoing">En curso</option>
                    <option value="completed">Completada</option>
                    <option value="single">Tomo único</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">País</span>
                  <select value={form.country_code} onChange={(e) => set({ country_code: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none">
                    <option value="">—</option>
                    {COUNTRY_CODES.map((c) => <option key={c} value={c}>{COUNTRIES[c].flag} {COUNTRIES[c].name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Demografía</span>
                  <select value={form.demographic} onChange={(e) => set({ demographic: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none">
                    <option value="">—</option>
                    {DEMOGRAPHICS.map((d) => <option key={d} value={d}>{DEMOGRAPHIC_LABELS[d]}</option>)}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Precio base (S/)</span>
                  <input type="number" min={0} step={0.01} value={form.base_price_pen} onChange={(e) => set({ base_price_pen: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                    placeholder="45.00" />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Imagen portada</span>
                  <input type="text" value={form.cover_image} onChange={(e) => set({ cover_image: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                    placeholder="cloudinary-id o URL" />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Descripción corta</span>
                <textarea value={form.description} onChange={(e) => set({ description: e.target.value })} rows={2}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none resize-none"
                  placeholder="Descripción compartida entre todos los tomos..." />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Descripción completa</span>
                <textarea value={form.full_description} onChange={(e) => set({ full_description: e.target.value })} rows={3}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none resize-none" />
              </label>

              {/* Propagate to volumes — only when editing */}
              {editing && (
                <div className="border border-[#2b496d]/20 dark:border-[#5a7a9e]/20 rounded-lg p-3 space-y-2 bg-blue-50/50 dark:bg-blue-900/10">
                  <p className="text-xs font-semibold text-[#2b496d] dark:text-[#5a7a9e]">
                    Aplicar cambios a todos los tomos de esta serie:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PROPAGABLE.map(({ field, label }) => (
                      <button
                        key={field}
                        type="button"
                        onClick={() => toggleProp(field)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                          propagate.has(field)
                            ? 'bg-[#2b496d] border-[#2b496d] text-white'
                            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#2b496d]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {propagate.size > 0 && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">
                      ⚠ Los campos seleccionados se sobreescribirán en todos los tomos.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancelar
              </button>
              <button type="button" onClick={save} disabled={saving}
                className="flex-1 py-2 text-sm font-semibold bg-[#2b496d] hover:bg-[#1e3550] text-white rounded-lg disabled:opacity-50 transition-colors">
                {saving ? 'Guardando...' : editing ? 'Guardar' + (propagate.size > 0 ? ` y aplicar a ${propagate.size} campo(s)` : '') : 'Crear serie'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

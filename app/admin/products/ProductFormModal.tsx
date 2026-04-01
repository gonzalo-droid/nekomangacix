'use client';

import { useState, FormEvent } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { AdminProduct } from './useAdminProducts';

const CATEGORIES = [
  'shonen','seinen','shojo','josei','kodomo','isekai',
  'slice_of_life','horror','romance','action','comedy',
  'drama','fantasy','sci-fi','sports','mystery',
];
const STOCK_STATUSES = ['in_stock','on_demand','preorder','out_of_stock'];
const COUNTRY_GROUPS = ['Argentina','México'];


interface Props {
  product?: AdminProduct | null;
  onClose: () => void;
  onSubmit: (data: Partial<AdminProduct>) => Promise<boolean>;
}

const EMPTY: Partial<AdminProduct> = {
  title: '', sku: '', editorial: '', author: '', series: null,
  price_pen: 0, stock: 0, stock_status: 'in_stock',
  category: 'shonen', country_group: 'Argentina',
  description: '', full_description: '',
  images: [], tags: [], is_active: true,
  estimated_arrival: '', preorder_deposit: undefined,
  specifications: { pages: '', format: '', language: 'Español', isbn: '', dimensions: '', weight: '' },
};

export default function ProductFormModal({ product, onClose, onSubmit }: Props) {
  const isEdit = !!product;
  const [form, setForm] = useState<Partial<AdminProduct>>(product ?? EMPTY);
  const [imagesInput, setImagesInput] = useState((product?.images ?? []).join(', '));
  const [tagsInput, setTagsInput] = useState((product?.tags ?? []).join(', '));
  const [specs, setSpecs] = useState<Record<string, string>>({
    pages: String(product?.specifications?.pages ?? ''),
    format: String(product?.specifications?.format ?? ''),
    language: String(product?.specifications?.language ?? 'Español'),
    isbn: String(product?.specifications?.isbn ?? ''),
    dimensions: String(product?.specifications?.dimensions ?? ''),
    weight: String(product?.specifications?.weight ?? ''),
  });
  const [saving, setSaving] = useState(false);

  // slug and sku are auto-generated server-side on create

  const set = (key: keyof AdminProduct, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const images = imagesInput.split(',').map((s) => s.trim()).filter(Boolean);
    const tags   = tagsInput.split(',').map((s) => s.trim()).filter(Boolean);
    const specifications: Record<string, string | number> = {};
    Object.entries(specs).forEach(([k, v]) => {
      if (v.trim()) specifications[k] = isNaN(Number(v)) ? v : Number(v);
    });

    const payload: Partial<AdminProduct> = {
      ...form,
      images,
      tags,
      specifications: Object.keys(specifications).length ? specifications : null,
      author: (form.author as string)?.trim() || null,
      description: (form.description as string)?.trim() || null,
      full_description: (form.full_description as string)?.trim() || null,
      estimated_arrival: (form.estimated_arrival as string)?.trim() || null,
      preorder_deposit: form.preorder_deposit || null,
    };

    const ok = await onSubmit(payload);
    setSaving(false);
    if (ok) onClose();
  }

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]';
  const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Información básica */}
          <section>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-1 border-b border-gray-100 dark:border-gray-700">
              Información básica
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Título *</label>
                <input className={inputClass} required value={form.title ?? ''} onChange={(e) => set('title', e.target.value)} />
              </div>
              {isEdit && (
                <>
                  <div>
                    <label className={labelClass}>SKU (auto-generado)</label>
                    <input className={`${inputClass} opacity-60 cursor-not-allowed`} readOnly value={form.sku ?? ''} />
                  </div>
                  <div>
                    <label className={labelClass}>Slug (auto-generado)</label>
                    <input className={`${inputClass} opacity-60 cursor-not-allowed`} readOnly value={form.slug ?? ''} />
                  </div>
                </>
              )}
              <div>
                <label className={labelClass}>Serie</label>
                <input className={inputClass} placeholder="ej: Jujutsu Kaisen" value={form.series ?? ''} onChange={(e) => set('series', e.target.value || null)} />
              </div>
              <div>
                <label className={labelClass}>Editorial *</label>
                <input className={inputClass} required value={form.editorial ?? ''} onChange={(e) => set('editorial', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Autor</label>
                <input className={inputClass} value={form.author ?? ''} onChange={(e) => set('author', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Categoría *</label>
                <select className={inputClass} value={form.category ?? 'shonen'} onChange={(e) => set('category', e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Grupo país *</label>
                <select className={inputClass} value={form.country_group ?? 'Argentina'} onChange={(e) => set('country_group', e.target.value)}>
                  {COUNTRY_GROUPS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Precio y stock */}
          <section>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-1 border-b border-gray-100 dark:border-gray-700">
              Precio y stock
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Precio PEN (S/) *</label>
                <input type="number" min="0" step="0.01" className={inputClass} required
                  value={form.price_pen ?? 0} onChange={(e) => set('price_pen', parseFloat(e.target.value))} />
              </div>
              <div>
                <label className={labelClass}>Stock</label>
                <input type="number" min="0" className={inputClass}
                  value={form.stock ?? 0} onChange={(e) => set('stock', parseInt(e.target.value))} />
              </div>
              <div>
                <label className={labelClass}>Estado de stock *</label>
                <select className={inputClass} value={form.stock_status ?? 'in_stock'} onChange={(e) => set('stock_status', e.target.value)}>
                  {STOCK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Depósito preventa (S/)</label>
                <input type="number" min="0" step="0.01" className={inputClass}
                  value={form.preorder_deposit ?? ''} onChange={(e) => set('preorder_deposit', e.target.value ? parseFloat(e.target.value) : undefined)} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Fecha estimada de llegada</label>
                <input type="date" className={inputClass}
                  value={form.estimated_arrival ?? ''} onChange={(e) => set('estimated_arrival', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Contenido */}
          <section>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-1 border-b border-gray-100 dark:border-gray-700">
              Contenido
            </h3>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Descripción corta</label>
                <textarea rows={2} className={inputClass}
                  value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Descripción completa</label>
                <textarea rows={4} className={inputClass}
                  value={form.full_description ?? ''} onChange={(e) => set('full_description', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Tags (separados por coma)</label>
                <input className={inputClass} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="manga, acción, aventura" />
              </div>
            </div>
          </section>

          {/* Imágenes */}
          <section>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-1 border-b border-gray-100 dark:border-gray-700">
              Imágenes y especificaciones
            </h3>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Imágenes (IDs de Cloudinary, separados por coma)</label>
                <input className={inputClass} value={imagesInput} onChange={(e) => setImagesInput(e.target.value)}
                  placeholder="jjk-vol1, jjk-vol1-back" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['pages','format','language','isbn','dimensions','weight'].map((k) => (
                  <div key={k}>
                    <label className={labelClass}>{k}</label>
                    <input className={inputClass} value={specs[k] ?? ''}
                      onChange={(e) => setSpecs((prev) => ({ ...prev, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Visible */}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_active" checked={!!form.is_active}
              onChange={(e) => set('is_active', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#2b496d]" />
            <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
              Producto visible en la tienda
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancelar
          </button>
          <button type="submit" form="" disabled={saving}
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            className="px-5 py-2 text-sm rounded-lg bg-[#2b496d] hover:bg-[#1e3550] disabled:opacity-50 text-white font-semibold flex items-center gap-2">
            {saving && <Loader2 size={15} className="animate-spin" />}
            {isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  );
}

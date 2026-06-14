'use client';

import { useState, useMemo, FormEvent } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { AdminProduct } from './useAdminProducts';
import { COUNTRIES, COUNTRY_CODES, type CountryCode } from '@/lib/constants/countries';
import { getEditorialsForCountry } from '@/lib/constants/editorials';
import { DEMOGRAPHIC_LABELS, DEMOGRAPHICS } from '@/lib/constants/demographics';
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS } from '@/lib/constants/productTypes';

const STOCK_STATUSES = ['in_stock', 'preorder', 'out_of_stock'];

interface Props {
  product?: AdminProduct | null;
  onClose: () => void;
  onSubmit: (data: Partial<AdminProduct>) => Promise<boolean>;
}

const EMPTY: Partial<AdminProduct> = {
  title: '', sku: '', editorial: 'Ivrea', author: null, series: null,
  price_pen: 0, stock: 0, stock_status: 'preorder',
  type: 'manga', country_code: 'AR', demographic: null,
  eta_text: null, description: null, full_description: null,
  images: [], tags: [], attributes: {}, is_active: true,
  estimated_arrival: null, preorder_deposit: undefined,
  series_status: null,
};

export default function ProductFormModal({ product, onClose, onSubmit }: Props) {
  const isEdit = !!product;
  const [form, setForm] = useState<Partial<AdminProduct>>(product ?? EMPTY);
  const [imagesInput, setImagesInput] = useState((product?.images ?? []).join(', '));
  const [tagsInput, setTagsInput] = useState((product?.tags ?? []).join(', '));
  const [attributes, setAttributes] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.entries(product?.attributes ?? {}).map(([k, v]) => [k, String(v)])
    )
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentCountry = (form.country_code as CountryCode) ?? 'AR';
  const currentType = (form.type as string) ?? 'manga';
  const editorialOptions = useMemo(
    () => getEditorialsForCountry(currentCountry),
    [currentCountry],
  );
  const showDemographic = currentType === 'manga';

  const set = (key: keyof AdminProduct, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function handleCountryChange(code: CountryCode) {
    setForm((prev) => ({ ...prev, country_code: code, editorial: '' }));
  }

  function setAttr(key: string, value: string) {
    setAttributes((prev) => ({ ...prev, [key]: value }));
  }

  function addAttrRow() {
    setAttributes((prev) => ({ ...prev, '': '' }));
  }

  function removeAttrRow(key: string) {
    setAttributes((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function renameAttrKey(oldKey: string, newKey: string) {
    setAttributes((prev) => {
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(prev)) {
        next[k === oldKey ? newKey : k] = v;
      }
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!editorialOptions.includes(String(form.editorial ?? ''))) {
      newErrors.editorial = 'La editorial no pertenece al país seleccionado';
    }
    if (form.demographic && currentType !== 'manga') {
      newErrors.demographic = 'La demografía solo aplica a mangas';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);

    const images = imagesInput.split(',').map((s) => s.trim()).filter(Boolean);
    const tags = tagsInput.split(',').map((s) => s.trim()).filter(Boolean);

    const parsedAttributes: Record<string, string | number | boolean> = {};
    for (const [k, v] of Object.entries(attributes)) {
      if (!k.trim()) continue;
      const num = Number(v);
      if (!isNaN(num) && v.trim() !== '') {
        parsedAttributes[k.trim()] = num;
      } else if (v === 'true') {
        parsedAttributes[k.trim()] = true;
      } else if (v === 'false') {
        parsedAttributes[k.trim()] = false;
      } else {
        parsedAttributes[k.trim()] = v;
      }
    }

    const payload: Partial<AdminProduct> = {
      ...form,
      images,
      tags,
      attributes: parsedAttributes,
      author: (form.author as string)?.trim() || null,
      description: (form.description as string)?.trim() || null,
      full_description: (form.full_description as string)?.trim() || null,
      estimated_arrival: (form.estimated_arrival as string)?.trim() || null,
      preorder_deposit: form.preorder_deposit || null,
      series: (form.series as string)?.trim() || null,
      eta_text: (form.eta_text as string)?.trim() || null,
      demographic: showDemographic ? (form.demographic ?? null) : null,
    };

    const ok = await onSubmit(payload);
    setSaving(false);
    if (ok) onClose();
  }

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]';
  const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';
  const errorClass = 'text-xs text-red-600 dark:text-red-400 mt-1';

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
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
                <label className={labelClass}>Tipo de producto *</label>
                <select className={inputClass} required value={currentType}
                  onChange={(e) => set('type', e.target.value)}>
                  {PRODUCT_TYPES.map((t) => (
                    <option key={t} value={t}>{PRODUCT_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>País de origen *</label>
                <select className={inputClass} required value={currentCountry}
                  onChange={(e) => handleCountryChange(e.target.value as CountryCode)}>
                  {COUNTRY_CODES.map((c) => (
                    <option key={c} value={c}>{COUNTRIES[c].flag} {COUNTRIES[c].name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Editorial *</label>
                <select className={inputClass} required value={form.editorial ?? ''}
                  onChange={(e) => set('editorial', e.target.value)}>
                  <option value="">— Selecciona editorial —</option>
                  {editorialOptions.map((ed) => (
                    <option key={ed} value={ed}>{ed}</option>
                  ))}
                </select>
                {errors.editorial && <p className={errorClass}>{errors.editorial}</p>}
              </div>

              <div>
                <label className={labelClass}>Serie</label>
                <input className={inputClass} placeholder="One Piece, Chainsaw Man…"
                  value={form.series ?? ''} onChange={(e) => set('series', e.target.value || null)} />
              </div>

              <div>
                <label className={labelClass}>Autor</label>
                <input className={inputClass} value={form.author ?? ''}
                  onChange={(e) => set('author', e.target.value || null)} />
              </div>

              {showDemographic && (
                <div>
                  <label className={labelClass}>Demografía</label>
                  <select className={inputClass} value={form.demographic ?? ''}
                    onChange={(e) => set('demographic', e.target.value || null)}>
                    <option value="">—</option>
                    {DEMOGRAPHICS.map((d) => (
                      <option key={d} value={d}>{DEMOGRAPHIC_LABELS[d]}</option>
                    ))}
                  </select>
                  {errors.demographic && <p className={errorClass}>{errors.demographic}</p>}
                </div>
              )}

              <div className="sm:col-span-2">
                <label className={labelClass}>ETA / Llegada estimada</label>
                <input className={inputClass} placeholder="Fin de mayo 2026"
                  value={form.eta_text ?? ''} onChange={(e) => set('eta_text', e.target.value || null)} />
              </div>
            </div>
          </section>

          {/* Precio y stock */}
          <section>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-1 border-b border-gray-100 dark:border-gray-700">
              Precio y stock
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <select className={inputClass} value={form.stock_status ?? 'in_stock'}
                  onChange={(e) => set('stock_status', e.target.value)}>
                  {STOCK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Depósito preventa (S/)</label>
                <input type="number" min="0" step="0.01" className={inputClass}
                  value={form.preorder_deposit ?? ''}
                  onChange={(e) => set('preorder_deposit', e.target.value ? parseFloat(e.target.value) : undefined)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Fecha estimada de llegada</label>
                <input type="date" className={inputClass}
                  value={form.estimated_arrival ?? ''}
                  onChange={(e) => set('estimated_arrival', e.target.value)} />
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
              Imágenes
            </h3>
            <div>
              <label className={labelClass}>IDs de Cloudinary (separados por coma)</label>
              <input className={inputClass} value={imagesInput} onChange={(e) => setImagesInput(e.target.value)}
                placeholder="jjk-vol1, jjk-vol1-back" />
            </div>
          </section>

          {/* Atributos dinámicos */}
          <section>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-1 border-b border-gray-100 dark:border-gray-700">
              Atributos
            </h3>
            <div className="space-y-2">
              {Object.entries(attributes).map(([key, value], i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className={inputClass + ' flex-1'}
                    placeholder="clave (ej: volume, brand, scale)"
                    value={key}
                    onChange={(e) => renameAttrKey(key, e.target.value)}
                  />
                  <input
                    className={inputClass + ' flex-1'}
                    placeholder="valor"
                    value={value}
                    onChange={(e) => setAttr(key, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeAttrRow(key)}
                    className="text-red-400 hover:text-red-600 text-xl leading-none px-1 shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addAttrRow}
                className="text-sm text-[#2b496d] dark:text-blue-400 hover:underline"
              >
                + Agregar atributo
              </button>
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

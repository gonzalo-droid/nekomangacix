'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Promotion, PromotionType, DiscountType } from '@/lib/promotions';
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS } from '@/lib/constants/productTypes';

const EMPTY: Omit<Promotion, 'id' | 'usesCount' | 'createdAt' | 'updatedAt'> = {
  name: '',
  type: 'per_product_type',
  isActive: true,
  discountType: 'percentage',
  discountValue: 10,
  productIds: [],
  productTypes: [],
  couponCode: '',
  startsAt: '',
  endsAt: '',
  maxUses: undefined,
};

type FormState = Omit<Promotion, 'id' | 'usesCount' | 'createdAt' | 'updatedAt'>;

function toDbPayload(f: FormState) {
  return {
    name: f.name,
    type: f.type,
    is_active: f.isActive,
    discount_type: f.discountType,
    discount_value: f.discountValue,
    product_ids: f.type === 'per_product' ? (f.productIds ?? []) : null,
    product_types: f.type === 'per_product_type' ? (f.productTypes ?? []) : null,
    coupon_code: f.type === 'coupon' ? (f.couponCode?.toUpperCase() || null) : null,
    max_uses: f.type === 'coupon' ? (f.maxUses || null) : null,
    starts_at: f.startsAt || null,
    ends_at: f.endsAt || null,
  };
}

const TYPE_LABELS: Record<PromotionType, string> = {
  per_product: 'Por producto',
  per_product_type: 'Por tipo de producto',
  coupon: 'Cupón',
};

export default function PromotionsManager() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/promotions');
    const json = await res.json();
    // Map DB snake_case → camelCase
    const mapped: Promotion[] = (json.data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      name: r.name as string,
      type: r.type as PromotionType,
      isActive: r.is_active as boolean,
      startsAt: (r.starts_at as string) ?? undefined,
      endsAt: (r.ends_at as string) ?? undefined,
      discountType: r.discount_type as DiscountType,
      discountValue: Number(r.discount_value),
      productIds: (r.product_ids as string[]) ?? undefined,
      productTypes: (r.product_types as string[]) ?? undefined,
      couponCode: (r.coupon_code as string) ?? undefined,
      maxUses: (r.max_uses as number) ?? undefined,
      usesCount: r.uses_count as number,
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
    }));
    setPromotions(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setForm(EMPTY);
    setEditing(null);
    setError(null);
    setShowForm(true);
  }

  function openEdit(p: Promotion) {
    setForm({
      name: p.name,
      type: p.type,
      isActive: p.isActive,
      discountType: p.discountType,
      discountValue: p.discountValue,
      productIds: p.productIds ?? [],
      productTypes: p.productTypes ?? [],
      couponCode: p.couponCode ?? '',
      startsAt: p.startsAt ? p.startsAt.slice(0, 16) : '',
      endsAt: p.endsAt ? p.endsAt.slice(0, 16) : '',
      maxUses: p.maxUses,
    });
    setEditing(p.id);
    setError(null);
    setShowForm(true);
  }

  async function save() {
    if (!form.name.trim()) { setError('El nombre es requerido'); return; }
    if (!form.discountValue || form.discountValue <= 0) { setError('El descuento debe ser mayor a 0'); return; }
    setSaving(true);
    setError(null);
    const payload = toDbPayload(form);
    const url = editing ? `/api/admin/promotions/${editing}` : '/api/admin/promotions';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? 'Error al guardar'); setSaving(false); return; }
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function toggleActive(p: Promotion) {
    await fetch(`/api/admin/promotions/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !p.isActive }),
    });
    load();
  }

  async function remove(p: Promotion) {
    if (!confirm(`¿Eliminar la promoción "${p.name}"?`)) return;
    await fetch(`/api/admin/promotions/${p.id}`, { method: 'DELETE' });
    load();
  }

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Tag size={20} /> Promociones y descuentos
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#ec4899] hover:bg-[#d63384] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Nueva promoción
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : promotions.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No hay promociones aún.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Descuento</th>
                <th className="px-4 py-3 text-left">Alcance</th>
                <th className="px-4 py-3 text-left">Vigencia</th>
                <th className="px-4 py-3 text-left">Usos</th>
                <th className="px-4 py-3 text-center">Activa</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {promotions.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{TYPE_LABELS[p.type]}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {p.discountType === 'percentage' ? `${p.discountValue}%` : `S/ ${p.discountValue.toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {p.type === 'coupon' && <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{p.couponCode}</span>}
                    {p.type === 'per_product_type' && (p.productTypes ?? []).join(', ')}
                    {p.type === 'per_product' && `${(p.productIds ?? []).length} producto(s)`}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {p.startsAt ? new Date(p.startsAt).toLocaleDateString('es-PE') : '—'}
                    {' → '}
                    {p.endsAt ? new Date(p.endsAt).toLocaleDateString('es-PE') : 'sin límite'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {p.type === 'coupon' ? `${p.usesCount}/${p.maxUses ?? '∞'}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button type="button" onClick={() => toggleActive(p)} className="text-gray-400 hover:text-[#2b496d] dark:hover:text-[#5a7a9e] transition-colors">
                      {p.isActive
                        ? <ToggleRight size={22} className="text-emerald-500" />
                        : <ToggleLeft size={22} className="text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button type="button" onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-[#2b496d] transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => remove(p)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editing ? 'Editar promoción' : 'Nueva promoción'}
            </h3>

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Nombre *</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ec4899]/50"
                  placeholder="Ej: Descuento manga 15%"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Tipo *</span>
                  <select
                    value={form.type}
                    onChange={(e) => set({ type: e.target.value as PromotionType })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="per_product_type">Por tipo de producto</option>
                    <option value="per_product">Por producto específico</option>
                    <option value="coupon">Cupón</option>
                  </select>
                </label>

                <div className="flex items-end gap-2">
                  <label className="flex-1">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Descuento *</span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={form.discountValue}
                      onChange={(e) => set({ discountValue: Number(e.target.value) })}
                      className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                    />
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => set({ discountType: e.target.value as DiscountType })}
                    className="px-2 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none mb-0.5"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">S/</option>
                  </select>
                </div>
              </div>

              {/* Scope by type */}
              {form.type === 'per_product_type' && (
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Tipos de producto</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {PRODUCT_TYPES.map((pt) => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => {
                          const cur = form.productTypes ?? [];
                          set({ productTypes: cur.includes(pt) ? cur.filter((x) => x !== pt) : [...cur, pt] });
                        }}
                        className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                          (form.productTypes ?? []).includes(pt)
                            ? 'bg-[#ec4899] border-[#ec4899] text-white'
                            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#ec4899]'
                        }`}
                      >
                        {PRODUCT_TYPE_LABELS[pt]}
                      </button>
                    ))}
                  </div>
                </label>
              )}

              {/* Coupon code */}
              {form.type === 'coupon' && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Código cupón</span>
                    <input
                      type="text"
                      value={form.couponCode ?? ''}
                      onChange={(e) => set({ couponCode: e.target.value.toUpperCase() })}
                      className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:outline-none"
                      placeholder="NEKO20"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Límite de usos</span>
                    <input
                      type="number"
                      min={1}
                      value={form.maxUses ?? ''}
                      onChange={(e) => set({ maxUses: e.target.value ? Number(e.target.value) : undefined })}
                      className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                      placeholder="Sin límite"
                    />
                  </label>
                </div>
              )}

              {/* Date range */}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Inicio</span>
                  <input
                    type="datetime-local"
                    value={form.startsAt ?? ''}
                    onChange={(e) => set({ startsAt: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Fin</span>
                  <input
                    type="datetime-local"
                    value={form.endsAt ?? ''}
                    onChange={(e) => set({ endsAt: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set({ isActive: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#ec4899]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Activa inmediatamente</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="flex-1 py-2 text-sm font-semibold bg-[#ec4899] hover:bg-[#d63384] text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear promoción'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

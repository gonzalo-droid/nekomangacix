'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Lock, Unlock, Calendar } from 'lucide-react';
import { dbRowToCampaign, type Campaign, type DbCampaign } from '@/lib/campaigns';
import { COUNTRY_CODES, COUNTRIES, type CountryCode } from '@/lib/constants/countries';

type FormState = {
  name: string;
  countryCode: CountryCode;
  startsAt: string;
  endsAt: string;
  notes: string;
};

const EMPTY: FormState = {
  name: '',
  countryCode: 'AR',
  startsAt: '',
  endsAt: '',
  notes: '',
};

function toDbPayload(f: FormState) {
  return {
    name: f.name,
    country_code: f.countryCode,
    starts_at: f.startsAt ? new Date(f.startsAt).toISOString() : null,
    ends_at: f.endsAt ? new Date(f.endsAt).toISOString() : null,
    notes: f.notes || null,
  };
}

export default function CampaignsManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/campaigns');
    const json = await res.json();
    setCampaigns(((json.data ?? []) as DbCampaign[]).map(dbRowToCampaign));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setForm(EMPTY);
    setEditing(null);
    setError(null);
    setShowForm(true);
  }

  function openEdit(c: Campaign) {
    setForm({
      name: c.name,
      countryCode: c.countryCode,
      startsAt: c.startsAt.slice(0, 16),
      endsAt: c.endsAt.slice(0, 16),
      notes: c.notes ?? '',
    });
    setEditing(c.id);
    setError(null);
    setShowForm(true);
  }

  async function save() {
    if (!form.name.trim()) { setError('El nombre es requerido'); return; }
    if (!form.startsAt || !form.endsAt) { setError('Definí inicio y fin'); return; }
    if (new Date(form.startsAt) >= new Date(form.endsAt)) { setError('El inicio debe ser anterior al fin'); return; }
    setSaving(true);
    setError(null);
    const payload = toDbPayload(form);
    const url = editing ? `/api/admin/campaigns/${editing}` : '/api/admin/campaigns';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? 'Error al guardar'); setSaving(false); return; }
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function toggleStatus(c: Campaign) {
    await fetch(`/api/admin/campaigns/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: c.status === 'open' ? 'closed' : 'open' }),
    });
    load();
  }

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar size={20} /> Campañas de preventa
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#ec4899] hover:bg-[#d63384] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Nueva campaña
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : campaigns.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No hay campañas aún.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">País</th>
                <th className="px-4 py-3 text-left">Ventana</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {COUNTRIES[c.countryCode].flag} {COUNTRIES[c.countryCode].name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(c.startsAt).toLocaleDateString('es-PE')} → {new Date(c.endsAt).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleStatus(c)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full transition-colors ${
                        c.status === 'open'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {c.status === 'open' ? <Unlock size={12} /> : <Lock size={12} />}
                      {c.status === 'open' ? 'Abierta' : 'Cerrada'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <button type="button" onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-[#2b496d] transition-colors">
                        <Pencil size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editing ? 'Editar campaña' : 'Nueva campaña'}
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
                  placeholder="Ej: Preventa Julio Argentina"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">País *</span>
                <select
                  value={form.countryCode}
                  onChange={(e) => set({ countryCode: e.target.value as CountryCode })}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                >
                  {COUNTRY_CODES.map((cc) => (
                    <option key={cc} value={cc}>{COUNTRIES[cc].flag} {COUNTRIES[cc].name}</option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Inicio *</span>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => set({ startsAt: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Fin *</span>
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => set({ endsAt: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Notas</span>
                <textarea
                  value={form.notes}
                  onChange={(e) => set({ notes: e.target.value })}
                  rows={2}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                  placeholder="Series incluidas, condiciones especiales, etc."
                />
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
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear campaña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

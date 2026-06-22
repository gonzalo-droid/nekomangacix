'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, GripVertical, Eye, EyeOff, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import Toaster from '@/components/ui/Toaster';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link?: string;
  type: 'preventa' | 'feria' | 'novedad' | 'general';
  is_active: boolean;
  sort_order: number;
}

const TYPE_LABELS: Record<string, string> = {
  preventa: '🔖 Preventa',
  feria: '🎪 Feria',
  novedad: '✨ Novedad',
  general: '📢 General',
};

const TYPE_COLORS: Record<string, string> = {
  preventa: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  feria: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  novedad: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const EMPTY: Omit<Banner, 'id' | 'sort_order'> = {
  title: '',
  subtitle: '',
  image_url: '',
  link: '',
  type: 'general',
  is_active: true,
};

export default function BannersManager() {
  const { toasts, toast, dismiss } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<Banner, 'id' | 'sort_order'>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners');
      const json = await res.json();
      setBanners(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'neko-manga/banners');
      const res = await fetch('/api/cloudinary/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) {
        setForm((f) => ({ ...f, image_url: json.public_id ?? json.url }));
        toast('Imagen subida', 'success');
      } else {
        toast('Error al subir imagen', 'error');
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.title || !form.image_url) {
      toast('Título e imagen son obligatorios', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const res = await fetch(`/api/admin/banners/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast('Banner actualizado', 'success');
      } else {
        const res = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, sort_order: banners.length }),
        });
        if (!res.ok) throw new Error();
        toast('Banner creado', 'success');
      }
      setForm(EMPTY);
      setEditId(null);
      load();
    } catch {
      toast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(b: Banner) {
    await fetch(`/api/admin/banners/${b.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !b.is_active }),
    });
    load();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    toast('Banner eliminado', 'success');
    load();
    setDeletingId(null);
  }

  function startEdit(b: Banner) {
    setEditId(b.id);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? '',
      image_url: b.image_url,
      link: b.link ?? '',
      type: b.type,
      is_active: b.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'nekomangacix';
  function resolveImg(ref: string) {
    if (!ref) return '';
    if (ref.startsWith('http')) return ref;
    return `https://res.cloudinary.com/${CLOUD}/image/upload/${ref}`;
  }

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} dismiss={dismiss} />

      {/* Formulario */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
          {editId ? 'Editar banner' : 'Nuevo banner'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Título *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ej: Blue Lock Vol. 36 — Preventa abierta"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Subtítulo</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              placeholder="Ej: Reserva con S/ 18 de depósito"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Link (opcional)</label>
            <input
              type="text"
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              placeholder="Ej: /products?status=preorder"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Banner['type'] }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]"
            >
              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Imagen *</label>
            <div className="flex gap-3 items-start">
              <input
                type="text"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="public_id de Cloudinary o URL"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]"
              />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Subir
              </button>
            </div>
            {form.image_url && (
              <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveImg(form.image_url)} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-[#2b496d] hover:bg-[#1e3550] text-white font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {editId ? 'Guardar cambios' : 'Crear banner'}
          </button>
          {editId && (
            <button
              onClick={() => { setEditId(null); setForm(EMPTY); }}
              className="px-5 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">Banners ({banners.length})</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            No hay banners todavía
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {banners.map((b) => (
              <li key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                <GripVertical size={16} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />

                {/* Thumbnail */}
                <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  {b.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveImg(b.image_url)} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">🖼</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[b.type]}`}>
                      {TYPE_LABELS[b.type]}
                    </span>
                    {!b.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                        Oculto
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{b.title}</p>
                  {b.subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{b.subtitle}</p>}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(b)} title={b.is_active ? 'Ocultar' : 'Mostrar'}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    {b.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button onClick={() => startEdit(b)} title="Editar"
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(b.id)} disabled={deletingId === b.id} title="Eliminar"
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
                    {deletingId === b.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

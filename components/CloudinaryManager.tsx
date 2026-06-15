'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Pencil, Trash2, Copy, Check, ChevronDown, RefreshCw, Folder, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function CloudinaryManager() {
  const [resources, setResources] = useState<CloudinaryResource[]>([]);
  const [subfolders, setSubfolders] = useState<string[]>([]);
  const [folder, setFolder] = useState('');
  const [folderHistory, setFolderHistory] = useState<string[]>(['']);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CloudinaryResource | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [updateProducts, setUpdateProducts] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async (targetFolder: string, cursor?: string) => {
    setLoading(true);
    const params = new URLSearchParams({ folder: targetFolder });
    if (cursor) params.set('next_cursor', cursor);
    const res = await fetch(`/api/cloudinary/images?${params}`);
    const json = await res.json();
    setResources((prev) => cursor ? [...prev, ...json.resources] : json.resources);
    setSubfolders(json.subfolders ?? []);
    setNextCursor(json.next_cursor ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { load(folder); }, [load, folder]);

  function navigateTo(path: string) {
    setFolder(path);
    setFolderHistory((prev) => {
      if (path === '') return [''];
      const idx = prev.indexOf(path);
      return idx >= 0 ? prev.slice(0, idx + 1) : [...prev, path];
    });
    setResources([]);
    setSearch('');
  }

  const filtered = resources.filter((r) =>
    r.public_id.toLowerCase().includes(search.toLowerCase())
  );

  function openRename(r: CloudinaryResource) {
    setSelected(r);
    setRenameValue(r.public_id);
    setError(null);
    setSuccessMsg(null);
  }

  async function doRename() {
    if (!selected || !renameValue.trim() || renameValue === selected.public_id) return;
    setRenaming(true);
    setError(null);
    const res = await fetch('/api/cloudinary/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_public_id: selected.public_id,
        to_public_id: renameValue.trim(),
        update_products: updateProducts,
      }),
    });
    const json = await res.json();
    setRenaming(false);
    if (!res.ok) { setError(json.error ?? 'Error al renombrar'); return; }
    setSuccessMsg(
      updateProducts && json.productsUpdated > 0
        ? `Renombrada y actualizada en ${json.productsUpdated} producto(s)`
        : 'Imagen renombrada'
    );
    setSelected(null);
    load(folder);
  }

  async function doDelete(r: CloudinaryResource) {
    if (!confirm(`¿Eliminar "${r.public_id}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    const res = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: r.public_id }),
    });
    setDeleting(false);
    if (!res.ok) { setError('Error al eliminar'); return; }
    setResources((prev) => prev.filter((x) => x.public_id !== r.public_id));
  }

  function copyId(public_id: string) {
    navigator.clipboard.writeText(public_id);
    setCopied(public_id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-5">
      {/* Header + search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]/40"
          />
        </div>
        <button
          type="button"
          onClick={() => load(folder)}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-[#2b496d] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          title="Recargar"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm flex-wrap">
        {folderHistory.map((f, i) => (
          <span key={f || '__root__'} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={13} className="text-gray-400" />}
            <button
              type="button"
              onClick={() => navigateTo(f)}
              className={`hover:text-[#2b496d] dark:hover:text-[#5a7a9e] transition-colors ${
                f === folder ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {f === '' ? 'Raíz' : f.split('/').pop()}
            </button>
          </span>
        ))}
      </div>

      {/* Subfolders */}
      {subfolders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {subfolders.map((sf) => (
            <button
              key={sf}
              type="button"
              onClick={() => navigateTo(sf)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Folder size={14} className="text-[#2b496d] dark:text-[#5a7a9e]" />
              {sf.split('/').pop()}
            </button>
          ))}
        </div>
      )}

      {successMsg && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
          ✓ {successMsg}
        </p>
      )}

      {/* Stats */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {filtered.length} imagen{filtered.length !== 1 ? 'es' : ''}{search ? ' encontradas' : ' en total'}
      </p>

      {/* Grid */}
      {loading && resources.length === 0 ? (
        <p className="text-sm text-gray-500">Cargando imágenes...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No se encontraron imágenes.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((r) => {
            const shortId = r.public_id.split('/').pop() ?? r.public_id;
            return (
              <div key={r.public_id} className="group relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 hover:shadow-md transition-shadow">
                <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={r.secure_url}
                    alt={shortId}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openRename(r)}
                      className="p-2 bg-white/90 rounded-lg text-gray-800 hover:bg-white transition-colors"
                      title="Renombrar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyId(r.public_id)}
                      className="p-2 bg-white/90 rounded-lg text-gray-800 hover:bg-white transition-colors"
                      title="Copiar public ID"
                    >
                      {copied === r.public_id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => doDelete(r)}
                      disabled={deleting}
                      className="p-2 bg-white/90 rounded-lg text-red-500 hover:bg-white transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="px-2 py-1.5">
                  <p className="text-[11px] font-medium text-gray-800 dark:text-gray-200 truncate" title={r.public_id}>
                    {shortId}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{formatBytes(r.bytes)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load more */}
      {nextCursor && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => load(folder, nextCursor)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <ChevronDown size={15} /> Cargar más
          </button>
        </div>
      )}

      {/* Rename modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Renombrar imagen</h3>

            <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center h-40">
              <Image src={selected.secure_url} alt={selected.public_id} width={120} height={160} className="object-contain max-h-40" />
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}

            <label className="block">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Nuevo public ID</span>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm font-mono border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]/50"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Incluye la carpeta: ej. <span className="font-mono">neko-manga/products/ivrea-mashle-16</span>
              </p>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={updateProducts}
                onChange={(e) => setUpdateProducts(e.target.checked)}
                className="w-4 h-4 rounded accent-[#2b496d]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Actualizar automáticamente en los productos que la usen
              </span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex-1 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={doRename}
                disabled={renaming || !renameValue.trim() || renameValue === selected.public_id}
                className="flex-1 py-2 text-sm font-semibold bg-[#2b496d] hover:bg-[#1e3550] text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                {renaming ? 'Renombrando...' : 'Renombrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

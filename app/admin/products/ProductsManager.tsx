'use client';

import { useState } from 'react';
import {
  Plus, Search, RefreshCw, FileSpreadsheet, ChevronUp, ChevronDown,
  Pencil, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import Toaster from '@/components/ui/Toaster';
import { useAdminProducts, type AdminProduct } from './useAdminProducts';
import ProductFormModal from './ProductFormModal';
import ExcelImportPanel from './ExcelImportPanel';

const CATEGORIES = ['shonen','seinen','shojo','josei','kodomo','isekai','slice_of_life','horror','romance','action','comedy','drama','fantasy','sci-fi','sports','mystery'];
const STOCK_STATUSES = ['in_stock','on_demand','preorder','out_of_stock'];

const STATUS_LABELS: Record<string, string> = {
  in_stock: 'En stock', on_demand: 'A pedido', preorder: 'Preventa', out_of_stock: 'Agotado',
};
const STATUS_COLORS: Record<string, string> = {
  in_stock:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  on_demand:    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  preorder:     'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  out_of_stock: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// Hoisted: evita lint `react-hooks/static-components` (crear componentes durante render)
function SortIcon({
  field,
  sortField,
  sortOrder,
}: {
  field: string;
  sortField: string;
  sortOrder: 'asc' | 'desc';
}) {
  if (sortField !== field) return <ChevronUp size={13} className="text-gray-300 dark:text-gray-600" />;
  return sortOrder === 'asc'
    ? <ChevronUp size={13} className="text-[#2b496d] dark:text-[#5a7a9e]" />
    : <ChevronDown size={13} className="text-[#2b496d] dark:text-[#5a7a9e]" />;
}

export default function ProductsManager() {
  const { toasts, toast, dismiss } = useToast();
  const {
    products, total, loading, error,
    page, pageSize, totalPages, filters, sort,
    setPage, applyFilters, applySort, refresh,
    createProduct, updateProduct, deleteProduct, bulkInsert,
  } = useAdminProducts(toast);

  const [editProduct, setEditProduct] = useState<AdminProduct | null | undefined>(undefined); // undefined = closed, null = new
  const [showImport, setShowImport] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminProduct | null>(null);

  const thClass = 'px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide';
  const tdClass = 'px-3 py-3 text-sm text-gray-700 dark:text-gray-300';

  async function handleDelete(product: AdminProduct) {
    setDeletingId(product.id);
    await deleteProduct(product.id);
    setDeletingId(null);
    setConfirmDelete(null);
  }

  async function handleToggleActive(product: AdminProduct) {
    await updateProduct(product.id, { is_active: !product.is_active });
  }

  async function handleStatusChange(product: AdminProduct, status: string) {
    await updateProduct(product.id, { stock_status: status });
  }

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="space-y-4">
      <Toaster toasts={toasts} dismiss={dismiss} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar título, SKU, editorial..."
              value={filters.search}
              onChange={(e) => applyFilters({ search: e.target.value })}
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d] w-64"
            />
          </div>

          <select value={filters.category} onChange={(e) => applyFilters({ category: e.target.value })}
            className="py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]">
            <option value="">Categoría</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={filters.status} onChange={(e) => applyFilters({ status: e.target.value })}
            className="py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]">
            <option value="">Estado stock</option>
            {STOCK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>

          <select value={filters.active} onChange={(e) => applyFilters({ active: e.target.value as '' | 'true' | 'false' })}
            className="py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]">
            <option value="">Todos</option>
            <option value="true">Visibles</option>
            <option value="false">Ocultos</option>
          </select>

          <button onClick={refresh} title="Refrescar"
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-[#2b496d] dark:border-[#5a7a9e] text-[#2b496d] dark:text-[#5a7a9e] hover:bg-[#2b496d]/10 transition-colors font-medium">
            <FileSpreadsheet size={15} /> Importar Excel
          </button>
          <button onClick={() => setEditProduct(null)}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#2b496d] hover:bg-[#1e3550] text-white font-semibold transition-colors">
            <Plus size={15} /> Nuevo producto
          </button>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {loading ? 'Cargando...' : `${total} producto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
      </p>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className={thClass}>Img</th>
                <th className={`${thClass} cursor-pointer select-none`} onClick={() => applySort('sku')}>
                  <span className="flex items-center gap-1">SKU <SortIcon field="sku" sortField={sort.field} sortOrder={sort.order} /></span>
                </th>
                <th className={`${thClass} cursor-pointer select-none`} onClick={() => applySort('title')}>
                  <span className="flex items-center gap-1">Título <SortIcon field="title" sortField={sort.field} sortOrder={sort.order} /></span>
                </th>
                <th className={thClass}>Editorial</th>
                <th className={`${thClass} cursor-pointer select-none`} onClick={() => applySort('price_pen')}>
                  <span className="flex items-center gap-1">Precio <SortIcon field="price_pen" sortField={sort.field} sortOrder={sort.order} /></span>
                </th>
                <th className={`${thClass} cursor-pointer select-none`} onClick={() => applySort('stock')}>
                  <span className="flex items-center gap-1">Stock <SortIcon field="stock" sortField={sort.field} sortOrder={sort.order} /></span>
                </th>
                <th className={thClass}>Estado</th>
                <th className={thClass}>Visible</th>
                <th className={thClass}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No se encontraron productos
                  </td>
                </tr>
              )}
              {!loading && products.map((p) => (
                <tr key={p.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${!p.is_active ? 'opacity-50' : ''}`}>
                  {/* Image */}
                  <td className="px-3 py-2">
                    {p.images?.[0] ? (
                      <img
                        src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_40,h_56,c_fill/neko-manga/products/${p.images[0]}`}
                        alt={p.title}
                        className="w-8 h-11 object-cover rounded"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-8 h-11 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-300 text-xs">?</div>
                    )}
                  </td>

                  {/* SKU */}
                  <td className={tdClass}>
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{p.sku}</span>
                  </td>

                  {/* Title + category */}
                  <td className={`${tdClass} max-w-[200px]`}>
                    <div className="font-medium text-gray-900 dark:text-white truncate">{p.title}</div>
                    <span className="text-xs text-gray-400">{p.category}</span>
                  </td>

                  {/* Editorial */}
                  <td className={`${tdClass} text-xs`}>{p.editorial}</td>

                  {/* Price */}
                  <td className={tdClass}>
                    <span className="font-semibold text-gray-900 dark:text-white">S/ {p.price_pen.toFixed(2)}</span>
                  </td>

                  {/* Stock */}
                  <td className={tdClass}>{p.stock}</td>

                  {/* Status inline select */}
                  <td className="px-3 py-2">
                    <select
                      value={p.stock_status}
                      onChange={(e) => handleStatusChange(p, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 focus:outline-none focus:ring-2 focus:ring-[#2b496d] cursor-pointer ${STATUS_COLORS[p.stock_status] ?? ''}`}
                    >
                      {STOCK_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>

                  {/* Active toggle */}
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleToggleActive(p)}
                      title={p.is_active ? 'Ocultar' : 'Mostrar'}
                      className={`p-1.5 rounded-lg transition-colors ${p.is_active ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      {p.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditProduct(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#2b496d] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(p)}
                        disabled={deletingId === p.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                        title="Eliminar"
                      >
                        {deletingId === p.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Página {page} de {totalPages} · {total} registros
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 transition-colors">
                <ChevronLeft size={16} />
              </button>
              {pages.map((n) => (
                <button key={n} onClick={() => setPage(n)}
                  className={`min-w-[32px] h-8 text-xs rounded-lg transition-colors ${page === n ? 'bg-[#2b496d] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">¿Eliminar producto?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              <strong>{confirmDelete.title}</strong> será eliminado permanentemente.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={!!deletingId}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2 disabled:opacity-50">
                {deletingId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create modal */}
      {editProduct !== undefined && (
        <ProductFormModal
          product={editProduct}
          onClose={() => setEditProduct(undefined)}
          onSubmit={editProduct ? (data) => updateProduct(editProduct.id, data) : createProduct}
        />
      )}

      {/* Excel import */}
      {showImport && (
        <ExcelImportPanel
          onImport={bulkInsert}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ToastType } from '@/hooks/useToast';

export interface AdminProduct {
  id: string;
  sku: string;
  slug: string;
  title: string;
  editorial: string;
  author: string | null;
  price_pen: number;
  stock: number;
  stock_status: string;
  estimated_arrival: string | null;
  preorder_deposit: number | null;
  description: string | null;
  full_description: string | null;
  specifications: Record<string, string | number> | null;
  series: string | null;
  images: string[];
  category: string;
  country_group: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Filters {
  search: string;
  category: string;
  status: string;
  editorial: string;
  active: '' | 'true' | 'false';
}

export interface SortState {
  field: string;
  order: 'asc' | 'desc';
}

interface FetchState {
  products: AdminProduct[];
  total: number;
  loading: boolean;
  error: string | null;
}

const DEFAULT_FILTERS: Filters = { search: '', category: '', status: '', editorial: '', active: '' };
const DEFAULT_SORT: SortState = { field: 'created_at', order: 'desc' };
const PAGE_SIZE = 20;

type ToastFn = (message: string, type: ToastType) => void;

export function useAdminProducts(toast: ToastFn) {
  const [state, setState] = useState<FetchState>({
    products: [], total: 0, loading: false, error: null,
  });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);

  const fetchProducts = useCallback(async (
    p: number,
    f: Filters,
    s: SortState,
  ) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const params = new URLSearchParams({
      page: String(p),
      pageSize: String(PAGE_SIZE),
      search: f.search,
      category: f.category,
      status: f.status,
      editorial: f.editorial,
      active: f.active,
      sortField: s.field,
      sortOrder: s.order,
    });

    const res = await fetch(`/api/admin/products?${params}`);
    const json = await res.json();

    if (!res.ok) {
      setState((prev) => ({ ...prev, loading: false, error: json.error ?? 'Error al cargar productos' }));
      return;
    }
    setState({ products: json.data ?? [], total: json.count ?? 0, loading: false, error: null });
  }, []);

  useEffect(() => {
    // Efecto legítimo de data-fetching: dispara GET al cambiar paginación/filtros/orden.
    // El setState ocurre dentro de fetchProducts (loading + resultado), no sincronamente aquí.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts(page, filters, sort);
  }, [page, filters, sort, fetchProducts]);

  const refresh = useCallback(() => {
    fetchProducts(page, filters, sort);
  }, [page, filters, sort, fetchProducts]);

  const applyFilters = useCallback((newFilters: Partial<Filters>) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const applySort = useCallback((field: string) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const createProduct = useCallback(async (data: Partial<AdminProduct>) => {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) { toast(json.error ?? 'Error al crear producto', 'error'); return false; }
    toast('Producto creado correctamente', 'success');
    refresh();
    return true;
  }, [toast, refresh]);

  const updateProduct = useCallback(async (id: string, data: Partial<AdminProduct>) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) { toast(json.error ?? 'Error al actualizar producto', 'error'); return false; }
    // Optimistic update in local state
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => p.id === id ? { ...p, ...data } : p),
    }));
    toast('Producto actualizado', 'success');
    return true;
  }, [toast]);

  const deleteProduct = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) { toast(json.error ?? 'Error al eliminar producto', 'error'); return false; }
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
      total: prev.total - 1,
    }));
    toast('Producto eliminado', 'success');
    return true;
  }, [toast]);

  const bulkInsert = useCallback(async (products: Partial<AdminProduct>[]) => {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bulk: true, products }),
    });
    const json = await res.json();
    if (!res.ok) { toast(json.error ?? 'Error en la importación', 'error'); return 0; }
    toast(`${json.inserted} productos importados correctamente`, 'success');
    refresh();
    return json.inserted as number;
  }, [toast, refresh]);

  return {
    ...state,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(state.total / PAGE_SIZE),
    filters,
    sort,
    setPage,
    applyFilters,
    applySort,
    refresh,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkInsert,
  };
}

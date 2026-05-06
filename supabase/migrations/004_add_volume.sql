-- Agrega columna volume a products
-- Representa el número de tomo dentro de una serie (ej. Vol. 1, Vol. 12)
alter table public.products
  add column if not exists volume integer check (volume > 0);

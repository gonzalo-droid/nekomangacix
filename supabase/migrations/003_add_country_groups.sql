-- Expand country_group to include España and Coleccionables
alter table public.products
  drop constraint if exists products_country_group_check;

alter table public.products
  add constraint products_country_group_check
  check (country_group in ('Argentina','México','España','Coleccionables'));

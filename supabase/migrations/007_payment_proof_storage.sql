-- ============================================
-- NekoMangaCix - 007: Payment-proof storage bucket
-- Path convention: payment-proofs/{user_id}/{order_id}.{ext}
-- ============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Drop existing policies (safe re-run)
drop policy if exists "Users upload own payment proof"    on storage.objects;
drop policy if exists "Users read own payment proof"      on storage.objects;
drop policy if exists "Users update own payment proof"    on storage.objects;
drop policy if exists "Admins read all payment proofs"    on storage.objects;

create policy "Users upload own payment proof"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users update own payment proof"
  on storage.objects for update
  using (
    bucket_id = 'payment-proofs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users read own payment proof"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins read all payment proofs"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

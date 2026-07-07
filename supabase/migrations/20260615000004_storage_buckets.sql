-- ============================================================
-- SportBook: Migration 004 — Storage Buckets
-- ============================================================
-- Purpose: Configures Supabase Storage buckets for user-
--          uploaded files (avatars, venue images, payment proofs).
-- ============================================================

-- Avatars bucket (public read, user-writeable)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Venue images bucket (public read, owner-writeable)
insert into storage.buckets (id, name, public) values ('venue-images', 'venue-images', true);

-- Payment proofs bucket (private, customer-writeable, owner/admin-readable)
insert into storage.buckets (id, name, public) values ('payment-proofs', 'payment-proofs', false);


-- ─── Storage RLS Policies ─────────────────────────────────

-- Avatars: public read, user uploads own
create policy "avatars_select"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_insert"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_update"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_delete"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);


-- Venue images: public read, owner uploads
create policy "venue_images_storage_select"
  on storage.objects for select
  using (bucket_id = 'venue-images');

create policy "venue_images_storage_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'venue-images'
    and public.get_user_role() in ('owner', 'admin')
  );

create policy "venue_images_storage_update"
  on storage.objects for update
  using (
    bucket_id = 'venue-images'
    and public.get_user_role() in ('owner', 'admin')
  );

create policy "venue_images_storage_delete"
  on storage.objects for delete
  using (
    bucket_id = 'venue-images'
    and public.get_user_role() in ('owner', 'admin')
  );


-- Payment proofs: customer uploads, owner/admin reads
create policy "payment_proofs_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "payment_proofs_select_own"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.get_user_role() in ('owner', 'admin')
    )
  );

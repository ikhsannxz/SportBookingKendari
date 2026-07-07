-- 1. Drop existing policies on storage.objects
DROP POLICY IF EXISTS "venue_images_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_storage_delete" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_storage_select_strict" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_storage_insert_strict" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_storage_update_strict" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_storage_delete_strict" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_storage_insert_secure" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_storage_update_secure" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_storage_delete_secure" ON storage.objects;

-- 2. Create simplified storage.objects policies
-- Path is: venues/{ownerId}/{venueId}/{filename}
-- Ownership is validated at the application level before uploading.

CREATE POLICY "venue_images_storage_select" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'venue-images'
);

CREATE POLICY "venue_images_storage_insert_secure" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'venue-images'
  AND (storage.foldername(name))[1] = 'venues'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "venue_images_storage_update_secure" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'venue-images'
  AND (storage.foldername(name))[1] = 'venues'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "venue_images_storage_delete_secure" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'venue-images'
  AND (storage.foldername(name))[1] = 'venues'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

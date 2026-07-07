-- Drop the old permissive policies
DROP POLICY IF EXISTS "venue_images_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_storage_delete" ON storage.objects;

-- Insert policy: Ensure it's in the venue-images bucket, user is owner/admin, 
-- and the path strictly matches 'venues/<owner_id>/...'
CREATE POLICY "venue_images_storage_insert_secure"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'venue-images'
    AND public.get_user_role() IN ('owner', 'admin')
    AND (storage.foldername(name))[1] = 'venues'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Update policy: Similar checks
CREATE POLICY "venue_images_storage_update_secure"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'venue-images'
    AND public.get_user_role() IN ('owner', 'admin')
    AND (storage.foldername(name))[1] = 'venues'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Delete policy: Similar checks
CREATE POLICY "venue_images_storage_delete_secure"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'venue-images'
    AND public.get_user_role() IN ('owner', 'admin')
    AND (storage.foldername(name))[1] = 'venues'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

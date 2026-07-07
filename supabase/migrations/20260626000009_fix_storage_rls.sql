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

-- 2. Create corrected storage.objects policies
-- Path is: venues/{ownerId}/{venueId}/{filename}
CREATE POLICY "venue_images_storage_select" ON storage.objects FOR SELECT USING (
  bucket_id = 'venue-images'
);

CREATE POLICY "venue_images_storage_insert_secure" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'venue-images'
  AND public.get_user_role() IN ('owner', 'admin')
  AND (storage.foldername(name))[1] = 'venues'
  AND (storage.foldername(name))[2] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.venues
    WHERE venues.id::text = (storage.foldername(name))[3]
      AND venues.owner_id = auth.uid()
  )
);

CREATE POLICY "venue_images_storage_update_secure" ON storage.objects FOR UPDATE USING (
  bucket_id = 'venue-images'
  AND public.get_user_role() IN ('owner', 'admin')
  AND (storage.foldername(name))[1] = 'venues'
  AND (storage.foldername(name))[2] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.venues
    WHERE venues.id::text = (storage.foldername(name))[3]
      AND venues.owner_id = auth.uid()
  )
);

CREATE POLICY "venue_images_storage_delete_secure" ON storage.objects FOR DELETE USING (
  bucket_id = 'venue-images'
  AND public.get_user_role() IN ('owner', 'admin')
  AND (storage.foldername(name))[1] = 'venues'
  AND (storage.foldername(name))[2] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.venues
    WHERE venues.id::text = (storage.foldername(name))[3]
      AND venues.owner_id = auth.uid()
  )
);


-- 3. Drop existing policies on public.venue_images
DROP POLICY IF EXISTS "venue_images_select" ON public.venue_images;
DROP POLICY IF EXISTS "venue_images_insert" ON public.venue_images;
DROP POLICY IF EXISTS "venue_images_update" ON public.venue_images;
DROP POLICY IF EXISTS "venue_images_delete" ON public.venue_images;

-- 4. Create corrected public.venue_images policies
CREATE POLICY "venue_images_select" ON public.venue_images FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.venues
    WHERE venues.id = venue_images.venue_id
      AND (venues.status = 'approved' OR venues.owner_id = auth.uid())
  )
);

CREATE POLICY "venue_images_insert" ON public.venue_images FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.venues
    WHERE venues.id = venue_images.venue_id 
      AND venues.owner_id = auth.uid()
  )
);

CREATE POLICY "venue_images_update" ON public.venue_images FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.venues
    WHERE venues.id = venue_images.venue_id 
      AND venues.owner_id = auth.uid()
  )
);

CREATE POLICY "venue_images_delete" ON public.venue_images FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.venues
    WHERE venues.id = venue_images.venue_id 
      AND venues.owner_id = auth.uid()
  )
);

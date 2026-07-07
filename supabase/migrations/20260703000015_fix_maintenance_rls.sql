-- Migration: Fix public visibility for maintenance venues

-- 1. Fix venues_select_approved policy to allow maintenance
DROP POLICY IF EXISTS "venues_select_approved" ON public.venues;
CREATE POLICY "venues_select_approved" ON public.venues FOR SELECT USING (status IN ('approved', 'maintenance'));

-- 2. Fix venue_images_select policy to allow maintenance
DROP POLICY IF EXISTS "venue_images_select" ON public.venue_images;
CREATE POLICY "venue_images_select" ON public.venue_images FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.venues
    WHERE venues.id = venue_images.venue_id
      AND (venues.status IN ('approved', 'maintenance') OR venues.owner_id = auth.uid())
  )
);

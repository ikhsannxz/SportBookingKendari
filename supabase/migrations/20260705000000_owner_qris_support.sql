-- Migration: Add QRIS Support
-- Date: 2026-07-05

-- 1. Add qris_image_url to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS qris_image_url TEXT;

-- 2. Create qris-images bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('qris-images', 'qris-images', true) ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS Policies for qris-images
CREATE POLICY "qris_images_select" ON storage.objects FOR SELECT USING (bucket_id = 'qris-images');

CREATE POLICY "qris_images_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'qris-images' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  public.get_user_role() = 'owner'
);

CREATE POLICY "qris_images_update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'qris-images' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  public.get_user_role() = 'owner'
);

CREATE POLICY "qris_images_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'qris-images' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  public.get_user_role() = 'owner'
);

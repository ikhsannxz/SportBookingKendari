-- Add google_maps_url to venues table
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS google_maps_url text;

CREATE OR REPLACE FUNCTION public.update_venue_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.venues
    SET 
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE venue_id = NEW.venue_id),
      rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE venue_id = NEW.venue_id)
    WHERE id = NEW.venue_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.venues
    SET 
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE venue_id = OLD.venue_id),
      rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE venue_id = OLD.venue_id)
    WHERE id = OLD.venue_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_venue_rating_trigger ON public.reviews;

CREATE TRIGGER update_venue_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_venue_rating();

-- Backfill existing venues
UPDATE public.venues v
SET 
  review_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.venue_id = v.id),
  rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews r WHERE r.venue_id = v.id);

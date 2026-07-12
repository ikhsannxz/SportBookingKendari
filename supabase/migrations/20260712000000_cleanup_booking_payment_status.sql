-- ============================================================
-- SportBook: Migration - Cleanup Booking and Payment Status
-- ============================================================
-- Fixes existing invalid combinations of booking and payment statuses

-- 1. Safely add 'expired' to payment_status enum if it doesn't exist
-- Although expireUnpaidBookings updates to 'expired', we need to make sure the enum supports it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid 
    WHERE t.typname = 'payment_status' AND e.enumlabel = 'expired'
  ) THEN
    ALTER TYPE public.payment_status ADD VALUE 'expired';
  END IF;
END
$$;

-- 2. Update payment status to 'verified' for 'completed' bookings with 'pending' payments
UPDATE public.payments
SET status = 'verified'
FROM public.bookings
WHERE public.payments.booking_id = public.bookings.id
  AND public.bookings.status = 'completed'
  AND public.payments.status = 'pending';

-- 3. Update payment status to 'rejected' for 'cancelled' bookings with 'pending' payments
UPDATE public.payments
SET status = 'rejected'
FROM public.bookings
WHERE public.payments.booking_id = public.bookings.id
  AND public.bookings.status = 'cancelled'
  AND public.payments.status = 'pending';

-- 4. Update payment status to 'expired' for 'expired' bookings with 'pending' payments
UPDATE public.payments
SET status = 'expired'
FROM public.bookings
WHERE public.payments.booking_id = public.bookings.id
  AND public.bookings.status = 'expired'
  AND public.payments.status = 'pending';

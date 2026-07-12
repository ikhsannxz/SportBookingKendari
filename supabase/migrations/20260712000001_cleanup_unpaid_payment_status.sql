-- ============================================================
-- SportBook: Migration - Cleanup Booking and Payment Status (Unpaid)
-- ============================================================
-- Fixes existing invalid combinations of booking and payment statuses where payment is 'unpaid'

-- 1. Update payment status to 'verified' for 'completed' bookings with 'unpaid' payments (though unlikely, just in case)
UPDATE public.payments
SET status = 'verified'
FROM public.bookings
WHERE public.payments.booking_id = public.bookings.id
  AND public.bookings.status = 'completed'
  AND public.payments.status = 'unpaid';

-- 2. Update payment status to 'rejected' for 'cancelled' bookings with 'unpaid' payments
UPDATE public.payments
SET status = 'rejected'
FROM public.bookings
WHERE public.payments.booking_id = public.bookings.id
  AND public.bookings.status = 'cancelled'
  AND public.payments.status = 'unpaid';

-- 3. Update payment status to 'expired' for 'expired' bookings with 'unpaid' payments
UPDATE public.payments
SET status = 'expired'
FROM public.bookings
WHERE public.payments.booking_id = public.bookings.id
  AND public.bookings.status = 'expired'
  AND public.payments.status = 'unpaid';

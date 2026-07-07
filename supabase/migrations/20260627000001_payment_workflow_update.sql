-- ============================================================
-- SportBook: Migration - Payment Workflow Update
-- ============================================================

-- 1. Safely add 'unpaid' to payment_status enum
ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'unpaid' BEFORE 'pending';

-- 2. Update create_booking_atomic to insert payment as 'unpaid'
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_customer_id uuid,
  p_venue_id uuid,
  p_booking_date date,
  p_start_time time,
  p_end_time time,
  p_duration_hours numeric,
  p_total_price numeric,
  p_notes text default null
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_overlap_count integer;
  v_booking_code text;
  v_date_str text;
  v_seq integer;
  v_venue_status public.venue_status;
  v_booking_id uuid;
BEGIN
  -- 1. Check if venue is approved
  SELECT status INTO v_venue_status FROM public.venues WHERE id = p_venue_id;
  IF v_venue_status != 'approved' THEN
    RAISE EXCEPTION 'Venue is not approved for booking';
  END IF;

  -- 2. Lock using advisory lock for this venue and date to prevent race conditions
  PERFORM pg_advisory_xact_lock(
    ('x' || substr(md5(p_venue_id::text || p_booking_date::text), 1, 8))::bit(32)::int
  );

  -- 3. Check for overlaps (pending, confirmed, or completed)
  SELECT count(*)
  INTO v_overlap_count
  FROM public.bookings
  WHERE venue_id = p_venue_id
    AND booking_date = p_booking_date
    AND status IN ('pending', 'confirmed', 'completed')
    AND (start_time < p_end_time AND end_time > p_start_time);

  IF v_overlap_count > 0 THEN
    RAISE EXCEPTION 'Time slot overlaps with an existing booking';
  END IF;

  -- 4. Generate unique booking code: SB-YYYYMMDD-XXXXXX
  v_date_str := to_char(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT count(*) + 1
  INTO v_seq
  FROM public.bookings
  WHERE booking_code LIKE 'SB-' || v_date_str || '-%';
  
  v_booking_code := 'SB-' || v_date_str || '-' || lpad(v_seq::text, 6, '0');

  WHILE EXISTS (SELECT 1 FROM public.bookings WHERE booking_code = v_booking_code) LOOP
    v_seq := v_seq + 1;
    v_booking_code := 'SB-' || v_date_str || '-' || lpad(v_seq::text, 6, '0');
  END LOOP;

  -- 5. Insert the booking and capture the ID
  INSERT INTO public.bookings (
    booking_code,
    customer_id,
    venue_id,
    booking_date,
    start_time,
    end_time,
    duration_hours,
    total_price,
    status,
    notes
  ) VALUES (
    v_booking_code,
    p_customer_id,
    p_venue_id,
    p_booking_date,
    p_start_time,
    p_end_time,
    p_duration_hours,
    p_total_price,
    'pending',
    p_notes
  ) RETURNING id INTO v_booking_id;

  -- 6. Insert corresponding payment record with 'unpaid' status
  INSERT INTO public.payments (
    booking_id,
    amount,
    status
  ) VALUES (
    v_booking_id,
    p_total_price,
    'unpaid'
  );

  RETURN v_booking_code;
END;
$$;

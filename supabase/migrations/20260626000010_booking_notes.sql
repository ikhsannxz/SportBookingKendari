-- ============================================================
-- SportBook: Migration 010 — Add Notes to Atomic Booking
-- ============================================================

drop function if exists public.create_booking_atomic(uuid, uuid, date, time, time, numeric, numeric);

create or replace function public.create_booking_atomic(
  p_customer_id uuid,
  p_venue_id uuid,
  p_booking_date date,
  p_start_time time,
  p_end_time time,
  p_duration_hours numeric,
  p_total_price numeric,
  p_notes text default null
) returns text
language plpgsql
security definer
as $$
declare
  v_overlap_count integer;
  v_booking_code text;
  v_date_str text;
  v_seq integer;
  v_venue_status public.venue_status;
begin
  -- 1. Check if venue is approved
  select status into v_venue_status from public.venues where id = p_venue_id;
  if v_venue_status != 'approved' then
    raise exception 'Venue is not approved for booking';
  end if;

  -- 2. Lock using advisory lock for this venue and date to prevent race conditions
  perform pg_advisory_xact_lock(
    ('x' || substr(md5(p_venue_id::text || p_booking_date::text), 1, 8))::bit(32)::int
  );

  -- 3. Check for overlaps (pending, confirmed, or completed)
  select count(*)
  into v_overlap_count
  from public.bookings
  where venue_id = p_venue_id
    and booking_date = p_booking_date
    and status in ('pending', 'confirmed', 'completed')
    and (start_time < p_end_time and end_time > p_start_time);

  if v_overlap_count > 0 then
    raise exception 'Time slot overlaps with an existing booking';
  end if;

  -- 4. Generate unique booking code: SB-YYYYMMDD-XXXXXX
  v_date_str := to_char(CURRENT_DATE, 'YYYYMMDD');
  
  select count(*) + 1
  into v_seq
  from public.bookings
  where booking_code like 'SB-' || v_date_str || '-%';
  
  v_booking_code := 'SB-' || v_date_str || '-' || lpad(v_seq::text, 6, '0');

  while exists (select 1 from public.bookings where booking_code = v_booking_code) loop
    v_seq := v_seq + 1;
    v_booking_code := 'SB-' || v_date_str || '-' || lpad(v_seq::text, 6, '0');
  end loop;

  -- 5. Insert the booking
  insert into public.bookings (
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
  ) values (
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
  );

  return v_booking_code;
end;
$$;

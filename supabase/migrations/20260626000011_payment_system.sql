-- ============================================================
-- SportBook: Migration 011 — Payment System
-- ============================================================

-- 1. Create payment-proofs bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- 2. Storage RLS Policies for payment-proofs

-- Customer: can upload their own proof
drop policy if exists "payment_proofs_insert" on storage.objects;
create policy "payment_proofs_insert" on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Customer: can update their own proof (re-upload)
drop policy if exists "payment_proofs_update" on storage.objects;
create policy "payment_proofs_update" on storage.objects for update
  using (
    bucket_id = 'payment-proofs' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Customer: can delete their own proof (orphaned files during re-upload)
drop policy if exists "payment_proofs_delete" on storage.objects;
create policy "payment_proofs_delete" on storage.objects for delete
  using (
    bucket_id = 'payment-proofs' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Customer: can view their own proofs
drop policy if exists "payment_proofs_select_customer" on storage.objects;
create policy "payment_proofs_select_customer" on storage.objects for select
  using (
    bucket_id = 'payment-proofs' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner: can view proofs for bookings belonging to their venues
drop policy if exists "payment_proofs_select_owner" on storage.objects;
create policy "payment_proofs_select_owner" on storage.objects for select
  using (
    bucket_id = 'payment-proofs' and
    exists (
      select 1 from public.bookings b
      join public.venues v on v.id = b.venue_id
      where b.id::text = (storage.foldername(name))[2]
        and v.owner_id = auth.uid()
    )
  );


-- 3. Update create_booking_atomic to auto-create payment record
drop function if exists public.create_booking_atomic(uuid, uuid, date, time, time, numeric, numeric, text);

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
  v_booking_id uuid;
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

  -- 5. Insert the booking and capture the ID
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
  ) returning id into v_booking_id;

  -- 6. Insert corresponding payment record
  insert into public.payments (
    booking_id,
    amount,
    status
  ) values (
    v_booking_id,
    p_total_price,
    'pending'
  );

  return v_booking_code;
end;
$$;

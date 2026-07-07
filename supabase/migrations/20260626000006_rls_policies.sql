-- ============================================================
-- SportBook: Migration 006 — Production-Grade RLS
-- ============================================================
-- Purpose: Safely drops any existing flawed policies, enabling
--          a strict, idempotent security baseline across all
--          tables and storage buckets.
-- ============================================================

-- Ensure the helper exists
create or replace function public.get_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ═══════════════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════════════
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;

create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_update_admin" on public.profiles for update using (public.get_user_role() = 'admin');

-- ═══════════════════════════════════════════════════════════
-- VENUES
-- ═══════════════════════════════════════════════════════════
alter table public.venues enable row level security;

drop policy if exists "venues_select_approved" on public.venues;
drop policy if exists "venues_select_own" on public.venues;
drop policy if exists "venues_select_admin" on public.venues;
drop policy if exists "venues_insert_owner" on public.venues;
drop policy if exists "venues_update_own" on public.venues;
drop policy if exists "venues_update_admin" on public.venues;
drop policy if exists "venues_delete_own" on public.venues;

create policy "venues_select_approved" on public.venues for select using (status = 'approved');
create policy "venues_select_own" on public.venues for select using (auth.uid() = owner_id);
create policy "venues_select_admin" on public.venues for select using (public.get_user_role() = 'admin');
create policy "venues_insert_owner" on public.venues for insert with check (auth.uid() = owner_id and public.get_user_role() = 'owner');
create policy "venues_update_own" on public.venues for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "venues_update_admin" on public.venues for update using (public.get_user_role() = 'admin');
create policy "venues_delete_own" on public.venues for delete using (auth.uid() = owner_id and status = 'draft');

-- ═══════════════════════════════════════════════════════════
-- VENUE IMAGES
-- ═══════════════════════════════════════════════════════════
alter table public.venue_images enable row level security;

drop policy if exists "venue_images_select" on public.venue_images;
drop policy if exists "venue_images_insert" on public.venue_images;
drop policy if exists "venue_images_update" on public.venue_images;
drop policy if exists "venue_images_delete" on public.venue_images;

create policy "venue_images_select" on public.venue_images for select using (
  exists (
    select 1 from public.venues
    where venues.id = venue_images.venue_id
      and (venues.status = 'approved' or venues.owner_id = auth.uid())
  )
);
create policy "venue_images_insert" on public.venue_images for insert with check (
  exists (
    select 1 from public.venues
    where venues.id = venue_images.venue_id and venues.owner_id = auth.uid()
  )
);
create policy "venue_images_update" on public.venue_images for update using (
  exists (
    select 1 from public.venues
    where venues.id = venue_images.venue_id and venues.owner_id = auth.uid()
  )
);
create policy "venue_images_delete" on public.venue_images for delete using (
  exists (
    select 1 from public.venues
    where venues.id = venue_images.venue_id and venues.owner_id = auth.uid()
  )
);

-- ═══════════════════════════════════════════════════════════
-- VENUE FACILITIES
-- ═══════════════════════════════════════════════════════════
alter table public.venue_facilities enable row level security;

drop policy if exists "venue_facilities_select" on public.venue_facilities;
drop policy if exists "venue_facilities_insert" on public.venue_facilities;
drop policy if exists "venue_facilities_update" on public.venue_facilities;
drop policy if exists "venue_facilities_delete" on public.venue_facilities;

create policy "venue_facilities_select" on public.venue_facilities for select using (true);
create policy "venue_facilities_insert" on public.venue_facilities for insert with check (
  exists (
    select 1 from public.venues
    where venues.id = venue_facilities.venue_id and venues.owner_id = auth.uid()
  )
);
create policy "venue_facilities_update" on public.venue_facilities for update using (
  exists (
    select 1 from public.venues
    where venues.id = venue_facilities.venue_id and venues.owner_id = auth.uid()
  )
);
create policy "venue_facilities_delete" on public.venue_facilities for delete using (
  exists (
    select 1 from public.venues
    where venues.id = venue_facilities.venue_id and venues.owner_id = auth.uid()
  )
);

-- ═══════════════════════════════════════════════════════════
-- SCHEDULES
-- ═══════════════════════════════════════════════════════════
alter table public.schedules enable row level security;

drop policy if exists "schedules_select" on public.schedules;
drop policy if exists "schedules_insert" on public.schedules;
drop policy if exists "schedules_update" on public.schedules;
drop policy if exists "schedules_delete" on public.schedules;

create policy "schedules_select" on public.schedules for select using (true);
create policy "schedules_insert" on public.schedules for insert with check (
  exists (
    select 1 from public.venues
    where venues.id = schedules.venue_id and venues.owner_id = auth.uid()
  )
);
create policy "schedules_update" on public.schedules for update using (
  exists (
    select 1 from public.venues
    where venues.id = schedules.venue_id and venues.owner_id = auth.uid()
  )
);
create policy "schedules_delete" on public.schedules for delete using (
  exists (
    select 1 from public.venues
    where venues.id = schedules.venue_id and venues.owner_id = auth.uid()
  )
);

-- ═══════════════════════════════════════════════════════════
-- BOOKINGS
-- ═══════════════════════════════════════════════════════════
alter table public.bookings enable row level security;

drop policy if exists "bookings_select_customer" on public.bookings;
drop policy if exists "bookings_select_owner" on public.bookings;
drop policy if exists "bookings_select_admin" on public.bookings;
drop policy if exists "bookings_insert_customer" on public.bookings;
drop policy if exists "bookings_update_customer" on public.bookings;
drop policy if exists "bookings_update_owner" on public.bookings;
drop policy if exists "bookings_update_admin" on public.bookings;

create policy "bookings_select_customer" on public.bookings for select using (auth.uid() = customer_id);
create policy "bookings_select_owner" on public.bookings for select using (
  exists (
    select 1 from public.venues
    where venues.id = bookings.venue_id and venues.owner_id = auth.uid()
  )
);
create policy "bookings_select_admin" on public.bookings for select using (public.get_user_role() = 'admin');

create policy "bookings_insert_customer" on public.bookings for insert with check (auth.uid() = customer_id and public.get_user_role() = 'customer');
create policy "bookings_update_customer" on public.bookings for update using (auth.uid() = customer_id) with check (auth.uid() = customer_id);
create policy "bookings_update_owner" on public.bookings for update using (
  exists (
    select 1 from public.venues
    where venues.id = bookings.venue_id and venues.owner_id = auth.uid()
  )
);
create policy "bookings_update_admin" on public.bookings for update using (public.get_user_role() = 'admin');

-- ═══════════════════════════════════════════════════════════
-- PAYMENTS
-- ═══════════════════════════════════════════════════════════
alter table public.payments enable row level security;

drop policy if exists "payments_select_customer" on public.payments;
drop policy if exists "payments_select_owner" on public.payments;
drop policy if exists "payments_select_admin" on public.payments;
drop policy if exists "payments_insert_customer" on public.payments;
drop policy if exists "payments_update_owner" on public.payments;
drop policy if exists "payments_update_admin" on public.payments;

create policy "payments_select_customer" on public.payments for select using (
  exists (
    select 1 from public.bookings
    where bookings.id = payments.booking_id and bookings.customer_id = auth.uid()
  )
);
create policy "payments_select_owner" on public.payments for select using (
  exists (
    select 1 from public.bookings
    join public.venues on venues.id = bookings.venue_id
    where bookings.id = payments.booking_id and venues.owner_id = auth.uid()
  )
);
create policy "payments_select_admin" on public.payments for select using (public.get_user_role() = 'admin');

create policy "payments_insert_customer" on public.payments for insert with check (
  exists (
    select 1 from public.bookings
    where bookings.id = payments.booking_id and bookings.customer_id = auth.uid()
  )
);
create policy "payments_update_owner" on public.payments for update using (
  exists (
    select 1 from public.bookings
    join public.venues on venues.id = bookings.venue_id
    where bookings.id = payments.booking_id and venues.owner_id = auth.uid()
  )
);
create policy "payments_update_admin" on public.payments for update using (public.get_user_role() = 'admin');

-- ═══════════════════════════════════════════════════════════
-- REVIEWS
-- ═══════════════════════════════════════════════════════════
alter table public.reviews enable row level security;

drop policy if exists "reviews_select" on public.reviews;
drop policy if exists "reviews_insert_customer" on public.reviews;
drop policy if exists "reviews_update_customer" on public.reviews;
drop policy if exists "reviews_update_owner_reply" on public.reviews;

create policy "reviews_select" on public.reviews for select using (true);
create policy "reviews_insert_customer" on public.reviews for insert with check (
  auth.uid() = customer_id
  and exists (
    select 1 from public.bookings
    where bookings.id = reviews.booking_id
      and bookings.customer_id = auth.uid()
      and bookings.status = 'completed'
  )
);
create policy "reviews_update_customer" on public.reviews for update using (auth.uid() = customer_id) with check (auth.uid() = customer_id);
create policy "reviews_update_owner_reply" on public.reviews for update using (
  exists (
    select 1 from public.venues
    where venues.id = reviews.venue_id and venues.owner_id = auth.uid()
  )
);

-- ═══════════════════════════════════════════════════════════
-- FAVORITES
-- ═══════════════════════════════════════════════════════════
alter table public.favorites enable row level security;

drop policy if exists "favorites_select_own" on public.favorites;
drop policy if exists "favorites_insert_own" on public.favorites;
drop policy if exists "favorites_delete_own" on public.favorites;

create policy "favorites_select_own" on public.favorites for select using (auth.uid() = customer_id);
create policy "favorites_insert_own" on public.favorites for insert with check (auth.uid() = customer_id);
create policy "favorites_delete_own" on public.favorites for delete using (auth.uid() = customer_id);

-- ═══════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════
alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
drop policy if exists "notifications_update_own" on public.notifications;

create policy "notifications_select_own" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- STORAGE BUCKET POLICIES (STRICT)
-- ═══════════════════════════════════════════════════════════

-- We must drop the flawed existing policies from 004
drop policy if exists "venue_images_storage_select" on storage.objects;
drop policy if exists "venue_images_storage_insert" on storage.objects;
drop policy if exists "venue_images_storage_update" on storage.objects;
drop policy if exists "venue_images_storage_delete" on storage.objects;

-- Strict venue_images policies:
-- The path structure is 'venue-images/[venue_id]/[filename]'
-- split_part(name, '/', 1) yields the venue_id. We check if this venue_id is owned by auth.uid().
create policy "venue_images_storage_select_strict" on storage.objects for select using (bucket_id = 'venue-images');

create policy "venue_images_storage_insert_strict" on storage.objects for insert with check (
  bucket_id = 'venue-images'
  and exists (
    select 1 from public.venues
    where id::text = split_part(name, '/', 1)
      and owner_id = auth.uid()
  )
);

create policy "venue_images_storage_update_strict" on storage.objects for update using (
  bucket_id = 'venue-images'
  and exists (
    select 1 from public.venues
    where id::text = split_part(name, '/', 1)
      and owner_id = auth.uid()
  )
);

create policy "venue_images_storage_delete_strict" on storage.objects for delete using (
  bucket_id = 'venue-images'
  and exists (
    select 1 from public.venues
    where id::text = split_part(name, '/', 1)
      and owner_id = auth.uid()
  )
);

-- ============================================================
-- SportBook: Migration 003 — Row Level Security (RLS)
-- ============================================================
-- Purpose: Locks down every table so users can only access
--          data appropriate to their role. Supabase enforces
--          RLS automatically when enabled on a table.
-- ============================================================

-- ─── Helper: get current user's role ─────────────────────────
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

-- Anyone can read profiles (for display names, avatars)
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

-- Users can update only their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can update any profile (e.g. role changes, bans)
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.get_user_role() = 'admin');


-- ═══════════════════════════════════════════════════════════
-- VENUES
-- ═══════════════════════════════════════════════════════════
alter table public.venues enable row level security;

-- Public: anyone can view approved venues
create policy "venues_select_approved"
  on public.venues for select
  using (status = 'approved');

-- Owners can see all their own venues (any status)
create policy "venues_select_own"
  on public.venues for select
  using (auth.uid() = owner_id);

-- Admins can see all venues
create policy "venues_select_admin"
  on public.venues for select
  using (public.get_user_role() = 'admin');

-- Owners can create venues
create policy "venues_insert_owner"
  on public.venues for insert
  with check (
    auth.uid() = owner_id
    and public.get_user_role() = 'owner'
  );

-- Owners can update their own venues
create policy "venues_update_own"
  on public.venues for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Admins can update any venue (approve/reject/suspend)
create policy "venues_update_admin"
  on public.venues for update
  using (public.get_user_role() = 'admin');

-- Owners can delete their own draft venues
create policy "venues_delete_own"
  on public.venues for delete
  using (auth.uid() = owner_id and status = 'draft');


-- ═══════════════════════════════════════════════════════════
-- VENUE IMAGES
-- ═══════════════════════════════════════════════════════════
alter table public.venue_images enable row level security;

-- Public read for images of approved venues
create policy "venue_images_select"
  on public.venue_images for select
  using (
    exists (
      select 1 from public.venues
      where venues.id = venue_images.venue_id
        and (venues.status = 'approved' or venues.owner_id = auth.uid())
    )
  );

-- Owner can manage images for their venues
create policy "venue_images_insert"
  on public.venue_images for insert
  with check (
    exists (
      select 1 from public.venues
      where venues.id = venue_images.venue_id
        and venues.owner_id = auth.uid()
    )
  );

create policy "venue_images_update"
  on public.venue_images for update
  using (
    exists (
      select 1 from public.venues
      where venues.id = venue_images.venue_id
        and venues.owner_id = auth.uid()
    )
  );

create policy "venue_images_delete"
  on public.venue_images for delete
  using (
    exists (
      select 1 from public.venues
      where venues.id = venue_images.venue_id
        and venues.owner_id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════
-- VENUE FACILITIES
-- ═══════════════════════════════════════════════════════════
alter table public.venue_facilities enable row level security;

-- Public read
create policy "venue_facilities_select"
  on public.venue_facilities for select
  using (true);

-- Owner can manage facilities for their venues
create policy "venue_facilities_insert"
  on public.venue_facilities for insert
  with check (
    exists (
      select 1 from public.venues
      where venues.id = venue_facilities.venue_id
        and venues.owner_id = auth.uid()
    )
  );

create policy "venue_facilities_update"
  on public.venue_facilities for update
  using (
    exists (
      select 1 from public.venues
      where venues.id = venue_facilities.venue_id
        and venues.owner_id = auth.uid()
    )
  );

create policy "venue_facilities_delete"
  on public.venue_facilities for delete
  using (
    exists (
      select 1 from public.venues
      where venues.id = venue_facilities.venue_id
        and venues.owner_id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════
-- SCHEDULES
-- ═══════════════════════════════════════════════════════════
alter table public.schedules enable row level security;

-- Public read (customers need to see availability)
create policy "schedules_select"
  on public.schedules for select
  using (true);

-- Owners manage their venue schedules
create policy "schedules_insert"
  on public.schedules for insert
  with check (
    exists (
      select 1 from public.venues
      where venues.id = schedules.venue_id
        and venues.owner_id = auth.uid()
    )
  );

create policy "schedules_update"
  on public.schedules for update
  using (
    exists (
      select 1 from public.venues
      where venues.id = schedules.venue_id
        and venues.owner_id = auth.uid()
    )
  );

create policy "schedules_delete"
  on public.schedules for delete
  using (
    exists (
      select 1 from public.venues
      where venues.id = schedules.venue_id
        and venues.owner_id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════
-- BOOKINGS
-- ═══════════════════════════════════════════════════════════
alter table public.bookings enable row level security;

-- Customers see their own bookings
create policy "bookings_select_customer"
  on public.bookings for select
  using (auth.uid() = customer_id);

-- Owners see bookings for their venues
create policy "bookings_select_owner"
  on public.bookings for select
  using (
    exists (
      select 1 from public.venues
      where venues.id = bookings.venue_id
        and venues.owner_id = auth.uid()
    )
  );

-- Admins see all bookings
create policy "bookings_select_admin"
  on public.bookings for select
  using (public.get_user_role() = 'admin');

-- Customers can create bookings
create policy "bookings_insert_customer"
  on public.bookings for insert
  with check (
    auth.uid() = customer_id
    and public.get_user_role() = 'customer'
  );

-- Customers can update their own pending bookings (cancel)
create policy "bookings_update_customer"
  on public.bookings for update
  using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

-- Owners can update bookings for their venues (confirm/complete)
create policy "bookings_update_owner"
  on public.bookings for update
  using (
    exists (
      select 1 from public.venues
      where venues.id = bookings.venue_id
        and venues.owner_id = auth.uid()
    )
  );

-- Admins can update any booking
create policy "bookings_update_admin"
  on public.bookings for update
  using (public.get_user_role() = 'admin');


-- ═══════════════════════════════════════════════════════════
-- PAYMENTS
-- ═══════════════════════════════════════════════════════════
alter table public.payments enable row level security;

-- Customers see payments for their bookings
create policy "payments_select_customer"
  on public.payments for select
  using (
    exists (
      select 1 from public.bookings
      where bookings.id = payments.booking_id
        and bookings.customer_id = auth.uid()
    )
  );

-- Owners see payments for their venue bookings
create policy "payments_select_owner"
  on public.payments for select
  using (
    exists (
      select 1 from public.bookings
      join public.venues on venues.id = bookings.venue_id
      where bookings.id = payments.booking_id
        and venues.owner_id = auth.uid()
    )
  );

-- Admins see all payments
create policy "payments_select_admin"
  on public.payments for select
  using (public.get_user_role() = 'admin');

-- Customers can create a payment (upload proof)
create policy "payments_insert_customer"
  on public.payments for insert
  with check (
    exists (
      select 1 from public.bookings
      where bookings.id = payments.booking_id
        and bookings.customer_id = auth.uid()
    )
  );

-- Owners and admins can update payments (verify/reject)
create policy "payments_update_owner"
  on public.payments for update
  using (
    exists (
      select 1 from public.bookings
      join public.venues on venues.id = bookings.venue_id
      where bookings.id = payments.booking_id
        and venues.owner_id = auth.uid()
    )
  );

create policy "payments_update_admin"
  on public.payments for update
  using (public.get_user_role() = 'admin');


-- ═══════════════════════════════════════════════════════════
-- REVIEWS
-- ═══════════════════════════════════════════════════════════
alter table public.reviews enable row level security;

-- Public read (reviews are visible to everyone)
create policy "reviews_select"
  on public.reviews for select
  using (true);

-- Customers can create reviews for their completed bookings
create policy "reviews_insert_customer"
  on public.reviews for insert
  with check (
    auth.uid() = customer_id
    and exists (
      select 1 from public.bookings
      where bookings.id = reviews.booking_id
        and bookings.customer_id = auth.uid()
        and bookings.status = 'completed'
    )
  );

-- Customers can update their own reviews
create policy "reviews_update_customer"
  on public.reviews for update
  using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

-- Owners can update reviews on their venues (to add owner_reply)
create policy "reviews_update_owner_reply"
  on public.reviews for update
  using (
    exists (
      select 1 from public.venues
      where venues.id = reviews.venue_id
        and venues.owner_id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════
alter table public.notifications enable row level security;

-- Users see only their own notifications
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Users can update their own (mark as read)
create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- System inserts are handled by service_role or triggers (no user insert needed)


-- ═══════════════════════════════════════════════════════════
-- FAVORITES
-- ═══════════════════════════════════════════════════════════
alter table public.favorites enable row level security;

-- Customers see their own favorites
create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = customer_id);

-- Customers can add favorites
create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = customer_id);

-- Customers can remove their own favorites
create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = customer_id);

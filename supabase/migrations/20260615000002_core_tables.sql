-- ============================================================
-- SportBook: Migration 002 — Core Tables
-- ============================================================
-- Purpose: Creates all application tables with proper UUID PKs,
--          foreign keys, constraints, defaults, and indexes.
-- ============================================================

-- ┌──────────────────────────────────────────────────────────┐
-- │  1. PROFILES                                             │
-- │  Extends Supabase auth.users with app-specific fields    │
-- └──────────────────────────────────────────────────────────┘
create table public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  email         text unique not null,
  full_name     text not null default '',
  phone         text,
  avatar_url    text,
  role          public.user_role not null default 'customer',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table  public.profiles is 'Application user profiles, linked 1:1 to auth.users';
comment on column public.profiles.role is 'RBAC role: customer | owner | admin';

create index idx_profiles_role      on public.profiles (role);
create index idx_profiles_email     on public.profiles (email);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();



-- ┌──────────────────────────────────────────────────────────┐
-- │  2. VENUES                                               │
-- │  Owned by users with role = 'owner'                      │
-- └──────────────────────────────────────────────────────────┘
create table public.venues (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  slug            text unique not null,
  description     text,
  sport_type      public.sport_type not null default 'futsal',
  address         text not null,
  city            text not null,
  district        text,               -- Kecamatan
  latitude        double precision,
  longitude       double precision,
  price_per_hour  numeric(12,2) not null check (price_per_hour >= 0),
  status          public.venue_status not null default 'draft',
  rating_avg      numeric(2,1) not null default 0.0 check (rating_avg >= 0 and rating_avg <= 5),
  review_count    integer not null default 0 check (review_count >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table  public.venues is 'Sport venues listed by owners';
comment on column public.venues.slug is 'URL-safe identifier, e.g. lapangan-futsal-mandiri';
comment on column public.venues.status is 'Lifecycle: draft → pending → approved | rejected | suspended';

create index idx_venues_owner       on public.venues (owner_id);
create index idx_venues_city        on public.venues (city);
create index idx_venues_sport       on public.venues (sport_type);
create index idx_venues_status      on public.venues (status);
create index idx_venues_slug        on public.venues (slug);
create index idx_venues_price       on public.venues (price_per_hour);
create index idx_venues_rating      on public.venues (rating_avg desc);

create trigger venues_updated_at
  before update on public.venues
  for each row execute function public.handle_updated_at();


-- ┌──────────────────────────────────────────────────────────┐
-- │  3. VENUE IMAGES                                         │
-- │  Separate table for structured gallery management        │
-- └──────────────────────────────────────────────────────────┘
create table public.venue_images (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references public.venues(id) on delete cascade,
  url         text not null,
  alt_text    text,
  is_primary  boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

comment on table  public.venue_images is 'Gallery images for a venue';
comment on column public.venue_images.is_primary is 'The primary/cover image shown in listings';

create index idx_venue_images_venue on public.venue_images (venue_id, sort_order);


-- ┌──────────────────────────────────────────────────────────┐
-- │  4. VENUE FACILITIES                                     │
-- │  Structured amenities / features per venue               │
-- └──────────────────────────────────────────────────────────┘
create table public.venue_facilities (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references public.venues(id) on delete cascade,
  name        text not null,           -- e.g. 'Parking', 'Shower', 'WiFi'
  icon        text,                    -- Icon identifier (e.g. Lucide icon name)
  created_at  timestamptz not null default now()
);

comment on table public.venue_facilities is 'Amenities and features available at a venue';

create index idx_venue_facilities_venue on public.venue_facilities (venue_id);
-- Prevent duplicate facility names per venue
create unique index uq_venue_facilities_name on public.venue_facilities (venue_id, lower(name));


-- ┌──────────────────────────────────────────────────────────┐
-- │  5. SCHEDULES                                            │
-- │  Weekly operating hours per venue                        │
-- └──────────────────────────────────────────────────────────┘
create table public.schedules (
  id            uuid primary key default gen_random_uuid(),
  venue_id      uuid not null references public.venues(id) on delete cascade,
  day_of_week   smallint not null check (day_of_week between 0 and 6),  -- 0=Sun … 6=Sat
  open_time     time not null,
  close_time    time not null,
  is_closed     boolean not null default false,
  created_at    timestamptz not null default now(),

  constraint chk_schedule_times check (open_time < close_time or is_closed = true)
);

comment on table  public.schedules is 'Weekly recurring schedule for venue operating hours';
comment on column public.schedules.day_of_week is '0=Sunday, 1=Monday, …, 6=Saturday';

create index idx_schedules_venue on public.schedules (venue_id, day_of_week);
-- One schedule row per venue per day
create unique index uq_schedules_venue_day on public.schedules (venue_id, day_of_week);


-- ┌──────────────────────────────────────────────────────────┐
-- │  6. BOOKINGS                                             │
-- │  Core transactional table                                │
-- └──────────────────────────────────────────────────────────┘
create table public.bookings (
  id              uuid primary key default gen_random_uuid(),
  booking_code    text unique not null,          -- Human-readable code, e.g. SB-20260615-A1B2
  customer_id     uuid not null references public.profiles(id) on delete cascade,
  venue_id        uuid not null references public.venues(id) on delete cascade,
  booking_date    date not null,
  start_time      time not null,
  end_time        time not null,
  duration_hours  numeric(3,1) not null check (duration_hours > 0),
  total_price     numeric(12,2) not null check (total_price >= 0),
  status          public.booking_status not null default 'pending',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint chk_booking_times check (start_time < end_time)
);

comment on table  public.bookings is 'Customer bookings for venue timeslots';
comment on column public.bookings.booking_code is 'Human-readable booking reference, e.g. SB-20260615-XXXX';
comment on column public.bookings.status is 'Workflow: pending → confirmed → completed | cancelled | expired';

create index idx_bookings_customer  on public.bookings (customer_id);
create index idx_bookings_venue     on public.bookings (venue_id);
create index idx_bookings_date      on public.bookings (booking_date);
create index idx_bookings_status    on public.bookings (status);
-- Prevent double-booking: no overlapping confirmed bookings for the same venue+date+time
create unique index uq_bookings_slot on public.bookings (venue_id, booking_date, start_time, end_time)
  where (status in ('pending', 'confirmed'));

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function public.handle_updated_at();


-- ┌──────────────────────────────────────────────────────────┐
-- │  7. PAYMENTS                                             │
-- │  Payment proof uploads & verification tracking           │
-- └──────────────────────────────────────────────────────────┘
create table public.payments (
  id                uuid primary key default gen_random_uuid(),
  booking_id        uuid not null references public.bookings(id) on delete cascade,
  amount            numeric(12,2) not null check (amount > 0),
  payment_method    text not null default 'bank_transfer',   -- bank_transfer, e-wallet, etc.
  proof_url         text,                                     -- Supabase Storage URL
  status            public.payment_status not null default 'pending',
  verified_by       uuid references public.profiles(id),     -- Admin/Owner who verified
  verified_at       timestamptz,
  rejection_reason  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table  public.payments is 'Payment records with proof upload and admin verification';
comment on column public.payments.status is 'Workflow: pending → verified | rejected → refunded';

create index idx_payments_booking on public.payments (booking_id);
create index idx_payments_status  on public.payments (status);

create trigger payments_updated_at
  before update on public.payments
  for each row execute function public.handle_updated_at();


-- ┌──────────────────────────────────────────────────────────┐
-- │  8. REVIEWS                                              │
-- │  Post-booking ratings & feedback                         │
-- └──────────────────────────────────────────────────────────┘
create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid unique not null references public.bookings(id) on delete cascade,  -- 1 review per booking
  customer_id   uuid not null references public.profiles(id) on delete cascade,
  venue_id      uuid not null references public.venues(id) on delete cascade,
  rating        smallint not null check (rating between 1 and 5),
  comment       text,
  owner_reply   text,                   -- Venue owner can reply
  replied_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table  public.reviews is 'Customer reviews for completed bookings (1 review per booking)';
comment on column public.reviews.owner_reply is 'Optional response from the venue owner';

create index idx_reviews_venue    on public.reviews (venue_id);
create index idx_reviews_customer on public.reviews (customer_id);
create index idx_reviews_rating   on public.reviews (venue_id, rating);

create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.handle_updated_at();


-- ┌──────────────────────────────────────────────────────────┐
-- │  9. NOTIFICATIONS                                        │
-- │  In-app notification system                              │
-- └──────────────────────────────────────────────────────────┘
create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  type          public.notification_type not null,
  title         text not null,
  message       text not null,
  is_read       boolean not null default false,
  reference_id  uuid,                    -- Polymorphic: booking_id, venue_id, etc.
  reference_type text,                   -- 'booking', 'venue', 'payment', 'review'
  created_at    timestamptz not null default now()
);

comment on table  public.notifications is 'In-app notifications for all user roles';
comment on column public.notifications.reference_id is 'Links to the related entity (booking, venue, etc.)';

create index idx_notifications_user      on public.notifications (user_id, is_read, created_at desc);
create index idx_notifications_unread    on public.notifications (user_id) where (is_read = false);


-- ┌──────────────────────────────────────────────────────────┐
-- │  10. FAVORITES                                           │
-- │  Customer wishlisted venues                              │
-- └──────────────────────────────────────────────────────────┘
create table public.favorites (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references public.profiles(id) on delete cascade,
  venue_id      uuid not null references public.venues(id) on delete cascade,
  created_at    timestamptz not null default now()
);

comment on table public.favorites is 'Customer-saved / wishlisted venues';

create unique index uq_favorites_customer_venue on public.favorites (customer_id, venue_id);
create index idx_favorites_customer on public.favorites (customer_id);
create index idx_favorites_venue    on public.favorites (venue_id);

-- ============================================================
-- SportBook: Migration 001 — Extensions, Enums & Utility Functions
-- ============================================================
-- Purpose: Foundation layer. Creates all required PostgreSQL
--          extensions, custom enum types, and shared trigger
--          functions used across every table.
-- ============================================================

-- 1. Extensions
create extension if not exists "pgcrypto";     -- gen_random_uuid()  (Supabase default)

-- 2. Enums ────────────────────────────────────────────────────

-- User roles (Customer, Owner, Admin)
create type public.user_role as enum (
  'customer',
  'owner',
  'admin'
);

-- Venue verification status
create type public.venue_status as enum (
  'draft',       -- Owner still editing
  'pending',     -- Submitted for admin review
  'approved',    -- Live & bookable
  'rejected',    -- Admin rejected
  'suspended'    -- Temporarily taken down
);

-- Sport / activity category
create type public.sport_type as enum (
  'futsal',
  'badminton',
  'basketball',
  'volleyball',
  'tennis',
  'swimming',
  'gym',
  'other'
);

-- Booking lifecycle
-- pending → confirmed → completed
--        → cancelled  (from pending or confirmed)
--        → expired    (auto, if not confirmed in time)
create type public.booking_status as enum (
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'expired'
);

-- Payment lifecycle
-- pending → verified → refunded
--        → rejected  (proof invalid)
create type public.payment_status as enum (
  'pending',
  'verified',
  'rejected',
  'refunded'
);

-- Notification category
create type public.notification_type as enum (
  'booking_created',
  'booking_confirmed',
  'booking_cancelled',
  'booking_completed',
  'payment_uploaded',
  'payment_verified',
  'payment_rejected',
  'venue_approved',
  'venue_rejected',
  'review_received',
  'system'
);

-- 3. Shared utility functions ─────────────────────────────────

-- Auto-update `updated_at` on row mutation
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- Migration: Add maintenance status and optional fields to venues

-- 1. Add enum value (idempotent in Postgres 12+)
ALTER TYPE public.venue_status ADD VALUE IF NOT EXISTS 'maintenance';

-- 2. Add columns to venues table
ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS maintenance_reason TEXT NULL,
ADD COLUMN IF NOT EXISTS maintenance_until DATE NULL;

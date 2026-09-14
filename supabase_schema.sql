-- ============================================================
-- KhetiBadi – Clean Database Schema (Mobile + Password Auth)
-- Run this in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/mueutiidvohvjuppnmpg/sql/new
-- ============================================================

-- Drop old tables if they exist (clean slate)
DROP TABLE IF EXISTS public.farmers CASCADE;
DROP TABLE IF EXISTS public.otp_verifications CASCADE;

-- ── 1. Users table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id               TEXT         PRIMARY KEY,            -- phone-derived UUID
  name             TEXT         NOT NULL,
  mobile_number    TEXT         NOT NULL UNIQUE,        -- format: +91XXXXXXXXXX
  email            TEXT,                                -- optional
  profile_picture  TEXT,                                -- Supabase Storage URL
  password_hash    TEXT         NOT NULL,               -- bcrypt hash
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- Disable RLS — service key manages all access securely
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ── 2. Storage bucket for profile photos ──────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read on profile photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND policyname = 'Public read profile photos'
  ) THEN
    CREATE POLICY "Public read profile photos"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'profile-photos');
  END IF;
END $$;

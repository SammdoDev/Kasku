-- ============================================================
-- Table: users (custom auth, bukan Supabase auth)
-- Jalankan di Supabase SQL Editor
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      TEXT NOT NULL UNIQUE,
  email         TEXT UNIQUE,                  -- opsional, untuk Google OAuth
  password_hash TEXT,                         -- NULL kalau login via Google
  google_id     TEXT UNIQUE,                  -- dari Google OAuth
  avatar_url    TEXT,
  full_name     TEXT,
  currency      TEXT NOT NULL DEFAULT 'IDR',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_users_username  ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id);

-- RLS (service_role key bypass RLS, pakai itu di server)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Hanya service_role yang boleh akses (semua query dari server pakai service_role)
-- Tidak ada policy SELECT/INSERT/UPDATE untuk anon/authenticated
-- karena kita pakai custom JWT, bukan Supabase auth
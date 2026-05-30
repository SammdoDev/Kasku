-- ============================================================
-- FIX: profiles table untuk custom auth (bukan Supabase auth)
-- Jalankan ini SEBAGAI GANTI schema profiles yang lama
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  currency    TEXT NOT NULL DEFAULT 'IDR',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at trigger (reuse fungsi yang sudah ada)
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: service_role bypass, tidak perlu policy karena kita pakai service key
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ============================================================
-- Table: tags
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tags (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

-- updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at ON public.tags;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_tags_user ON public.tags(user_id);

-- RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tags"
  ON public.tags FOR ALL USING (auth.uid() = user_id);
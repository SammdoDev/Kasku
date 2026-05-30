-- ============================================================
-- Table: payment_methods
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,   -- e.g. "BCA", "GoPay", "Cash"
  type        TEXT,            -- e.g. "bank", "ewallet", "cash"
  icon        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at ON public.payment_methods;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON public.payment_methods(user_id);

-- RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own payment methods"
  ON public.payment_methods FOR ALL USING (auth.uid() = user_id);
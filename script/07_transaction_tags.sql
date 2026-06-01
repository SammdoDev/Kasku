-- ============================================================
-- Table: transaction_tags (junction)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.transaction_tags (
  transaction_id  UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  tag_id          UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, tag_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_transaction_tags_tag ON public.transaction_tags(tag_id);

-- RLS
ALTER TABLE public.transaction_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own transaction tags"
  ON public.transaction_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id AND t.user_id = auth.uid()
    )
  );
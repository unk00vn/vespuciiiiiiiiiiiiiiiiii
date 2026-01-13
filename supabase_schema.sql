-- Tabela przypięć
CREATE TABLE IF NOT EXISTS officer_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  target_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE,
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false
);

-- RLS dla przypięć
ALTER TABLE officer_pins ENABLE ROW LEVEL SECURITY;

-- Każdy widzi własne przypięcia ORAZ te oznaczone jako publiczne
DROP POLICY IF EXISTS "View pins" ON officer_pins;
CREATE POLICY "View pins" ON officer_pins FOR SELECT USING (
  author_id = auth.uid() OR is_public = true
);

-- Każdy może tworzyć przypięcia
DROP POLICY IF EXISTS "Insert pins" ON officer_pins;
CREATE POLICY "Insert pins" ON officer_pins FOR INSERT WITH CHECK (
  author_id = auth.uid()
);

-- Tylko autor może usuwać swoje przypięcia
DROP POLICY IF EXISTS "Delete pins" ON officer_pins;
CREATE POLICY "Delete pins" ON officer_pins FOR DELETE USING (
  author_id = auth.uid()
);
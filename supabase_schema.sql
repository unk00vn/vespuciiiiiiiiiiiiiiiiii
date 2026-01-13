-- Usuwamy tabele, aby zdefiniować je z nowymi ograniczeniami
DROP TABLE IF EXISTS officer_pin_shares;
DROP TABLE IF EXISTS officer_pins;

-- 1. Tabela główna przypięć (Teczka)
CREATE TABLE officer_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  target_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  note_id integer REFERENCES notes(id) ON DELETE CASCADE,
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE
);

-- 2. UNIKALNE INDEKSY: Zapobiegają przypięciu tego samego dokumentu tej samej osobie
CREATE UNIQUE INDEX idx_unique_officer_note ON officer_pins (target_profile_id, note_id) WHERE note_id IS NOT NULL;
CREATE UNIQUE INDEX idx_unique_officer_report ON officer_pins (target_profile_id, report_id) WHERE report_id IS NOT NULL;

-- 3. Tabela udostępnień konkretnym osobom
CREATE TABLE officer_pin_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id uuid REFERENCES officer_pins(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(pin_id, profile_id)
);

-- 4. Włączenie Row Level Security
ALTER TABLE officer_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE officer_pin_shares ENABLE ROW LEVEL SECURITY;

-- 5. Polityki dla officer_pins
DROP POLICY IF EXISTS "View pins" ON officer_pins;
CREATE POLICY "View pins" ON officer_pins FOR SELECT USING (
  author_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM officer_pin_shares 
    WHERE pin_id = officer_pins.id AND profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Insert pins" ON officer_pins;
CREATE POLICY "Insert pins" ON officer_pins FOR INSERT WITH CHECK (
  author_id = auth.uid()
);

DROP POLICY IF EXISTS "Delete pins" ON officer_pins;
CREATE POLICY "Delete pins" ON officer_pins FOR DELETE USING (
  author_id = auth.uid()
);

-- 6. Polityki dla officer_pin_shares
DROP POLICY IF EXISTS "View shares" ON officer_pin_shares;
CREATE POLICY "View shares" ON officer_pin_shares FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert shares" ON officer_pin_shares;
CREATE POLICY "Insert shares" ON officer_pin_shares FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM officer_pins WHERE id = pin_id AND author_id = auth.uid())
);
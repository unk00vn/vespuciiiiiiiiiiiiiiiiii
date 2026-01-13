-- Usuwamy tabele, aby zdefiniować je z poprawnymi typami
DROP TABLE IF EXISTS officer_pin_shares;
DROP TABLE IF EXISTS officer_pins;

-- 1. Tabela główna przypięć (Teczka)
CREATE TABLE officer_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  target_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  -- Dopasowanie typów:
  note_id integer REFERENCES notes(id) ON DELETE CASCADE, -- Notatki używają integer
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE -- Raporty używają uuid
);

-- 2. Tabela udostępnień konkretnym osobom
CREATE TABLE officer_pin_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id uuid REFERENCES officer_pins(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(pin_id, profile_id)
);

-- 3. Włączenie Row Level Security
ALTER TABLE officer_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE officer_pin_shares ENABLE ROW LEVEL SECURITY;

-- 4. Polityki dla officer_pins
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

-- 5. Polityki dla officer_pin_shares
DROP POLICY IF EXISTS "View shares" ON officer_pin_shares;
CREATE POLICY "View shares" ON officer_pin_shares FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert shares" ON officer_pin_shares;
CREATE POLICY "Insert shares" ON officer_pin_shares FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM officer_pins WHERE id = pin_id AND author_id = auth.uid())
);
-- Usuwamy starą kolumnę is_public
ALTER TABLE officer_pins DROP COLUMN IF EXISTS is_public;

-- Tabela udostępnień konkretnym osobom
CREATE TABLE IF NOT EXISTS officer_pin_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id uuid REFERENCES officer_pins(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(pin_id, profile_id)
);

-- RLS dla udostępnień
ALTER TABLE officer_pin_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View shares" ON officer_pin_shares;
CREATE POLICY "View shares" ON officer_pin_shares FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert shares" ON officer_pin_shares;
CREATE POLICY "Insert shares" ON officer_pin_shares FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM officer_pins WHERE id = pin_id AND author_id = auth.uid())
);

-- Aktualizacja RLS dla pinów - widzi autor lub osoba, której udostępniono
DROP POLICY IF EXISTS "View pins" ON officer_pins;
CREATE POLICY "View pins" ON officer_pins FOR SELECT USING (
  author_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM officer_pin_shares 
    WHERE pin_id = officer_pins.id AND profile_id = auth.uid()
  )
);
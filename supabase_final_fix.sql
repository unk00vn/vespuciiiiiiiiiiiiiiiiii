-- 1. Czyścimy stare polityki i funkcje
DROP POLICY IF EXISTS "notes_read_policy" ON notes;
DROP POLICY IF EXISTS "notes_write_policy" ON notes;
DROP POLICY IF EXISTS "shares_read_policy" ON note_shares;
DROP POLICY IF EXISTS "shares_write_policy" ON note_shares;

DROP FUNCTION IF EXISTS check_is_note_collaborator(uuid, uuid);
DROP FUNCTION IF EXISTS check_is_note_collaborator(integer, uuid);
DROP FUNCTION IF EXISTS check_is_note_author(uuid, uuid);
DROP FUNCTION IF EXISTS check_is_note_author(integer, uuid);

-- 2. Tworzymy funkcje z poprawnymi typami (BIGINT dla ID notatki, UUID dla profilu)
-- Używamy BIGINT, ponieważ Postgres traktuje auto-increment jako ten typ
CREATE OR REPLACE FUNCTION check_is_note_collaborator(n_id BIGINT, p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM note_shares
    WHERE note_id = n_id AND profile_id = p_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_is_note_author(n_id BIGINT, p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM notes
    WHERE id = n_id AND author_id = p_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Nakładamy nowe polityki na tabelę 'notes'
-- Zmieniamy typ rzutowania na BIGINT dla pewności
CREATE POLICY "notes_read_policy" ON notes FOR SELECT
USING (
  author_id = auth.uid() 
  OR 
  check_is_note_collaborator(id::BIGINT, auth.uid())
);

CREATE POLICY "notes_write_policy" ON notes FOR ALL
USING (author_id = auth.uid());

-- 4. Nakładamy nowe polityki na tabelę 'note_shares'
CREATE POLICY "shares_read_policy" ON note_shares FOR SELECT
USING (
  profile_id = auth.uid() 
  OR 
  check_is_note_author(note_id::BIGINT, auth.uid())
);

CREATE POLICY "shares_write_policy" ON note_shares FOR ALL
USING (check_is_note_author(note_id::BIGINT, auth.uid()));

-- 5. Aktywacja RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_shares ENABLE ROW LEVEL SECURITY;
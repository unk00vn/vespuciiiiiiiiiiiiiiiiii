-- 1. Czyścimy stare, wadliwe polityki
DROP POLICY IF EXISTS "notes_select_final" ON notes;
DROP POLICY IF EXISTS "notes_owner_all" ON notes;
DROP POLICY IF EXISTS "notes_select_v2" ON notes;
DROP POLICY IF EXISTS "notes_select" ON notes;
DROP POLICY IF EXISTS "notes_access_policy" ON notes;

DROP POLICY IF EXISTS "note_shares_select_final" ON note_shares;
DROP POLICY IF EXISTS "note_shares_manage_final" ON note_shares;
DROP POLICY IF EXISTS "shares_select_v2" ON note_shares;
DROP POLICY IF EXISTS "shares_select" ON note_shares;

-- 2. Tworzymy funkcje pomocnicze (SECURITY DEFINER pozwala ominąć pętlę RLS)
CREATE OR REPLACE FUNCTION check_is_note_collaborator(n_id UUID, p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM note_shares
    WHERE note_id = n_id AND profile_id = p_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_is_note_author(n_id UUID, p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM notes
    WHERE id = n_id AND author_id = p_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Nakładamy nowe polityki na tabelę 'notes'
CREATE POLICY "notes_read_policy" ON notes FOR SELECT
USING (
  author_id = auth.uid() 
  OR 
  check_is_note_collaborator(id, auth.uid())
);

CREATE POLICY "notes_write_policy" ON notes FOR ALL
USING (author_id = auth.uid());

-- 4. Nakładamy nowe polityki na tabelę 'note_shares'
CREATE POLICY "shares_read_policy" ON note_shares FOR SELECT
USING (
  profile_id = auth.uid() 
  OR 
  check_is_note_author(note_id, auth.uid())
);

CREATE POLICY "shares_write_policy" ON note_shares FOR ALL
USING (check_is_note_author(note_id, auth.uid()));

-- 5. Upewniamy się, że RLS jest aktywny
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_shares ENABLE ROW LEVEL SECURITY;
-- Włącz RLS dla notes i note_shares
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_shares ENABLE ROW LEVEL SECURITY;

-- 1. Polityki dla tabeli 'notes' (Notatki)

-- Wyczyść istniejące polityki, aby uniknąć konfliktów
DROP POLICY IF EXISTS "Allow all authenticated users to view their notes and shared notes" ON notes;
DROP POLICY IF EXISTS "Allow authenticated users to create notes" ON notes;
DROP POLICY IF EXISTS "Allow author or collaborator to update notes" ON notes;
DROP POLICY IF EXISTS "Allow author to delete notes" ON notes;

-- SELECT: Autor lub współpracownik może czytać
CREATE POLICY "Allow all authenticated users to view their notes and shared notes"
ON notes FOR SELECT TO authenticated
USING (
    (author_id = auth.uid()) OR
    (id IN (SELECT note_id FROM note_shares WHERE profile_id = auth.uid()))
);

-- INSERT: Tylko zalogowany użytkownik może tworzyć
CREATE POLICY "Allow authenticated users to create notes"
ON notes FOR INSERT TO authenticated
WITH CHECK (author_id = auth.uid());

-- UPDATE: Autor lub współpracownik może edytować
CREATE POLICY "Allow author or collaborator to update notes"
ON notes FOR UPDATE TO authenticated
USING (
    (author_id = auth.uid()) OR
    (id IN (SELECT note_id FROM note_shares WHERE profile_id = auth.uid()))
);

-- DELETE: Tylko autor może usuwać
CREATE POLICY "Allow author to delete notes"
ON notes FOR DELETE TO authenticated
USING (author_id = auth.uid());


-- 2. Polityki dla tabeli 'note_shares' (Współpracownicy)

-- Wyczyść istniejące polityki, aby uniknąć konfliktów
DROP POLICY IF EXISTS "Allow author to insert shares" ON note_shares;
DROP POLICY IF EXISTS "Allow author to delete shares" ON note_shares;
DROP POLICY IF EXISTS "Allow select if author or collaborator" ON note_shares;

-- INSERT: Autor notatki może dodawać udostępnienia
CREATE POLICY "Allow author to insert shares"
ON note_shares FOR INSERT TO authenticated
WITH CHECK (
    EXISTS ( SELECT 1 FROM notes WHERE notes.id = note_id AND notes.author_id = auth.uid() )
);

-- DELETE: Autor notatki może usuwać udostępnienia
CREATE POLICY "Allow author to delete shares"
ON note_shares FOR DELETE TO authenticated
USING (
    EXISTS ( SELECT 1 FROM notes WHERE notes.id = note_id AND notes.author_id = auth.uid() )
);

-- SELECT: Użytkownik może zobaczyć udostępnienia, jeśli jest autorem notatki lub sam jest udostępniony
CREATE POLICY "Allow select if author or collaborator"
ON note_shares FOR SELECT TO authenticated
USING (
    EXISTS ( SELECT 1 FROM notes WHERE notes.id = note_id AND notes.author_id = auth.uid() ) OR
    (profile_id = auth.uid())
);
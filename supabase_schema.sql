-- Tabela do przechowywania metadanych plików
CREATE TABLE attachments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    file_url text NOT NULL,
    file_type text,
    file_size bigint,
    
    -- Powiązania z innymi tabelami (tylko jedno może być ustawione)
    report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
    note_id uuid REFERENCES notes(id) ON DELETE CASCADE,
    chat_id uuid, -- Zakładamy, że chat_id jest UUID, jeśli używasz go do identyfikacji wiadomości
    
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS dla attachments
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Polityka: Właściciel może tworzyć, czytać, aktualizować i usuwać swoje załączniki
CREATE POLICY "Allow owner to manage their attachments"
ON attachments FOR ALL TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Polityka: Użytkownicy mogą czytać załączniki, jeśli mają dostęp do powiązanego rekordu (np. raportu/notatki)
CREATE POLICY "Allow select if owner or related record is visible"
ON attachments FOR SELECT TO authenticated
USING (
    (owner_id = auth.uid()) OR
    (report_id IN (SELECT id FROM reports WHERE recipient_id = auth.uid() OR author_id = auth.uid())) OR
    (note_id IN (SELECT id FROM notes WHERE author_id = auth.uid() OR id IN (SELECT note_id FROM note_shares WHERE profile_id = auth.uid())))
);
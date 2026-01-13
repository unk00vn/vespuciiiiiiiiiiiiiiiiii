-- Tabela do przechowywania metadanych załączników (zdjęć)
CREATE TABLE attachments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    
    owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    file_url text NOT NULL,
    file_type text NOT NULL,
    file_size integer NOT NULL,
    
    -- Powiązania z innymi tabelami
    report_id uuid REFERENCES reports(id) ON DELETE SET NULL,
    note_id integer REFERENCES notes(id) ON DELETE SET NULL, -- Zmieniono na INTEGER
    chat_id uuid REFERENCES chat_messages(id) ON DELETE SET NULL
);

-- Włączanie Row Level Security (RLS)
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Polityka: Wszyscy zalogowani użytkownicy mogą czytać załączniki
CREATE POLICY "Allow authenticated users to view attachments"
ON attachments FOR SELECT
TO authenticated
USING (true);

-- Polityka: Użytkownik może tworzyć załączniki
CREATE POLICY "Allow users to insert their own attachments"
ON attachments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Polityka: Użytkownik może aktualizować swoje załączniki (np. przypisać report_id)
CREATE POLICY "Allow owners to update their attachments"
ON attachments FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

-- Polityka: Użytkownik może usuwać swoje załączniki
ON attachments FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);
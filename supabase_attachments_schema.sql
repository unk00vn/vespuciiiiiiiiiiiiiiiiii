-- Tabela załączników
CREATE TABLE IF NOT EXISTS attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    chat_id UUID, -- Opcjonalnie pod czaty
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_attachments_report ON attachments(report_id);
CREATE INDEX IF NOT EXISTS idx_attachments_note ON attachments(note_id);

-- Włączenie RLS
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Polityka: Każdy może widzieć załączniki, do których ma dostęp (uproszczone)
CREATE POLICY "Public Access" ON attachments FOR SELECT USING (true);
CREATE POLICY "Owners can insert" ON attachments FOR INSERT WITH CHECK (auth.uid() = owner_id);
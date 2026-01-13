-- 1. Tabela powiadomień
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'info', -- 'report', 'note', 'system'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Włączenie Realtime dla powiadomień
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 2. Poprawka dla załączników (pozwalamy na NULL report_id tymczasowo)
ALTER TABLE attachments ALTER COLUMN report_id DROP NOT NULL;
ALTER TABLE attachments ALTER COLUMN note_id DROP NOT NULL;
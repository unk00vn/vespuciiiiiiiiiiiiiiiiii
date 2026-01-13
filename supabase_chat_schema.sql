-- Utworzenie tabeli dla wiadomości czatu
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES auth.users(id),
    user_name TEXT NOT NULL,
    badge_number TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Włączenie Realtime dla tej tabeli
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Uprawnienia RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Każdy zalogowany może czytać wiadomości" 
ON chat_messages FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Każdy zalogowany może wysyłać wiadomości" 
ON chat_messages FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = author_id);
-- Tworzenie brakującej tabeli udostępniania notatek
CREATE TABLE IF NOT EXISTS public.note_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id BIGINT REFERENCES public.notes(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    can_edit BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(note_id, profile_id)
);

-- Włączenie bezpieczeństwa (RLS)
ALTER TABLE public.note_shares ENABLE ROW LEVEL SECURITY;

-- Polityka: zalogowani użytkownicy mogą wszystko (najprostsza konfiguracja)
CREATE POLICY "Enable all for authenticated users" 
ON public.note_shares 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Dodanie brakującej kolumny do załączników, jeśli jej nie ma
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attachments' AND column_name='chat_id') THEN
        ALTER TABLE public.attachments ADD COLUMN chat_id UUID;
    END IF;
END $$;
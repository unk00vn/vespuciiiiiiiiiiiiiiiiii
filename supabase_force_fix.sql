-- 1. Usuwamy starą tabelę, jeśli istnieje (wyczyści to błędny cache)
DROP TABLE IF EXISTS public.note_shares;

-- 2. Tworzymy tabelę od zera z poprawnymi kolumnami
CREATE TABLE public.note_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id BIGINT REFERENCES public.notes(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    can_edit BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(note_id, profile_id)
);

-- 3. Ponowne włączenie zabezpieczeń
ALTER TABLE public.note_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_auth" ON public.note_shares FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Opcjonalnie: Dodaj komentarz do tabeli, co czasami pomaga wymusić przeładowanie cache
COMMENT ON TABLE public.note_shares IS 'Table for sharing notes between officers';
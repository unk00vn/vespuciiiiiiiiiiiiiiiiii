-- 1. System UDOSTĘPNIANIA NOTATEK
CREATE TABLE IF NOT EXISTS public.note_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id BIGINT REFERENCES public.notes(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    can_edit BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(note_id, profile_id)
);

-- Włączenie RLS i uprawnień (tymczasowo pozwalamy na wszystko dla zalogowanych)
ALTER TABLE public.note_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON public.note_shares FOR ALL TO authenticated USING (true);

-- 2. System CZATÓW (jeśli jeszcze nie ma)
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    is_group BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(chat_id, user_id)
);

-- Upewnienie się, że wiadomości mają kolumnę chat_id
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='chat_id') THEN
        ALTER TABLE public.chat_messages ADD COLUMN chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE;
    END IF;
END $$;

-- RLS dla czatów
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON public.chats FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON public.chat_participants FOR ALL TO authenticated USING (true);
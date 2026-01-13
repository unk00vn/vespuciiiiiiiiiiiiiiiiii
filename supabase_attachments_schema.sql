-- Tabela do przechowywania załączników (plików)
CREATE TABLE IF NOT EXISTS public.attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    
    -- Metadane pliku
    owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_url text NOT NULL,
    file_type text NOT NULL,
    file_size bigint NOT NULL,
    
    -- Relacje do innych tabel (może być NULL, jeśli plik jest tymczasowy lub nieprzypisany)
    report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE,
    note_id uuid REFERENCES public.notes(id) ON DELETE CASCADE,
    chat_id uuid REFERENCES public.chat_messages(id) ON DELETE CASCADE
);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Polityka: Właściciel może widzieć i modyfikować swoje załączniki
CREATE POLICY "Owners can manage their attachments"
ON public.attachments
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Polityka: Użytkownicy mogą widzieć załączniki, jeśli mają dostęp do raportu/notatki (wymaga bardziej złożonej logiki RLS, ale na razie wystarczy, że właściciel widzi)
-- W praktyce, dostęp do załączników powinien być kontrolowany przez dostęp do nadrzędnego raportu/notatki.
-- Na potrzeby tego projektu, skupiamy się na tym, że właściciel może zarządzać swoimi plikami.
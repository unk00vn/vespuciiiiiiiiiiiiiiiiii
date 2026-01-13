-- 1. SIŁOWE USUNIĘCIE WSZYSTKICH ISTNIEJĄCYCH POLITYK (Dla pewności)
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'notes') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON notes', pol.policyname);
    END LOOP;
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'note_shares') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON note_shares', pol.policyname);
    END LOOP;
END $$;

-- 2. USUNIĘCIE STARYCH FUNKCJI
DROP FUNCTION IF EXISTS check_is_note_collaborator(bigint, uuid);
DROP FUNCTION IF EXISTS check_is_note_author(bigint, uuid);
DROP FUNCTION IF EXISTS check_is_note_collaborator(integer, uuid);
DROP FUNCTION IF EXISTS check_is_note_author(integer, uuid);

-- 3. JEDNA FUNKCJA BYPASSUJĄCA RLS (SECURITY DEFINER)
-- Funkcja ta działa z uprawnieniami właściciela bazy, więc NIE odpala RLS przy sprawdzaniu
CREATE OR REPLACE FUNCTION public.can_user_access_note(n_id bigint, u_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Czy użytkownik jest autorem?
  IF EXISTS (SELECT 1 FROM public.notes WHERE id = n_id AND author_id = u_id) THEN
    RETURN true;
  END IF;
  
  -- Czy notatka jest mu udostępniona?
  IF EXISTS (SELECT 1 FROM public.note_shares WHERE note_id = n_id AND profile_id = u_id) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. NAŁOŻENIE NOWYCH, PROSTYCH POLITYK
-- Tabela 'notes'
CREATE POLICY "notes_select_final" ON public.notes FOR SELECT 
USING (public.can_user_access_note(id::bigint, auth.uid()));

CREATE POLICY "notes_owner_all" ON public.notes FOR ALL 
USING (author_id = auth.uid());

-- Tabela 'note_shares'
-- Pozwalamy każdemu widzieć listę udostępnień (to nie zdradza treści notatki)
-- co całkowicie wyklucza rekursję
CREATE POLICY "shares_select_final" ON public.note_shares FOR SELECT 
TO authenticated USING (true);

-- Tylko autor notatki może zarządzać udostępnieniami
CREATE POLICY "shares_manage_final" ON public.note_shares FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND author_id = auth.uid())
);

-- 5. RESTART RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_shares ENABLE ROW LEVEL SECURITY;
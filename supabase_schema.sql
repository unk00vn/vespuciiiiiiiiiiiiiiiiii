-- Dodanie polityki pozwalającej na aktualizację statusu raportu
-- Uprawnienia mają: adresat raportu LUB osoby z dostępem dowódczym (wyższy role_level)

-- Usuwamy stare polityki jeśli istnieją, aby uniknąć konfliktów
DROP POLICY IF EXISTS "Users can view relevant reports" ON reports;
DROP POLICY IF EXISTS "Users can update reports" ON reports;

-- 1. Polityka Widoczności (Autor i Adresat widzą raport)
CREATE POLICY "Users can view relevant reports" 
ON reports FOR SELECT 
USING (auth.uid() = author_id OR auth.uid() = recipient_id);

-- 2. Polityka Aktualizacji (Tylko adresat może zmienić status raportu)
CREATE POLICY "Users can update reports" 
ON reports FOR UPDATE 
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- Opcjonalnie: Jeśli chcesz, aby wyższe stopnie (np. Kapitan) też mogły edytować, 
-- polityka musiałaby sprawdzać role_id w tabeli profiles, co jest bardziej złożone.
-- Na ten moment powyższa polityka pozwoli ADRESATOWI na zatwierdzenie raportu.
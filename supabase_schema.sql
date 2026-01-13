-- Usuwamy starą zbiorczą politykę
DROP POLICY IF EXISTS "LT+ manage profile divisions" ON profile_divisions;

-- 1. Zezwól LT+ na usuwanie powiązań
CREATE POLICY "LT+ delete profile divisions" ON profile_divisions 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE p.id = auth.uid() AND r.level >= 3
  )
);

-- 2. Zezwól LT+ na dodawanie powiązań
CREATE POLICY "LT+ insert profile divisions" ON profile_divisions 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE p.id = auth.uid() AND r.level >= 3
  )
);

-- 3. Zezwól wszystkim na podgląd
DROP POLICY IF EXISTS "View profile divisions" ON profile_divisions;
CREATE POLICY "View profile divisions" ON profile_divisions 
FOR SELECT USING (true);
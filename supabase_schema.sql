-- 1. Zezwól wszystkim na podgląd dywizji
DROP POLICY IF EXISTS "Anyone can view divisions" ON divisions;
CREATE POLICY "Anyone can view divisions" ON divisions FOR SELECT USING (true);

-- 2. Zezwól High Command na pełne zarządzanie (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "High Command can manage divisions" ON divisions;
CREATE POLICY "High Command can manage divisions" ON divisions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE p.id = auth.uid() AND r.name = 'High Command'
  )
);
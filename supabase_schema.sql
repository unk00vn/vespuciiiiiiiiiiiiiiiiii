-- Polityki dla tabeli łączącej dywizje
DROP POLICY IF EXISTS "View profile divisions" ON profile_divisions;
CREATE POLICY "View profile divisions" ON profile_divisions FOR SELECT USING (true);

DROP POLICY IF EXISTS "LT+ manage profile divisions" ON profile_divisions;
CREATE POLICY "LT+ manage profile divisions" ON profile_divisions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE p.id = auth.uid() AND r.level >= 3
  )
);

-- Polityka usuwania ogłoszeń dla LT+
DROP POLICY IF EXISTS "LT+ delete announcements" ON announcements;
CREATE POLICY "LT+ delete announcements" ON announcements FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE p.id = auth.uid() AND r.level >= 3
  )
);
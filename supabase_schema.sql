-- 1. Tabela łącząca profile z wieloma dywizjami
CREATE TABLE IF NOT EXISTS profile_divisions (
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  division_id INTEGER REFERENCES divisions(id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, division_id)
);

-- 2. Tabela ogłoszeń
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'Aktywne',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela współdzielenia notatek
CREATE TABLE IF NOT EXISTS note_shares (
  note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, profile_id)
);

-- Włącz RLS dla nowych tabel
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_divisions ENABLE ROW LEVEL SECURITY;

-- Proste polityki (wszyscy widzą, odpowiednie role tworzą)
CREATE POLICY "View announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "SGT+ can insert announcements" ON announcements FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE p.id = auth.uid() AND r.level >= 2
  )
);
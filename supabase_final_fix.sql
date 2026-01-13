-- 1. ROLE
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    level INTEGER NOT NULL
);

INSERT INTO roles (name, level) VALUES 
('Officer', 1), ('Sergeant', 2), ('Lieutenant', 3), ('Captain', 4), ('High Command', 5)
ON CONFLICT (name) DO NOTHING;

-- 2. PROFILE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    badge_number TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    role_id INTEGER REFERENCES roles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. DYWIZJE
CREATE TABLE IF NOT EXISTS divisions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS profile_divisions (
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    division_id INTEGER REFERENCES divisions(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, division_id)
);

-- 4. RAPORTY
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id),
    recipient_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    location TEXT,
    date DATE DEFAULT CURRENT_DATE,
    time TEXT,
    description TEXT,
    category TEXT DEFAULT 'other',
    priority TEXT DEFAULT 'medium',
    involved_parties TEXT,
    status TEXT DEFAULT 'Oczekujący',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. NOTATKI
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS note_shares (
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, profile_id)
);

-- 6. OGŁOSZENIA
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. CZAT (Jeśli jeszcze nie ma)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES auth.users(id),
    user_name TEXT NOT NULL,
    badge_number TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- WŁĄCZENIE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE reports;

-- PROSTE USTAWIENIE RLS (Dla ułatwienia - każdy zalogowany ma dostęp)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Update own" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All auth reports" ON reports FOR ALL TO authenticated USING (true);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All auth notes" ON notes FOR ALL TO authenticated USING (true);

ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All auth divisions" ON divisions FOR ALL TO authenticated USING (true);

ALTER TABLE profile_divisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All auth prof_div" ON profile_divisions FOR ALL TO authenticated USING (true);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All auth roles" ON roles FOR ALL TO authenticated USING (true);

ALTER TABLE note_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All auth shares" ON note_shares FOR ALL TO authenticated USING (true);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All auth announcements" ON announcements FOR ALL TO authenticated USING (true);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All auth chat" ON chat_messages FOR ALL TO authenticated USING (true);
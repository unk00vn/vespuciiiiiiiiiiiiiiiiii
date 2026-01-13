-- 1. Tabela Ról
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    level INTEGER NOT NULL
);

-- Wstawienie podstawowych ról
INSERT INTO roles (name, level) VALUES 
('Officer', 1),
('Sergeant', 2),
('Lieutenant', 3),
('Captain', 4),
('High Command', 5)
ON CONFLICT (name) DO NOTHING;

-- 2. Tabela Dywizji
CREATE TABLE IF NOT EXISTS divisions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Wstawienie podstawowych dywizji
INSERT INTO divisions (name) VALUES 
('Patrol Division'),
('Detective Bureau'),
('Traffic Division'),
('SWAT Team')
ON CONFLICT (name) DO NOTHING;

-- 3. Tabela Profili (rozszerzenie auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    badge_number TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    role_id INTEGER REFERENCES roles(id) DEFAULT 1,
    division_id INTEGER REFERENCES divisions(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabela Raportów
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) NOT NULL,
    recipient_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    location TEXT,
    date DATE DEFAULT CURRENT_DATE,
    time TEXT,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'other',
    priority TEXT DEFAULT 'medium',
    involved_parties TEXT,
    status TEXT DEFAULT 'Oczekujący',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabela Notatek
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'Aktywna',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Włączenie RLS (Row Level Security) - opcjonalnie, ale zalecane
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Przykładowe polityki (umożliwiające dostęp zalogowanym użytkownikom)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view relevant reports" ON reports FOR SELECT USING (auth.uid() = author_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can manage own notes" ON notes FOR ALL USING (auth.uid() = author_id);
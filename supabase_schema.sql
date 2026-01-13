-- 1. Deklarujemy zmienne pomocnicze
DO $$
DECLARE
    sergeant_role_id int;
    target_recipient_id uuid;
    test_officer_id uuid := gen_random_uuid(); -- Generujemy losowy ID dla profilu
BEGIN
    -- 2. Pobieramy ID roli 'Sergeant'
    SELECT id INTO sergeant_role_id FROM roles WHERE name = 'Sergeant' LIMIT 1;
    
    -- 3. Pobieramy ID dowolnego innego funkcjonariusza (adresat raportu)
    SELECT id INTO target_recipient_id FROM profiles WHERE status = 'approved' LIMIT 1;

    -- 4. Tworzymy profil Sierżanta (Mike Miller)
    INSERT INTO profiles (id, email, first_name, last_name, badge_number, role_id, status)
    VALUES (
        test_officer_id, 
        'mike.miller@lspd.com', 
        'Mike', 
        'Miller', 
        'S-102', 
        sergeant_role_id, 
        'approved'
    );

    -- 5. Dodajemy jego prywatną notatkę (bez wpisu w note_shares - nikt inny jej nie zobaczy)
    INSERT INTO notes (author_id, title, content)
    VALUES (
        test_officer_id, 
        'Prywatne obserwacje: Ganton', 
        'Zauważono podejrzaną aktywność w okolicach warsztatu na Grove Street. Wymagana dalsza dyskretna obserwacja. Brak powiązań z obecnymi śledztwami.'
    );

    -- 6. Dodajemy jego raport (wysłany do przełożonego)
    INSERT INTO reports (
        author_id, 
        recipient_id, 
        title, 
        location, 
        date, 
        time, 
        description, 
        category, 
        priority, 
        status
    )
    VALUES (
        test_officer_id, 
        target_recipient_id, 
        'Zatrzymanie pojazdu: Przekroczenie prędkości', 
        'Del Perro Freeway', 
        CURRENT_DATE, 
        '15:45', 
        'Kierowca czarnej fusty zatrzymany do kontroli. Wystawiono mandat na kwotę 500$. Kierowca współpracował.', 
        'Ruch drogowy', 
        'low', 
        'Zakończony'
    );

    RAISE NOTICE 'Testowy Sierżant Mike Miller został utworzony wraz z dokumentacją.';
END $$;
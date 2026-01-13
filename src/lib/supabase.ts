"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback do pustych stringów zapobiega crashowi 'Invalid URL', 
// ale spowoduje błędy w konsoli przy próbie wykonania zapytania.
const safeUrl = supabaseUrl && supabaseUrl !== "twoj_url" ? supabaseUrl : "https://placeholder-project.supabase.co";
const safeKey = supabaseAnonKey && supabaseAnonKey !== "twoj_klucz" ? supabaseAnonKey : "placeholder-key";

if (!supabaseUrl || supabaseUrl === "twoj_url") {
  console.warn("BRAK KONFIGURACJI SUPABASE: Użyj przycisku integracji, aby dodać projekt.");
}

export const supabase = createClient(safeUrl, safeKey);

// Dodajemy brakującą funkcję testową używaną w main.tsx
export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw error;
    console.log("Połączenie z bazą danych OK");
    return true;
  } catch (err) {
    console.warn("Błąd połączenia z Supabase (prawdopodobnie brak konfiguracji):", err);
    return false;
  }
};
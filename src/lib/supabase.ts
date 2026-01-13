"use client";

import { createClient } from "@supabase/supabase-js";

// Używamy Twoich danych jako fallback, jeśli zmienne środowiskowe nie są ustawione
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zlkfeaeelfbznsxrqytc.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_5-KXLR-MOfJit5b8XhTBZw_BVZB5Ep1";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw error;
    console.log("Połączenie z bazą danych OK");
    return true;
  } catch (err) {
    console.warn("Błąd połączenia z Supabase:", err);
    return false;
  }
};
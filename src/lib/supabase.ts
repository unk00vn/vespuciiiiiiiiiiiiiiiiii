import { createClient } from '@supabase/supabase-js';

// Pobranie zmiennych środowiskowych wstrzykiwanych przez Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Rygorystyczna walidacja przed inicjalizacją
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables! Check Vercel settings.');
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'lspd-vespucci-auth' // Unikalny klucz storage zapobiegający konfliktom
    }
  }
);
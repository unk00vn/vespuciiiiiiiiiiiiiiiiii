"use client";

import { createClient } from "@supabase/supabase-js";
// import { Database } from "./database.types"; // Używamy typów dla lepszej walidacji

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided as environment variables.");
}

// Używamy createClient bez typów bazy danych, aby uniknąć błędu kompilacji, jeśli typy nie są wygenerowane.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
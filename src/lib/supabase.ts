"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing!");
  throw new Error("Supabase URL and Anon Key must be provided as environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test połączenia z bazą danych
export const testDatabaseConnection = async () => {
  try {
    console.log("Testing database connection...");

    // Proste zapytanie testowe
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Database connection failed:", error.message);
      return false;
    }

    console.log("Database connection successful!");
    return true;
  } catch (err) {
    console.error("Database connection error:", err);
    return false;
  }
};
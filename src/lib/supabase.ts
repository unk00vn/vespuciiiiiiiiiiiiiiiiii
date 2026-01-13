"use client";
import { createClient } from "@supabase/supabase-js";

// Use environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zlkfeaeelfbznsxrqytc.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_5-KXLR-MOfJit5b8XhTBZw_BVZB5Ep1";

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase configuration. Please check your environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: "public"
  },
  global: {
    headers: {
      "X-Client-Info": "LSPD-Vespucci-App"
    }
  }
});

export const testDatabaseConnection = async () => {
  try {
    // Test with a simple query that should always work
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.warn("Database connection test failed:", error);
      return { success: false, error: error.message };
    }
    
    console.log("Database connection OK");
    return { success: true, data };
  } catch (err: any) {
    console.warn("Database connection error:", err);
    return { success: false, error: err.message };
  }
};

// Add connection status monitoring
export const monitorConnection = () => {
  const channel = supabase.channel('connection-monitor');
  
  channel.on('system', { event: 'connection_lost' }, () => {
    console.warn('Connection to Supabase lost');
  });
  
  channel.on('system', { event: 'connection_restored' }, () => {
    console.log('Connection to Supabase restored');
  });
  
  channel.subscribe();
  
  return channel;
};
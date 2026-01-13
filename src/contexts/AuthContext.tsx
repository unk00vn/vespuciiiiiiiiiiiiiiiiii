"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";

export type UserRole = "Officer" | "Sergeant" | "Lieutenant" | "Captain" | "High Command";

export interface UserProfile {
  id: string;
  email: string;
  badge_number: string;
  first_name?: string;
  last_name?: string;
  role_id: number;
  role_name: UserRole;
  role_level: number;
  divisions: { id: number; name: string }[];
  status: "pending" | "approved" | "rejected";
  avatar_url?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, badgeNumber: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id, email, badge_number, first_name, last_name, status, avatar_url,
          roles (id, name, level)
        `)
        .eq("id", userId)
        .single();

      if (profileError || !profileData) return null;

      const { data: divData } = await supabase
        .from("profile_divisions")
        .select("divisions(id, name)")
        .eq("profile_id", userId);

      const divisions = divData?.map((d: any) => d.divisions).filter(Boolean) || [];

      return {
        ...profileData,
        role_id: (profileData as any).roles.id,
        role_name: (profileData as any).roles.name as UserRole,
        role_level: (profileData as any).roles.level,
        divisions: divisions as any,
      };
    } catch (e) {
      console.error("[Auth] Profile fetch error:", e);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Główna funkcja inicjalizująca - pobiera sesję raz przy starcie
    const initSession = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user || null);
          
          if (initialSession?.user) {
            const userProfile = await fetchUserProfile(initialSession.user.id);
            if (isMounted) setProfile(userProfile);
          }
        }
      } catch (err: any) {
        console.error("[Auth] Initialization error:", err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initSession();

    // Słuchacz zmian stanu autoryzacji (Login/Logout/Token Refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`[Auth] Event: ${event}`);
      
      if (isMounted) {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        if (currentSession?.user) {
          const userProfile = await fetchUserProfile(currentSession.user.id);
          if (isMounted) setProfile(userProfile);
        } else {
          if (isMounted) setProfile(null);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    return { error };
  };

  const signUp = async (email: string, password: string, badgeNumber: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast.error(error.message);
      return { error };
    }

    // Dodanie profilu bezpośrednio po rejestracji (Fallback dla triggera DB)
    const { data: roleData } = await supabase.from("roles").select("id").eq("name", "Officer").single();
    await supabase.from("profiles").upsert({
      id: data.user?.id,
      email,
      badge_number: badgeNumber,
      role_id: roleData?.id || 1,
      status: "pending"
    });

    toast.info("Account created. Awaiting approval.");
    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
    navigate("/login");
    return { error };
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, error, signIn, signUp, signOut, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const ProtectedRoute = ({ children, allowedRoles }: { children: ReactNode; allowedRoles?: UserRole[] }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-lapd-navy text-lapd-gold font-mono">
        <div className="h-10 w-10 border-t-2 border-lapd-gold animate-spin rounded-full mb-4"></div>
        <p className="animate-pulse">CONNECTING TO LSPD TERMINAL...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (profile?.status === "pending") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-lapd-navy text-white p-6 text-center">
        <h2 className="text-lapd-gold font-black text-2xl mb-4">ACCESS RESTRICTED</h2>
        <p className="text-slate-300">Your account is currently pending approval by High Command.</p>
        <Button onClick={() => window.location.reload()} className="mt-8 bg-lapd-gold text-lapd-navy font-bold">RE-CHECK STATUS</Button>
      </div>
    );
  }
  
  if (!profile || profile.status === "rejected") return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(profile.role_name)) return <Navigate to="/" replace />;

  return <>{children}</>;
};
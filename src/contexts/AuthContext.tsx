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
  status: "pending" | "approved" | "rejected";
  avatar_url?: string;
  division_id?: number;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, badgeNumber: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select(`*, roles(name, level)`)
      .eq("id", userId)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      role_name: (data as any).roles.name as UserRole,
      role_level: (data as any).roles.level,
    } as UserProfile;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
      if (initialSession?.user) {
        fetchProfile(initialSession.user.id).then(setProfile);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (event === 'SIGNED_IN' && currentSession?.user) {
        const p = await fetchProfile(currentSession.user.id);
        setProfile(p);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (res.error) toast.error("Błąd logowania: " + res.error.message);
    return res;
  };

  const signUp = async (email: string, password: string, badgeNumber: string) => {
    const res = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: { badge_number: badgeNumber } } 
    });
    if (res.error) toast.error("Błąd rejestracji: " + res.error.message);
    else toast.success("Konto utworzone. Oczekiwanie na akceptację.");
    return res;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      setProfile(p);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
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

  if (loading) return <div className="min-h-screen bg-lapd-navy flex items-center justify-center text-lapd-gold">AUTORYZACJA...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (profile?.status === "pending") {
    return (
      <div className="min-h-screen bg-lapd-navy flex flex-col items-center justify-center text-white p-8">
        <h2 className="text-2xl font-black text-lapd-gold uppercase mb-4 tracking-tighter">DOSTĘP ZABLOKOWANY</h2>
        <p className="text-slate-400 text-center max-w-md">Twoje konto (#{(profile as any).badge_number}) oczekuje na weryfikację przez High Command.</p>
        <Button onClick={() => window.location.reload()} className="mt-8 bg-lapd-gold text-lapd-navy font-bold">SPRAWDŹ PONOWNIE</Button>
      </div>
    );
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role_name)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
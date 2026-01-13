"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
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
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
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
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (!isMounted) return;

      setSession(initialSession);
      setUser(initialSession?.user || null);

      if (initialSession?.user) {
        const p = await fetchUserProfile(initialSession.user.id);
        if (isMounted) setProfile(p);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (event === 'SIGNED_IN' && currentSession?.user) {
        const p = await fetchUserProfile(currentSession.user.id);
        if (isMounted) setProfile(p);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, badgeNumber: string) => {
    const res = await supabase.auth.signUp({ email, password });
    if (!res.error) {
        const { data: roleData } = await supabase.from("roles").select("id").eq("name", "Officer").single();
        await supabase.from("profiles").upsert({
            id: res.data.user?.id,
            email,
            badge_number: badgeNumber,
            role_id: roleData?.id || 1,
            status: "pending"
        });
        toast.success("Wniosek o dostęp został wysłany.");
    }
    return res;
  };

  const signOut = async () => {
    const res = await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
    navigate("/login");
    return res;
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signIn, signUp, signOut, fetchUserProfile }}>
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

  if (loading) return (
    <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center text-lapd-gold font-mono">
      <div className="h-10 w-10 border-t-2 border-lapd-gold animate-spin rounded-full mb-4"></div>
      <p className="animate-pulse text-xs uppercase">Connecting to LSPD terminal...</p>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  
  if (profile?.status === "pending") {
    return (
      <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center text-white p-8 text-center">
        <h2 className="text-xl font-black text-lapd-gold uppercase mb-4 tracking-widest">Access Restricted</h2>
        <p className="text-slate-400 max-w-md text-sm">Twoje konto (#{(profile as any).badge_number}) oczekuje na weryfikację przez High Command.</p>
        <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-lapd-gold text-black font-bold uppercase text-xs">Sprawdź ponownie</button>
      </div>
    );
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role_name)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
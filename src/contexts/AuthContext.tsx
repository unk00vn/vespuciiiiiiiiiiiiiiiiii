"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
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
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, badgeNumber: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(`
        id, email, badge_number, first_name, last_name, status, avatar_url,
        roles (id, name, level)
      `)
      .eq("id", userId)
      .single();

    if (profileError) return null;

    // Pobierz dywizje z tabeli łączącej
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
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      if (currentSession?.user) {
        const userProfile = await fetchUserProfile(currentSession.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); return { error }; }
    return { error: null };
  };

  const signUp = async (email: string, password: string, badgeNumber: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { toast.error(error.message); return { error }; }
    
    const { data: roleData } = await supabase.from("roles").select("id").eq("name", "Officer").single();
    await supabase.from("profiles").insert({ id: data.user?.id, email, badge_number: badgeNumber, role_id: roleData?.id, status: "pending" });
    
    toast.info("Konto oczekuje na akceptację.");
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
    return { error: null };
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
  if (loading) return <div className="p-20 text-center">Ładowanie...</div>;
  if (!user || !profile || profile.status !== "approved") return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(profile.role_name)) return <Navigate to="/" />;
  return <>{children}</>;
};
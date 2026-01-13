"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // Dodany import Button

// Definicje typów
export type UserRole = "Officer" | "Sergeant" | "Lieutenant" | "Captain" | "High Command";

export interface Division {
  id: number;
  name: string;
  description?: string; // Dodano description, aby naprawić błąd w DivisionsPage
}

export interface UserProfile {
  id: string;
  email: string;
  badge_number: string;
  first_name?: string;
  last_name?: string;
  role_id: number;
  role_name: UserRole;
  role_level: number;
  division_id?: number; // Dodano division_id
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
  const location = useLocation();

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(`
        id, email, badge_number, first_name, last_name, status, avatar_url, division_id,
        roles (id, name, level)
      `)
      .eq("id", userId)
      .single();

    if (profileError || !profileData || !profileData.roles) {
      console.error("Error fetching user profile:", profileError);
      return null;
    }

    // Naprawa błędów 2, 3, 4: roles jest pojedynczym obiektem, nie tablicą
    const role = profileData.roles as { id: number, name: string, level: number };

    return {
      id: profileData.id,
      email: profileData.email,
      badge_number: profileData.badge_number,
      first_name: profileData.first_name || undefined,
      last_name: profileData.last_name || undefined,
      role_id: role.id,
      role_name: role.name as UserRole,
      role_level: role.level,
      division_id: profileData.division_id || undefined,
      status: profileData.status as "pending" | "approved" | "rejected",
      avatar_url: profileData.avatar_url || undefined,
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const handleAuthChange = async (event: string, currentSession: Session | null) => {
      if (!isMounted) return;

      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        const p = await fetchUserProfile(currentSession.user.id);
        if (!isMounted) return;
        setProfile(p);

        if (p?.status === "pending") {
          toast.info("Twoje konto oczekuje na akceptację przez dowództwo.");
          if (location.pathname !== "/login" && location.pathname !== "/register") {
             navigate("/login");
          }
        } else if (p?.status === "rejected") {
          toast.error("Twoje konto zostało odrzucone.");
          if (location.pathname !== "/login" && location.pathname !== "/register") {
             navigate("/login");
          }
        } else if (p?.status === "approved" && (location.pathname === "/login" || location.pathname === "/register")) {
          navigate("/");
        }
      } else {
        setProfile(null);
        if (location.pathname !== "/login" && location.pathname !== "/register") {
          navigate("/login");
        }
      }
      setLoading(false);
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleAuthChange('INITIAL_SESSION', initialSession);
    });

    // Listener for subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, navigate, location.pathname]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    }
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, badgeNumber: string) => {
    setLoading(true);
    
    // 1. Sign up user with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          badge_number: badgeNumber,
        }
      }
    });

    if (authError) {
      toast.error(authError.message);
      setLoading(false);
      return { error: authError };
    }

    // Profile creation is handled by the SQL trigger (handle_new_user)

    if (authData.user) {
      toast.info("Konto zostało utworzone i oczekuje na akceptację.");
      navigate("/login");
    }
    setLoading(false);
    return { error: null };
  }, [navigate]);

  const signOut = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return { error };
    }
    toast.success("Wylogowano pomyślnie.");
    // Navigation handled by useEffect listener
    return { error: null };
  }, []);

  const value = useMemo(() => ({
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    fetchUserProfile
  }), [session, user, profile, loading, signIn, signUp, signOut, fetchUserProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-lapd-navy text-lapd-white">Ładowanie...</div>;
  }

  if (!user || !profile) {
    // Redirect unauthenticated users
    return <Navigate to="/login" replace />;
  }
  
  if (profile.status !== "approved") {
    // Show pending/rejected screen if not approved
    return (
      <div className="min-h-screen bg-lapd-navy flex flex-col items-center justify-center text-lapd-white p-8 text-center">
        <h2 className="text-xl font-black text-lapd-gold uppercase mb-4 tracking-widest">Ograniczony Dostęp</h2>
        <p className="text-gray-400 max-w-md text-sm">
          Twoje konto ({profile.badge_number}) jest w statusie: 
          <span className={`font-bold ml-1 ${profile.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>
            {profile.status === 'pending' ? 'OCZEKUJĄCY' : 'ODRZUCONY'}
          </span>.
        </p>
        <Button onClick={() => supabase.auth.signOut()} className="mt-8 bg-lapd-gold text-lapd-navy hover:bg-yellow-600">
          Wyloguj
        </Button>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(profile.role_name)) {
    // Redirect if user role is not allowed
    toast.error("Brak uprawnień do dostępu do tej strony.");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
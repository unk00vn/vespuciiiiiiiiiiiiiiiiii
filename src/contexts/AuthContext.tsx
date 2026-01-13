"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { toast } from "sonner";

// Definicje typów dla ról i profilu
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
  division_id?: number;
  division_name?: string; // Dodano pole division_name
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
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id, email, badge_number, first_name, last_name, status, avatar_url,
        roles (id, name, level),
        divisions (id, name)
      `)
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    if (data) {
      return {
        id: data.id,
        email: data.email,
        badge_number: data.badge_number,
        first_name: data.first_name || undefined,
        last_name: data.last_name || undefined,
        role_id: data.roles.id,
        role_name: data.roles.name as UserRole,
        role_level: data.roles.level,
        division_id: data.divisions?.id || undefined,
        division_name: data.divisions?.name || undefined, // Dodano division_name
        status: data.status as "pending" | "approved" | "rejected",
        avatar_url: data.avatar_url || undefined,
      };
    }
    return null;
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          const userProfile = await fetchUserProfile(currentSession.user.id);
          setProfile(userProfile);
          if (userProfile?.status === "pending") {
            toast.info("Twoje konto oczekuje na akceptację przez dowództwo.");
            navigate("/login"); // Redirect to login if pending
          } else if (userProfile?.status === "rejected") {
            toast.error("Twoje konto zostało odrzucone. Skontaktuj się z dowództwem.");
            navigate("/login"); // Redirect to login if rejected
          } else if (userProfile?.status === "approved" && location.pathname === "/login") {
            navigate("/"); // Redirect to dashboard if approved and on login page
          }
        } else {
          setProfile(null);
          if (location.pathname !== "/login" && location.pathname !== "/register") {
            navigate("/login");
          }
        }
        setLoading(false);
      }
    );

    // Initial check
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
      if (initialSession?.user) {
        const userProfile = await fetchUserProfile(initialSession.user.id);
        setProfile(userProfile);
        if (userProfile?.status === "pending" || userProfile?.status === "rejected") {
          navigate("/login");
        }
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return { error };
    }
    if (data.user) {
      const userProfile = await fetchUserProfile(data.user.id);
      if (userProfile?.status === "pending") {
        toast.info("Twoje konto oczekuje na akceptację przez dowództwo.");
        await supabase.auth.signOut(); // Force logout if pending
        return { error: new Error("Account pending approval") };
      } else if (userProfile?.status === "rejected") {
        toast.error("Twoje konto zostało odrzucone. Skontaktuj się z dowództwem.");
        await supabase.auth.signOut(); // Force logout if rejected
        return { error: new Error("Account rejected") };
      }
      setProfile(userProfile);
      toast.success("Zalogowano pomyślnie!");
      navigate("/");
    }
    setLoading(false);
    return { error: null };
  };

  const signUp = async (email: string, password: string, badgeNumber: string) => {
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          badge_number: badgeNumber, // Pass badge_number to auth.users metadata
        },
      },
    });

    if (authError) {
      toast.error(authError.message);
      setLoading(false);
      return { error: authError };
    }

    if (authData.user) {
      // Insert profile into public.profiles table with default 'pending' status and 'Officer' role
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("id, name, level")
        .eq("name", "Officer")
        .single();

      if (roleError || !roleData) {
        console.error("Error fetching Officer role:", roleError);
        toast.error("Błąd podczas rejestracji: Nie można przypisać roli.");
        await supabase.auth.signOut(); // Log out the user if profile creation fails
        setLoading(false);
        return { error: roleError || new Error("Officer role not found") };
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: email,
        badge_number: badgeNumber,
        role_id: roleData.id,
        status: "pending",
      });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
        toast.error("Błąd podczas tworzenia profilu użytkownika.");
        await supabase.auth.signOut(); // Log out the user if profile creation fails
        setLoading(false);
        return { error: profileError };
      }

      toast.info("Konto zostało utworzone i oczekuje na akceptację.");
      navigate("/login");
    }
    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return { error };
    }
    setSession(null);
    setUser(null);
    setProfile(null);
    toast.success("Wylogowano pomyślnie.");
    navigate("/login");
    setLoading(false);
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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectPath?: string;
}

export const ProtectedRoute = ({ children, allowedRoles, redirectPath = "/login" }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-lapd-navy text-lapd-white">Ładowanie...</div>;
  }

  if (!user || !profile || profile.status !== "approved") {
    // Redirect unauthenticated or unapproved users
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role_name)) {
    // Redirect if user role is not allowed
    toast.error("Brak uprawnień do dostępu do tej strony.");
    return <Navigate to="/" replace />; // Redirect to dashboard or another appropriate page
  }

  return <>{children}</>;
};
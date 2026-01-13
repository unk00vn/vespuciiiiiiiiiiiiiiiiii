import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserProfile, Division } from "@/contexts/AuthContext";

// --- Typy Danych ---

export interface Report {
  id: string;
  author_id: string;
  recipient_id: string | null;
  title: string;
  location: string | null;
  date: string | null;
  status: string;
  created_at: string;
  author: Pick<UserProfile, 'first_name' | 'last_name' | 'badge_number'>;
}

export interface Note {
  id: number;
  author_id: string;
  title: string;
  content: string | null;
  status: string;
  is_private: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  author_id: string | null;
  title: string;
  content: string;
  status: string;
  created_at: string;
}

// --- Hooki do Raportów ---

export const useReports = () => {
  return useQuery<Report[], Error>({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          author:profiles(first_name, last_name, badge_number)
        `)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      
      // Mapowanie danych, aby autor był płaski
      return data.map(r => ({
        ...r,
        author: Array.isArray(r.author) ? r.author[0] : r.author,
      })) as Report[];
    },
  });
};

// --- Hooki do Notatek ---

export const useNotes = (userId: string) => {
  return useQuery<Note[], Error>({
    queryKey: ["notes", userId],
    queryFn: async () => {
      // Pobieramy tylko notatki, których jesteśmy autorem (RLS zapewnia dostęp)
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data as Note[];
    },
    enabled: !!userId,
  });
};

// --- Hooki do Ogłoszeń ---

export const useAnnouncements = () => {
  return useQuery<Announcement[], Error>({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data as Announcement[];
    },
  });
};

// --- Hooki do Dywizji ---

export const useDivisions = () => {
  return useQuery<Division[], Error>({
    queryKey: ["divisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("divisions")
        .select("id, name, description")
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);
      return data as Division[];
    },
  });
};
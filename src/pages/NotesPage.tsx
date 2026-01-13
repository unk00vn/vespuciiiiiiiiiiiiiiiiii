"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Users, Loader2, Edit, AlertCircle, RefreshCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Note {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  note_shares?: { profile_id: string }[];
}

const NotesPage = () => {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);
    setDbError(null);

    try {
      const { data, error } = await supabase
        .from("notes")
        .select(`
          *,
          note_shares(profile_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (e: any) {
      console.error("Notes fetch error:", e);
      if (e.message?.includes("recursion")) {
        setDbError("Błąd rekursji RLS. Uruchom skrypt 'FINAL FIX' w panelu Supabase.");
      } else {
        toast.error("Błąd bazy danych: " + e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [profile]);

  const handleAdd = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    const { error } = await supabase.from("notes").insert({ 
      author_id: profile?.id, 
      title: newNote.title, 
      content: newNote.content 
    });
    
    if (error) toast.error("Błąd: " + error.message);
    else {
      toast.success("Zapisano.");
      setIsAdding(false);
      setNewNote({ title: "", content: "" });
      fetchData();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lapd-navy uppercase tracking-tighter">Baza Operacyjna</h1>
        <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchData} className="border-lapd-gold">
                <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setIsAdding(!isAdding)} className="bg-lapd-gold text-lapd-navy font-bold shadow-md">
                {isAdding ? "ANULUJ" : "NOWA NOTATKA"}
            </Button>
        </div>
      </div>

      {dbError && (
        <Alert variant="destructive" className="border-2 border-red-500 bg-red-50">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-black uppercase">Wykryto problem z uprawnieniami (RLS)</AlertTitle>
          <AlertDescription className="text-sm mt-1">
            Silnik bazy danych wykrył pętlę. Aby to naprawić, wklej kod z pliku <b>supabase_final_fix.sql</b> do SQL Editora w Supabase i kliknij <b>Run</b>. Potem odśwież stronę przyciskiem obok.
          </AlertDescription>
        </Alert>
      )}

      {isAdding && (
        <Card className="border-lapd-gold shadow-xl p-4 space-y-4">
            <Input placeholder="Tytuł operacji" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} />
            <Textarea placeholder="Treść notatki..." value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} className="min-h-[150px]" />
            <Button onClick={handleAdd} className="w-full bg-lapd-navy text-lapd-gold font-bold uppercase">ZAPISZ W BAZIE</Button>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-lapd-gold" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(n => (
            <Card key={n.id} className="border-l-4 border-l-lapd-gold bg-white hover:shadow-lg transition-all h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black text-lapd-navy uppercase truncate">{n.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 flex-1 whitespace-pre-wrap line-clamp-6">
                {n.content}
              </CardContent>
              <CardFooter className="pt-2 border-t flex justify-between">
                <Badge className={n.author_id === profile?.id ? "bg-lapd-navy" : "bg-blue-600"}>
                    {n.author_id === profile?.id ? "MOJA" : "UDOSTĘPNIONA"}
                </Badge>
                <span className="text-[10px] text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
              </CardFooter>
            </Card>
          ))}
          {notes.length === 0 && !loading && !dbError && (
            <div className="col-span-full text-center py-20 text-gray-400 italic">Baza notatek jest obecnie pusta.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotesPage;
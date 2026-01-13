"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Users, Loader2, Edit, RefreshCcw, Check, X, AlertCircle, Database } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Note {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  note_shares?: { profile_id: string }[];
}

interface Officer {
  id: string;
  first_name: string;
  last_name: string;
  badge_number: string;
}

const NotesPage = () => {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [sharingNote, setSharingNote] = useState<Note | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);
    setError(false);

    const safetyTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError(true);
      }
    }, 6000);

    try {
      const { data: notesData, error: sbError } = await supabase
        .from("notes")
        .select("*, note_shares(profile_id)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (sbError) throw sbError;
      setNotes(notesData || []);
    } catch (e) {
      console.error("Notes fetch error:", e);
      setError(true);
    } finally {
      clearTimeout(safetyTimeout);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    supabase.from("profiles").select("id, first_name, last_name, badge_number").eq("status", "approved").limit(200).then(({data}) => setOfficers(data || []));
  }, [profile]);

  const handleAdd = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    const { error } = await supabase.from("notes").insert({ author_id: profile?.id, title: newNote.title, content: newNote.content });
    if (error) toast.error("Błąd zapisu.");
    else {
      toast.success("Zapisano.");
      setIsAdding(false);
      setNewNote({ title: "", content: "" });
      fetchData();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Baza Operacyjna</h1>
        <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchData} className="border-white/10 text-white hover:bg-white/5">
                <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setIsAdding(!isAdding)} className="bg-lapd-gold text-black font-bold shadow-lg">
                {isAdding ? "ANULUJ" : "DODAJ WPIS"}
            </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="bg-white/5 border-lapd-gold/50 shadow-xl p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase">Tytuł Zdarzenia</Label>
              <Input 
                placeholder="Wpisz tytuł..." 
                value={newNote.title} 
                onChange={e => setNewNote({...newNote, title: e.target.value})} 
                className="bg-black/40 border-white/10 text-white h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase">Opis</Label>
              <Textarea 
                placeholder="Treść notatki..." 
                value={newNote.content} 
                onChange={e => setNewNote({...newNote, content: e.target.value})} 
                className="min-h-[150px] bg-black/40 border-white/10 text-white"
              />
            </div>
            <Button onClick={handleAdd} className="w-full bg-lapd-gold text-black font-black uppercase h-11">ZAPISZ W SYSTEMIE</Button>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
           <Loader2 className="animate-spin text-lapd-gold h-12 w-12 mb-4" />
           <p className="text-slate-500 text-xs font-mono uppercase">Trwa przeszukiwanie bazy danych...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-red-500/5 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-white font-bold uppercase">Baza danych niedostępna</p>
          <p className="text-slate-400 text-xs mt-1">Przekroczono czas oczekiwania na odpowiedź z terminala.</p>
          <Button onClick={fetchData} className="mt-6 bg-red-600 hover:bg-red-700 text-white">PONÓW PRÓBĘ</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map(n => (
            <Card key={n.id} className="border border-white/10 bg-white/5 hover:bg-white/[0.08] transition-all flex flex-col group">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wide truncate">{n.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm text-slate-200 flex-1 whitespace-pre-wrap leading-relaxed line-clamp-6">
                {n.content}
              </CardContent>
              <CardFooter className="pt-3 border-t border-white/5 flex justify-between items-center bg-black/10">
                <div className="flex gap-1">
                    {n.author_id === profile?.id ? (
                        <Badge className="bg-lapd-gold text-black text-[9px] font-black">WŁASNA</Badge>
                    ) : (
                        <Badge variant="outline" className="border-blue-500 text-blue-400 text-[9px] font-bold">UDOSTĘPNIONA</Badge>
                    )}
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => setEditingNote(n)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
          {notes.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-600">
               <Database className="h-12 w-12 mb-4 opacity-10" />
               <p className="text-xs uppercase font-black tracking-tighter italic">Baza operacyjna jest obecnie pusta.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotesPage;
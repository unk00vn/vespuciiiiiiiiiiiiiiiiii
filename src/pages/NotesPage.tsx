"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Share2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const NotesPage = () => {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [allOfficers, setAllOfficers] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [sharingNote, setSharingNote] = useState<any>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    if (!profile) return;
    setLoading(true);
    const { data: myNotes } = await supabase.from("notes").select("*").eq("author_id", profile.id);
    const { data: shared } = await supabase.from("note_shares").select("notes(*)").eq("profile_id", profile.id);
    
    const combined = [...(myNotes || []), ...(shared?.map(s => s.notes) || [])];
    setNotes(combined.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
    supabase.from("profiles").select("id, first_name, last_name, badge_number").eq("status", "approved").then(({data}) => setAllOfficers(data || []));
  }, [profile]);

  const handleAdd = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    await supabase.from("notes").insert({ author_id: profile?.id, title: newNote.title, content: newNote.content });
    setIsAdding(false);
    setNewNote({ title: "", content: "" });
    fetchNotes();
  };

  const handleDelete = async () => {
    if (!deletingNoteId) return;
    const { error } = await supabase.from("notes").delete().eq("id", deletingNoteId);
    if (error) toast.error("Błąd podczas usuwania.");
    else {
      toast.success("Notatka usunięta.");
      fetchNotes();
    }
    setDeletingNoteId(null);
  };

  const handleShare = async (officerId: string) => {
    const { error } = await supabase.from("note_shares").insert({ note_id: sharingNote.id, profile_id: officerId });
    
    if (error) {
      // Sprawdzamy, czy błąd to naruszenie unikalności (kod 23505 w PostgreSQL)
      if (error.code === '23505') {
        toast.warning("Ta notatka jest już udostępniona temu funkcjonariuszowi.");
      } else {
        toast.error("Błąd udostępniania: " + error.message);
      }
    } else {
      toast.success("Udostępniono pomyślnie.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lapd-navy">Notatki & Operacje</h1>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-lapd-gold text-lapd-navy font-bold">
          {isAdding ? "ANULUJ" : "NOWA NOTATKA"}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-lapd-gold shadow-lg">
          <CardContent className="p-4 space-y-4">
            <Input placeholder="Tytuł notatki" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} />
            <Textarea placeholder="Treść..." value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} />
            <Button onClick={handleAdd} className="w-full bg-lapd-navy text-lapd-gold font-bold">ZAPISZ NOTATKĘ</Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-lapd-gold" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(n => (
            <Card key={n.id} className="relative border-l-4 border-l-lapd-gold hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-lapd-navy uppercase truncate">{n.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 min-h-[100px] whitespace-pre-wrap">
                {n.content}
              </CardContent>
              <CardFooter className="flex justify-end gap-1 pt-2 border-t border-gray-100">
                {n.author_id === profile?.id ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setSharingNote(n)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingNoteId(n.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <span className="text-[10px] text-gray-400 italic">Udostępniona</span>
                )}
              </CardFooter>
            </Card>
          ))}
          {notes.length === 0 && !loading && (
            <div className="col-span-full text-center py-20 text-gray-400">Brak dostępnych notatek.</div>
          )}
        </div>
      )}

      {/* Okno udostępniania */}
      <Dialog open={!!sharingNote} onOpenChange={() => setSharingNote(null)}>
        <DialogContent className="border-lapd-gold">
          <DialogHeader><DialogTitle className="text-lapd-navy font-black uppercase">Udostępnij notatkę</DialogTitle></DialogHeader>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {allOfficers.filter(o => o.id !== profile?.id).map(o => (
              <div key={o.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                <span className="text-sm font-bold">#{o.badge_number} {o.first_name} {o.last_name}</span>
                <Button size="sm" variant="outline" className="border-lapd-gold text-lapd-navy" onClick={() => handleShare(o.id)}>Udostępnij</Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Okno potwierdzenia usuwania */}
      <AlertDialog open={!!deletingNoteId} onOpenChange={() => setDeletingNoteId(null)}>
        <AlertDialogContent className="border-2 border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 font-black uppercase">Czy na pewno chcesz usunąć tę notatkę?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć. Notatka zostanie trwale usunięta z bazy danych LSPD.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">ANULUJ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold">
              USUŃ NOTATKĘ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotesPage;
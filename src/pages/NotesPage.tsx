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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

const CollaboratorManager = ({ note, officers, onClose, onUpdate }: { note: Note, officers: Officer[], onClose: () => void, onUpdate: () => void }) => {
  const [currentCollaborators, setCurrentCollaborators] = useState<string[]>(note.note_shares?.map(s => s.profile_id) || []);
  const [saving, setSaving] = useState(false);
  const { profile } = useAuth();

  const availableOfficers = officers.filter(o => o.id !== profile?.id && o.id !== note.author_id);

  const handleToggleCollaborator = (officerId: string) => {
    setCurrentCollaborators(prev => 
      prev.includes(officerId) ? prev.filter(id => id !== officerId) : [...prev, officerId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from("note_shares").delete().eq("note_id", note.id);
      if (currentCollaborators.length > 0) {
        const inserts = currentCollaborators.map(pid => ({ note_id: note.id, profile_id: pid }));
        await supabase.from("note_shares").insert(inserts);
      }
      toast.success("Zaktualizowano dostęp.");
      onUpdate();
      onClose();
    } catch (e: any) {
      toast.error("Wystąpił błąd podczas zapisywania.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="border-lapd-gold bg-white">
        <DialogHeader><DialogTitle className="text-lapd-navy font-black uppercase">Współdzielenie Notatki</DialogTitle></DialogHeader>
        <div className="max-h-60 overflow-y-auto space-y-2 py-2">
          {availableOfficers.map(o => (
            <div key={o.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
              <span className="text-sm font-bold">#{o.badge_number} {o.first_name} {o.last_name}</span>
              <Button 
                size="sm" 
                variant={currentCollaborators.includes(o.id) ? "default" : "outline"} 
                className={currentCollaborators.includes(o.id) ? "bg-red-500 text-white" : "border-lapd-gold text-lapd-navy"}
                onClick={() => handleToggleCollaborator(o.id)}
              >
                {currentCollaborators.includes(o.id) ? "USUŃ" : "DODAJ"}
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Anuluj</Button>
          <Button className="bg-lapd-navy text-lapd-gold font-bold" onClick={handleSave} disabled={saving}>ZAPISZ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const NotesPage = () => {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [allOfficers, setAllOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [sharingNote, setSharingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [dbError, setDbError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);
    setDbError(null);

    try {
        const { data: notesData, error: notesError } = await supabase
            .from("notes")
            .select("*")
            .order("created_at", { ascending: false });

        if (notesError) throw notesError;

        const noteIds = (notesData || []).map(n => n.id);
        let sharesData: any[] = [];
        if (noteIds.length > 0) {
            const { data: sData } = await supabase
                .from("note_shares")
                .select("note_id, profile_id")
                .in("note_id", noteIds);
            sharesData = sData || [];
        }

        const formatted = (notesData || []).map(n => ({
            ...n,
            note_shares: sharesData.filter(s => s.note_id === n.id)
        }));

        setNotes(formatted);
    } catch (e: any) {
        console.error("Fetch error:", e);
        if (e.message?.includes("recursion")) {
            setDbError("Wykryto pętlę uprawnień. Uruchom skrypt 'supabase_final_fix.sql' w panelu Supabase.");
        } else {
            toast.error("Nie udało się załadować notatek.");
        }
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    supabase.from("profiles").select("id, first_name, last_name, badge_number").eq("status", "approved").then(({data}) => setAllOfficers(data || []));
  }, [profile]);

  const handleAdd = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    const { error } = await supabase.from("notes").insert({ author_id: profile?.id, title: newNote.title, content: newNote.content });
    if (error) toast.error("Błąd zapisu.");
    else {
        toast.success("Zapisano notatkę.");
        setIsAdding(false);
        setNewNote({ title: "", content: "" });
        fetchData();
    }
  };

  const handleUpdate = async () => {
    if (!editingNote) return;
    const { error } = await supabase.from("notes").update({ title: editingNote.title, content: editingNote.content }).eq("id", editingNote.id);
    if (error) toast.error("Błąd aktualizacji.");
    else {
        toast.success("Zmiany zapisane.");
        setEditingNote(null);
        fetchData();
    }
  };

  const handleDelete = async () => {
    if (!deletingNoteId) return;
    const { error } = await supabase.from("notes").delete().eq("id", deletingNoteId);
    if (error) toast.error("Błąd usuwania.");
    else {
        toast.success("Notatka usunięta.");
        fetchData();
    }
    setDeletingNoteId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lapd-navy uppercase tracking-tighter">Baza Operacyjna</h1>
        <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchData} className="border-lapd-gold hover:bg-lapd-gold/10">
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
          <AlertTitle className="font-black">BŁĄD REKURSJI RLS</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            Baza danych wykryła pętlę w uprawnieniach. Skopiuj kod z pliku <b>supabase_final_fix.sql</b> w edytorze i uruchom go w SQL Editor panelu Supabase.
          </AlertDescription>
        </Alert>
      )}

      {isAdding && (
        <Card className="border-lapd-gold shadow-xl bg-white p-4 space-y-4">
            <Input placeholder="Tytuł notatki" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} className="border-lapd-gold" />
            <Textarea placeholder="Treść..." value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} className="min-h-[150px] border-lapd-gold" />
            <Button onClick={handleAdd} className="w-full bg-lapd-navy text-lapd-gold font-bold">ZAPISZ NOTATKĘ</Button>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-lapd-gold" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(n => (
            <Card key={n.id} className="border-l-4 border-l-lapd-gold hover:shadow-lg transition-all bg-white flex flex-col h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black text-lapd-navy uppercase truncate">{n.title}</CardTitle>
                <div className="text-[10px] text-gray-400 font-mono">ID: {n.id.substring(0, 8)}</div>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 flex-1 whitespace-pre-wrap line-clamp-6">
                {n.content}
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                <div className="flex gap-1">
                    {n.author_id === profile?.id ? (
                        <Badge className="bg-lapd-navy text-lapd-gold text-[9px] font-bold">WŁASNA</Badge>
                    ) : (
                        <Badge variant="outline" className="border-blue-500 text-blue-500 text-[9px] font-bold">WSPÓŁPRACA</Badge>
                    )}
                </div>
                <div className="flex gap-1">
                    {n.author_id === profile?.id && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-lapd-gold/20" onClick={() => setSharingNote(n)}>
                            <Users className="h-4 w-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-lapd-gold/20" onClick={() => setEditingNote(n)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    {n.author_id === profile?.id && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeletingNoteId(n.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
              </CardFooter>
            </Card>
          ))}
          {notes.length === 0 && !loading && !dbError && (
            <div className="col-span-full text-center py-20 text-gray-400">Brak notatek do wyświetlenia.</div>
          )}
        </div>
      )}

      {editingNote && (
        <Dialog open={true} onOpenChange={() => setEditingNote(null)}>
          <DialogContent className="max-w-2xl border-lapd-gold bg-white">
            <DialogHeader><DialogTitle className="text-lapd-navy font-black uppercase">Edycja Notatki</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <Input value={editingNote.title} onChange={e => setEditingNote({...editingNote, title: e.target.value})} className="border-lapd-gold" />
                <Textarea value={editingNote.content} onChange={e => setEditingNote({...editingNote, content: e.target.value})} className="min-h-[300px] border-lapd-gold" />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setEditingNote(null)}>Anuluj</Button>
                <Button className="bg-lapd-navy text-lapd-gold font-bold" onClick={handleUpdate}>ZAPISZ ZMIANY</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {sharingNote && <CollaboratorManager note={sharingNote} officers={allOfficers} onClose={() => setSharingNote(null)} onUpdate={fetchData} />}

      <AlertDialog open={!!deletingNoteId} onOpenChange={() => setDeletingNoteId(null)}>
        <AlertDialogContent className="border-2 border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 uppercase font-black">Potwierdź usunięcie</AlertDialogTitle>
            <AlertDialogDescription>Tej operacji nie można cofnąć. Notatka zniknie z bazy danych.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold">USUŃ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotesPage;
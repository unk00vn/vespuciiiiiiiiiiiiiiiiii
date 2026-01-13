"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Users, Loader2, UserPlus, X, Edit, AlertCircle } from "lucide-react";
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
      const { error: deleteError } = await supabase
        .from("note_shares")
        .delete()
        .eq("note_id", note.id);

      if (deleteError) throw deleteError;

      if (currentCollaborators.length > 0) {
        const inserts = currentCollaborators.map(profileId => ({
          note_id: note.id,
          profile_id: profileId
        }));
        const { error: insertError } = await supabase.from("note_shares").insert(inserts);
        if (insertError) throw insertError;
      }

      toast.success("Dostęp zaktualizowany.");
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error("Błąd: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="border-lapd-gold">
        <DialogHeader><DialogTitle className="text-lapd-navy uppercase font-black">Zarządzaj dostępem</DialogTitle></DialogHeader>
        <div className="max-h-60 overflow-y-auto space-y-2">
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
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [sharingNote, setSharingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingNew, setSavingNew] = useState(false);

  const fetchNotes = async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    
    try {
        // 1. Pobierz moje notatki
        const { data: myNotes, error: e1 } = await supabase.from("notes").select("*").eq("author_id", profile.id);
        if (e1) throw e1;
        
        // 2. Pobierz ID notatek udostępnionych
        const { data: shares, error: e2 } = await supabase.from("note_shares").select("note_id").eq("profile_id", profile.id);
        if (e2) throw e2;
        
        const sharedIds = shares?.map(s => s.note_id) || [];
        
        // 3. Pobierz treść udostępnionych notatek
        let sharedNotes: Note[] = [];
        if (sharedIds.length > 0) {
            const { data: nData, error: e3 } = await supabase.from("notes").select("*").in("id", sharedIds);
            if (e3) throw e3;
            sharedNotes = nData as Note[];
        }
        
        // 4. Pobierz wszystkie udostępnienia (do ikon)
        const allVisibleIds = [...(myNotes || []).map(n => n.id), ...sharedIds];
        let allNoteShares: any[] = [];
        if (allVisibleIds.length > 0) {
            const { data: sData } = await supabase.from("note_shares").select("note_id, profile_id").in("note_id", allVisibleIds);
            allNoteShares = sData || [];
        }

        const notesMap = new Map<string, Note>();
        [...(myNotes || []), ...sharedNotes].forEach(n => {
            notesMap.set(n.id, { ...n, note_shares: allNoteShares.filter(s => s.note_id === n.id) });
        });
        
        setNotes(Array.from(notesMap.values()).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        
    } catch (err: any) {
        console.error("Fetch error:", err);
        if (err.message?.includes("recursion")) {
            setError("Wykryto błąd rekursji RLS w bazie danych. Musisz uruchomić skrypt SQL naprawczy w panelu Supabase.");
        } else {
            setError("Wystąpił błąd podczas ładowania notatek: " + err.message);
        }
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    supabase.from("profiles").select("id, first_name, last_name, badge_number").eq("status", "approved").then(({data}) => setAllOfficers(data || []));
  }, [profile]);

  const handleAdd = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    setSavingNew(true);
    const { error } = await supabase.from("notes").insert({ author_id: profile?.id, title: newNote.title, content: newNote.content });
    if (error) toast.error("Błąd zapisu: " + error.message);
    else {
        toast.success("Notatka zapisana.");
        setIsAdding(false);
        setNewNote({ title: "", content: "" });
        fetchNotes();
    }
    setSavingNew(false);
  };
  
  const handleSaveEdit = async () => {
      if (!editingNote) return;
      setSavingNew(true); 
      const { error } = await supabase.from("notes").update({ title: editingNote.title, content: editingNote.content }).eq("id", editingNote.id);
      if (error) toast.error("Błąd aktualizacji: " + error.message);
      else {
          toast.success("Notatka zaktualizowana.");
          setEditingNote(null);
          fetchNotes();
      }
      setSavingNew(false);
  };

  const handleDelete = async () => {
    if (!deletingNoteId) return;
    const { error } = await supabase.from("notes").delete().eq("id", deletingNoteId);
    if (error) toast.error("Błąd usuwania: " + error.message);
    else {
      toast.success("Notatka usunięta.");
      fetchNotes();
    }
    setDeletingNoteId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lapd-navy">Notatki & Operacje</h1>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-lapd-gold text-lapd-navy font-bold shadow-md">
          {isAdding ? "ANULUJ" : "NOWA NOTATKA"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="border-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd Konfiguracji Bazy Danych</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>{error}</p>
            <p className="font-bold">Instrukcja naprawy:</p>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>Otwórz panel Supabase</li>
              <li>Przejdź do zakładki <b>SQL Editor</b></li>
              <li>Wklej skrypt naprawczy otrzymany na czacie</li>
              <li>Kliknij <b>Run</b></li>
              <li>Odśwież tę stronę</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      {isAdding && (
        <Card className="border-lapd-gold shadow-xl bg-white p-4 space-y-4">
            <Input placeholder="Tytuł notatki" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} disabled={savingNew} className="border-lapd-gold" />
            <Textarea placeholder="Treść notatki..." value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} className="min-h-[150px] border-lapd-gold" disabled={savingNew} />
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAdding(false)} disabled={savingNew}>Anuluj</Button>
                <Button onClick={handleAdd} className="bg-lapd-navy text-lapd-gold font-bold px-8" disabled={savingNew}>
                    {savingNew ? <Loader2 className="animate-spin h-4 w-4" /> : "ZAPISZ NOTATKĘ"}
                </Button>
            </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-lapd-gold" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(n => (
            <Card key={n.id} className="border-l-4 border-l-lapd-gold hover:shadow-lg transition-all bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-lapd-navy uppercase truncate">{n.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 min-h-[120px] whitespace-pre-wrap line-clamp-6">{n.content}</CardContent>
              <CardFooter className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="flex gap-1">
                    {n.author_id === profile?.id ? (
                        <Badge className="bg-lapd-navy text-lapd-gold text-[10px] font-bold">WŁASNA</Badge>
                    ) : (
                        <Badge variant="outline" className="border-blue-500 text-blue-500 text-[10px] font-bold uppercase">Współpraca</Badge>
                    )}
                </div>
                <div className="flex gap-1">
                    {n.author_id === profile?.id && (
                        <Button variant="ghost" size="sm" onClick={() => setSharingNote(n)} className="hover:bg-lapd-gold/20">
                            <Users className="h-4 w-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setEditingNote(n)} className="hover:bg-lapd-gold/20">
                        <Edit className="h-4 w-4" />
                    </Button>
                    {n.author_id === profile?.id && (
                        <Button variant="ghost" size="sm" onClick={() => setDeletingNoteId(n.id)} className="text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
              </CardFooter>
            </Card>
          ))}
          {notes.length === 0 && !loading && !error && (
            <div className="col-span-full text-center py-20 text-gray-400">Twoja baza notatek jest pusta.</div>
          )}
        </div>
      )}

      {/* Dialog Edycji */}
      {editingNote && (
        <Dialog open={true} onOpenChange={() => !savingNew && setEditingNote(null)}>
          <DialogContent className="border-lapd-gold bg-white">
            <DialogHeader><DialogTitle className="text-lapd-navy font-black uppercase">Edycja Notatki</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-gray-500">Tytuł</Label>
                    <Input value={editingNote.title} onChange={e => setEditingNote({...editingNote, title: e.target.value})} className="border-lapd-gold" disabled={savingNew} />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-gray-500">Treść</Label>
                    <Textarea value={editingNote.content} onChange={e => setEditingNote({...editingNote, content: e.target.value})} className="min-h-[250px] border-lapd-gold" disabled={savingNew} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setEditingNote(null)} disabled={savingNew}>Anuluj</Button>
                <Button className="bg-lapd-navy text-lapd-gold font-bold" onClick={handleSaveEdit} disabled={savingNew}>
                    {savingNew ? <Loader2 className="animate-spin h-4 w-4" /> : "ZAPISZ ZMIANY"}
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog Udostępniania */}
      {sharingNote && (
        <CollaboratorManager 
            note={sharingNote} 
            officers={allOfficers} 
            onClose={() => setSharingNote(null)} 
            onUpdate={fetchNotes} 
        />
      )}
      
      {/* Dialog Usuwania */}
      <AlertDialog open={!!deletingNoteId} onOpenChange={() => setDeletingNoteId(null)}>
        <AlertDialogContent className="border-2 border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 uppercase font-black">Potwierdź usunięcie</AlertDialogTitle>
            <AlertDialogDescription>Czy na pewno chcesz usunąć tę notatkę? Tej operacji nie można cofnąć.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">ANULUJ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold">USUŃ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotesPage;
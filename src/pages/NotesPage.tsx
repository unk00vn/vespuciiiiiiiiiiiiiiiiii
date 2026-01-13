"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Users, Loader2, UserPlus, X, Edit } from "lucide-react";
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

// Komponent do zarządzania współpracownikami
const CollaboratorManager = ({ note, officers, onClose, onUpdate }: { note: Note, officers: Officer[], onClose: () => void, onUpdate: () => void }) => {
  const [currentCollaborators, setCurrentCollaborators] = useState<string[]>(note.note_shares?.map(s => s.profile_id) || []);
  const [saving, setSaving] = useState(false);
  const { profile } = useAuth();

  // Filtrujemy, aby nie dodawać siebie ani autora notatki (jeśli autor jest inny niż ja)
  const availableOfficers = officers.filter(o => o.id !== profile?.id && o.id !== note.author_id);

  const handleToggleCollaborator = (officerId: string) => {
    setCurrentCollaborators(prev => 
      prev.includes(officerId) ? prev.filter(id => id !== officerId) : [...prev, officerId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Usuń wszystkie istniejące udostępnienia dla tej notatki
      const { error: deleteError } = await supabase
        .from("note_shares")
        .delete()
        .eq("note_id", note.id);

      if (deleteError) throw deleteError;

      // 2. Wstaw nowe udostępnienia
      if (currentCollaborators.length > 0) {
        const inserts = currentCollaborators.map(profileId => ({
          note_id: note.id,
          profile_id: profileId
        }));
        const { error: insertError } = await supabase.from("note_shares").insert(inserts);
        if (insertError) throw insertError;
      }

      toast.success("Współpracownicy zaktualizowani.");
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error("Błąd zapisu współpracowników: " + error.message);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="border-lapd-gold">
        <DialogHeader><DialogTitle className="text-lapd-navy font-black uppercase">Zarządzaj Współpracownikami</DialogTitle></DialogHeader>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {availableOfficers.map(o => (
            <div key={o.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
              <span className="text-sm font-bold">#{o.badge_number} {o.first_name} {o.last_name}</span>
              <Button 
                size="sm" 
                variant={currentCollaborators.includes(o.id) ? "default" : "outline"} 
                className={currentCollaborators.includes(o.id) ? "bg-red-500 hover:bg-red-600 text-white" : "border-lapd-gold text-lapd-navy"}
                onClick={() => handleToggleCollaborator(o.id)}
              >
                {currentCollaborators.includes(o.id) ? <X className="h-4 w-4 mr-1" /> : <UserPlus className="h-4 w-4 mr-1" />}
                {currentCollaborators.includes(o.id) ? "USUŃ" : "DODAJ"}
              </Button>
            </div>
          ))}
          {availableOfficers.length === 0 && <p className="text-center text-gray-400 py-4">Brak innych funkcjonariuszy do dodania.</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Anuluj</Button>
          <Button className="bg-lapd-navy text-lapd-gold font-bold" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Users className="h-4 w-4 mr-2" />}
            ZAPISZ WSPÓŁPRACOWNIKÓW
          </Button>
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
  const [savingNew, setSavingNew] = useState(false);

  const fetchNotes = async () => {
    if (!profile) return;
    setLoading(true);
    
    try {
        // 1. Pobieramy notatki, których jestem autorem, wraz z ich udostępnieniami
        const { data: myNotes, error: myNotesError } = await supabase
          .from("notes")
          .select("*, note_shares(profile_id)")
          .eq("author_id", profile.id);
          
        if (myNotesError) throw myNotesError;
          
        // 2. Pobieramy ID notatek, które zostały mi udostępnione
        const { data: sharedIds, error: sharedIdsError } = await supabase
          .from("note_shares")
          .select("note_id")
          .eq("profile_id", profile.id);
          
        if (sharedIdsError) throw sharedIdsError;
        
        const sharedNoteIds = sharedIds?.map(s => s.note_id) || [];
        
        let sharedNotes: Note[] = [];
        if (sharedNoteIds.length > 0) {
            // 3. Pobieramy udostępnione notatki (bez rekursywnego zagnieżdżenia)
            const { data: sharedData, error: sharedDataError } = await supabase
                .from("notes")
                .select("*, note_shares(profile_id)")
                .in("id", sharedNoteIds);
            
            if (sharedDataError) throw sharedDataError;
            sharedNotes = sharedData as Note[];
        }
        
        // Łączymy i usuwamy duplikaty
        const combinedMap = new Map<string, Note>();
        [...(myNotes || []), ...sharedNotes].forEach(note => {
            if (note) combinedMap.set(note.id, note);
        });
        
        const combined = Array.from(combinedMap.values());
        
        setNotes(combined.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        
    } catch (error: any) {
        toast.error("Błąd ładowania notatek. Sprawdź konfigurację RLS: " + error.message);
        console.error("Error fetching notes:", error);
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
    
    const { error } = await supabase.from("notes").insert({ 
        author_id: profile?.id, 
        title: newNote.title, 
        content: newNote.content 
    });
    
    if (error) {
        toast.error("Błąd dodawania notatki: " + error.message);
    } else {
        toast.success("Notatka zapisana.");
    }
    
    setSavingNew(false);
    setIsAdding(false);
    setNewNote({ title: "", content: "" });
    fetchNotes();
  };
  
  const handleEdit = (note: Note) => {
      setEditingNote(note);
  };
  
  const handleSaveEdit = async () => {
      if (!editingNote) return;
      setSavingNew(true); 
      
      const { error } = await supabase
        .from("notes")
        .update({ title: editingNote.title, content: editingNote.content })
        .eq("id", editingNote.id);
        
      if (error) {
          toast.error("Błąd zapisu: " + error.message);
      } else {
          toast.success("Notatka zaktualizowana.");
          setEditingNote(null);
          fetchNotes();
      }
      setSavingNew(false);
  };

  const handleDelete = async () => {
    if (!deletingNoteId) return;
    setLoading(true);
    
    const { error } = await supabase.from("notes").delete().eq("id", deletingNoteId);
    
    if (error) toast.error("Błąd podczas usuwania: " + error.message);
    else {
      toast.success("Notatka usunięta.");
      fetchNotes();
    }
    setDeletingNoteId(null);
    setLoading(false);
  };
  
  const isAuthor = (note: Note) => note.author_id === profile?.id;
  const isCollaborator = (note: Note) => note.note_shares?.some(s => s.profile_id === profile?.id);
  const canEdit = (note: Note) => isAuthor(note) || isCollaborator(note);

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
            <Input 
                placeholder="Tytuł notatki" 
                value={newNote.title} 
                onChange={e => setNewNote({...newNote, title: e.target.value})} 
                className="border-lapd-gold"
                disabled={savingNew}
            />
            <Textarea 
                placeholder="Treść..." 
                value={newNote.content} 
                onChange={e => setNewNote({...newNote, content: e.target.value})} 
                className="border-lapd-gold min-h-[150px]"
                disabled={savingNew}
            />
            <Button 
                onClick={handleAdd} 
                className="w-full bg-lapd-navy text-lapd-gold font-bold"
                disabled={savingNew || !newNote.title.trim() || !newNote.content.trim()}
            >
                {savingNew ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                ZAPISZ NOTATKĘ
            </Button>
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
              <CardFooter className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="flex gap-1">
                    {isAuthor(n) && <Badge variant="default" className="bg-lapd-navy text-lapd-gold text-[10px]">AUTOR</Badge>}
                    {isCollaborator(n) && <Badge variant="outline" className="border-blue-500 text-blue-500 text-[10px]">WSPÓŁPRACA</Badge>}
                </div>
                <div className="flex gap-1">
                    {isAuthor(n) && (
                        <Button variant="ghost" size="sm" onClick={() => setSharingNote(n)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                            <Users className="h-4 w-4" />
                        </Button>
                    )}
                    {canEdit(n) && (
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(n)} className="text-green-500 hover:text-green-700 hover:bg-green-50">
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                    {isAuthor(n) && (
                        <Button variant="ghost" size="sm" onClick={() => setDeletingNoteId(n.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
              </CardFooter>
            </Card>
          ))}
          {notes.length === 0 && !loading && (
            <div className="col-span-full text-center py-20 text-gray-400">Brak dostępnych notatek.</div>
          )}
        </div>
      )}

      {/* Okno edycji notatki */}
      <Dialog open={!!editingNote} onOpenChange={() => !savingNew && setEditingNote(null)}>
        <DialogContent className="border-lapd-gold">
          <DialogHeader><DialogTitle className="text-lapd-navy font-black uppercase">Edytuj Notatkę</DialogTitle></DialogHeader>
          {editingNote && (
            <>
              <Input 
                placeholder="Tytuł notatki" 
                value={editingNote.title} 
                onChange={e => setEditingNote({...editingNote, title: e.target.value})} 
                className="border-lapd-gold"
                disabled={savingNew}
              />
              <Textarea 
                placeholder="Treść..." 
                value={editingNote.content} 
                onChange={e => setEditingNote({...editingNote, content: e.target.value})} 
                className="border-lapd-gold min-h-[200px]"
                disabled={savingNew}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingNote(null)} disabled={savingNew}>Anuluj</Button>
                <Button 
                    className="bg-lapd-navy text-lapd-gold font-bold" 
                    onClick={handleSaveEdit}
                    disabled={savingNew || !editingNote.title.trim() || !editingNote.content.trim()}
                >
                    {savingNew ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "ZAPISZ ZMIANY"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Okno zarządzania współpracownikami */}
      {sharingNote && (
        <CollaboratorManager 
          note={sharingNote} 
          officers={allOfficers} 
          onClose={() => setSharingNote(null)} 
          onUpdate={fetchNotes} 
        />
      )}

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
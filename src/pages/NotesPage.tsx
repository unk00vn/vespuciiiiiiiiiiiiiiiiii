"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Users, Loader2, Edit, RefreshCcw, Check, X } from "lucide-react";
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

const SharingManager = ({ note, officers, onClose, onUpdate }: { note: Note, officers: Officer[], onClose: () => void, onUpdate: () => void }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(note.note_shares?.map(s => s.profile_id) || []);
  const [saving, setSaving] = useState(false);
  const { profile } = useAuth();

  const handleToggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from("note_shares").delete().eq("note_id", note.id);
      if (selectedIds.length > 0) {
        const inserts = selectedIds.map(pid => ({ note_id: note.id, profile_id: pid }));
        await supabase.from("note_shares").insert(inserts);
      }
      toast.success("Zapisano uprawnienia.");
      onUpdate();
      onClose();
    } catch (e) {
      toast.error("Wystąpił błąd zapisu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="border-lapd-gold bg-lapd-darker text-white">
        <DialogHeader><DialogTitle className="text-lapd-gold font-bold uppercase">Udostępnianie Zapisu</DialogTitle></DialogHeader>
        <ScrollArea className="h-72 pr-4 py-2">
          {officers.filter(o => o.id !== profile?.id).map(o => (
            <div key={o.id} className="flex items-center justify-between p-3 mb-2 border border-white/10 rounded-lg bg-white/5">
              <span className="text-sm font-bold">#{o.badge_number} {o.last_name}</span>
              <Button 
                size="sm" 
                variant={selectedIds.includes(o.id) ? "default" : "outline"} 
                className={selectedIds.includes(o.id) ? "bg-red-600 hover:bg-red-700 text-white" : "border-lapd-gold text-lapd-gold hover:bg-lapd-gold hover:text-black"}
                onClick={() => handleToggle(o.id)}
              >
                {selectedIds.includes(o.id) ? <X className="h-4 w-4 mr-1" /> : <PlusCircle className="h-4 w-4 mr-1" />}
                {selectedIds.includes(o.id) ? "USUŃ" : "DODAJ"}
              </Button>
            </div>
          ))}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" className="border-white/20 text-white" onClick={onClose} disabled={saving}>Anuluj</Button>
          <Button className="bg-lapd-gold text-black font-bold" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />} ZAPISZ ZMIANY
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const NotesPage = () => {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [sharingNote, setSharingNote] = useState<Note | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { data: notesData, error } = await supabase
        .from("notes")
        .select("*, note_shares(profile_id)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(notesData || []);
    } catch (e) {
      toast.error("Błąd ładowania danych.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    supabase.from("profiles").select("id, first_name, last_name, badge_number").eq("status", "approved").then(({data}) => setOfficers(data || []));
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

  const handleUpdate = async () => {
    if (!editingNote) return;
    const { error } = await supabase.from("notes").update({ title: editingNote.title, content: editingNote.content }).eq("id", editingNote.id);
    if (error) toast.error("Błąd zapisu.");
    else {
      toast.success("Zaktualizowano.");
      setEditingNote(null);
      fetchData();
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const { error } = await supabase.from("notes").delete().eq("id", deletingId);
    if (error) toast.error("Błąd usuwania.");
    else {
      toast.success("Usunięto.");
      fetchData();
    }
    setDeletingId(null);
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
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-lapd-gold" /></div>
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
                    {n.author_id === profile?.id && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-lapd-gold hover:bg-white/5" onClick={() => setSharingNote(n)}>
                            <Users className="h-4 w-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5" onClick={() => setEditingNote(n)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    {n.author_id === profile?.id && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-500 hover:bg-red-500/10" onClick={() => setDeletingId(n.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
              </CardFooter>
            </Card>
          ))}
          {notes.length === 0 && !loading && (
            <div className="col-span-full text-center py-24 text-slate-500 italic">Baza operacyjna jest obecnie pusta.</div>
          )}
        </div>
      )}

      {/* Dialog Edycji */}
      {editingNote && (
        <Dialog open={true} onOpenChange={() => setEditingNote(null)}>
          <DialogContent className="max-w-2xl border-lapd-gold bg-lapd-darker text-white">
            <DialogHeader><DialogTitle className="text-lapd-gold font-bold uppercase">Edycja Zapisu</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase">Tytuł</Label>
                  <Input value={editingNote.title} onChange={e => setEditingNote({...editingNote, title: e.target.value})} className="bg-black/40 border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase">Treść</Label>
                  <Textarea value={editingNote.content} onChange={e => setEditingNote({...editingNote, content: e.target.value})} className="min-h-[300px] bg-black/40 border-white/10 text-white" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" className="border-white/20 text-white" onClick={() => setEditingNote(null)}>Anuluj</Button>
                <Button className="bg-lapd-gold text-black font-bold" onClick={handleUpdate}>ZAPISZ ZMIANY</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog Udostępniania */}
      {sharingNote && <SharingManager note={sharingNote} officers={officers} onClose={() => setSharingNote(null)} onUpdate={fetchData} />}

      {/* Potwierdzenie usunięcia */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="border-2 border-red-600 bg-lapd-darker text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 font-bold uppercase">Potwierdź usunięcie</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">Czy na pewno chcesz trwale usunąć ten zapis z bazy operacyjnej?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white">Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold">USUŃ WPIS</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotesPage;
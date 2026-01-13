"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2, Edit, Share2, Trash2, X, AlertTriangle, Save, Eye, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { FileUploadWidget } from "@/components/FileUploadWidget";
import { AttachmentList } from "@/components/AttachmentList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [sharedNotes, setSharedNotes] = useState<any[]>([]);
  const [allOfficers, setAllOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [tempAttachments, setTempAttachments] = useState<any[]>([]);
  
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [sharingNote, setSharingNote] = useState<any | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (isMounted: boolean) => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { data: myNotes } = await supabase.from("notes").select(`*, attachments(*)`).eq("author_id", profile.id).order("created_at", { ascending: false });
      const { data: shared } = await supabase.from("note_shares").select(`note_id, can_edit, notes(*, attachments(*))`).eq("profile_id", profile.id);
      const { data: officers } = await supabase.from("profiles").select("*").eq("status", "approved");

      if (isMounted) {
        setNotes(myNotes || []);
        setSharedNotes(shared?.map(s => s.notes ? { ...s.notes, can_edit: s.can_edit, is_shared: true } : null).filter(Boolean) || []);
        setAllOfficers(officers?.filter(o => o.id !== profile.id) || []);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => { 
    let isMounted = true;
    fetchData(isMounted); 
    return () => { isMounted = false; };
  }, [fetchData]);

  const handleAdd = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    setSaving(true);
    const { data: note, error } = await supabase.from("notes").insert({ author_id: profile?.id, title: newNote.title, content: newNote.content }).select().single();
    if (error) {
        toast.error("Błąd zapisu: " + error.message);
    } else {
        if (tempAttachments.length > 0) await supabase.from("attachments").update({ note_id: note.id }).in('id', tempAttachments.map(a => a.id));
        toast.success("Notatka utworzona.");
        setIsAdding(false);
        setNewNote({ title: "", content: "" });
        setTempAttachments([]);
        fetchData(true);
    }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editingNote) return;
    setSaving(true);
    const { error } = await supabase.from("notes").update({ title: editingNote.title, content: editingNote.content }).eq("id", editingNote.id);
    if (error) toast.error("Błąd aktualizacji: " + error.message);
    else {
        toast.success("Zapisano zmiany.");
        setEditingNote(null);
        fetchData(true);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!noteToDelete) return;
    setSaving(true);
    const { error } = await supabase.from("notes").delete().eq("id", noteToDelete.id);
    if (error) toast.error("Błąd usuwania.");
    else {
        toast.success("Notatka usunięta.");
        fetchData(true);
    }
    setNoteToDelete(null);
    setSaving(false);
  };

  const handleShare = async (officerId: string, canEdit: boolean) => {
    if (!sharingNote) return;
    const { error } = await supabase.from("note_shares").upsert({
        note_id: sharingNote.id,
        profile_id: officerId,
        can_edit: canEdit
    });

    if (error) toast.error("Błąd bazy.");
    else toast.success(`Uprawnienia nadane.`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Baza Dokumentacji Operacyjnej</h1>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-lapd-gold text-black font-black">
            {isAdding ? <X className="h-4 w-4 mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />} 
            {isAdding ? "ANULUJ" : "DODAJ WPIS"}
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-white/5 border-lapd-gold p-6 space-y-4 shadow-2xl">
            <Input placeholder="TEMAT ZDARZENIA..." value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} className="bg-black/40 border-lapd-gold/30 text-white font-bold h-12" />
            <Textarea placeholder="TREŚĆ OPERACYJNA..." value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} className="min-h-[200px] bg-black/40 border-lapd-gold/30" />
            <div className="pt-2">
                <FileUploadWidget parentType="note" onUploadSuccess={(files) => setTempAttachments(prev => [...prev, ...files])} />
                <div className="mt-4"><AttachmentList attachments={tempAttachments} canDelete={true} onDelete={(id) => setTempAttachments(prev => prev.filter(a => a.id !== id))} /></div>
            </div>
            <Button onClick={handleAdd} disabled={saving} className="w-full bg-lapd-gold text-black font-black uppercase h-12">{saving ? <Loader2 className="animate-spin" /> : "ARCHIWIZUJ W BAZIE"}</Button>
        </Card>
      )}

      {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-lapd-gold" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...notes, ...sharedNotes].map((n) => {
                const isOwner = n.author_id === profile?.id;
                const canEdit = isOwner || n.can_edit;

                return (
                    <Card key={n.id} className={`border flex flex-col group transition-all hover:scale-[1.01] ${isOwner ? 'border-lapd-gold/30 bg-white/5' : 'border-blue-500/30 bg-blue-500/5'}`}>
                        <CardHeader className="bg-black/20 p-4 border-b border-white/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-black text-white uppercase truncate flex-1 mr-2">{n.title}</CardTitle>
                            <div className="flex gap-1">
                                {isOwner && (
                                    <>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-lapd-gold hover:bg-lapd-gold/20" onClick={() => setSharingNote(n)}>
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-500/20" onClick={() => setNoteToDelete(n)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                                {canEdit && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => setEditingNote(n)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-1">
                            <p className="text-xs text-slate-300 italic whitespace-pre-wrap line-clamp-6">{n.content}</p>
                            {n.attachments?.length > 0 && <div className="mt-4"><AttachmentList attachments={n.attachments} /></div>}
                        </CardContent>
                        <CardFooter className="bg-black/20 p-3 flex justify-between items-center text-[10px] font-bold">
                            <Badge className={isOwner ? "bg-lapd-gold text-black" : "bg-blue-600 text-white"}>
                                {isOwner ? "WŁASNA" : "UDOSTĘPNIONA"}
                            </Badge>
                            <span className="text-slate-500 font-mono">{new Date(n.created_at).toLocaleDateString()}</span>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
      )}

      {/* Dialogs and Alerts (Delete, Share, Edit) without changes as they don't have effects */}
      <AlertDialog open={!!noteToDelete} onOpenChange={() => setNoteToDelete(null)}>
        <AlertDialogContent className="bg-lapd-darker border-2 border-red-600 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 font-black uppercase flex items-center">
              <AlertTriangle className="mr-2 h-6 w-6" /> POTWIERDŹ USUNIĘCIE DANYCH
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 text-sm">
              Czy na pewno chcesz usunąć ten wpis? Ta operacja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 text-white border-none hover:bg-white/20 font-bold">ANULUJ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-black">USUŃ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!sharingNote} onOpenChange={() => setSharingNote(null)}>
        <DialogContent className="bg-[#0A1A2F] border-2 border-lapd-gold text-white max-w-md">
            <DialogHeader><DialogTitle className="uppercase font-black text-lapd-gold tracking-tighter">Zarządzanie Dostępem Operacyjnym</DialogTitle></DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                    {allOfficers.map(off => (
                        <div key={off.id} className="flex items-center justify-between p-3 border border-white/5 rounded bg-black/40 hover:border-lapd-gold/30 transition-colors">
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">#{off.badge_number} {off.last_name}</p>
                                <p className="text-[9px] text-slate-500 uppercase">{off.role_name}</p>
                            </div>
                            <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-8 px-2 text-[9px] font-black uppercase text-blue-400 hover:bg-blue-500/10" onClick={() => handleShare(off.id, false)}>
                                    <Eye className="h-3 w-3 mr-1" /> Podgląd
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 px-2 text-[9px] font-black uppercase text-lapd-gold hover:bg-lapd-gold/10" onClick={() => handleShare(off.id, true)}>
                                    <ShieldCheck className="h-3 w-3 mr-1" /> Edycja
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className="bg-lapd-darker border-lapd-gold text-white max-w-2xl">
            <DialogHeader><DialogTitle className="uppercase font-black text-lapd-gold">Edycja Wpisu</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <Input value={editingNote?.title || ""} onChange={e => setEditingNote({...editingNote, title: e.target.value})} className="bg-black/40 border-lapd-gold/30 text-white font-bold" />
                <Textarea rows={10} value={editingNote?.content || ""} onChange={e => setEditingNote({...editingNote, content: e.target.value})} className="bg-black/40 border-lapd-gold/30 text-white" />
            </div>
            <DialogFooter>
                <Button onClick={handleUpdate} disabled={saving} className="bg-lapd-gold text-lapd-navy font-black w-full uppercase h-12">
                    {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} ZAPISZ ZMIANY
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesPage;
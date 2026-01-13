"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2, Edit, RefreshCcw, AlertCircle, Database, Paperclip, Save, Share2, Eye, UserPlus, ShieldCheck, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { FileUploadWidget } from "@/components/FileUploadWidget";
import { AttachmentList } from "@/components/AttachmentList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);

    try {
      // 1. Moje notatki
      const { data: myNotes } = await supabase
        .from("notes")
        .select(`*, attachments(*)`)
        .eq("author_id", profile.id)
        .order("created_at", { ascending: false });

      // 2. Udostępnione mi notatki
      const { data: shared } = await supabase
        .from("note_shares")
        .select(`note_id, can_edit, notes(*, attachments(*))`)
        .eq("profile_id", profile.id);

      // 3. Wszyscy oficerowie (do udostępniania)
      const { data: officers } = await supabase.from("profiles").select("*").eq("status", "approved");

      setNotes(myNotes || []);
      setSharedNotes(shared?.map(s => ({ ...s.notes, can_edit: s.can_edit, is_shared: true })) || []);
      setAllOfficers(officers?.filter(o => o.id !== profile.id) || []);
    } catch (e) {
      toast.error("Błąd ładowania danych.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [profile]);

  const handleAdd = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    setSaving(true);
    const { data: note, error } = await supabase
        .from("notes")
        .insert({ author_id: profile?.id, title: newNote.title, content: newNote.content })
        .select().single();

    if (error) {
        toast.error("Błąd zapisu.");
    } else {
        if (tempAttachments.length > 0) {
            await supabase.from("attachments").update({ note_id: note.id }).in('id', tempAttachments.map(a => a.id));
        }
        toast.success("Notatka utworzona.");
        setIsAdding(false);
        setNewNote({ title: "", content: "" });
        setTempAttachments([]);
        fetchData();
    }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editingNote) return;
    setSaving(true);
    const { error } = await supabase
        .from("notes")
        .update({ title: editingNote.title, content: editingNote.content })
        .eq("id", editingNote.id);
    
    if (error) toast.error("Błąd aktualizacji.");
    else {
        toast.success("Zapisano zmiany.");
        setEditingNote(null);
        fetchData();
    }
    setSaving(false);
  };

  const handleShare = async (officerId: string, canEdit: boolean) => {
    if (!sharingNote) return;
    const { error } = await supabase.from("note_shares").upsert({
        note_id: sharingNote.id,
        profile_id: officerId,
        can_edit: canEdit
    });

    if (error) toast.error("Błąd udostępniania.");
    else toast.success("Uprawnienia nadane.");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">System Dokumentacji Operacyjnej</h1>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-lapd-gold text-black font-black">
            {isAdding ? "ANULUJ" : "DODAJ WPIS"}
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-white/5 border-lapd-gold p-6 space-y-4 shadow-2xl">
            <Input placeholder="TEMAT..." value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} className="bg-black/40 border-lapd-gold/30 text-white font-bold h-12" />
            <Textarea placeholder="TREŚĆ NOTATKI..." value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} className="min-h-[200px] bg-black/40 border-lapd-gold/30" />
            <FileUploadWidget parentType="note" onUploadSuccess={(files) => setTempAttachments(prev => [...prev, ...files])} />
            <AttachmentList attachments={tempAttachments} canDelete={true} onDelete={(id) => setTempAttachments(prev => prev.filter(a => a.id !== id))} />
            <Button onClick={handleAdd} disabled={saving} className="w-full bg-lapd-gold text-black font-black uppercase">{saving ? <Loader2 className="animate-spin" /> : "ARCHIWIZUJ W BAZIE"}</Button>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...notes, ...sharedNotes].map((n) => {
            const isOwner = n.author_id === profile?.id;
            const canEdit = isOwner || n.can_edit;

            return (
                <Card key={n.id} className={`border flex flex-col group ${isOwner ? 'border-lapd-gold/30 bg-white/5' : 'border-blue-500/30 bg-blue-500/5'}`}>
                    <CardHeader className="bg-black/20 p-4 border-b border-white/5 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-black text-white uppercase truncate flex-1">{n.title}</CardTitle>
                        <div className="flex gap-1">
                            {isOwner && (
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-lapd-gold" onClick={() => setSharingNote(n)}>
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            )}
                            {canEdit && (
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-white" onClick={() => setEditingNote(n)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-1">
                        <p className="text-xs text-slate-300 italic whitespace-pre-wrap line-clamp-6">{n.content}</p>
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

      {/* MODAL UDOSTĘPNIANIA */}
      <Dialog open={!!sharingNote} onOpenChange={() => setSharingNote(null)}>
        <DialogContent className="bg-lapd-darker border-lapd-gold text-white">
            <DialogHeader><DialogTitle className="uppercase font-black text-lapd-gold">Zarządzanie Dostępem</DialogTitle></DialogHeader>
            <ScrollArea className="h-80 pr-4 mt-4">
                <div className="space-y-3">
                    {allOfficers.map(off => (
                        <div key={off.id} className="flex items-center justify-between p-3 border border-white/10 rounded bg-black/20">
                            <div>
                                <p className="text-xs font-bold">#{off.badge_number} {off.last_name}</p>
                                <p className="text-[10px] text-slate-500 uppercase">{off.role_name || "OFFICER"}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="h-8 text-[10px] uppercase font-black border-blue-500/50 hover:bg-blue-500/20" onClick={() => handleShare(off.id, false)}>
                                    <Eye className="h-3 w-3 mr-1" /> Podgląd
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 text-[10px] uppercase font-black border-lapd-gold/50 hover:bg-lapd-gold/20" onClick={() => handleShare(off.id, true)}>
                                    <ShieldCheck className="h-3 w-3 mr-1" /> Edycja
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* MODAL EDYCJI */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className="bg-lapd-darker border-lapd-gold text-white max-w-2xl">
            <DialogHeader><DialogTitle className="uppercase font-black">Edycja Notatki</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <Input value={editingNote?.title || ""} onChange={e => setEditingNote({...editingNote, title: e.target.value})} className="bg-black/40 border-lapd-gold/30" />
                <Textarea rows={10} value={editingNote?.content || ""} onChange={e => setEditingNote({...editingNote, content: e.target.value})} className="bg-black/40 border-lapd-gold/30" />
            </div>
            <DialogFooter>
                <Button onClick={handleUpdate} disabled={saving} className="bg-lapd-gold text-lapd-navy font-black w-full">ZAPISZ ZMIANY</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesPage;
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2, Edit, RefreshCcw, AlertCircle, Database, Paperclip, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { FileUploadWidget } from "@/components/FileUploadWidget";
import { AttachmentList } from "@/components/AttachmentList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const NotesPage = () => {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [tempAttachments, setTempAttachments] = useState<any[]>([]);
  
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchNotes = async () => {
    if (!profile) return;
    setLoading(true);
    setError(false);

    try {
      const { data: notesData, error: sbError } = await supabase
        .from("notes")
        .select(`*, attachments(*)`)
        .order("created_at", { ascending: false });

      if (sbError) throw sbError;
      setNotes(notesData || []);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, [profile]);

  const handleAdd = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    
    const { data: note, error } = await supabase
        .from("notes")
        .insert({ author_id: profile?.id, title: newNote.title, content: newNote.content })
        .select()
        .single();

    if (error) {
        toast.error("Błąd zapisu.");
        return;
    }

    if (tempAttachments.length > 0) {
        await supabase.from("attachments")
            .update({ note_id: note.id })
            .in('id', tempAttachments.map(a => a.id));
    }

    toast.success("Notatka zapisana.");
    setIsAdding(false);
    setNewNote({ title: "", content: "" });
    setTempAttachments([]);
    fetchNotes();
  };

  const handleUpdate = async () => {
    if (!editingNote || !editingNote.title.trim()) return;
    setSaving(true);
    const { error } = await supabase
        .from("notes")
        .update({ title: editingNote.title, content: editingNote.content })
        .eq("id", editingNote.id);
    
    if (error) {
        toast.error("Błąd aktualizacji.");
    } else {
        toast.success("Notatka zaktualizowana.");
        setEditingNote(null);
        fetchNotes();
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Baza Operacyjna</h1>
        <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchNotes} className="border-white/10 text-white hover:bg-white/5">
                <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setIsAdding(!isAdding)} className="bg-lapd-gold text-black font-bold">
                {isAdding ? "ANULUJ" : "DODAJ WPIS"}
            </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="bg-white/5 border-lapd-gold/50 shadow-xl p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase">Tytuł Zdarzenia</Label>
              <Input value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} className="bg-black/40 border-white/10 text-white h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase">Opis</Label>
              <Textarea value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} className="min-h-[150px] bg-black/40 border-white/10 text-white" />
            </div>
            
            <div className="pt-4 border-t border-white/5">
                <Label className="text-xs font-bold text-lapd-gold uppercase flex items-center mb-4">
                    <Paperclip className="h-3 w-3 mr-2" /> Załączniki (Zdjęcia)
                </Label>
                <AttachmentList attachments={tempAttachments} canDelete={true} onDelete={(id) => setTempAttachments(prev => prev.filter(a => a.id !== id))} />
                <div className="mt-4">
                    <FileUploadWidget parentType="note" onUploadSuccess={(files) => setTempAttachments(prev => [...prev, ...files])} />
                </div>
            </div>

            <Button onClick={handleAdd} className="w-full bg-lapd-gold text-black font-black uppercase h-11">ZAPISZ W SYSTEMIE</Button>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-32"><Loader2 className="animate-spin text-lapd-gold h-12 w-12" /></div>
      ) : error ? (
        <div className="text-center py-20 bg-red-500/5 rounded-lg border border-red-500/20">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-white font-bold uppercase">Błąd ładowania</p>
          <Button onClick={fetchNotes} className="mt-4 bg-red-600 hover:bg-red-700">PONÓW</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map(n => (
            <Card key={n.id} className="border border-white/10 bg-white/5 flex flex-col group overflow-hidden">
              <CardHeader className="pb-3 border-b border-white/5 flex justify-between items-center">
                <CardTitle className="text-sm font-bold text-white uppercase truncate">{n.title}</CardTitle>
                {n.author_id === profile?.id && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-lapd-gold opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setEditingNote(n)}>
                        <Edit className="h-3 w-3" />
                    </Button>
                )}
              </CardHeader>
              <CardContent className="pt-4 text-sm text-slate-200 flex-1 flex flex-col gap-4">
                <div className="whitespace-pre-wrap leading-relaxed line-clamp-4 italic">{n.content}</div>
                {n.attachments?.length > 0 && (
                    <div className="pt-2 border-t border-white/5">
                        <AttachmentList attachments={n.attachments} />
                    </div>
                )}
              </CardContent>
              <CardFooter className="pt-3 border-t border-white/5 flex justify-between items-center bg-black/10">
                <Badge className="bg-lapd-gold text-black text-[9px] font-black">
                    {n.author_id === profile?.id ? "WŁASNA" : "SYSTEMOWA"}
                </Badge>
                <span className="text-[9px] text-slate-500 font-mono">{new Date(n.created_at).toLocaleDateString()}</span>
              </CardFooter>
            </Card>
          ))}
          {notes.length === 0 && (
            <div className="col-span-full text-center py-32 opacity-20">
               <Database className="h-12 w-12 mx-auto mb-4" />
               <p className="uppercase font-black">Baza jest pusta</p>
            </div>
          )}
        </div>
      )}

      {/* OKNO EDYCJI */}
      <Dialog open={!!editingNote} onOpenChange={() => !saving && setEditingNote(null)}>
          <DialogContent className="bg-lapd-darker border-lapd-gold text-white">
              <DialogHeader><DialogTitle className="text-lapd-gold uppercase font-black">Edytuj Notatkę</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label className="uppercase text-[10px] font-bold">Tytuł</Label>
                    <Input value={editingNote?.title || ""} onChange={e => setEditingNote({...editingNote, title: e.target.value})} className="bg-black/40 border-lapd-gold/30 text-white" />
                </div>
                <div className="space-y-2">
                    <Label className="uppercase text-[10px] font-bold">Treść</Label>
                    <Textarea rows={6} value={editingNote?.content || ""} onChange={e => setEditingNote({...editingNote, content: e.target.value})} className="bg-black/40 border-lapd-gold/30 text-white" />
                </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" className="text-white border-white/20" onClick={() => setEditingNote(null)} disabled={saving}>Anuluj</Button>
                  <Button onClick={handleUpdate} disabled={saving} className="bg-lapd-gold text-lapd-navy font-black">
                      {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} ZAPISZ ZMIANY
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesPage;
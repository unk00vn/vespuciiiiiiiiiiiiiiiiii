"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, ClipboardList, Share2, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const NotesPage = () => {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [allOfficers, setAllOfficers] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [sharingNote, setSharingNote] = useState<any>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  const fetchNotes = async () => {
    if (!profile) return;
    // Pobierz własne notatki ORAZ udostępnione
    const { data: myNotes } = await supabase.from("notes").select("*").eq("author_id", profile.id);
    const { data: shared } = await supabase.from("note_shares").select("notes(*)").eq("profile_id", profile.id);
    
    const combined = [...(myNotes || []), ...(shared?.map(s => s.notes) || [])];
    setNotes(combined.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  };

  useEffect(() => {
    fetchNotes();
    supabase.from("profiles").select("id, first_name, last_name").eq("status", "approved").then(({data}) => setAllOfficers(data || []));
  }, [profile]);

  const handleAdd = async () => {
    await supabase.from("notes").insert({ author_id: profile?.id, title: newNote.title, content: newNote.content });
    setIsAdding(false);
    fetchNotes();
  };

  const handleShare = async (officerId: string) => {
    const { error } = await supabase.from("note_shares").insert({ note_id: sharingNote.id, profile_id: officerId });
    if (error) toast.error("Już udostępniono");
    else toast.success("Udostępniono");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lapd-navy">Notatki & Operacje</h1>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-lapd-gold text-lapd-navy">NOWA</Button>
      </div>

      {isAdding && (
        <Card className="border-lapd-gold">
          <CardContent className="p-4 space-y-4">
            <Input placeholder="Tytuł" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} />
            <Textarea placeholder="Treść..." value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} />
            <Button onClick={handleAdd} className="w-full bg-lapd-navy text-lapd-gold">ZAPISZ</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map(n => (
          <Card key={n.id} className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{n.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 min-h-[100px]">{n.content}</CardContent>
            <CardFooter className="flex justify-end gap-2">
              {n.author_id === profile?.id && (
                <Button variant="ghost" size="sm" onClick={() => setSharingNote(n)}><Share2 className="h-4 w-4" /></Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!sharingNote} onOpenChange={() => setSharingNote(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Udostępnij notatkę</DialogTitle></DialogHeader>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {allOfficers.filter(o => o.id !== profile?.id).map(o => (
              <div key={o.id} className="flex justify-between items-center p-2 border rounded">
                <span>{o.first_name} {o.last_name}</span>
                <Button size="sm" variant="outline" onClick={() => handleShare(o.id)}>Udostępnij</Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesPage;
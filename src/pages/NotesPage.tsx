"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, ClipboardList, Loader2, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const NotesPage = () => {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    status: "Aktywna"
  });

  const fetchNotes = async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false });

    if (!error && data) setNotes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, [profile]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newNote.title) return;

    const { error } = await supabase.from("notes").insert({
      author_id: profile.id,
      title: newNote.title,
      content: newNote.content,
      status: newNote.status
    });

    if (error) {
      toast.error("Błąd zapisu notatki");
    } else {
      toast.success("Notatka zapisana");
      setNewNote({ title: "", content: "", status: "Aktywna" });
      setIsAdding(false);
      fetchNotes();
    }
  };

  const deleteNote = async (id: number) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) {
      setNotes(notes.filter(n => n.id !== id));
      toast.success("Notatka usunięta");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-lapd-navy">Moje Notatki</h1>
          <p className="text-gray-500 text-sm">Twoje prywatne notatki i szkice operacyjne.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)} 
          className={isAdding ? "bg-gray-500" : "bg-lapd-gold text-lapd-navy font-bold"}
        >
          {isAdding ? "ANULUJ" : <><PlusCircle className="mr-2 h-4 w-4" /> NOWA NOTATKA</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-lapd-gold shadow-xl">
          <form onSubmit={handleAddNote}>
            <CardHeader className="bg-lapd-navy text-lapd-white py-3">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center">
                <ClipboardList className="h-4 w-4 mr-2 text-lapd-gold" /> NOWY WPIS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500">Tytuł notatki</label>
                <Input 
                  value={newNote.title} 
                  onChange={e => setNewNote({...newNote, title: e.target.value})}
                  className="border-lapd-gold h-10"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500">Treść</label>
                <Textarea 
                  value={newNote.content} 
                  onChange={e => setNewNote({...newNote, content: e.target.value})}
                  className="border-lapd-gold min-h-[150px]"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t justify-end p-4">
              <Button type="submit" className="bg-lapd-navy text-lapd-gold px-8 font-bold">
                <Save className="h-4 w-4 mr-2" /> ZAPISZ W BAZIE
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-lapd-gold h-10 w-10" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card key={note.id} className="bg-white border-l-4 border-l-lapd-gold shadow-md hover:shadow-xl transition-shadow group">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <Badge variant="outline" className="text-[10px] uppercase border-lapd-navy text-lapd-navy mb-2">
                    {note.status}
                  </Badge>
                  <CardTitle className="text-lapd-navy font-bold line-clamp-1">{note.title}</CardTitle>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono uppercase">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteNote(note.id)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 -mt-1 -mr-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pb-6">
                <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-6">{note.content}</p>
              </CardContent>
            </Card>
          ))}
          {notes.length === 0 && !isAdding && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-xl">
              <ClipboardList className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Nie masz jeszcze żadnych notatek.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotesPage;
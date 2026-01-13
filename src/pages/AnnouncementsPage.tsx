"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Clock, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
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

const AnnouncementsPage = () => {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: "", content: "" });
  const [annToDelete, setAnnToDelete] = useState<string | null>(null);

  const canAdd = profile && profile.role_level >= 2; // Sergeant+
  const canDelete = profile && profile.role_level >= 3; // Lieutenant+

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("announcements")
      .select("*, author:profiles(first_name, last_name, badge_number)")
      .order("created_at", { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleAdd = async () => {
    if (!newAnn.title || !newAnn.content) return;
    const { error } = await supabase.from("announcements").insert({
      author_id: profile?.id,
      title: newAnn.title,
      content: newAnn.content
    });
    if (error) toast.error("Błąd podczas dodawania ogłoszenia.");
    else {
      toast.success("Ogłoszenie opublikowane.");
      setIsAdding(false);
      setNewAnn({ title: "", content: "" });
      fetchAnnouncements();
    }
  };

  const handleDelete = async () => {
    if (!annToDelete) return;
    const { error } = await supabase.from("announcements").delete().eq("id", annToDelete);
    if (error) toast.error("Błąd podczas usuwania.");
    else {
      toast.success("Ogłoszenie usunięte.");
      fetchAnnouncements();
    }
    setAnnToDelete(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lapd-navy">Ogłoszenia</h1>
        {canAdd && (
          <Button onClick={() => setIsAdding(!isAdding)} className="bg-lapd-gold text-lapd-navy font-bold">
            {isAdding ? "ANULUJ" : "NOWE OGŁOSZENIE"}
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-lapd-gold bg-white shadow-xl">
          <CardContent className="p-6 space-y-4">
            <Input 
              placeholder="Tytuł ogłoszenia" 
              value={newAnn.title} 
              onChange={e => setNewAnn({...newAnn, title: e.target.value})} 
              className="border-lapd-gold focus:ring-lapd-navy"
            />
            <Textarea 
              placeholder="Treść ogłoszenia..." 
              value={newAnn.content} 
              onChange={e => setNewAnn({...newAnn, content: e.target.value})} 
              className="border-lapd-gold min-h-[150px]"
            />
            <Button onClick={handleAdd} className="bg-lapd-navy text-lapd-gold w-full font-bold">OPUBLIKUJ TERAZ</Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-lapd-gold h-10 w-10" /></div>
      ) : (
        <div className="space-y-4">
          {announcements.map(ann => (
            <Card key={ann.id} className="border-l-4 border-l-lapd-gold shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex gap-4 text-[10px] text-slate-600 uppercase font-bold mb-1">
                      <span className="flex items-center"><User className="h-3 w-3 mr-1" /> {ann.author?.first_name} {ann.author?.last_name} (#{ann.author?.badge_number})</span>
                      <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {new Date(ann.created_at).toLocaleString()}</span>
                    </div>
                    <CardTitle className="text-lapd-navy uppercase tracking-tight">{ann.title}</CardTitle>
                  </div>
                  {canDelete && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setAnnToDelete(ann.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
              </CardContent>
            </Card>
          ))}
          {announcements.length === 0 && !loading && (
            <div className="text-center py-20 text-gray-400">Brak aktualnych ogłoszeń.</div>
          )}
        </div>
      )}

      {/* Okno potwierdzenia usuwania */}
      <AlertDialog open={!!annToDelete} onOpenChange={() => setAnnToDelete(null)}>
        <AlertDialogContent className="border-2 border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 font-black uppercase">Usunąć to ogłoszenie?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta czynność jest nieodwracalna. Ogłoszenie zniknie z tablicy wszystkich funkcjonariuszy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">ANULUJ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold">
              USUŃ DEFINITYWNIE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AnnouncementsPage;
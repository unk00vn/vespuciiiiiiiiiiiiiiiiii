"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Bell, User, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AnnouncementsPage = () => {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: "", content: "" });

  const canAdd = profile && profile.role_level >= 2; // Sergeant+

  const fetchAnnouncements = async () => {
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
    if (error) toast.error("Błąd");
    else {
      toast.success("Ogłoszenie dodane");
      setIsAdding(false);
      setNewAnn({ title: "", content: "" });
      fetchAnnouncements();
    }
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
        <Card className="border-lapd-gold">
          <CardContent className="p-6 space-y-4">
            <Input placeholder="Tytuł" value={newAnn.title} onChange={e => setNewAnn({...newAnn, title: e.target.value})} />
            <Textarea placeholder="Treść..." value={newAnn.content} onChange={e => setNewAnn({...newAnn, content: e.target.value})} />
            <Button onClick={handleAdd} className="bg-lapd-navy text-lapd-gold w-full">OPUBLIKUJ</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {announcements.map(ann => (
          <Card key={ann.id} className="border-l-4 border-l-lapd-gold">
            <CardHeader className="pb-2">
              <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold mb-1">
                <span className="flex items-center"><User className="h-3 w-3 mr-1" /> {ann.author?.first_name} {ann.author?.last_name}</span>
                <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {new Date(ann.created_at).toLocaleString()}</span>
              </div>
              <CardTitle className="text-lapd-navy">{ann.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ann.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
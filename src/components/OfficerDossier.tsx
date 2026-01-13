"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Pin, Paperclip, Lock, Eye, Trash2, FileText, ClipboardList } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PinItem {
  id: string;
  is_public: boolean;
  author_id: string;
  notes?: { title: string; content: string };
  reports?: { title: string; status: string };
}

export const OfficerDossier = ({ targetOfficer }: { targetOfficer: any }) => {
  const { profile } = useAuth();
  const [pins, setPins] = useState<PinItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [myNotes, setMyNotes] = useState<any[]>([]);
  const [myReports, setMyReports] = useState<any[]>([]);

  const fetchDossier = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("officer_pins")
      .select("*, notes(title, content), reports(title, status)")
      .eq("target_profile_id", targetOfficer.id);
    setPins(data || []);

    // Pobierz moje rzeczy do przypięcia
    const { data: notes } = await supabase.from("notes").select("*").eq("author_id", profile?.id);
    const { data: reports } = await supabase.from("reports").select("*").eq("author_id", profile?.id);
    setMyNotes(notes || []);
    setMyReports(reports || []);
    setLoading(false);
  };

  const togglePin = async (type: 'note' | 'report', id: string, isPublic = false) => {
    const { error } = await supabase.from("officer_pins").insert({
      author_id: profile?.id,
      target_profile_id: targetOfficer.id,
      [type === 'note' ? 'note_id' : 'report_id']: id,
      is_public: isPublic
    });

    if (error) toast.error("Już przypięto ten element.");
    else {
      toast.success("Dokument przypięty do teczki.");
      fetchDossier();
    }
  };

  const removePin = async (pinId: string) => {
    const { error } = await supabase.from("officer_pins").delete().eq("id", pinId);
    if (!error) {
      toast.success("Usunięto z teczki.");
      fetchDossier();
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && fetchDossier()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-lapd-gold text-lapd-navy hover:bg-lapd-gold/10">
          <Paperclip className="h-4 w-4 mr-2" /> TECZKA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl border-lapd-gold bg-white">
        <DialogHeader>
          <DialogTitle className="text-lapd-navy uppercase font-black">
            Teczka Funkcjonariusza: {targetOfficer.first_name} {targetOfficer.last_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="view" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="view">Podgląd Zawartości</TabsTrigger>
            <TabsTrigger value="add">Przypnij Nowe</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="py-4">
            <ScrollArea className="h-[400px] pr-4">
              {pins.length === 0 ? (
                <p className="text-center text-gray-400 py-10">Teczka jest pusta.</p>
              ) : (
                <div className="space-y-3">
                  {pins.map((pin) => (
                    <div key={pin.id} className="border rounded-lg p-3 bg-gray-50 flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {pin.notes ? <ClipboardList className="h-4 w-4 text-amber-500" /> : <FileText className="h-4 w-4 text-blue-500" />}
                          <span className="font-bold text-sm text-lapd-navy">
                            {pin.notes?.title || pin.reports?.title}
                          </span>
                          {pin.is_public ? (
                            <Badge className="bg-green-100 text-green-700 text-[9px]"><Eye className="h-3 w-3 mr-1" /> PUBLICZNE</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600 text-[9px]"><Lock className="h-3 w-3 mr-1" /> PRYWATNE</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {pin.notes?.content || "Raport systemowy"}
                        </p>
                      </div>
                      {pin.author_id === profile?.id && (
                        <Button variant="ghost" size="sm" onClick={() => removePin(pin.id)} className="text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="add" className="py-4">
            <ScrollArea className="h-[400px] pr-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Twoje Notatki</h4>
              <div className="space-y-2 mb-6">
                {myNotes.map(n => (
                  <div key={n.id} className="flex justify-between items-center p-2 border rounded text-sm">
                    <span className="truncate flex-1 mr-2">{n.title}</span>
                    <div className="flex gap-1">
                      <Button size="xs" variant="outline" onClick={() => togglePin('note', n.id, false)} className="text-[10px] h-7"><Lock className="h-3 w-3 mr-1"/> Prywatnie</Button>
                      <Button size="xs" onClick={() => togglePin('note', n.id, true)} className="text-[10px] h-7 bg-lapd-navy"><Eye className="h-3 w-3 mr-1"/> Publicznie</Button>
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Twoje Raporty</h4>
              <div className="space-y-2">
                {myReports.map(r => (
                  <div key={r.id} className="flex justify-between items-center p-2 border rounded text-sm">
                    <span className="truncate flex-1 mr-2">{r.title}</span>
                    <div className="flex gap-1">
                      <Button size="xs" variant="outline" onClick={() => togglePin('report', r.id, false)} className="text-[10px] h-7"><Lock className="h-3 w-3 mr-1"/> Prywatnie</Button>
                      <Button size="xs" onClick={() => togglePin('report', r.id, true)} className="text-[10px] h-7 bg-lapd-navy"><Eye className="h-3 w-3 mr-1"/> Publicznie</Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
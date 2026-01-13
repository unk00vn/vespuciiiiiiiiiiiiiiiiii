"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Paperclip, Lock, Users, Trash2, FileText, ClipboardList, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PinItem {
  id: string;
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
  const [allOfficers, setAllOfficers] = useState<any[]>([]);
  
  // State dla formularza przypinania
  const [selectedDoc, setSelectedDoc] = useState<{type: 'note' | 'report', id: string} | null>(null);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [isPinning, setIsPinning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    // Pobierz piny
    const { data: pinsData } = await supabase
      .from("officer_pins")
      .select("*, notes(title, content), reports(title, status)")
      .eq("target_profile_id", targetOfficer.id);
    setPins(pinsData || []);

    // Pobierz moje dokumenty
    const { data: notes } = await supabase.from("notes").select("*").eq("author_id", profile?.id);
    const { data: reports } = await supabase.from("reports").select("*").eq("author_id", profile?.id);
    setMyNotes(notes || []);
    setMyReports(reports || []);

    // Pobierz wszystkich funkcjonariuszy (do udostępniania)
    const { data: officers } = await supabase.from("profiles").select("id, first_name, last_name, badge_number").eq("status", "approved");
    setAllOfficers(officers || []);
    setLoading(false);
  };

  const handlePin = async () => {
    if (!selectedDoc) return;
    setIsPinning(true);

    // 1. Stwórz główny wpis pinu
    const { data: pinData, error: pinError } = await supabase
      .from("officer_pins")
      .insert({
        author_id: profile?.id,
        target_profile_id: targetOfficer.id,
        [selectedDoc.type === 'note' ? 'note_id' : 'report_id']: selectedDoc.id
      })
      .select()
      .single();

    if (pinError) {
      toast.error("Błąd: Element jest już przypięty do tej teczki.");
      setIsPinning(false);
      return;
    }

    // 2. Jeśli wybrano osoby, dodaj udostępnienia
    if (sharedWith.length > 0) {
      const shares = sharedWith.map(offId => ({
        pin_id: pinData.id,
        profile_id: offId
      }));
      await supabase.from("officer_pin_shares").insert(shares);
    }

    toast.success("Dokument został przypięty i udostępniony.");
    setSelectedDoc(null);
    setSharedWith([]);
    fetchData();
    setIsPinning(false);
  };

  const removePin = async (pinId: string) => {
    const { error } = await supabase.from("officer_pins").delete().eq("id", pinId);
    if (!error) {
      toast.success("Usunięto z teczki.");
      fetchData();
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && fetchData()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-lapd-gold text-lapd-navy hover:bg-lapd-gold/10">
          <Paperclip className="h-4 w-4 mr-2" /> TECZKA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl border-lapd-gold bg-white max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lapd-navy uppercase font-black">
            Teczka Funkcjonariusza: {targetOfficer.first_name} {targetOfficer.last_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="view" className="w-full flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="view">Podgląd Zawartości</TabsTrigger>
            <TabsTrigger value="add">Przypnij Nowe Dokumenty</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="flex-1 overflow-hidden py-4">
            <ScrollArea className="h-full pr-4">
              {pins.length === 0 ? (
                <div className="text-center text-gray-400 py-20">Teczka nie zawiera żadnych przypiętych dokumentów.</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {pins.map((pin) => (
                    <div key={pin.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex justify-between items-start group">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {pin.notes ? <ClipboardList className="h-5 w-5 text-amber-500" /> : <FileText className="h-5 w-5 text-blue-500" />}
                          <span className="font-black text-lapd-navy uppercase tracking-tight">
                            {pin.notes?.title || pin.reports?.title}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {pin.notes?.content || "Dokumentacja systemowa - Raport LSPD"}
                        </p>
                      </div>
                      {pin.author_id === profile?.id && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removePin(pin.id)} 
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="add" className="flex-1 flex flex-col gap-6 overflow-hidden py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
              {/* Lewa kolumna: Wybór dokumentu */}
              <div className="flex flex-col overflow-hidden">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">1. Wybierz Dokument</h4>
                <ScrollArea className="flex-1 border rounded-lg p-2 bg-gray-50/50">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Notatki</p>
                      {myNotes.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => setSelectedDoc({type: 'note', id: n.id})}
                          className={`p-2 mb-1 rounded cursor-pointer text-sm flex items-center justify-between border transition-all ${selectedDoc?.id === n.id ? 'bg-lapd-navy text-lapd-gold border-lapd-gold' : 'bg-white hover:border-lapd-gold/50'}`}
                        >
                          <span className="truncate">{n.title}</span>
                          {selectedDoc?.id === n.id && <Check className="h-4 w-4" />}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Raporty</p>
                      {myReports.map(r => (
                        <div 
                          key={r.id} 
                          onClick={() => setSelectedDoc({type: 'report', id: r.id})}
                          className={`p-2 mb-1 rounded cursor-pointer text-sm flex items-center justify-between border transition-all ${selectedDoc?.id === r.id ? 'bg-lapd-navy text-lapd-gold border-lapd-gold' : 'bg-white hover:border-lapd-gold/50'}`}
                        >
                          <span className="truncate">{r.title}</span>
                          {selectedDoc?.id === r.id && <Check className="h-4 w-4" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Prawa kolumna: Wybór osób */}
              <div className="flex flex-col overflow-hidden">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">2. Komu Udostępnić?</h4>
                <ScrollArea className="flex-1 border rounded-lg p-2 bg-gray-50/50">
                  <div className="space-y-1">
                    {allOfficers.filter(o => o.id !== profile?.id).map(o => (
                      <div 
                        key={o.id} 
                        className={`flex items-center space-x-3 p-2 rounded hover:bg-white border border-transparent transition-colors ${sharedWith.includes(o.id) ? 'bg-white border-lapd-gold/30 shadow-sm' : ''}`}
                      >
                        <Checkbox 
                          id={`share-${o.id}`} 
                          checked={sharedWith.includes(o.id)}
                          onCheckedChange={(checked) => {
                            setSharedWith(prev => checked ? [...prev, o.id] : prev.filter(id => id !== o.id));
                          }}
                        />
                        <Label htmlFor={`share-${o.id}`} className="flex-1 text-xs cursor-pointer">
                          <span className="font-bold">#{o.badge_number}</span> {o.first_name} {o.last_name}
                        </Label>
                      </div>
                    ))}
                    {allOfficers.length <= 1 && <p className="text-xs text-gray-400 p-4 text-center">Brak innych funkcjonariuszy do udostępnienia.</p>}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="pt-4 border-t flex flex-col items-center">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-4">
                {selectedDoc ? "Wybrano 1 element do przypięcia" : "Wybierz dokument z listy powyżej"}
              </p>
              <Button 
                onClick={handlePin} 
                disabled={!selectedDoc || isPinning}
                className="bg-lapd-navy text-lapd-gold hover:bg-lapd-navy/90 px-12 py-6 font-black uppercase tracking-widest shadow-xl disabled:opacity-50"
              >
                {isPinning ? <Loader2 className="animate-spin mr-2" /> : <Paperclip className="h-5 w-5 mr-2" />}
                PRZYPNIJ DO TECZKI
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
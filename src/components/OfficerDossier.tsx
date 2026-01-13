"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Paperclip, Trash2, FileText, ClipboardList, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const OfficerDossier = ({ targetOfficer }: { targetOfficer: any }) => {
  const { profile } = useAuth();
  const [pins, setPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [myNotes, setMyNotes] = useState<any[]>([]);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [allOfficers, setAllOfficers] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<{type: 'note' | 'report', id: string} | null>(null);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [isPinning, setIsPinning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: pinsData } = await supabase
      .from("officer_pins")
      .select("*, notes(id, title, content), reports(id, title, status)")
      .eq("target_profile_id", targetOfficer.id);
    setPins(pinsData || []);

    const { data: notes } = await supabase.from("notes").select("*").eq("author_id", profile?.id);
    const { data: reports } = await supabase.from("reports").select("*").eq("author_id", profile?.id);
    
    const pinnedNoteIds = pinsData?.map(p => p.note_id).filter(Boolean) || [];
    const pinnedReportIds = pinsData?.map(p => p.report_id).filter(Boolean) || [];

    setMyNotes(notes?.filter(n => !pinnedNoteIds.includes(n.id)) || []);
    setMyReports(reports?.filter(r => !pinnedReportIds.includes(r.id)) || []);

    const { data: officers } = await supabase.from("profiles").select("id, first_name, last_name, badge_number").eq("status", "approved");
    setAllOfficers(officers || []);
    setLoading(false);
  };

  const handlePin = async () => {
    if (!selectedDoc) return;
    setIsPinning(true);
    const { data: pinData, error: pinError } = await supabase.from("officer_pins").insert({
        author_id: profile?.id,
        target_profile_id: targetOfficer.id,
        [selectedDoc.type === 'note' ? 'note_id' : 'report_id']: selectedDoc.id
      }).select().single();

    if (pinError) {
      toast.error("Błąd zapisu pinu.");
      setIsPinning(false);
      return;
    }

    if (sharedWith.length > 0) {
      await supabase.from("officer_pin_shares").insert(sharedWith.map(offId => ({ pin_id: pinData.id, profile_id: offId })));
    }

    toast.success("Dokument przypięty.");
    setSelectedDoc(null);
    setSharedWith([]);
    fetchData();
    setIsPinning(false);
  };

  return (
    <Dialog onOpenChange={(open) => open && fetchData()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-lapd-gold text-lapd-gold hover:bg-lapd-gold hover:text-lapd-navy transition-all font-bold">
          <Paperclip className="h-4 w-4 mr-2" /> TECZKA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl border-lapd-gold bg-lapd-darker text-foreground max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lapd-gold uppercase font-black tracking-tighter text-2xl">
            DOSSIER: {targetOfficer.first_name} {targetOfficer.last_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="view" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 bg-lapd-navy/50 p-1">
            <TabsTrigger value="view" className="data-[state=active]:bg-lapd-gold data-[state=active]:text-lapd-navy font-bold uppercase text-xs">ZAWARTOŚĆ</TabsTrigger>
            <TabsTrigger value="add" className="data-[state=active]:bg-lapd-gold data-[state=active]:text-lapd-navy font-bold uppercase text-xs">DODAJ WPIS</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="flex-1 overflow-hidden py-4">
            <ScrollArea className="h-[400px] pr-4">
              {pins.length === 0 ? <div className="text-center text-muted-foreground py-20 italic">Brak dokumentacji.</div> : (
                <div className="space-y-3">
                  {pins.map((pin) => (
                    <div key={pin.id} className="border border-lapd-gray rounded p-4 bg-lapd-navy/30 flex justify-between items-start group">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {pin.notes ? <ClipboardList className="h-4 w-4 text-lapd-gold" /> : <FileText className="h-4 w-4 text-blue-400" />}
                          <span className="font-bold text-sm uppercase">{pin.notes?.title || pin.reports?.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{pin.notes?.content || "Raport Służbowy LSPD"}</p>
                      </div>
                      {pin.author_id === profile?.id && (
                        <Button variant="ghost" size="icon" onClick={() => {
                            supabase.from("officer_pins").delete().eq("id", pin.id).then(() => fetchData());
                        }} className="text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="add" className="flex-1 flex flex-col gap-4 overflow-hidden py-4">
            <div className="grid grid-cols-2 gap-4 h-[350px]">
              <div className="flex flex-col">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase mb-2">Dostępne dokumenty</h4>
                <ScrollArea className="border border-lapd-gray rounded bg-black/20 p-2">
                    <div className="space-y-4">
                        <div>
                            <p className="text-[9px] font-bold text-lapd-gold mb-2 border-b border-lapd-gold/20">NOTATKI</p>
                            {myNotes.map(n => (
                                <div key={n.id} onClick={() => setSelectedDoc({type: 'note', id: n.id})} className={`p-2 mb-1 rounded cursor-pointer text-xs flex justify-between border transition-all ${selectedDoc?.id === n.id ? 'bg-lapd-gold text-lapd-navy border-lapd-gold' : 'hover:border-lapd-gold/50'}`}>
                                    <span className="truncate">{n.title}</span>
                                    {selectedDoc?.id === n.id && <Check className="h-3 w-3" />}
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-blue-400 mb-2 border-b border-blue-400/20">RAPORTY</p>
                            {myReports.map(r => (
                                <div key={r.id} onClick={() => setSelectedDoc({type: 'report', id: r.id})} className={`p-2 mb-1 rounded cursor-pointer text-xs flex justify-between border transition-all ${selectedDoc?.id === r.id ? 'bg-lapd-gold text-lapd-navy border-lapd-gold' : 'hover:border-lapd-gold/50'}`}>
                                    <span className="truncate">{r.title}</span>
                                    {selectedDoc?.id === r.id && <Check className="h-3 w-3" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollArea>
              </div>
              <div className="flex flex-col">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase mb-2">Udostępnianie</h4>
                <ScrollArea className="border border-lapd-gray rounded bg-black/20 p-2">
                    {allOfficers.filter(o => o.id !== profile?.id).map(o => (
                        <div key={o.id} className="flex items-center space-x-2 p-1.5 hover:bg-lapd-navy/50 rounded">
                            <Checkbox id={`s-${o.id}`} checked={sharedWith.includes(o.id)} onCheckedChange={(c) => setSharedWith(prev => c ? [...prev, o.id] : prev.filter(i => i !== o.id))} />
                            <Label htmlFor={`s-${o.id}`} className="text-[10px] cursor-pointer font-bold">#{o.badge_number} {o.last_name}</Label>
                        </div>
                    ))}
                </ScrollArea>
              </div>
            </div>
            <Button onClick={handlePin} disabled={!selectedDoc || isPinning} className="bg-lapd-gold text-lapd-navy font-black uppercase w-full py-6 mt-2">
                {isPinning ? <Loader2 className="animate-spin mr-2" /> : <Paperclip className="h-4 w-4 mr-2" />} PRZYPNIJ DO TECZKI
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
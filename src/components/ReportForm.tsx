"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Send, Paperclip, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FileUploadWidget } from "./FileUploadWidget";
import { AttachmentList } from "./AttachmentList";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ReportForm = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [officers, setOfficers] = useState<any[]>([]);
  const [tempAttachments, setTempAttachments] = useState<any[]>([]);
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    description: "",
    priority: "medium",
    thirdParties: "",
    recipientId: ""
  });

  useEffect(() => {
    supabase.from("profiles")
      .select("id, first_name, last_name, badge_number")
      .eq("status", "approved")
      .then(({ data }) => setOfficers(data || []));
  }, []);

  const handleAttachmentSuccess = (attachments: any[]) => {
    setTempAttachments(prev => [...prev, ...attachments]);
  };

  const toggleOfficer = (badgeAndName: string) => {
    setSelectedOfficers(prev => 
      prev.includes(badgeAndName) 
        ? prev.filter(o => o !== badgeAndName) 
        : [...prev, badgeAndName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !formData.recipientId) return toast.error("Wybierz adresata!");
    if (!formData.title) return toast.error("Podaj tytuł zdarzenia!");

    setLoading(true);
    
    const { data: report, error } = await supabase.from("reports").insert({
      author_id: profile.id,
      recipient_id: formData.recipientId,
      title: formData.title,
      location: formData.location,
      date: formData.date,
      time: formData.time,
      description: formData.description,
      priority: formData.priority,
      status: "Oczekujący",
      involved_officers: selectedOfficers.join(", "),
      third_parties: formData.thirdParties
    }).select('id').single();

    if (error) {
      toast.error("Błąd zapisu: " + error.message);
      setLoading(false);
      return;
    }

    if (tempAttachments.length > 0) {
      await supabase.from("attachments")
        .update({ report_id: report.id })
        .in('id', tempAttachments.map(a => a.id));
    }

    await supabase.from("notifications").insert({
      user_id: formData.recipientId,
      title: "Nowy Raport do weryfikacji",
      description: `Otrzymałeś raport od #${profile.badge_number} dot. ${formData.title}`,
      type: "report"
    });

    toast.success("Raport przesłany!");
    navigate("/reports");
  };

  return (
    <Card className="bg-lapd-darker border-lapd-gold border-2 shadow-2xl">
      <CardHeader className="bg-lapd-navy border-b border-lapd-gold/30">
        <CardTitle className="text-lapd-gold flex items-center uppercase font-black">
          <FileText className="h-6 w-6 mr-3" /> PROTOKÓŁ ZDARZENIA
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-lapd-gold tracking-widest">Adresat (Przełożony)</Label>
            <Select onValueChange={(v) => setFormData({...formData, recipientId: v})}>
              <SelectTrigger className="border-lapd-gold bg-black/40"><SelectValue placeholder="Wybierz..." /></SelectTrigger>
              <SelectContent>
                {officers.map(off => (
                  <SelectItem key={off.id} value={off.id}>
                    #{off.badge_number} {off.first_name} {off.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-lapd-gold tracking-widest">Tytuł Zdarzenia</Label>
            <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="border-lapd-gold bg-black/40" placeholder="np. Strzelanina pod bankiem" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-lapd-gold tracking-widest">Funkcjonariusze uczestniczący</Label>
            <div className="border border-lapd-gold/30 rounded bg-black/40 p-3">
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {officers.filter(o => o.id !== profile?.id).map(off => {
                    const label = `#${off.badge_number} ${off.first_name} ${off.last_name}`;
                    return (
                      <div key={off.id} className="flex items-center space-x-2 p-1 hover:bg-white/5 rounded transition-colors cursor-pointer" onClick={() => toggleOfficer(label)}>
                        <Checkbox checked={selectedOfficers.includes(label)} onCheckedChange={() => toggleOfficer(label)} className="border-lapd-gold data-[state=checked]:bg-lapd-gold data-[state=checked]:text-lapd-navy" />
                        <span className="text-xs text-white">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="mt-2 pt-2 border-t border-lapd-gold/20">
                <p className="text-[9px] text-slate-500 uppercase font-bold">Wybrano: {selectedOfficers.length > 0 ? selectedOfficers.join(", ") : "Brak"}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-lapd-gold tracking-widest">Osoby Postronne / Zatrzymani</Label>
            <Textarea rows={6} value={formData.thirdParties} onChange={e => setFormData({...formData, thirdParties: e.target.value})} className="border-lapd-gold bg-black/40" placeholder="Imię, Nazwisko, rola (świadek/podejrzany)..." />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-lapd-gold tracking-widest">Opis</Label>
          <Textarea rows={8} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="border-lapd-gold bg-black/40" placeholder="Szczegółowy przebieg akcji..." />
        </div>

        <div className="border-t border-lapd-gold/20 pt-6">
          <h3 className="text-lapd-gold font-bold text-sm uppercase mb-4 flex items-center">
            <Paperclip className="h-4 w-4 mr-2" /> Dokumentacja Fotograficzna
          </h3>
          <AttachmentList attachments={tempAttachments} canDelete={true} onDelete={(id) => setTempAttachments(prev => prev.filter(a => a.id !== id))} />
          <div className="mt-4">
            <FileUploadWidget parentType="report" onUploadSuccess={handleAttachmentSuccess} />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-lapd-navy/50 p-6 flex justify-end gap-4 border-t border-lapd-gold/20">
        <Button onClick={handleSubmit} disabled={loading} className="bg-lapd-gold text-lapd-navy font-black uppercase px-8 shadow-lg hover:bg-yellow-500">
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />} ARCHIWIZUJ RAPORT
        </Button>
      </CardFooter>
    </Card>
  );
};
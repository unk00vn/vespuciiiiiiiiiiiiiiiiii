"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, MapPin, Clock, User, Send, Paperclip } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FileUploadWidget } from "./FileUploadWidget";
import { AttachmentList } from "./AttachmentList";

export const ReportForm = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [officers, setOfficers] = useState<{ id: string, first_name: string, last_name: string, badge_number: string }[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]); // Tymczasowa lista załączników przed zapisem
  const [newReportId, setNewReportId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    description: "",
    category: "other",
    priority: "medium",
    involvedParties: "",
    recipientId: ""
  });

  useEffect(() => {
    const fetchOfficers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, badge_number")
        .eq("status", "approved");
      
      if (!error && data) {
        setOfficers(data);
      }
    };
    fetchOfficers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttachmentSuccess = (attachment: any) => {
    setAttachments(prev => [...prev, attachment]);
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    // W przypadku tworzenia nowego raportu, usuwamy tylko z listy tymczasowej
    // W przypadku edycji, musielibyśmy usunąć z Supabase i R2 (co wymagałoby kolejnego endpointu serwerowego)
    
    // Ponieważ jesteśmy w trybie tworzenia, usuwamy tylko z listy, jeśli raport nie został jeszcze zapisany.
    if (!newReportId) {
        setAttachments(prev => prev.filter(a => a.id !== attachmentId));
        toast.info("Załącznik usunięty z listy przed zapisem raportu.");
        // UWAGA: W pełni funkcjonalnym systemie, plik w R2 musiałby zostać usunięty.
        return;
    }
    
    // Jeśli raport został już zapisany, usuwamy z Supabase (R2 wymaga serwera)
    const { error } = await supabase.from("attachments").delete().eq("id", attachmentId);
    if (error) {
        toast.error("Błąd usuwania załącznika: " + error.message);
    } else {
        setAttachments(prev => prev.filter(a => a.id !== attachmentId));
        toast.success("Załącznik usunięty z metadanych.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    if (!formData.recipientId) {
      toast.error("Wybierz adresata raportu!");
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase.from("reports").insert({
      author_id: profile.id,
      recipient_id: formData.recipientId,
      title: formData.title,
      location: formData.location,
      date: formData.date,
      time: formData.time,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      involved_parties: formData.involvedParties,
      status: "Oczekujący"
    }).select('id').single();

    if (error) {
      toast.error("Błąd zapisu raportu: " + error.message);
      setLoading(false);
    } else {
      toast.success("Raport został przesłany pomyślnie. Możesz teraz dodać załączniki.");
      setNewReportId(data.id);
      setLoading(false);
      // Nie nawigujemy od razu, aby umożliwić dodanie załączników
    }
  };

  const handleFinish = () => {
    navigate("/reports");
  };

  return (
    <Card className="bg-lapd-white border-lapd-gold shadow-2xl">
      <CardHeader className="bg-lapd-navy text-lapd-white rounded-t-lg border-b border-lapd-gold">
        <CardTitle className="text-xl flex items-center tracking-wide">
          <FileText className="h-6 w-6 mr-3 text-lapd-gold" />
          OFICJALNY RAPORT POLICYJNY
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 p-8">
          {/* Formularz Raportu */}
          <fieldset disabled={!!newReportId} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-lapd-navy font-bold flex items-center text-sm uppercase">
                  <Send className="h-4 w-4 mr-2 text-lapd-gold" /> Adresat Raportu
                </Label>
                <Select onValueChange={(v) => handleSelectChange("recipientId", v)} value={formData.recipientId}>
                  <SelectTrigger className="border-lapd-gold focus:ring-lapd-navy h-11 bg-gray-50">
                    <SelectValue placeholder="Wybierz przełożonego/funkcjonariusza" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-lapd-gold">
                    {officers.map(off => (
                      <SelectItem key={off.id} value={off.id}>
                        {off.first_name} {off.last_name} (#{off.badge_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-lapd-navy font-bold flex items-center text-sm uppercase">
                  Tytuł Incydentu
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="np. Kradzież pojazdu na Vespucci"
                  required
                  className="border-lapd-gold focus:ring-lapd-navy h-11 bg-gray-50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-lapd-navy font-bold flex items-center text-sm uppercase">Data</Label>
                <Input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="border-lapd-gold h-11 bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-lapd-navy font-bold flex items-center text-sm uppercase">Godzina</Label>
                <Input
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="border-lapd-gold h-11 bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-lapd-navy font-bold flex items-center text-sm uppercase">Priorytet</Label>
                <Select onValueChange={(v) => handleSelectChange("priority", v)} defaultValue="medium">
                  <SelectTrigger className="border-lapd-gold h-11 bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="low">Niski</SelectItem>
                    <SelectItem value="medium">Średni</SelectItem>
                    <SelectItem value="high">Wysoki</SelectItem>
                    <SelectItem value="critical">Krytyczny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-lapd-navy font-bold flex items-center text-sm uppercase">
                <MapPin className="h-4 w-4 mr-2 text-lapd-gold" /> Lokalizacja
              </Label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Dokładny adres lub rejon"
                required
                className="border-lapd-gold h-11 bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-lapd-navy font-bold flex items-center text-sm uppercase">Opis Zdarzenia</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Podaj szczegółowy przebieg interwencji..."
                rows={8}
                required
                className="border-lapd-gold bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-lapd-navy font-bold flex items-center text-sm uppercase">Osoby Zaangażowane</Label>
              <Input
                name="involvedParties"
                value={formData.involvedParties}
                onChange={handleChange}
                placeholder="Imiona, nazwiska, numery telefonów"
                className="border-lapd-gold h-11 bg-gray-50"
              />
            </div>
          </fieldset>
          
          {/* Sekcja Załączników (po zapisie raportu) */}
          {newReportId && (
            <div className="space-y-4 border-t pt-6">
                <h3 className="text-xl font-bold text-lapd-navy flex items-center">
                    <Paperclip className="h-5 w-5 mr-2 text-lapd-gold" />
                    Załączniki do Raportu #{newReportId.substring(0, 8)}
                </h3>
                
                <AttachmentList attachments={attachments} onDelete={handleDeleteAttachment} canDelete={true} />
                
                <FileUploadWidget 
                    parentId={newReportId} 
                    parentType="report" 
                    onUploadSuccess={handleAttachmentSuccess} 
                />
            </div>
          )}
          
        </CardContent>
        
        <CardFooter className="bg-gray-50 p-6 flex justify-between border-t border-gray-200">
          <Button variant="outline" type="button" onClick={handleFinish} className="border-gray-300">
            {newReportId ? "ZAKOŃCZ I WRÓĆ" : "Anuluj"}
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !!newReportId}
            className="bg-lapd-navy text-lapd-gold hover:bg-lapd-navy/90 px-10 h-11 font-bold shadow-lg"
          >
            {loading ? "Wysyłanie..." : "PRZEŚLIJ RAPORT DO WERYFIKACJI"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, MapPin, Clock, User, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const ReportForm = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [officers, setOfficers] = useState<{ id: string, first_name: string, last_name: string, badge_number: string }[]>([]);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    if (!formData.recipientId) {
      toast.error("Wybierz adresata raportu!");
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.from("reports").insert({
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
    });

    if (error) {
      toast.error("Błąd zapisu: " + error.message);
    } else {
      toast.success("Raport został przesłany pomyślnie.");
      navigate("/reports");
    }
    setLoading(false);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-lapd-navy font-bold flex items-center text-sm uppercase">
                <Send className="h-4 w-4 mr-2 text-lapd-gold" /> Adresat Raportu
              </Label>
              <Select onValueChange={(v) => handleSelectChange("recipientId", v)}>
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
        </CardContent>
        
        <CardFooter className="bg-gray-50 p-6 flex justify-between border-t border-gray-200">
          <Button variant="outline" type="button" onClick={() => navigate("/reports")} className="border-gray-300">
            Anuluj
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-lapd-navy text-lapd-gold hover:bg-lapd-navy/90 px-10 h-11 font-bold shadow-lg"
          >
            {loading ? "Wysyłanie..." : "PRZEŚLIJ RAPORT DO WERYFIKACJI"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
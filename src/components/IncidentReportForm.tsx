"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  MapPin, 
  Clock, 
  User, 
  Car,
  Camera,
  Upload
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface IncidentFormData {
  title: string;
  location: string;
  date: string;
  time: string;
  description: string;
  category: string;
  priority: string;
  involvedParties: string;
  vehicles: string;
  evidence: string;
}

export const IncidentReportForm = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [formData, setFormData] = useState<IncidentFormData>({
    title: "",
    location: "",
    date: new Date().toISOString().split('T')[0],
    time: "",
    description: "",
    category: "",
    priority: "medium",
    involvedParties: "",
    vehicles: "",
    evidence: ""
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    // Simulate file upload
    setTimeout(() => {
      setUploading(false);
      toast({
        title: "Dowody przesłane",
        description: "Pliki zostały pomyślnie przesłane do systemu.",
      });
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.location || !formData.description) {
      toast({
        title: "Błąd",
        description: "Proszę wypełnić wszystkie wymagane pola.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Form submitted:", formData);
    
    toast({
      title: "Raport Zgłoszony",
      description: "Twój raport incydentu został pomyślnie przesłany i oczekuje na przegląd.",
    });
    
    // Reset form
    setFormData({
      title: "",
      location: "",
      date: new Date().toISOString().split('T')[0],
      time: "",
      description: "",
      category: "",
      priority: "medium",
      involvedParties: "",
      vehicles: "",
      evidence: ""
    });
  };

  return (
    <Card className="bg-lapd-white border-lapd-gold shadow-md">
      <CardHeader>
        <CardTitle className="text-lapd-navy flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Raport Incydentu
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lapd-navy flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Tytuł Incydentu *
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Opisz krótko incydent"
                required
                className="border-lapd-gold focus:ring-lapd-gold"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location" className="text-lapd-navy flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Lokalizacja *
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Gdzie miał miejsce incydent"
                required
                className="border-lapd-gold focus:ring-lapd-gold"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-lapd-navy flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Data
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="border-lapd-gold focus:ring-lapd-gold"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="text-lapd-navy flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Godzina
              </Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                className="border-lapd-gold focus:ring-lapd-gold"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-lapd-navy">Priorytet</Label>
              <Select 
                name="priority" 
                value={formData.priority} 
                onValueChange={(value) => handleSelectChange("priority", value)}
              >
                <SelectTrigger className="border-lapd-gold focus:ring-lapd-gold">
                  <SelectValue placeholder="Wybierz priorytet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niski</SelectItem>
                  <SelectItem value="medium">Średni</SelectItem>
                  <SelectItem value="high">Wysoki</SelectItem>
                  <SelectItem value="critical">Krytyczny</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-lapd-navy">Kategoria</Label>
              <Select 
                name="category" 
                value={formData.category} 
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger className="border-lapd-gold focus:ring-lapd-gold">
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theft">Kradzież</SelectItem>
                  <SelectItem value="assault">Napad</SelectItem>
                  <SelectItem value="traffic">Ruch drogowy</SelectItem>
                  <SelectItem value="domestic">Sprawa domowa</SelectItem>
                  <SelectItem value="drugs">Narkotyki</SelectItem>
                  <SelectItem value="other">Inne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="involvedParties" className="text-lapd-navy flex items-center">
                <User className="h-4 w-4 mr-2" />
                Zaangażowane Osoby
              </Label>
              <Input
                id="involvedParties"
                name="involvedParties"
                value={formData.involvedParties}
                onChange={handleChange}
                placeholder="Imiona/nazwiska osób zaangażowanych"
                className="border-lapd-gold focus:ring-lapd-gold"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vehicles" className="text-lapd-navy flex items-center">
              <Car className="h-4 w-4 mr-2" />
              Zaangażowane Pojazdy
            </Label>
            <Input
              id="vehicles"
              name="vehicles"
              value={formData.vehicles}
              onChange={handleChange}
              placeholder="Modele/numery rejestracyjne pojazdów"
              className="border-lapd-gold focus:ring-lapd-gold"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-lapd-navy">Opis Incydentu *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Szczegółowo opisz przebieg incydentu, w tym czasy, miejsca i zaangażowane osoby..."
              rows={6}
              required
              className="border-lapd-gold focus:ring-lapd-gold"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-lapd-navy flex items-center">
              <Camera className="h-4 w-4 mr-2" />
              Dowody
            </Label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-lapd-gold rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Kliknij, aby przesłać</span> lub przeciągnij i upuść
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF (MAX. 10MB)</p>
                </div>
                <Input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*,application/pdf"
                />
              </label>
            </div>
            {uploading && <p className="text-sm text-gray-500 mt-2">Przesyłanie plików...</p>}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-lapd-gold text-lapd-navy hover:bg-yellow-600"
          >
            Zgłoś Incydent
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
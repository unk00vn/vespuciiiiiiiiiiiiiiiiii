"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, MapPin, Clock, User } from "lucide-react";

interface ReportFormData {
  title: string;
  location: string;
  date: string;
  time: string;
  description: string;
  category: string;
  priority: string;
  involvedParties: string;
}

export const ReportForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ReportFormData>({
    title: "",
    location: "",
    date: new Date().toISOString().split('T')[0],
    time: "",
    description: "",
    category: "",
    priority: "medium",
    involvedParties: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    
    toast({
      title: "Raport Zapisany",
      description: "Twój raport został pomyślnie zapisany i przesłany.",
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
      involvedParties: ""
    });
  };

  return (
    <Card className="bg-lapd-white border-lapd-gold shadow-md">
      <CardHeader>
        <CardTitle className="text-lapd-navy flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Nowy Raport Policyjny
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lapd-navy flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Tytuł Incydentu
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
                Lokalizacja
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
                required
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
                required
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="description" className="text-lapd-navy">Opis Incydentu</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Szczegółowo opisz przebieg incydentu..."
              rows={5}
              required
              className="border-lapd-gold focus:ring-lapd-gold"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-lapd-gold text-lapd-navy hover:bg-yellow-600"
          >
            Zapisz Raport
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
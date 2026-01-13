"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Users, Edit, Loader2, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Division {
  id: number;
  name: string;
  description: string;
}

const DivisionsPage = () => {
  const { profile } = useAuth();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [currentDivision, setCurrentDivision] = useState<Partial<Division>>({
    name: "",
    description: ""
  });

  const isHC = profile?.role_name === "High Command";

  const fetchDivisions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("divisions")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      toast.error("Błąd podczas ładowania dywizji: " + error.message);
    } else {
      setDivisions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  const handleOpenAdd = () => {
    setCurrentDivision({ name: "", description: "" });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (division: Division) => {
    setCurrentDivision(division);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!currentDivision.name) {
      toast.error("Nazwa dywizji jest wymagana!");
      return;
    }

    setSaving(true);
    try {
      if (isEditing && currentDivision.id) {
        const { error } = await supabase
          .from("divisions")
          .update({
            name: currentDivision.name,
            description: currentDivision.description
          })
          .eq("id", currentDivision.id);

        if (error) throw error;
        toast.success("Dywizja zaktualizowana.");
      } else {
        const { error } = await supabase
          .from("divisions")
          .insert({
            name: currentDivision.name,
            description: currentDivision.description
          });

        if (error) throw error;
        toast.success("Nowa dywizja została utworzona.");
      }
      
      setIsDialogOpen(false);
      await fetchDivisions();
    } catch (error: any) {
      toast.error("Błąd zapisu: " + error.message);
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-lapd-navy">Dywizje LSPD</h1>
          <p className="text-gray-700">Przeglądaj i zarządzaj jednostkami specjalistycznymi.</p>
        </div>
        {isHC && (
          <Button 
            className="bg-lapd-gold text-lapd-navy hover:bg-yellow-600 font-bold"
            onClick={handleOpenAdd}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            DODAJ DYWIZJĘ
          </Button>
        )}
      </div>

      <Card className="bg-lapd-white border-lapd-gold shadow-md">
        <CardHeader>
          <CardTitle className="text-lapd-navy flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Struktura Jednostek
          </CardTitle>
          <CardDescription className="text-gray-600">
            Poniżej znajduje się lista wszystkich aktywnych dywizji w departamencie.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-lapd-gold" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-lapd-navy hover:bg-lapd-navy">
                    <TableHead className="text-lapd-white w-12 text-center">ID</TableHead>
                    <TableHead className="text-lapd-white">Nazwa Dywizji</TableHead>
                    <TableHead className="text-lapd-white">Opis</TableHead>
                    {isHC && <TableHead className="text-lapd-white text-right">Akcje</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {divisions.map((division) => (
                    <TableRow key={division.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-center text-gray-500">{division.id}</TableCell>
                      <TableCell className="font-bold text-lapd-navy">{division.name}</TableCell>
                      <TableCell className="text-gray-700 text-sm max-w-md">
                        {division.description || <span className="text-gray-400 italic">Brak opisu</span>}
                      </TableCell>
                      {isHC && (
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-lapd-navy hover:bg-lapd-gold/20"
                            onClick={() => handleOpenEdit(division)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            EDYTUJ
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {divisions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isHC ? 4 : 3} className="text-center py-10 text-gray-400">
                        Nie znaleziono żadnych dywizji w bazie danych.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-lapd-white border-2 border-lapd-gold">
          <DialogHeader>
            <DialogTitle className="text-lapd-navy uppercase font-black">
              {isEditing ? "Edytuj Dywizję" : "Nowa Dywizja"}
            </DialogTitle>
            <DialogDescription>
              Wprowadź dane dywizji. Zmiany będą widoczne dla wszystkich funkcjonariuszy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lapd-navy font-bold uppercase text-xs">Nazwa Dywizji</Label>
              <Input
                id="name"
                value={currentDivision.name}
                onChange={(e) => setCurrentDivision({ ...currentDivision, name: e.target.value })}
                placeholder="np. Detective Bureau"
                className="border-lapd-gold focus:ring-lapd-navy"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc" className="text-lapd-navy font-bold uppercase text-xs">Opis i Zadania</Label>
              <Textarea
                id="desc"
                value={currentDivision.description}
                onChange={(e) => setCurrentDivision({ ...currentDivision, description: e.target.value })}
                placeholder="Opisz przeznaczenie tej jednostki..."
                className="border-lapd-gold min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Anuluj</Button>
            <Button 
              className="bg-lapd-navy text-lapd-gold font-bold"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {isEditing ? "ZAPISZ ZMIANY" : "DODAJ JEDNOSTKĘ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DivisionsPage;
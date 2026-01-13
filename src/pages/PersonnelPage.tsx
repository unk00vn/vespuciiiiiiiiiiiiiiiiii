"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth, UserProfile } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const PersonnelPage = () => {
  const { profile: me } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedDivisions, setSelectedDivisions] = useState<number[]>([]);

  const isEditor = me && me.role_level >= 3; // Lieutenant+

  const fetchData = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*, roles(id, name, level)").eq("status", "approved");
    const { data: divData } = await supabase.from("divisions").select("*");
    
    // Pobierz wszystkie relacje dywizji
    const { data: relData } = await supabase.from("profile_divisions").select("*");

    const formatted = profiles?.map(p => ({
      ...p,
      role_name: (p as any).roles.name,
      role_level: (p as any).roles.level,
      divisions: relData?.filter(r => r.profile_id === p.id).map(r => divData?.find(d => d.id === r.division_id)).filter(Boolean) || []
    })) as UserProfile[];

    setUsers(formatted || []);
    setDivisions(divData || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (user: UserProfile) => {
    setEditingUser(user);
    setSelectedDivisions(user.divisions.map(d => d.id));
  };

  const handleSaveDivisions = async () => {
    if (!editingUser) return;
    
    // Usuń stare relacje i dodaj nowe
    await supabase.from("profile_divisions").delete().eq("profile_id", editingUser.id);
    const inserts = selectedDivisions.map(divId => ({ profile_id: editingUser.id, division_id: divId }));
    
    if (inserts.length > 0) {
      const { error } = await supabase.from("profile_divisions").insert(inserts);
      if (error) toast.error("Błąd zapisu");
      else toast.success("Dywizje zaktualizowane");
    } else {
      toast.success("Usunięto wszystkie dywizje");
    }
    
    setEditingUser(null);
    fetchData();
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-lapd-navy">Lista Funkcjonariuszy</h1>
      
      <Card className="border-lapd-gold">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-lapd-navy">
              <TableRow>
                <TableHead className="text-white">Odznaka / Imię</TableHead>
                <TableHead className="text-white">Stopień</TableHead>
                <TableHead className="text-white">Dywizje</TableHead>
                {isEditor && <TableHead className="text-white text-right">Akcje</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-bold">#{u.badge_number} {u.first_name} {u.last_name}</TableCell>
                  <TableCell><Badge variant="outline">{u.role_name}</Badge></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.divisions.map(d => <Badge key={d.id} className="bg-lapd-gold text-lapd-navy text-[10px]">{d.name}</Badge>)}
                    </div>
                  </TableCell>
                  {isEditor && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(u)}><Edit className="h-4 w-4" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="border-lapd-gold">
          <DialogHeader><DialogTitle>Zarządzaj Dywizjami: {editingUser?.first_name}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            {divisions.map(d => (
              <div key={d.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`div-${d.id}`} 
                  checked={selectedDivisions.includes(d.id)}
                  onCheckedChange={(checked) => {
                    setSelectedDivisions(prev => checked ? [...prev, d.id] : prev.filter(id => id !== d.id));
                  }}
                />
                <Label htmlFor={`div-${d.id}`}>{d.name}</Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button className="bg-lapd-navy text-lapd-gold" onClick={handleSaveDivisions}>ZAPISZ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonnelPage;
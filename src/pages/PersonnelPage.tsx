"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth, UserProfile } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { OfficerDossier } from "@/components/OfficerDossier";

const PersonnelPage = () => {
  const { profile: me } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedDivisions, setSelectedDivisions] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const isEditor = me && me.role_level >= 3; // Lieutenant+

  const fetchData = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*, roles(id, name, level)").eq("status", "approved");
    const { data: divData } = await supabase.from("divisions").select("*");
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
    setSaving(true);
    
    await supabase.from("profile_divisions").delete().eq("profile_id", editingUser.id);

    if (selectedDivisions.length > 0) {
      const inserts = selectedDivisions.map(divId => ({ profile_id: editingUser.id, division_id: divId }));
      const { error } = await supabase.from("profile_divisions").insert(inserts);
      if (error) toast.error("Błąd podczas zapisu dywizji.");
      else {
        toast.success("Dywizje zaktualizowane.");
        setEditingUser(null);
        fetchData();
      }
    } else {
      toast.success("Usunięto wszystkie dywizje.");
      setEditingUser(null);
      fetchData();
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-white">Lista Funkcjonariuszy</h1>
      
      <Card className="border-lapd-gold shadow-lg bg-white/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-lapd-navy">
              <TableRow>
                <TableHead className="text-white">Odznaka / Imię</TableHead>
                <TableHead className="text-white">Stopień</TableHead>
                <TableHead className="text-white">Dywizje</TableHead>
                <TableHead className="text-white text-right px-6">Dokumentacja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="animate-spin h-8 w-8 mx-auto text-lapd-gold" /></TableCell></TableRow>
              ) : (
                users.map(u => (
                  <TableRow key={u.id} className="hover:bg-white/10 border-white/5">
                    <TableCell className="font-bold text-white">#{u.badge_number} {u.first_name} {u.last_name}</TableCell>
                    <TableCell><Badge variant="outline" className="border-white/50 text-slate-300">{u.role_name}</Badge></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.divisions.map(d => <Badge key={d.id} className="bg-lapd-gold text-lapd-navy text-[10px] uppercase font-bold">{d.name}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6 space-x-2">
                      <OfficerDossier targetOfficer={u} />
                      {isEditor && (
                        <Button variant="ghost" size="sm" onClick={() => openEdit(u)} className="hover:bg-lapd-gold/20 text-lapd-gold">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="border-lapd-gold bg-lapd-darker text-white">
          <DialogHeader><DialogTitle className="text-lapd-gold uppercase font-black">Edycja Dywizji</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            {divisions.map(d => (
              <div key={d.id} className="flex items-center space-x-3 p-2 hover:bg-white/10 rounded">
                <Checkbox id={`div-${d.id}`} checked={selectedDivisions.includes(d.id)} onCheckedChange={(checked) => setSelectedDivisions(prev => checked ? [...prev, d.id] : prev.filter(id => id !== d.id))} className="border-lapd-gold data-[state=checked]:bg-lapd-gold data-[state=checked]:text-lapd-navy" />
                <Label htmlFor={`div-${d.id}`} className="font-medium cursor-pointer flex-1 text-white">{d.name}</Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20" onClick={() => setEditingUser(null)}>Anuluj</Button>
            <Button className="bg-lapd-gold text-lapd-navy font-bold" onClick={handleSaveDivisions} disabled={saving}>ZAPISZ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonnelPage;
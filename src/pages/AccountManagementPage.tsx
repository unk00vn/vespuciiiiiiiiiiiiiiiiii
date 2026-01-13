"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth, UserProfile, UserRole } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface Role {
  id: number;
  name: UserRole;
  level: number;
}

interface Division {
  id: number;
  name: string;
}

interface LocalProfile extends Omit<UserProfile, 'divisions'> {
  division_id?: number;
  division_name?: string;
}

const AccountManagementPage = () => {
  const { profile: currentUserProfile } = useAuth();
  const [profiles, setProfiles] = useState<LocalProfile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    const { data: rolesData } = await supabase.from("roles").select("*");
    const { data: divisionsData } = await supabase.from("divisions").select("*");
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select(`id, email, badge_number, first_name, last_name, status, avatar_url, division_id, roles (id, name, level)`)
      .order("badge_number", { ascending: true }); 

    if (!profilesError) {
      const allDivisions = divisionsData || [];
      const formattedProfiles: LocalProfile[] = profilesData.map((p: any) => ({
        id: p.id,
        email: p.email,
        badge_number: p.badge_number,
        first_name: p.first_name || undefined,
        last_name: p.last_name || undefined,
        role_id: p.roles.id,
        role_name: p.roles.name as UserRole,
        role_level: p.roles.level,
        division_id: p.division_id || undefined,
        division_name: allDivisions.find(d => d.id === p.division_id)?.name || undefined,
        status: p.status as any,
      }));
      setProfiles(formattedProfiles);
    }
    setRoles(rolesData as Role[] || []);
    setDivisions(divisionsData as Division[] || []);
    setLoading(false);
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleStatusChange = async (profileId: string, newStatus: "approved" | "rejected") => {
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", profileId);
    if (!error) { toast.success("Status zaktualizowany"); fetchAllData(); }
  };

  const handleRoleChange = async (profileId: string, newRoleId: string) => {
    const { error } = await supabase.from("profiles").update({ role_id: parseInt(newRoleId) }).eq("id", profileId);
    if (!error) { toast.success("Rola zaktualizowana"); fetchAllData(); }
  };

  const handleDivisionChange = async (profileId: string, newDivisionId: string) => {
    const { error } = await supabase.from("profiles").update({ division_id: parseInt(newDivisionId) }).eq("id", profileId);
    if (!error) { toast.success("Dywizja zaktualizowana"); fetchAllData(); }
  };

  if (loading) return <div className="text-center text-white py-20">Ładowanie systemowe...</div>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl font-black text-white uppercase tracking-tight">Zarządzanie Kontami</h1>
      <p className="text-slate-200 text-sm font-medium">Baza danych aktywnych i oczekujących funkcjonariuszy LSPD.</p>

      <Card className="bg-white/5 border-white/10 shadow-2xl">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-white uppercase text-lg">Rejestr Personelu</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow>
                <TableHead className="text-white font-bold">Email</TableHead>
                <TableHead className="text-white font-bold">Odznaka</TableHead>
                <TableHead className="text-white font-bold">Status</TableHead>
                <TableHead className="text-white font-bold">Rola</TableHead>
                <TableHead className="text-white font-bold">Dywizja</TableHead>
                <TableHead className="text-white font-bold text-right px-6">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id} className="hover:bg-white/5 border-b border-white/5">
                  <TableCell className="text-white font-medium">{p.email}</TableCell>
                  <TableCell className="text-white">#{p.badge_number}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                      p.status === "approved" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {p.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select value={p.role_id.toString()} onValueChange={(v) => handleRoleChange(p.id, v)}>
                      <SelectTrigger className="w-40 bg-black/40 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/20 text-white">
                        {roles.map((r) => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={p.division_id?.toString() || ""} onValueChange={(v) => handleDivisionChange(p.id, v)}>
                      <SelectTrigger className="w-40 bg-black/40 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/20 text-white">
                        {divisions.map((d) => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right px-6 space-x-2">
                    {p.status === "pending" && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold" onClick={() => handleStatusChange(p.id, "approved")}>ZATWIERDŹ</Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10" onClick={() => {}} disabled={p.id === currentUserProfile?.id}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountManagementPage;
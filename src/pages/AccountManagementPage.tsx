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

interface Role {
  id: number;
  name: UserRole;
  level: number;
}

interface Division {
  id: number;
  name: string;
}

const AccountManagementPage = () => {
  const { profile: currentUserProfile } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        id, email, badge_number, first_name, last_name, status, avatar_url,
        roles (id, name, level),
        divisions (id, name)
      `);

    const { data: rolesData, error: rolesError } = await supabase
      .from("roles")
      .select("*");

    const { data: divisionsData, error: divisionsError } = await supabase
      .from("divisions")
      .select("*");

    if (profilesError) {
      toast.error("Błąd podczas ładowania profili: " + profilesError.message);
      console.error("Error fetching profiles:", profilesError);
    } else {
      const formattedProfiles: UserProfile[] = profilesData.map((p: any) => ({
        id: p.id,
        email: p.email,
        badge_number: p.badge_number,
        first_name: p.first_name || undefined,
        last_name: p.last_name || undefined,
        role_id: p.roles.id,
        role_name: p.roles.name as UserRole,
        role_level: p.roles.level,
        division_id: p.divisions?.id || undefined,
        status: p.status as "pending" | "approved" | "rejected",
        avatar_url: p.avatar_url || undefined,
      }));
      setProfiles(formattedProfiles);
    }

    if (rolesError) {
      toast.error("Błąd podczas ładowania ról: " + rolesError.message);
      console.error("Error fetching roles:", rolesError);
    } else {
      setRoles(rolesData as Role[]);
    }

    if (divisionsError) {
      toast.error("Błąd podczas ładowania dywizji: " + divisionsError.message);
      console.error("Error fetching divisions:", divisionsError);
    } else {
      setDivisions(divisionsData as Division[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleStatusChange = async (profileId: string, newStatus: "approved" | "rejected") => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", profileId);

    if (error) {
      toast.error("Błąd podczas zmiany statusu: " + error.message);
      console.error("Error updating status:", error);
    } else {
      toast.success(`Status użytkownika zaktualizowany na: ${newStatus}`);
      fetchAllData(); // Refresh data
    }
  };

  const handleRoleChange = async (profileId: string, newRoleId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role_id: parseInt(newRoleId) })
      .eq("id", profileId);

    if (error) {
      toast.error("Błąd podczas zmiany roli: " + error.message);
      console.error("Error updating role:", error);
    } else {
      toast.success("Rola użytkownika zaktualizowana.");
      fetchAllData(); // Refresh data
    }
  };

  const handleDivisionChange = async (profileId: string, newDivisionId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ division_id: parseInt(newDivisionId) })
      .eq("id", profileId);

    if (error) {
      toast.error("Błąd podczas zmiany dywizji: " + error.message);
      console.error("Error updating division:", error);
    } else {
      toast.success("Dywizja użytkownika zaktualizowana.");
      fetchAllData(); // Refresh data
    }
  };

  if (loading) {
    return <div className="text-center text-lapd-navy">Ładowanie danych...</div>;
  }

  // Check if current user has required role (LT, CPT, HC)
  const isAuthorized = currentUserProfile && ["Lieutenant", "Captain", "High Command"].includes(currentUserProfile.role_name);

  if (!isAuthorized) {
    return (
      <div className="text-center text-red-600 font-bold text-xl mt-10">
        Brak uprawnień do dostępu do tej strony.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-lapd-navy">Zarządzanie Kontami Funkcjonariuszy</h1>
      <p className="text-gray-700">Przeglądaj i zarządzaj kontami oczekującymi na akceptację oraz edytuj role i dywizje istniejących funkcjonariuszy.</p>

      <Card className="bg-lapd-white border-lapd-gold shadow-md">
        <CardHeader>
          <CardTitle className="text-lapd-navy">Lista Kont</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-lapd-navy text-lapd-white hover:bg-lapd-navy">
                  <TableHead className="text-lapd-white">Email</TableHead>
                  <TableHead className="text-lapd-white">Numer Odznaki</TableHead>
                  <TableHead className="text-lapd-white">Status</TableHead>
                  <TableHead className="text-lapd-white">Rola</TableHead>
                  <TableHead className="text-lapd-white">Dywizja</TableHead>
                  <TableHead className="text-lapd-white text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-lapd-navy">{profile.email}</TableCell>
                    <TableCell className="text-gray-700">{profile.badge_number}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        profile.status === "approved" ? "bg-green-100 text-green-800" :
                        profile.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {profile.status === "approved" ? "Akceptowane" :
                         profile.status === "pending" ? "Oczekujące" : "Odrzucone"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={profile.role_id.toString()}
                        onValueChange={(value) => handleRoleChange(profile.id, value)}
                      >
                        <SelectTrigger className="w-[180px] border-lapd-gold text-lapd-navy">
                          <SelectValue placeholder="Wybierz rolę" />
                        </SelectTrigger>
                        <SelectContent className="bg-lapd-white text-lapd-navy border-lapd-gold">
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={profile.division_id?.toString() || ""}
                        onValueChange={(value) => handleDivisionChange(profile.id, value)}
                      >
                        <SelectTrigger className="w-[180px] border-lapd-gold text-lapd-navy">
                          <SelectValue placeholder="Wybierz dywizję" />
                        </SelectTrigger>
                        <SelectContent className="bg-lapd-white text-lapd-navy border-lapd-gold">
                          {divisions.map((division) => (
                            <SelectItem key={division.id} value={division.id.toString()}>
                              {division.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {profile.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => handleStatusChange(profile.id, "approved")}
                          >
                            Akceptuj
                          </Button>
                          <Button
                            variant="outline"
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => handleStatusChange(profile.id, "rejected")}
                          >
                            Odrzuć
                          </Button>
                        </>
                      )}
                      {profile.status === "rejected" && (
                        <Button
                          variant="outline"
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleStatusChange(profile.id, "approved")}
                        >
                          Akceptuj
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountManagementPage;
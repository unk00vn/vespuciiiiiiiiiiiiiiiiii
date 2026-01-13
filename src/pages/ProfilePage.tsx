"use client";

import React, { useState, useEffect } from "react";
import { useAuth, UserProfile } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Mail, Briefcase, Shield, CheckCircle, Clock, XCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const ProfilePage = () => {
  const { profile, user, loading, fetchUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error("Błąd: Użytkownik nie jest zalogowany.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName, last_name: lastName, avatar_url: avatarUrl })
      .eq("id", user.id);

    if (error) {
      toast.error("Błąd podczas aktualizacji profilu: " + error.message);
      console.error("Error updating profile:", error);
    } else {
      toast.success("Profil zaktualizowany pomyślnie!");
      await fetchUserProfile(user.id); // Refresh profile in context
      setIsEditing(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("Błąd: Użytkownik nie jest zalogowany.");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // 1. Upload file
    const { error: uploadError } = await supabase.storage
      .from("avatars") // Ensure you have a bucket named 'avatars' in Supabase Storage
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Błąd podczas przesyłania awatara: " + uploadError.message);
      console.error("Error uploading avatar:", uploadError);
      setUploading(false);
      return;
    }

    // 2. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      // 3. Update profile with new URL
      setAvatarUrl(publicUrlData.publicUrl);
      toast.success("Awatar przesłany pomyślnie! Zapisz profil, aby zastosować zmiany.");
    } else {
      toast.error("Nie udało się uzyskać publicznego URL awatara.");
    }
    setUploading(false);
  };

  if (loading || !profile) {
    return <div className="text-center text-lapd-navy">Ładowanie profilu...</div>;
  }

  const getStatusIcon = (status: UserProfile["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: UserProfile["status"]) => {
    switch (status) {
      case "approved":
        return "Akceptowane";
      case "pending":
        return "Oczekujące";
      case "rejected":
        return "Odrzucone";
      default:
        return "Nieznany";
    }
  };

  const divisionNames = profile.divisions.map(d => d.name).join(', ');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-lapd-navy">Mój Profil</h1>
      <p className="text-gray-700">Przeglądaj i edytuj swoje dane osobowe oraz status.</p>

      <Card className="bg-lapd-white border-lapd-gold shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lapd-navy">Informacje o funkcjonariuszu</CardTitle>
          <Button
            variant="outline"
            className="bg-lapd-gold text-lapd-navy hover:bg-yellow-600"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Anuluj" : "Edytuj"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24 border-4 border-lapd-gold">
              <AvatarImage src={avatarUrl || "https://github.com/shadcn.png"} alt={profile.email} />
              <AvatarFallback className="bg-lapd-navy text-lapd-gold text-2xl">
                {profile.first_name ? profile.first_name[0] : ""}{profile.last_name ? profile.last_name[0] : ""}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="flex flex-col space-y-2">
                <Label htmlFor="avatar" className="text-lapd-navy">Zmień awatar</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="border-lapd-gold focus:ring-lapd-gold focus:border-lapd-gold"
                />
                {uploading && <p className="text-sm text-gray-500">Przesyłanie...</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-lapd-navy flex items-center">
                <Mail className="h-4 w-4 mr-2" /> Email
              </Label>
              <Input id="email" value={profile.email} readOnly className="mt-1 border-lapd-gold bg-gray-50" />
            </div>
            <div>
              <Label htmlFor="badgeNumber" className="text-lapd-navy flex items-center">
                <Briefcase className="h-4 w-4 mr-2" /> Numer Odznaki
              </Label>
              <Input id="badgeNumber" value={profile.badge_number} readOnly className="mt-1 border-lapd-gold bg-gray-50" />
            </div>
            <div>
              <Label htmlFor="firstName" className="text-lapd-navy flex items-center">
                <UserIcon className="h-4 w-4 mr-2" /> Imię
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                readOnly={!isEditing}
                className="mt-1 border-lapd-gold focus:ring-lapd-gold focus:border-lapd-gold"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-lapd-navy flex items-center">
                <UserIcon className="h-4 w-4 mr-2" /> Nazwisko
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                readOnly={!isEditing}
                className="mt-1 border-lapd-gold focus:ring-lapd-gold focus:border-lapd-gold"
              />
            </div>
            <div>
              <Label htmlFor="role" className="text-lapd-navy flex items-center">
                <Shield className="h-4 w-4 mr-2" /> Rola
              </Label>
              <Input id="role" value={profile.role_name} readOnly className="mt-1 border-lapd-gold bg-gray-50" />
            </div>
            <div>
              <Label htmlFor="status" className="text-lapd-navy flex items-center">
                {getStatusIcon(profile.status)} Status
              </Label>
              <Input id="status" value={getStatusText(profile.status)} readOnly className="mt-1 border-lapd-gold bg-gray-50" />
            </div>
            {divisionNames && (
              <div>
                <Label htmlFor="division" className="text-lapd-navy flex items-center">
                  <Users className="h-4 w-4 mr-2" /> Dywizja
                </Label>
                <Input id="division" value={divisionNames} readOnly className="mt-1 border-lapd-gold bg-gray-50" />
              </div>
            )}
          </div>
          {isEditing && (
            <Button
              className="w-full bg-lapd-gold text-lapd-navy hover:bg-yellow-600 transition-colors duration-200"
              onClick={handleSaveProfile}
              disabled={loading || uploading}
            >
              {loading ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
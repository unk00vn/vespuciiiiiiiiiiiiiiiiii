"use client";

import React, { useState, useEffect } from "react";
import { useAuth, UserProfile } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Mail, Briefcase, Users, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useFileUpload } from "@/hooks/useFileUpload";

const ProfilePage = () => {
  const { profile, user, loading, fetchUserProfile } = useAuth();
  const { uploadFile, isUploading } = useFileUpload();
  
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName, last_name: lastName, avatar_url: avatarUrl })
      .eq("id", user.id);

    if (error) {
      toast.error("Błąd: " + error.message);
    } else {
      toast.success("Profil zaktualizowany!");
      await fetchUserProfile(user.id);
      setIsEditing(false);
    }
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Używamy hooka do uploadu, oznaczając, że to zdjęcie profilowe
    const result = await uploadFile(file, { isProfilePicture: true });
    
    if (result && 'fileUrl' in result) {
        // Aktualizujemy stan lokalny i zapisujemy profil
        setAvatarUrl(result.fileUrl);
        
        const { error } = await supabase
            .from("profiles")
            .update({ avatar_url: result.fileUrl })
            .eq("id", user!.id);
            
        if (error) {
            toast.error("Błąd aktualizacji URL avatara: " + error.message);
        } else {
            await fetchUserProfile(user!.id);
        }
    }
  };

  if (loading || !profile) {
    return <div className="text-center p-20 text-white">Ładowanie profilu...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-lapd-navy">Mój Profil</h1>

      <Card className="bg-lapd-white border-lapd-gold shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lapd-navy">Dane Funkcjonariusza</CardTitle>
          <Button
            variant="outline"
            className="border-lapd-gold text-lapd-navy hover:bg-lapd-gold"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Anuluj" : "Edytuj Dane"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-lapd-gold">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-lapd-navy text-lapd-gold text-2xl">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-lapd-gold p-1 rounded-full cursor-pointer hover:bg-yellow-600 transition-colors shadow-md">
                        {isUploading ? (
                            <Loader2 className="h-5 w-5 text-lapd-navy animate-spin" />
                        ) : (
                            <Upload className="h-5 w-5 text-lapd-navy" />
                        )}
                        <Input 
                            id="avatar-upload" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleAvatarUpload} 
                            className="hidden" 
                            disabled={isUploading}
                        />
                    </label>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-lapd-navy flex items-center mb-1"><Mail className="h-4 w-4 mr-2" /> Email</Label>
              <Input value={profile.email} readOnly className="bg-gray-100 border-lapd-gold text-slate-800" />
            </div>
            <div>
              <Label className="text-lapd-navy flex items-center mb-1"><Briefcase className="h-4 w-4 mr-2" /> Odznaka</Label>
              <Input value={profile.badge_number} readOnly className="bg-gray-100 border-lapd-gold font-bold text-slate-800" />
            </div>
            <div>
              <Label className="text-lapd-navy flex items-center mb-1"><UserIcon className="h-4 w-4 mr-2" /> Imię</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} readOnly={!isEditing} className="border-lapd-gold text-slate-800" />
            </div>
            <div>
              <Label className="text-lapd-navy flex items-center mb-1"><UserIcon className="h-4 w-4 mr-2" /> Nazwisko</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} readOnly={!isEditing} className="border-lapd-gold text-slate-800" />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <Label className="text-lapd-navy flex items-center mb-3 text-lg font-bold">
              <Users className="h-5 w-5 mr-2 text-lapd-gold" /> Przynależność do Dywizji
            </Label>
            <div className="flex flex-wrap gap-2">
              {profile.divisions && profile.divisions.length > 0 ? (
                profile.divisions.map(d => (
                  <Badge key={d.id} className="bg-lapd-navy text-lapd-gold px-4 py-2 text-sm">
                    {d.name}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 italic text-sm">Brak przypisanych dywizji specjalistycznych.</p>
              )}
            </div>
          </div>

          {isEditing && (
            <Button className="w-full bg-lapd-gold text-lapd-navy font-bold" onClick={handleSaveProfile} disabled={isUploading}>
              ZAPISZ ZMIANY W PROFILU
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
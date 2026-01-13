"use client";

import React from "react";
import { Bell, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "./NotificationBell";

export const Navbar = () => {
  const { profile } = useAuth();

  // Generuj inicjały na podstawie imienia i nazwiska
  const getInitials = (firstName?: string, lastName?: string) => {
    const firstInitial = firstName ? firstName[0] : "";
    const lastInitial = lastName ? lastName[0] : "";
    return `${firstInitial}${lastInitial}`.toUpperCase() || "JD"; // Domyślne "JD" jeśli brak imienia/nazwiska
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-lapd-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-lapd-navy">Panel LSPD</h2>
      </div>
      <div className="flex items-center space-x-4">
        <NotificationBell />
        <Link to="/profile">
          <Avatar className="h-8 w-8 border-2 border-lapd-gold">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.email || "User Avatar"} />
            <AvatarFallback className="bg-lapd-navy text-lapd-gold">
              {getInitials(profile?.first_name, profile?.last_name)}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
};
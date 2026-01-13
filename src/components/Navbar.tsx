"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react";

export const Navbar = () => {
  const { profile } = useAuth();
  const initials = `${profile?.first_name?.[0] || ""}${profile?.last_name?.[0] || ""}`.toUpperCase();

  return (
    <header className="flex items-center justify-between h-20 px-8 bg-lapd-darker border-b border-lapd-gray shadow-2xl">
      <div className="flex items-center space-x-3">
        <div className="bg-lapd-gold p-1.5 rounded">
            <Shield className="h-6 w-6 text-lapd-navy" />
        </div>
        <div>
            <h2 className="text-xl font-black text-lapd-gold tracking-tighter uppercase italic">Vespucci Precinct</h2>
            <p className="text-[10px] text-muted-foreground font-mono uppercase">Internal Data Terminal v2.4.0</p>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <Link to="/profile" className="flex items-center space-x-4 group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-lapd-gold uppercase">{profile?.last_name}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">#{profile?.badge_number}</p>
          </div>
          <Avatar className="h-10 w-10 border-2 border-lapd-gold transition-transform group-hover:scale-110">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-lapd-navy text-lapd-gold font-black">{initials || "JD"}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
};
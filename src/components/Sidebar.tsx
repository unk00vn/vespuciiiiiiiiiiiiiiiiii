"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FileText, Bell, Users, MessageSquare, User, LogOut, ClipboardList, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, UserRole } from "@/contexts/AuthContext"; // Import useAuth and UserRole

interface SidebarProps {
  className?: string;
}

const navItems = [
  { name: "Dashboard", icon: Home, path: "/" },
  { name: "Raporty", icon: FileText, path: "/reports" },
  { name: "Dywizje", icon: Users, path: "/divisions" },
  { name: "Ogłoszenia", icon: Bell, path: "/announcements" },
  { name: "Notatki", icon: ClipboardList, path: "/notes" },
  { name: "Czat", icon: MessageSquare, path: "/chat" },
  { name: "Profil", icon: User, path: "/profile" },
  { name: "Zarządzanie kontami", icon: ShieldCheck, path: "/account-management", requiredRoles: ["Lieutenant", "Captain", "High Command"] as UserRole[] }, // For LT, CPT, HC
];

export const Sidebar = ({ className }: SidebarProps) => {
  const { profile, signOut } = useAuth();
  const userRole = profile?.role_name;

  const filteredNavItems = navItems.filter(item => {
    if (item.requiredRoles && userRole && !item.requiredRoles.includes(userRole)) {
      return false;
    }
    return true;
  });

  return (
    <div className={cn("flex flex-col h-full bg-lapd-navy text-lapd-white p-4 shadow-lg", className)}>
      <div className="flex items-center justify-center h-16 border-b border-lapd-gold mb-6">
        <h1 className="text-2xl font-bold text-lapd-gold">LSPD Vespucci</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {filteredNavItems.map((item) => (
          <Button
            key={item.name}
            asChild
            variant="ghost"
            className="w-full justify-start text-lapd-white hover:bg-lapd-gold hover:text-lapd-navy transition-colors duration-200"
          >
            <Link to={item.path} className="flex items-center space-x-3">
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-lapd-gold">
        <Button
          variant="ghost"
          className="w-full justify-start text-lapd-white hover:bg-lapd-gold hover:text-lapd-navy transition-colors duration-200"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Wyloguj</span>
        </Button>
      </div>
    </div>
  );
};
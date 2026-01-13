"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  FileText, 
  Bell, 
  Users, 
  User, 
  LogOut, 
  ClipboardList, 
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface SidebarProps {
  className?: string;
}

const navItems = [
  { name: "Dashboard", icon: Home, path: "/" },
  { name: "Raporty", icon: FileText, path: "/reports" },
  { name: "Dywizje", icon: Users, path: "/divisions" },
  { name: "Ogłoszenia", icon: Bell, path: "/announcements" },
  { name: "Notatki", icon: ClipboardList, path: "/notes" },
  { name: "Profil", icon: User, path: "/profile" },
  { 
    name: "Zarządzanie", 
    icon: ShieldCheck, 
    path: "/account-management", 
    requiredRoles: ["Lieutenant", "Captain", "High Command"] as UserRole[] 
  },
];

export const Sidebar = ({ className }: SidebarProps) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const userRole = profile?.role_name;
  
  const filteredNavItems = navItems.filter(item => {
    if (item.requiredRoles && userRole && !item.requiredRoles.includes(userRole)) {
      return false;
    }
    return true;
  });

  return (
    <div className={cn("flex flex-col h-full bg-lapd-navy text-lapd-white p-4 shadow-xl border-r border-lapd-gold/20", className)}>
      <div className="flex flex-col items-center justify-center py-8 mb-6 border-b border-lapd-gold/30">
        <div className="w-16 h-16 bg-lapd-gold rounded-full mb-3 flex items-center justify-center shadow-lg shadow-lapd-gold/20">
          <ShieldCheck className="h-10 w-10 text-lapd-navy" />
        </div>
        <h1 className="text-xl font-bold text-lapd-gold tracking-wider">LSPD VESPUCCI</h1>
        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-semibold">To Protect and to Serve</p>
      </div>
      
      <nav className="flex-1 space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.name}
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start text-lapd-white hover:bg-lapd-gold hover:text-lapd-navy transition-all duration-200 group px-3 py-6",
                isActive && "bg-lapd-gold text-lapd-navy shadow-md"
              )}
            >
              <Link to={item.path} className="flex items-center space-x-3">
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-lapd-navy" : "text-lapd-gold")} />
                <span className="font-medium">{item.name}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-lapd-gold/30">
        <div className="flex items-center p-3 mb-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-lapd-gold">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-[10px] text-gray-400 truncate uppercase">{profile?.role_name} • #{profile?.badge_number}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:bg-red-500 hover:text-white transition-colors duration-200 py-6"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="font-semibold">Wyloguj</span>
        </Button>
      </div>
    </div>
  );
};
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
  Contact
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { NotificationBell } from "./NotificationBell";

const navItems = [
  { name: "DASHBOARD", icon: Home, path: "/" },
  { name: "RAPORTY", icon: FileText, path: "/reports" },
  { name: "PERSONEL", icon: Contact, path: "/personnel" },
  { name: "DYWIZJE", icon: Users, path: "/divisions" },
  { name: "OGŁOSZENIA", icon: Bell, path: "/announcements" },
  { name: "BAZA NOTATEK", icon: ClipboardList, path: "/notes" },
  { name: "PROFIL", icon: User, path: "/profile" },
  { 
    name: "ZARZĄDZANIE", 
    icon: ShieldCheck, 
    path: "/account-management", 
    requiredRoles: ["Lieutenant", "Captain", "High Command"] as UserRole[] 
  },
];

export const Sidebar = ({ className }: { className?: string }) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const userRole = profile?.role_name;
  
  const filteredNavItems = navItems.filter(item => {
    if (item.requiredRoles && userRole && !item.requiredRoles.includes(userRole)) return false;
    return true;
  });

  return (
    <div className={cn("flex flex-col h-full bg-[#050b14] border-r border-lapd-gold/30 p-4", className)}>
      <div className="py-8 mb-6 border-b border-lapd-gold/20 flex flex-col items-center">
        <ShieldCheck className="h-12 w-12 text-lapd-gold mb-2" />
        <h1 className="text-xl font-black text-white tracking-tighter">LSPD <span className="text-lapd-gold">VESPUCCI</span></h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.name}
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start text-slate-300 hover:bg-lapd-gold hover:text-lapd-navy font-bold text-xs transition-all",
                isActive && "bg-lapd-gold text-lapd-navy shadow-lg"
              )}
            >
              <Link to={item.path} className="flex items-center space-x-3">
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-lapd-gold/20 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Alerts</span>
            <NotificationBell />
        </div>
        
        <div className="p-3 bg-white/5 rounded border border-white/10">
          <p className="text-[10px] font-black text-lapd-gold uppercase">Zalogowano jako:</p>
          <p className="text-sm font-bold text-white truncate">
            {profile?.first_name} {profile?.last_name} (#{profile?.badge_number})
          </p>
        </div>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:bg-red-500 hover:text-white font-bold"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-3" /> WYLOGUJ
        </Button>
      </div>
    </div>
  );
};
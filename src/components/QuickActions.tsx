"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Bell,
  ClipboardList,
  ShieldCheck,
  User,
  PlusCircle,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

export const QuickActions = () => {
  const actions = [
    { name: "Nowy Raport", icon: <PlusCircle />, path: "/reports/new", color: "text-blue-400" },
    { name: "Lista Raportów", icon: <FileText />, path: "/reports", color: "text-indigo-400" },
    { name: "Baza Notatek", icon: <ClipboardList />, path: "/notes", color: "text-amber-400" },
    { name: "Ogłoszenia", icon: <Bell />, path: "/announcements", color: "text-red-400" },
    { name: "Dywizje", icon: <Users />, path: "/divisions", color: "text-emerald-400" },
    { name: "Mój Profil", icon: <User />, path: "/profile", color: "text-slate-300" },
    { name: "Zarządzanie", icon: <ShieldCheck />, path: "/account-management", color: "text-purple-400" },
  ];

  return (
    <Card className="bg-white/5 border-lapd-gold/30 shadow-2xl">
      <CardHeader className="border-b border-lapd-gold/20">
        <CardTitle className="text-white text-lg font-black uppercase tracking-tighter">Panel Sterowania</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="flex flex-col items-center justify-center h-28 p-2 border-white/10 bg-black/20 hover:bg-lapd-gold hover:text-lapd-navy transition-all group"
              asChild
            >
              <Link to={action.path}>
                <div className={`${action.color} mb-3 group-hover:text-lapd-navy transition-colors`}>{action.icon}</div>
                <span className="text-[10px] font-black text-center uppercase leading-tight text-white group-hover:text-lapd-navy">{action.name}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
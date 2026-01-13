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
    { name: "Nowy Raport", icon: <PlusCircle className="h-6 w-6" />, path: "/reports/new", color: "text-blue-500" },
    { name: "Przeglądaj Raporty", icon: <FileText className="h-6 w-6" />, path: "/reports", color: "text-indigo-500" },
    { name: "Notatki", icon: <ClipboardList className="h-6 w-6" />, path: "/notes", color: "text-amber-500" },
    { name: "Ogłoszenia", icon: <Bell className="h-6 w-6" />, path: "/announcements", color: "text-red-500" },
    { name: "Dywizje", icon: <Users className="h-6 w-6" />, path: "/divisions", color: "text-emerald-500" },
    { name: "Mój Profil", icon: <User className="h-6 w-6" />, path: "/profile", color: "text-slate-500" },
    { name: "Zarządzanie", icon: <ShieldCheck className="h-6 w-6" />, path: "/account-management", color: "text-purple-500" },
  ];

  return (
    <Card className="bg-lapd-white border-lapd-gold shadow-lg overflow-hidden">
      <CardHeader className="bg-lapd-navy/5 border-b border-lapd-gold/20">
        <CardTitle className="text-lapd-navy text-lg font-bold">Panel Sterowania</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="flex flex-col items-center justify-center h-28 p-4 border-gray-200 hover:border-lapd-gold hover:bg-lapd-gold/5 transition-all duration-300 shadow-sm hover:shadow-md group"
              asChild
            >
              <Link to={action.path}>
                <div className={`${action.color} mb-3 transition-transform group-hover:scale-110`}>{action.icon}</div>
                <span className="text-[11px] font-bold text-center uppercase tracking-tighter text-lapd-navy">{action.name}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
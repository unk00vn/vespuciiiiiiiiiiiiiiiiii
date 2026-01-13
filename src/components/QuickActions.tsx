"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  Bell,
  ClipboardList,
  MessageSquare,
  ShieldCheck,
  PlusCircle,
  Search,
  MapPin,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";

export const QuickActions = () => {
  const actions = [
    { name: "Nowy Raport", icon: <FileText className="h-5 w-5" />, path: "/reports/new" },
    { name: "Zgłoś Incydent", icon: <AlertTriangle className="h-5 w-5" />, path: "/incident-report" },
    { name: "Nowe Ogłoszenie", icon: <Bell className="h-5 w-5" />, path: "/announcements" },
    { name: "Dodaj Notatkę", icon: <ClipboardList className="h-5 w-5" />, path: "/notes" },
    { name: "Nowa Wiadomość", icon: <MessageSquare className="h-5 w-5" />, path: "/chat" },
    { name: "Zarządzaj Kontem", icon: <ShieldCheck className="h-5 w-5" />, path: "/account-management" },
    { name: "Wyszukaj Funkcjonariusza", icon: <Search className="h-5 w-5" />, path: "/divisions" },
    { name: "Mapa Incydentów", icon: <MapPin className="h-5 w-5" />, path: "/" },
  ];

  return (
    <Card className="bg-lapd-white border-lapd-gold shadow-md">
      <CardHeader>
        <CardTitle className="text-lapd-navy">Szybkie Akcje</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="flex flex-col items-center justify-center h-24 p-2 border-lapd-gold hover:bg-lapd-gold hover:text-lapd-navy transition-colors"
              asChild
            >
              <Link to={action.path}>
                <div className="mb-2">{action.icon}</div>
                <span className="text-xs text-center">{action.name}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
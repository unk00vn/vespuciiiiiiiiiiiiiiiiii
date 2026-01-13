"use client";

import React, { useState } from "react";
import { Bell, X, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "alert" | "info" | "success";
}

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Nowy incydent",
      description: "Zgłoszenie kradzieży samochodu w rejonie Vespucci",
      time: "2 minuty temu",
      read: false,
      type: "alert"
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-lapd-gold hover:bg-white/10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-600 text-white border-2 border-lapd-darker">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-lapd-darker border-lapd-gold/50 shadow-2xl" align="end">
        <div className="border-b border-white/10 p-4">
          <h3 className="font-bold text-white uppercase text-sm tracking-widest">Centrum Powiadomień</h3>
        </div>
        
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs uppercase font-bold italic">
              Brak nowych komunikatów
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {n.type === "alert" ? <AlertCircle className="h-4 w-4 text-red-500" /> : <Info className="h-4 w-4 text-lapd-gold" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase">{n.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{n.description}</p>
                      <p className="text-[9px] text-slate-600 mt-2 font-mono">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
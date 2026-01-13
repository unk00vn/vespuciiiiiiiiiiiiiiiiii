"use client";

import React, { useState, useEffect } from "react";
import { Bell, Info, FileText, ClipboardList, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const NotificationBell = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications(data || []);
  };

  useEffect(() => {
    fetchNotifications();
    // Realtime subskrypcja została usunięta zgodnie z wytycznymi.
    // Dane aktualizują się tylko przy przeładowaniu strony.
  }, [profile]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    if (!profile) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", profile.id);
    fetchNotifications();
  };
  
  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) {
      toast.error("Błąd usuwania powiadomienia.");
    } else {
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Powiadomienie usunięte.");
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'report': return <FileText className="h-4 w-4 text-blue-400" />;
      case 'note': return <ClipboardList className="h-4 w-4 text-amber-400" />;
      default: return <Info className="h-4 w-4 text-lapd-gold" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-lapd-gold hover:bg-white/10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px] bg-red-600 border-2 border-lapd-darker flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-lapd-darker border-lapd-gold shadow-2xl" align="end">
        <div className="border-b border-white/10 p-4 flex justify-between items-center">
          <h3 className="font-black text-white uppercase text-xs tracking-widest">Powiadomienia</h3>
          {unreadCount > 0 && <Button variant="ghost" size="sm" className="text-[9px] h-6 uppercase font-bold text-lapd-gold" onClick={markAllAsRead}>Oznacz jako przeczytane</Button>}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-[10px] uppercase italic">Brak komunikatów</div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((n) => (
                <div key={n.id} className={`p-4 transition-colors flex justify-between items-start group ${!n.is_read ? 'bg-white/5' : 'opacity-60'}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getIcon(n.type)}</div>
                    <div>
                      <h4 className="text-[11px] font-black text-white uppercase">{n.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{n.description}</p>
                      <p className="text-[8px] text-slate-600 mt-2 font-mono">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteNotification(n.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
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
    },
    {
      id: "2",
      title: "Raport wymaga przeglądu",
      description: "Raport RPT-2026-045 oczekuje na Twoją akceptację",
      time: "15 minut temu",
      read: false,
      type: "info"
    },
    {
      id: "3",
      title: "Szkolenie zakończone",
      description: "Twoje szkolenie z taktyki zostało zakończone pomyślnie",
      time: "1 godzinę temu",
      read: true,
      type: "success"
    },
    {
      id: "4",
      title: "Zmiana grafiku",
      description: "Twój grafik na przyszły tydzień został opublikowany",
      time: "3 godziny temu",
      read: true,
      type: "info"
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "alert": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBgColor = (type: string, read: boolean) => {
    if (read) return "bg-gray-50";
    
    switch (type) {
      case "alert": return "bg-red-50";
      case "success": return "bg-green-50";
      default: return "bg-blue-50";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-lapd-navy hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lapd-navy">Powiadomienia</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-lapd-navy hover:bg-lapd-gold"
                onClick={markAllAsRead}
              >
                Oznacz wszystkie jako przeczytane
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Brak powiadomień
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 ${getBgColor(notification.type, notification.read)} relative`}
                >
                  <div className="flex justify-between">
                    <div className="flex items-start">
                      <div className="mt-0.5 mr-3">
                        {getIcon(notification.type)}
                      </div>
                      <div>
                        <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-lapd-navy'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-gray-600"
                      onClick={() => clearNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {!notification.read && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-lapd-gold text-lapd-navy hover:bg-lapd-gold"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Oznacz jako przeczytane
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t border-gray-200 p-2">
          <Button variant="ghost" className="w-full text-lapd-navy text-sm">
            Zobacz wszystkie powiadomienia
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
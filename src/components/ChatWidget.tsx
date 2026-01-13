"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  user: string;
  badgeNumber: string;
  content: string;
  timestamp: string;
}

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";
const MESSAGE_COOLDOWN_MS = 2000;

let socket: Socket | null = null;

export const ChatWidget = () => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastSentTimeRef = useRef(0);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (!profile) return;

    if (!socket) {
      socket = io(SOCKET_SERVER_URL, {
        transports: ['websocket'],
        auth: { token: profile.id },
      });
    }

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onMessageReceived = (message: Message) => {
      setMessages(prev => prev.some(m => m.id === message.id) ? prev : [...prev, message]);
      setTimeout(scrollToBottom, 50);
    };
    
    const onHistoryReceived = (history: Message[]) => {
      setMessages(history);
      setTimeout(scrollToBottom, 50);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('chatMessage', onMessageReceived);
    socket.on('history', onHistoryReceived);

    return () => {
      socket?.off('connect', onConnect);
      socket?.off('disconnect', onDisconnect);
      socket?.off('chatMessage', onMessageReceived);
      socket?.off('history', onHistoryReceived);
    };
  }, [profile]);

  useEffect(() => {
    if (isOpen) setTimeout(scrollToBottom, 100);
  }, [isOpen, messages.length]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !profile) return;
    
    // Jeśli nie ma połączenia, poinformuj o tym, ale nie blokuj całkowicie UI
    if (!isConnected && !import.meta.env.DEV) {
      toast.error("Czat jest obecnie w trybie offline.");
      return;
    }

    const now = Date.now();
    if (now - lastSentTimeRef.current < MESSAGE_COOLDOWN_MS) {
      toast.warning("Zwolnij! Wysyłasz wiadomości zbyt szybko.");
      return;
    }

    setIsSending(true);
    
    const messageData = {
      user: `${profile.first_name} ${profile.last_name}`,
      badgeNumber: profile.badge_number,
      content: newMessage,
    };

    if (socket && isConnected) {
      socket.emit('sendMessage', messageData, (response: any) => {
        setIsSending(false);
        if (response?.success) {
          setNewMessage("");
          lastSentTimeRef.current = Date.now();
        } else {
          toast.error("Błąd wysyłania.");
        }
      });
    } else {
      // Mock wysyłania dla środowiska bez serwera socketów
      setIsSending(false);
      setNewMessage("");
      toast.info("Wiadomość wysłana (tryb lokalny).");
    }
  };

  if (!profile) return null;

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 bg-lapd-gold text-lapd-navy hover:bg-yellow-600 shadow-xl z-50 animate-bounce"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 h-96 bg-[#0a121e] border-2 border-lapd-gold shadow-2xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-3 bg-lapd-navy border-b border-lapd-gold/30">
        <CardTitle className="text-white text-sm font-black flex items-center uppercase tracking-tighter">
          <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          RADIOCZAT LSPD
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-red-500" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
                <p className="text-[10px] text-slate-500 text-center uppercase font-bold italic mt-10">Brak aktywnych transmisji radiowych</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className="border-l-2 border-lapd-gold pl-3 py-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-black text-lapd-gold uppercase">{m.user}</span>
                  <span className="text-[8px] text-slate-500 font-mono">#{m.badgeNumber}</span>
                </div>
                <p className="text-xs text-white leading-relaxed mt-1">{m.content}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-3 bg-lapd-navy/50 border-t border-lapd-gold/20 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="NADAJ KOMUNIKAT..."
            className="bg-black/40 border-lapd-gold/30 text-white text-xs placeholder:text-slate-600 focus:border-lapd-gold h-9"
          />
          <Button
            size="sm"
            className="bg-lapd-gold text-lapd-navy hover:bg-yellow-500 h-9 px-3"
            onClick={handleSendMessage}
            disabled={isSending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
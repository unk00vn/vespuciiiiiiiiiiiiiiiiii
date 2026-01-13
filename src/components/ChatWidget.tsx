"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  timestamp: string; // Zmienione na string, aby pasowało do formatu JSON/Socket
}

// Używamy stałego adresu URL dla Socket.IO, zakładając, że serwer działa na tym samym hoście
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";
const MESSAGE_COOLDOWN_MS = 3000;

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
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  // Efekt do zarządzania połączeniem Socket.IO
  useEffect(() => {
    if (!profile) return;

    // Inicjalizacja Socket.IO
    if (!socket) {
      socket = io(SOCKET_SERVER_URL, {
        transports: ['websocket'],
        auth: { token: profile.id }, // Przekazujemy ID profilu do autoryzacji
      });
    }

    const onConnect = () => {
      setIsConnected(true);
      console.log("Socket connected.");
      // Po ponownym połączeniu, prosimy o historię wiadomości (jeśli serwer to obsługuje)
      socket?.emit('requestHistory');
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log("Socket disconnected.");
    };

    const onMessageReceived = (message: Message) => {
      setMessages(prev => {
        // Zapobiegamy duplikatom, jeśli wiadomość ma unikalne ID
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    };
    
    const onHistoryReceived = (history: Message[]) => {
        setMessages(history);
        scrollToBottom();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('chatMessage', onMessageReceived);
    socket.on('history', onHistoryReceived);

    // Wyczyść przy odmontowaniu
    return () => {
      socket?.off('connect', onConnect);
      socket?.off('disconnect', onDisconnect);
      socket?.off('chatMessage', onMessageReceived);
      socket?.off('history', onHistoryReceived);
      // Nie zamykamy socketu, aby utrzymać połączenie w tle
    };
  }, [profile]);

  // Scroll do dołu po otwarciu i załadowaniu wiadomości
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !profile || !isConnected) {
      if (!isConnected) toast.error("Błąd połączenia z czatem.");
      return;
    }
    
    const now = Date.now();
    if (now - lastSentTimeRef.current < MESSAGE_COOLDOWN_MS) {
      const remaining = Math.ceil((MESSAGE_COOLDOWN_MS - (now - lastSentTimeRef.current)) / 1000);
      toast.warning(`Musisz poczekać ${remaining}s przed wysłaniem kolejnej wiadomości.`);
      return;
    }

    setIsSending(true);
    
    const message: Omit<Message, 'id' | 'timestamp'> = {
      user: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unknown Officer",
      badgeNumber: profile.badge_number,
      content: newMessage,
    };

    // Wysyłamy wiadomość przez Socket.IO
    socket?.emit('sendMessage', message, (response: { success: boolean, messageId?: string, error?: string }) => {
        setIsSending(false);
        if (response.success) {
            setNewMessage("");
            lastSentTimeRef.current = Date.now();
        } else {
            toast.error("Nie udało się wysłać wiadomości: " + (response.error || "Nieznany błąd"));
        }
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!profile) return null; // Ukryj widget, jeśli użytkownik nie jest zalogowany

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 bg-lapd-gold text-lapd-navy hover:bg-yellow-600 shadow-lg z-50"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 h-96 bg-lapd-white border-lapd-gold shadow-xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-lapd-navy text-lapd-white rounded-t-lg">
        <CardTitle className="text-lg flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Chat LSPD
        </CardTitle>
        <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} title={isConnected ? "Połączono" : "Rozłączono"}></div>
            <Button
              variant="ghost"
              size="sm"
              className="text-lapd-white hover:bg-lapd-gold"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="text-sm">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-lapd-navy">
                    {message.user}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {message.badgeNumber}
                </div>
                <div className="mt-1 text-gray-700 bg-gray-50 p-2 rounded">
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-gray-200 flex">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Wpisz wiadomość..."
            className="flex-1 mr-2 text-sm border-lapd-gold focus:ring-lapd-gold"
            disabled={!isConnected || isSending}
          />
          <Button
            size="sm"
            className="bg-lapd-gold text-lapd-navy hover:bg-yellow-600"
            onClick={handleSendMessage}
            disabled={!isConnected || isSending}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
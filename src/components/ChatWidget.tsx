"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  user_name: string;
  badge_number: string;
  content: string;
  created_at: string;
}

export const ChatWidget = () => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Pobieranie historii z bazy
  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(50);
    
    if (error) {
      console.error("Błąd pobierania czatu:", error.message);
    } else {
      setMessages(data || []);
      setTimeout(scrollToBottom, 100);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();

    // Subskrypcja w czasie rzeczywistym
    const channel = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', { event: 'INSERT', table: 'chat_messages' }, (payload) => {
        const msg = payload.new as Message;
        setMessages((prev) => [...prev, msg]);
        
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
        
        setTimeout(scrollToBottom, 50);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !profile) return;

    const content = newMessage;
    setNewMessage(""); // Czyścimy od razu dla lepszego UX

    const { error } = await supabase.from("chat_messages").insert({
      user_name: `${profile.first_name} ${profile.last_name}`,
      badge_number: profile.badge_number,
      content: content,
      profile_id: profile.id
    });

    if (error) {
      toast.error("Błąd transmisji radiowej.");
      console.error(error);
    }
  };

  if (!profile) return null;

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 rounded-full h-16 w-16 bg-lapd-gold text-lapd-navy hover:bg-yellow-600 shadow-2xl z-50 transition-all hover:scale-110"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-8 w-8" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-600 text-white border-2 border-lapd-darker h-6 min-w-6 flex items-center justify-center rounded-full text-xs font-black">
            {unreadCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 h-[450px] bg-[#0a121e] border-2 border-lapd-gold shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-5">
      <CardHeader className="flex flex-row items-center justify-between p-3 bg-lapd-navy border-b border-lapd-gold/30">
        <CardTitle className="text-white text-sm font-black flex items-center uppercase tracking-tighter">
          <div className="h-2 w-2 rounded-full mr-2 bg-green-500 animate-pulse" />
          RADIOCZAT DYWIZJI
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-red-500" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-lapd-gold h-8 w-8" /></div>
          ) : (
            <div className="space-y-4">
              {messages.length === 0 && (
                  <p className="text-[10px] text-slate-500 text-center uppercase font-bold italic mt-10">System radiowy gotowy do pracy</p>
              )}
              {messages.map((m) => (
                <div key={m.id} className="border-l-2 border-lapd-gold/40 pl-3 py-1 bg-white/[0.02] rounded-r">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[10px] font-black text-lapd-gold uppercase">{m.user_name}</span>
                    <span className="text-[8px] text-slate-500 font-mono">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-white leading-relaxed">{m.content}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 bg-lapd-navy/50 border-t border-lapd-gold/20 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="NADAJ KOMUNIKAT..."
            className="bg-black/40 border-lapd-gold/30 text-white text-xs placeholder:text-slate-600 focus:border-lapd-gold h-10"
          />
          <Button
            size="sm"
            className="bg-lapd-gold text-lapd-navy hover:bg-yellow-500 h-10 px-3"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
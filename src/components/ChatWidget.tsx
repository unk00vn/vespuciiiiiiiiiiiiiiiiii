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
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Ładowanie historii i subskrypcja Realtime
  useEffect(() => {
    if (!profile) return;

    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) {
        console.error("Błąd pobierania historii czatu:", error);
      } else {
        setMessages(data || []);
        setTimeout(scrollToBottom, 100);
      }
      setIsLoading(false);
    };

    fetchHistory();

    // Subskrypcja na nowe wiadomości
    const channel = supabase
      .channel("public:chat_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          setTimeout(scrollToBottom, 50);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  useEffect(() => {
    if (isOpen) setTimeout(scrollToBottom, 100);
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !profile || isSending) return;

    setIsSending(true);
    
    const { error } = await supabase.from("chat_messages").insert({
      user_name: `${profile.first_name} ${profile.last_name}`,
      badge_number: profile.badge_number,
      content: newMessage,
      author_id: profile.id
    });

    if (error) {
      toast.error("Błąd transmisji: " + error.message);
    } else {
      setNewMessage("");
    }
    setIsSending(false);
  };

  if (!profile) return null;

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 bg-lapd-gold text-lapd-navy hover:bg-yellow-600 shadow-xl z-50"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-85 h-[500px] bg-lapd-darker border-2 border-lapd-gold shadow-2xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-3 bg-lapd-navy border-b border-lapd-gold/30">
        <CardTitle className="text-white text-sm font-black flex items-center uppercase tracking-tighter">
          <div className="h-2 w-2 rounded-full mr-2 bg-green-500 animate-pulse" />
          KANAŁ OPERACYJNY LSPD
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-red-500" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-lapd-gold" /></div>
            ) : messages.length === 0 ? (
                <p className="text-[10px] text-slate-500 text-center uppercase font-bold italic mt-10">Brak aktywnych transmisji radiowych</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="border-l-2 border-lapd-gold/50 pl-3 py-1 bg-white/[0.02] rounded-r">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-black text-lapd-gold uppercase">{m.user_name}</span>
                    <span className="text-[8px] text-slate-500 font-mono">#{m.badge_number}</span>
                  </div>
                  <p className="text-xs text-white leading-relaxed mt-1">{m.content}</p>
                  <p className="text-[8px] text-slate-600 text-right mt-1">{new Date(m.created_at).toLocaleTimeString()}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-3 bg-lapd-navy border-t border-lapd-gold/20 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="NADAJ KOMUNIKAT..."
            className="bg-black/60 border-lapd-gold/30 text-white text-xs placeholder:text-slate-600 focus:ring-1 focus:ring-lapd-gold h-10"
          />
          <Button
            size="sm"
            className="bg-lapd-gold text-lapd-navy hover:bg-yellow-500 h-10 px-3"
            onClick={handleSendMessage}
            disabled={isSending}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
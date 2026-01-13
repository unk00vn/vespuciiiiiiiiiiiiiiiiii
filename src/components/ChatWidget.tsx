"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Loader2, Maximize2, Minimize2, CornerDownLeft, CornerDownRight, WifiOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [isWide, setIsWide] = useState(false);
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  };

  const fetchHistory = async () => {
    if (!profile) return;
    setIsLoading(true);
    setError(false);

    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError(true);
      }
    }, 5000);

    try {
      const { data, error: sbError } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);

      if (sbError) throw sbError;
      setMessages(data || []);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Chat fetch error:", err);
      setError(true);
    } finally {
      clearTimeout(safetyTimeout);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile && isOpen) {
      fetchHistory();

      const channel = supabase
        .channel("public:chat_messages")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          setTimeout(scrollToBottom, 50);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [profile, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(scrollToBottom, 100);
  }, [isOpen, messages.length, isWide, position]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !profile || isSending) return;
    setIsSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      user_name: `${profile.first_name} ${profile.last_name}`,
      badge_number: profile.badge_number,
      content: newMessage,
      author_id: profile.id
    });
    if (error) toast.error("Błąd połączenia.");
    else setNewMessage("");
    setIsSending(false);
  };

  if (!profile) return null;

  if (!isOpen) {
    return (
      <Button
        className={cn(
          "fixed bottom-6 rounded-full h-14 w-14 bg-lapd-gold text-lapd-navy hover:bg-yellow-600 shadow-xl z-50",
          position === 'bottom-right' ? 'right-6' : 'left-6'
        )}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-6 bg-lapd-darker border-2 border-lapd-gold shadow-2xl z-50 flex flex-col transition-all duration-300",
      position === 'bottom-right' ? 'right-6' : 'left-6',
      isWide ? "w-[600px] h-[350px]" : "w-80 h-[500px]"
    )}>
      <CardHeader className="flex flex-row items-center justify-between p-3 bg-lapd-navy border-b border-lapd-gold/30">
        <CardTitle className="text-white text-[10px] font-black flex items-center uppercase tracking-tighter">
          <div className={cn("h-2 w-2 rounded-full mr-2 animate-pulse", error ? "bg-red-500" : "bg-green-500")} />
          KANAŁ OPERACYJNY
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white" onClick={() => setIsWide(!isWide)}>
            {isWide ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {isLoading ? (
               <div className="flex justify-center py-20"><Loader2 className="animate-spin text-lapd-gold" /></div>
            ) : error ? (
               <div className="flex flex-col items-center justify-center py-20 text-red-500 text-center">
                  <WifiOff className="h-8 w-8 mb-2" />
                  <p className="text-[10px] font-black uppercase">Brak połączenia z siecią</p>
                  <Button variant="link" size="sm" onClick={fetchHistory} className="text-red-400 text-[10px] uppercase underline mt-2">Ponów próbę</Button>
               </div>
            ) : messages.length === 0 ? (
               <div className="text-center py-20 text-slate-600 text-[10px] uppercase font-bold italic">Brak wiadomości na kanale.</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="border-l-2 border-lapd-gold/50 pl-3 py-1 bg-white/[0.02]">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[9px] font-black text-lapd-gold uppercase">{m.user_name}</span>
                    <span className="text-[8px] text-slate-600">#{m.badge_number}</span>
                  </div>
                  <p className="text-xs text-white mt-1">{m.content}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-3 bg-lapd-navy/50 border-t border-lapd-gold/20 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="NADAJ..."
            className="bg-black/60 border-lapd-gold/30 text-white text-xs h-9"
          />
          <Button size="sm" className="bg-lapd-gold text-lapd-navy h-9" onClick={handleSendMessage} disabled={isSending || error}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
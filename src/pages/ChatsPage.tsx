"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Send, Users, User, Plus, Loader2, Paperclip, Search } from "lucide-react";
import { toast } from "sonner";
import { AttachmentList } from "@/components/AttachmentList";
import { FileUploadWidget } from "@/components/FileUploadWidget";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const ChatsPage = () => {
  const { profile } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [allOfficers, setAllOfficers] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchChats = async () => {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase
      .from("chat_participants")
      .select(`chat:chats(*), chat_id`)
      .eq("user_id", profile.id);
    
    setChats(data?.map(d => d.chat) || []);
    setLoading(false);
  };

  const fetchMessages = async (chatId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select(`*, attachments(*)`)
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 50);
  };

  useEffect(() => {
    fetchChats();
    supabase.from("profiles").select("*").eq("status", "approved").then(({data}) => setAllOfficers(data || []));
  }, [profile]);

  useEffect(() => {
    if (!activeChat) return;
    fetchMessages(activeChat.id);
    const channel = supabase.channel(`chat_${activeChat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${activeChat.id}` }, (p) => {
        setMessages(prev => [...prev, p.new]);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat || isSending) return;
    setIsSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      chat_id: activeChat.id,
      author_id: profile?.id,
      content: newMessage,
      user_name: `${profile?.first_name} ${profile?.last_name}`,
      badge_number: profile?.badge_number
    });
    if (!error) setNewMessage("");
    setIsSending(false);
  };

  const createGroup = async (name: string, members: string[]) => {
    const { data: chat, error } = await supabase.from("chats").insert({ name, is_group: members.length > 1 }).select().single();
    if (error) return toast.error("Błąd tworzenia chatu.");
    
    const participants = [...members, profile!.id].map(uid => ({ chat_id: chat.id, user_id: uid }));
    await supabase.from("chat_participants").insert(participants);
    
    fetchChats();
    setActiveChat(chat);
    toast.success("Chat utworzony.");
  };

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6">
      {/* Sidebar Chatów */}
      <Card className="w-80 bg-white/5 border-white/10 flex flex-col">
        <CardHeader className="p-4 border-b border-white/10 flex flex-row items-center justify-between">
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Wiadomości</h2>
          <NewChatDialog officers={allOfficers} onCreated={createGroup} />
        </CardHeader>
        <ScrollArea className="flex-1">
          {chats.map(c => (
            <div key={c.id} onClick={() => setActiveChat(c)} className={`p-4 cursor-pointer hover:bg-white/5 border-b border-white/5 transition-colors ${activeChat?.id === c.id ? 'bg-lapd-gold/10 border-l-4 border-l-lapd-gold' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-lapd-navy rounded flex items-center justify-center border border-lapd-gold/30">
                  {c.is_group ? <Users className="h-5 w-5 text-lapd-gold" /> : <User className="h-5 w-5 text-lapd-gold" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase truncate w-40">{c.name || "Rozmowa prywatna"}</p>
                  <p className="text-[10px] text-slate-500 font-mono">ID: {c.id.substring(0,6)}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </Card>

      {/* Okno Chatu */}
      <Card className="flex-1 bg-white/5 border-white/10 flex flex-col relative overflow-hidden">
        {activeChat ? (
          <>
            <div className="p-4 bg-lapd-navy border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xs font-black text-lapd-gold uppercase">{activeChat.name || "ROZMOWA PRYWATNA"}</h3>
            </div>
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((m) => (
                  <div key={m.id} className={`flex flex-col ${m.author_id === profile?.id ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[10px] font-black text-lapd-gold uppercase">#{m.badge_number} {m.user_name}</span>
                    </div>
                    <div className={`p-3 rounded-lg max-w-[70%] text-sm ${m.author_id === profile?.id ? 'bg-lapd-gold text-lapd-navy rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                      {m.content}
                      {m.attachments?.length > 0 && (
                        <div className="mt-3">
                          <AttachmentList attachments={m.attachments} />
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] text-slate-500 mt-1 uppercase">{new Date(m.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 bg-lapd-navy/50 border-t border-white/10 flex flex-col gap-3">
                <div className="flex gap-2">
                    <FileUploadWidget parentType="chat" parentId={activeChat.id} onUploadSuccess={(files) => {
                        supabase.from("chat_messages").insert({
                            chat_id: activeChat.id,
                            author_id: profile?.id,
                            content: "Przesłano załącznik fotograficzny.",
                            user_name: `${profile?.first_name} ${profile?.last_name}`,
                            badge_number: profile?.badge_number
                        }).select().single().then(({data}) => {
                            if (data) supabase.from("attachments").update({ chat_id: data.id }).in('id', files.map(f => f.id)).then(() => fetchMessages(activeChat.id));
                        });
                    }} />
                    <div className="flex-1 flex gap-2">
                        <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="WPISZ WIADOMOŚĆ..." className="bg-black/40 border-lapd-gold/30 text-white" />
                        <Button onClick={handleSendMessage} disabled={isSending} className="bg-lapd-gold text-lapd-navy"><Send className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20">
            <MessageSquare className="h-20 w-20 mb-4" />
            <p className="uppercase font-black tracking-widest">Wybierz kanał operacyjny</p>
          </div>
        )}
      </Card>
    </div>
  );
};

const NewChatDialog = ({ officers, onCreated }: { officers: any[], onCreated: (name: string, members: string[]) => void }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [name, setName] = useState("");

    return (
        <Dialog>
            <DialogTrigger asChild><Button variant="ghost" size="icon" className="text-lapd-gold hover:bg-white/10"><Plus className="h-5 w-5" /></Button></DialogTrigger>
            <DialogContent className="bg-lapd-darker border-lapd-gold text-white">
                <DialogHeader><DialogTitle className="text-lapd-gold uppercase font-black">Nowa Konwersacja</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="uppercase text-[10px] font-bold">Nazwa Grupy (opcjonalnie)</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="np. Patrol 1" className="bg-black/40 border-lapd-gold/30" />
                    </div>
                    <Label className="uppercase text-[10px] font-bold">Wybierz funkcjonariuszy</Label>
                    <ScrollArea className="h-60 border border-white/10 rounded p-2">
                        {officers.map(o => (
                            <div key={o.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded">
                                <Checkbox checked={selected.includes(o.id)} onCheckedChange={(c) => setSelected(prev => c ? [...prev, o.id] : prev.filter(i => i !== o.id))} className="border-lapd-gold" />
                                <span className="text-xs font-bold">#{o.badge_number} {o.last_name}</span>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <Button onClick={() => onCreated(name, selected)} className="bg-lapd-gold text-lapd-navy font-black w-full uppercase">UTWÓRZ KANAŁ</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ChatsPage;
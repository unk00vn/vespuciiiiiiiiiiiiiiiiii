"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Send, Users, User, Plus, Loader2, Image as ImageIcon, Search, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { AttachmentList } from "@/components/AttachmentList";
import { FileUploadWidget } from "@/components/FileUploadWidget";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
    try {
        const { data, error } = await supabase.from("chat_participants").select(`chat_id, chats(*)`).eq("user_id", profile.id);
        if (error) throw error;
        setChats(data?.map(d => d.chats).filter(Boolean).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || []);
    } catch (err) {
        console.error("Fetch chats error:", err);
    } finally {
        setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    const { data } = await supabase.from("chat_messages").select(`*, attachments(*)`).eq("chat_id", chatId).order("created_at", { ascending: true });
    setMessages(data || []);
    setTimeout(scrollToBottom, 50);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
        const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
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
        if (p.new.chat_id === activeChat.id) {
            setMessages(prev => [...prev, p.new]);
            setTimeout(scrollToBottom, 50);
        }
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
    if (!error) {
        setNewMessage("");
        scrollToBottom();
    } else toast.error("Błąd wysyłania.");
    setIsSending(false);
  };

  const handleFileUpload = async (files: any[]) => {
    if (!activeChat || files.length === 0) return;
    
    const { data: msg, error } = await supabase.from("chat_messages").insert({
        chat_id: activeChat.id,
        author_id: profile?.id,
        content: "Nadesłano dokumentację fotograficzną.",
        user_name: `${profile?.first_name} ${profile?.last_name}`,
        badge_number: profile?.badge_number
    }).select().single();

    if (error) return toast.error("Błąd przesyłania.");
    await supabase.from("attachments").update({ chat_id: msg.id }).in('id', files.map(f => f.id));
    fetchMessages(activeChat.id);
  };

  const createGroup = async (name: string, members: string[]) => {
    try {
        const { data: chat, error: chatError } = await supabase.from("chats").insert({ name: name.trim() || null, is_group: members.length > 1 }).select().single();
        if (chatError) throw chatError;

        const uniqueMembers = Array.from(new Set([...members, profile!.id]));
        const participants = uniqueMembers.map(uid => ({ chat_id: chat.id, user_id: uid }));

        const { error: partError } = await supabase.from("chat_participants").insert(participants);
        if (partError) throw partError;

        toast.success("Konwersacja rozpoczęta.");
        await fetchChats();
        setActiveChat(chat);
    } catch (err: any) {
        toast.error("Błąd: " + err.message);
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 animate-in fade-in duration-500">
      <Card className="w-80 bg-lapd-darker border-white/10 flex flex-col shadow-2xl">
        <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between bg-lapd-navy/50">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sieć Operacyjna</h2>
          <NewChatDialog officers={allOfficers} onCreated={createGroup} />
        </CardHeader>
        <ScrollArea className="flex-1">
          {loading ? (
              <div className="flex justify-center p-12"><Loader2 className="animate-spin text-lapd-gold" /></div>
          ) : chats.length === 0 ? (
              <div className="p-12 text-center text-[10px] text-slate-600 uppercase font-black italic">Brak połączeń</div>
          ) : (
            chats.map(c => (
                <div key={c.id} onClick={() => setActiveChat(c)} className={cn("p-4 cursor-pointer hover:bg-white/5 border-b border-white/5 transition-all group", activeChat?.id === c.id ? 'bg-lapd-gold/5 border-l-4 border-l-lapd-gold' : 'border-l-4 border-l-transparent')}>
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded flex items-center justify-center border transition-colors", activeChat?.id === c.id ? 'bg-lapd-gold border-lapd-gold' : 'bg-lapd-navy border-white/10 group-hover:border-lapd-gold/50')}>
                      {c.is_group ? <Users className={cn("h-5 w-5", activeChat?.id === c.id ? 'text-lapd-navy' : 'text-lapd-gold')} /> : <User className={cn("h-5 w-5", activeChat?.id === c.id ? 'text-lapd-navy' : 'text-lapd-gold')} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-black uppercase truncate", activeChat?.id === c.id ? 'text-lapd-gold' : 'text-white')}>{c.name || "Rozmowa prywatna"}</p>
                      <p className="text-[9px] text-slate-500 font-mono tracking-tighter">SYGNATURA: #{c.id.substring(0,8)}</p>
                    </div>
                    {activeChat?.id === c.id && <ChevronRight className="h-4 w-4 text-lapd-gold animate-pulse" />}
                  </div>
                </div>
              ))
          )}
        </ScrollArea>
      </Card>

      <Card className="flex-1 bg-lapd-darker border-white/10 flex flex-col relative overflow-hidden shadow-2xl">
        {activeChat ? (
          <>
            <div className="p-4 bg-lapd-navy border-b border-lapd-gold/20 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">{activeChat.name || "KANAŁ PRYWATNY"}</h3>
                <p className="text-[8px] text-lapd-gold font-bold uppercase mt-0.5">Połączenie szyfrowane: AES-256</p>
              </div>
            </div>
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((m) => {
                  const isMe = m.author_id === profile?.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                         <span className="text-[9px] font-black text-lapd-gold uppercase tracking-tighter">#{m.badge_number} {m.user_name}</span>
                         <span className="text-[8px] text-slate-600 font-mono">{new Date(m.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div className={cn(
                        "p-3 rounded-lg max-w-[80%] text-sm shadow-lg border",
                        isMe ? 'bg-lapd-gold text-lapd-navy rounded-tr-none border-lapd-gold' : 'bg-white/5 text-slate-200 rounded-tl-none border-white/10'
                      )}>
                        {m.content}
                        {m.attachments?.length > 0 && <div className="mt-3 bg-black/20 p-2 rounded border border-white/5"><AttachmentList attachments={m.attachments} /></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="p-4 bg-lapd-navy/80 border-t border-lapd-gold/30">
                <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-lg border border-white/10 focus-within:border-lapd-gold transition-colors">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-lapd-gold hover:bg-lapd-gold hover:text-lapd-navy rounded">
                                <ImageIcon className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 bg-lapd-darker border-lapd-gold shadow-2xl" side="top" align="start">
                            <div className="p-4"><FileUploadWidget parentType="chat" parentId={activeChat.id} onUploadSuccess={handleFileUpload} /></div>
                        </PopoverContent>
                    </Popover>
                    <Input 
                        value={newMessage} 
                        onChange={e => setNewMessage(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()} 
                        placeholder="NADAJ WIADOMOŚĆ..." 
                        className="flex-1 bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-slate-600 font-bold text-xs h-10" 
                    />
                    <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()} className="bg-lapd-gold text-lapd-navy h-10 px-4 font-black uppercase hover:bg-yellow-500 group">
                        {isSending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                    </Button>
                </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20">
            <div className="relative">
                <MessageSquare className="h-24 w-24 mb-4 text-lapd-gold" />
                <div className="absolute inset-0 animate-ping opacity-20"><MessageSquare className="h-24 w-24 text-lapd-gold" /></div>
            </div>
            <p className="uppercase font-black tracking-[0.5em] text-xs">Oczekiwanie na sygnał...</p>
          </div>
        )}
      </Card>
    </div>
  );
};

const NewChatDialog = ({ officers, onCreated }: { officers: any[], onCreated: (name: string, members: string[]) => void }) => {
    const { profile } = useAuth();
    const [selected, setSelected] = useState<string[]>([]);
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filteredOfficers = officers.filter(o => 
      o.id !== profile?.id && (
        (o.last_name?.toLowerCase() || "").includes(search.toLowerCase()) || 
        (o.badge_number?.toLowerCase() || "").includes(search.toLowerCase())
      )
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-lapd-gold hover:bg-lapd-gold hover:text-lapd-navy rounded border border-lapd-gold/30"><Plus className="h-4 w-4" /></Button></DialogTrigger>
            <DialogContent className="bg-[#0A1A2F] border-2 border-lapd-gold text-white max-w-md">
                <DialogHeader><DialogTitle className="text-lapd-gold uppercase font-black tracking-tighter">Otwórz Nowy Kanał</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Kryptonim Rozmowy (opcjonalnie)</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="np. ADAM-10" className="bg-black/40 border-lapd-gold/30 text-white font-bold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Wybierz Uczestników</Label>
                        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" /><Input placeholder="Szukaj po nazwisku lub odznace..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-black/20 border-white/10 text-xs" /></div>
                        <ScrollArea className="h-60 border border-white/10 rounded mt-2 p-1 bg-black/20">
                            {filteredOfficers.map(o => (
                                <div key={o.id} className="flex items-center gap-3 p-2.5 hover:bg-lapd-gold/10 rounded transition-colors group cursor-pointer" onClick={() => setSelected(prev => selected.includes(o.id) ? prev.filter(i => i !== o.id) : [...prev, o.id])}>
                                    <Checkbox id={`user-${o.id}`} checked={selected.includes(o.id)} onCheckedChange={() => {}} className="border-lapd-gold data-[state=checked]:bg-lapd-gold data-[state=checked]:text-lapd-navy" />
                                    <div className="flex-1 min-w-0"><p className="text-xs font-bold text-white uppercase group-hover:text-lapd-gold transition-colors">#{o.badge_number} {o.last_name}</p><p className="text-[9px] text-slate-500 uppercase">{o.role_name}</p></div>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => { onCreated(name, selected); setOpen(false); setSelected([]); setName(""); }} className="bg-lapd-gold text-lapd-navy font-black w-full uppercase h-12 shadow-lg hover:bg-yellow-500">UTWÓRZ POŁĄCZENIE OPERACYJNE</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ChatsPage;
"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useRealtimeChat = (chatId?: string) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId || !profile) return;

    // Pobierz historię
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      setMessages(data || []);
      setLoading(false);
    };

    fetchHistory();

    // Subskrypcja Real-time
    const channel = supabase.channel(`chat:${chatId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages', 
        filter: `chat_id=eq.${chatId}` 
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, profile]);

  const sendMessage = async (content: string) => {
    if (!profile || !chatId) return;
    const { error } = await supabase.from('chat_messages').insert({
      chat_id: chatId,
      author_id: profile.id,
      user_name: `${profile.first_name} ${profile.last_name}`,
      badge_number: profile.badge_number,
      content
    });
    if (error) toast.error("Błąd wysyłania wiadomości.");
  };

  return { messages, loading, sendMessage };
};
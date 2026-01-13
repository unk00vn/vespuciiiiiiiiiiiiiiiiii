"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  user: string;
  badgeNumber: string;
  content: string;
  timestamp: Date;
}

export const ChatWidget = () => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mock messages for demonstration
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: "1",
        user: "Officer Johnson",
        badgeNumber: "LSPD-1245",
        content: "Patrol unit 3 responding to incident at Vespucci Beach",
        timestamp: new Date(Date.now() - 300000),
      },
      {
        id: "2",
        user: "Sergeant Davis",
        badgeNumber: "LSPD-0089",
        content: "Copy that, backup is on the way",
        timestamp: new Date(Date.now() - 240000),
      },
      {
        id: "3",
        user: "Lieutenant Smith",
        badgeNumber: "LSPD-0012",
        content: "All units be advised: suspect is considered armed and dangerous",
        timestamp: new Date(Date.now() - 180000),
      },
    ];
    setMessages(mockMessages);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !profile) return;

    const message: Message = {
      id: Date.now().toString(),
      user: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unknown Officer",
      badgeNumber: profile.badge_number,
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
        <Button
          variant="ghost"
          size="sm"
          className="text-lapd-white hover:bg-lapd-gold"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
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
          />
          <Button
            size="sm"
            className="bg-lapd-gold text-lapd-navy hover:bg-yellow-600"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
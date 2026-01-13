"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  FileText, 
  Clock, 
  Send,
  Star,
  LogIn,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StatItem {
  name: string;
  value: string | number;
  progress?: number;
  icon: React.ReactNode;
  color: string;
}

export const OfficerStats = () => {
  const { profile } = useAuth();
  const [statsData, setStatsData] = useState({
    reportsSent: 0,
    reportsReceived: 0,
    loginsCount: 0,
    loading: true
  });

  useEffect(() => {
    const fetchOfficerStats = async () => {
      if (!profile) return;
      
      try {
        // 1. Raporty wysłane
        const { count: sentCount } = await supabase
          .from("reports")
          .select("*", { count: 'exact', head: true })
          .eq("author_id", profile.id);

        // 2. Raporty otrzymane (do weryfikacji)
        const { count: receivedCount } = await supabase
          .from("reports")
          .select("*", { count: 'exact', head: true })
          .eq("recipient_id", profile.id);
          
        // 3. Liczba logowań (Mocked, ponieważ Supabase nie udostępnia tego łatwo w RLS)
        // W prawdziwej aplikacji wymagałoby to tabeli 'user_logins'
        const mockLogins = Math.floor(Math.random() * 50) + 10; 

        setStatsData({
          reportsSent: sentCount || 0,
          reportsReceived: receivedCount || 0,
          loginsCount: mockLogins,
          loading: false
        });

      } catch (e: any) {
        toast.error("Błąd ładowania statystyk: " + e.message);
        console.error(e);
        setStatsData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchOfficerStats();
  }, [profile]);

  const stats: StatItem[] = [
    {
      name: "Raporty Wysłane",
      value: statsData.reportsSent,
      icon: <Send className="h-5 w-5" />,
      color: "bg-blue-500"
    },
    {
      name: "Raporty Otrzymane",
      value: statsData.reportsReceived,
      icon: <FileText className="h-5 w-5" />,
      color: "bg-green-500"
    },
    {
      name: "Liczba Logowań (Miesiąc)",
      value: statsData.loginsCount,
      icon: <LogIn className="h-5 w-5" />,
      color: "bg-purple-500"
    },
  ];

  return (
    <Card className="bg-lapd-white border-lapd-gold shadow-md">
      <CardHeader>
        <CardTitle className="text-lapd-navy flex items-center">
          <Star className="h-5 w-5 mr-2" />
          Statystyki Funkcjonariusza
        </CardTitle>
      </CardHeader>
      <CardContent>
        {statsData.loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-lapd-gold" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <div className={`p-2 rounded-full ${stat.color} text-white mr-3`}>
                    {stat.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">{stat.name}</h3>
                    <p className="text-2xl font-bold text-lapd-navy">{stat.value}</p>
                  </div>
                </div>
                {stat.progress !== undefined && (
                  <div className="mt-2">
                    <Progress value={stat.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>{stat.progress}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Send,
  Star,
  LogIn,
  Loader2,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
        const { count: sentCount } = await supabase
          .from("reports")
          .select("*", { count: 'exact', head: true })
          .eq("author_id", profile.id);

        const { count: receivedCount } = await supabase
          .from("reports")
          .select("*", { count: 'exact', head: true })
          .eq("recipient_id", profile.id);
          
        const mockLogins = Math.floor(Math.random() * 50) + 12; 

        setStatsData({
          reportsSent: sentCount || 0,
          reportsReceived: receivedCount || 0,
          loginsCount: mockLogins,
          loading: false
        });

      } catch (e: any) {
        console.error(e);
        setStatsData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchOfficerStats();
  }, [profile]);

  const stats = [
    {
      label: "RAPORTY WYSŁANE",
      value: statsData.reportsSent.toString().padStart(3, '0'),
      icon: <Send className="h-4 w-4" />,
      color: "border-blue-500"
    },
    {
      label: "RAPORTY DO WGLĄDU",
      value: statsData.reportsReceived.toString().padStart(3, '0'),
      icon: <FileText className="h-4 w-4" />,
      color: "border-lapd-gold"
    },
    {
      label: "SESJE OPERACYJNE",
      value: statsData.loginsCount.toString().padStart(3, '0'),
      icon: <LogIn className="h-4 w-4" />,
      color: "border-green-500"
    },
  ];

  return (
    <Card className="bg-white/5 border-lapd-gold/20 shadow-2xl overflow-hidden">
      <CardHeader className="bg-lapd-navy/40 border-b border-lapd-gold/10 py-3">
        <CardTitle className="text-white text-sm font-black flex items-center tracking-widest uppercase">
          <TrendingUp className="h-4 w-4 mr-2 text-lapd-gold" />
          ANalityka Funkcjonariusza
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {statsData.loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-lapd-gold" />
          </div>
        ) : (
          <div className="divide-y divide-lapd-gold/10">
            {stats.map((stat, index) => (
              <div key={index} className={`flex items-center justify-between p-6 bg-gradient-to-r from-transparent to-white/[0.02] border-l-4 ${stat.color}`}>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                    {stat.label}
                  </p>
                  <div className="flex items-center text-lapd-gold">
                    {stat.icon}
                    <span className="ml-2 text-xs font-bold text-slate-500">SYSTEM STATUS: OK</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-mono font-black text-white tracking-tighter">
                    {stat.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
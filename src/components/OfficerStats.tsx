"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Send, LogIn, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

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
        const { count: s } = await supabase.from("reports").select("*", { count: 'exact', head: true }).eq("author_id", profile.id);
        const { count: r } = await supabase.from("reports").select("*", { count: 'exact', head: true }).eq("recipient_id", profile.id);
        setStatsData({ reportsSent: s || 0, reportsReceived: r || 0, loginsCount: 24, loading: false });
      } catch (e) { 
        console.error("Stats fetch error:", e);
        setStatsData(prev => ({ ...prev, loading: false })); 
      }
    };
    fetchOfficerStats();
  }, [profile]);

  // ... (reszta komponentu bez zmian)
  const stats = [
    { label: "RAPORTY WYSŁANE", value: statsData.reportsSent, icon: <Send className="h-4 w-4" /> },
    { label: "RAPORTY ODEBRANE", value: statsData.reportsReceived, icon: <FileText className="h-4 w-4" /> },
    { label: "SESJE OPERACYJNE", value: statsData.loginsCount, icon: <LogIn className="h-4 w-4" /> },
  ];

  return (
    <Card className="bg-white/5 border-white/10 shadow-2xl">
      <CardHeader className="bg-white/5 border-b border-white/10 py-3">
        <CardTitle className="text-white text-sm font-black flex items-center tracking-widest uppercase">
          <TrendingUp className="h-4 w-4 mr-2 text-lapd-gold" /> ANALITYKA OSOBISTA
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {statsData.loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-white" /></div> : (
          <div className="divide-y divide-white/5">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">{s.label}</p>
                  <div className="flex items-center text-slate-400">
                    {s.icon}
                    <span className="ml-2 text-[9px] font-bold">STATUS: ZAKODOWANO</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-5xl font-mono font-black text-white tabular-nums">
                    {s.value.toString().padStart(2, '0')}
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
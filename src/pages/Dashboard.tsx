"use client";

import React, { useEffect, useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell, FileText, Users, AlertTriangle, Loader2 } from "lucide-react";
import { OfficerStats } from "@/components/OfficerStats";
import { ReportStatsChart } from "@/components/ReportStatsChart";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    reportsToReview: 0,
    totalOfficers: 0,
    pendingAccounts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile) return;
      const { count: rCount } = await supabase.from("reports").select("*", { count: 'exact', head: true }).eq("recipient_id", profile.id).eq("status", "Oczekujący");
      const { count: oCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true }).eq("status", "approved");
      const { count: pCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true }).eq("status", "pending");

      setStats({
        reportsToReview: rCount || 0,
        totalOfficers: oCount || 0,
        pendingAccounts: pCount || 0
      });
      setLoading(false);
    };
    fetchStats();
  }, [profile]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center border-b border-lapd-gold/30 pb-6">
        <div>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter">
            WITAJ, <span className="text-lapd-gold italic">{profile?.first_name || "OFFICER"}</span>
          </h1>
          <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.3em] mt-2">
            LSPD Central Terminal • Secure Connection Established
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Konta Oczekujące", val: stats.pendingAccounts, icon: <Bell className="h-4 w-4" /> },
          { title: "Raporty do wglądu", val: stats.reportsToReview, icon: <FileText className="h-4 w-4" /> },
          { title: "Aktywny Personel", val: stats.totalOfficers, icon: <Users className="h-4 w-4" /> },
          { title: "Status Systemu", val: "ACTIVE", icon: <AlertTriangle className="h-4 w-4" /> }
        ].map((s, i) => (
          <Card key={i} className="bg-white/5 border-white/10 hover:border-lapd-gold/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.title}</CardTitle>
              <div className="text-lapd-gold">{s.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-mono font-black text-white">
                {loading ? "..." : s.val}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <OfficerStats />
        </div>
        <div className="lg:col-span-2">
          <ReportStatsChart profileId={profile?.id || ""} />
        </div>
      </div>
      
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;
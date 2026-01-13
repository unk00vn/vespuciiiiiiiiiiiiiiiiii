"use client";

import React, { useEffect, useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell, FileText, Users, AlertTriangle, Loader2 } from "lucide-react";
import { OfficerStats } from "@/components/OfficerStats";
import { QuickActions } from "@/components/QuickActions";
import { RecentIncidents } from "@/components/RecentIncidents";
import { ActivePatrols } from "@/components/ActivePatrols";
import { ReportStatsChart } from "@/components/ReportStatsChart";
import { supabase, testDatabaseConnection } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center border-b border-lapd-gold/30 pb-4">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">
            WITAJ, <span className="text-lapd-gold">{profile?.first_name || "FUNKCJONARIUSZU"}</span>!
          </h1>
          <p className="text-slate-200 font-bold uppercase text-xs tracking-widest mt-1">Terminal Operacyjny LSPD • Status: Online</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Oczekujące Konta", val: stats.pendingAccounts, icon: <Bell />, desc: "Do zatwierdzenia" },
          { title: "Do Przejrzenia", val: stats.reportsToReview, icon: <FileText />, desc: "Twoje raporty" },
          { title: "Stan Osobowy", val: stats.totalOfficers, icon: <Users />, desc: "Zatwierdzeni" },
          { title: "Aktywne Zdarzenia", val: 7, icon: <AlertTriangle />, desc: "Wymagają uwagi" }
        ].map((s, i) => (
          <Card key={i} className="bg-white/5 border-lapd-gold/20 hover:border-lapd-gold transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black text-lapd-gold uppercase">{s.title}</CardTitle>
              <div className="text-lapd-gold">{s.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{loading ? "..." : s.val}</div>
              <p className="text-[10px] text-slate-300 font-bold uppercase mt-1">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <div>
          <OfficerStats />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentIncidents />
        <ActivePatrols />
      </div>

      <ReportStatsChart profileId={profile?.id || ""} />
      
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;
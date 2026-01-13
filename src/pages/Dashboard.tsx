"use client";

import React, { useEffect, useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell, FileText, Users, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { OfficerStats } from "@/components/OfficerStats";
import { ReportStatsChart } from "@/components/ReportStatsChart";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    reportsToReview: 0,
    totalOfficers: 0,
    pendingAccounts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = async () => {
    if (!profile) return;
    setLoading(true);
    setError(false);

    const safetyTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError(true);
      }
    }, 6000);

    try {
      const [rCount, oCount, pCount] = await Promise.all([
        supabase.from("reports").select("*", { count: 'exact', head: true }).eq("recipient_id", profile.id).eq("status", "Oczekujący"),
        supabase.from("profiles").select("*", { count: 'exact', head: true }).eq("status", "approved"),
        supabase.from("profiles").select("*", { count: 'exact', head: true }).eq("status", "pending")
      ]);

      setStats({
        reportsToReview: rCount.count || 0,
        totalOfficers: oCount.count || 0,
        pendingAccounts: pCount.count || 0
      });
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError(true);
    } finally {
      clearTimeout(safetyTimeout);
      setLoading(false);
    }
  };

  useEffect(() => {
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
        {error && (
          <Button onClick={fetchStats} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
            <RefreshCw className="h-4 w-4 mr-2" /> PONÓW PRÓBĘ
          </Button>
        )}
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-lg text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-500 font-bold">BŁĄD POŁĄCZENIA Z BAZĄ DANYCH</p>
          <p className="text-xs text-slate-400 mt-2 uppercase">Serwer nie odpowiedział w wymaganym czasie. Sprawdź połączenie.</p>
        </div>
      ) : (
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
                  {loading ? <Loader2 className="h-6 w-6 animate-spin text-slate-700" /> : s.val}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
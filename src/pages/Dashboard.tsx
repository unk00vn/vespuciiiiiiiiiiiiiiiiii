"use client";

import React, { useEffect, useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell, FileText, Users, AlertTriangle, Loader2 } from "lucide-react";
import { OfficerStats } from "@/components/OfficerStats";
import { QuickActions } from "@/components/QuickActions";
import { RecentIncidents } from "@/components/RecentIncidents";
import { IncidentStatsChart } from "@/components/IncidentStatsChart";
import { ActivePatrols } from "@/components/ActivePatrols";
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

      // 1. Raporty do przejrzenia (skierowane do mnie i oczekujące)
      const { count: reportsCount } = await supabase
        .from("reports")
        .select("*", { count: 'exact', head: true })
        .eq("recipient_id", profile.id)
        .eq("status", "Oczekujący");

      // 2. Wszyscy zatwierdzeni funkcjonariusze
      const { count: officersCount } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .eq("status", "approved");

      // 3. Oczekujące konta (dla kadry)
      const { count: pendingCount } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .eq("status", "pending");

      setStats({
        reportsToReview: reportsCount || 0,
        totalOfficers: officersCount || 0,
        pendingAccounts: pendingCount || 0
      });
      setLoading(false);
    };

    fetchStats();
  }, [profile]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-lapd-navy uppercase tracking-tighter">
        Witaj, {profile?.first_name || "Funkcjonariuszu"}!
      </h1>
      <p className="text-gray-700">Przeglądaj najważniejsze informacje i szybkie skróty.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-lapd-white border-lapd-gold shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-lapd-navy uppercase">
              Oczekujące Konta
            </CardTitle>
            <Bell className="h-4 w-4 text-lapd-gold" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <div className="text-2xl font-black text-lapd-navy">{stats.pendingAccounts}</div>
            )}
            <p className="text-xs text-gray-500">Do zatwierdzenia przez LT+</p>
          </CardContent>
        </Card>
        
        <Card className="bg-lapd-white border-lapd-gold shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-lapd-navy uppercase">
              Raporty do Przejrzenia
            </CardTitle>
            <FileText className="h-4 w-4 text-lapd-gold" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <div className="text-2xl font-black text-lapd-navy">{stats.reportsToReview}</div>
            )}
            <p className="text-xs text-gray-500">Skierowane bezpośrednio do Ciebie</p>
          </CardContent>
        </Card>
        
        <Card className="bg-lapd-white border-lapd-gold shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-lapd-navy uppercase">
              Funkcjonariusze
            </CardTitle>
            <Users className="h-4 w-4 text-lapd-gold" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <div className="text-2xl font-black text-lapd-navy">{stats.totalOfficers}</div>
            )}
            <p className="text-xs text-gray-500">Aktywne i zatwierdzone konta</p>
          </CardContent>
        </Card>
        
        <Card className="bg-lapd-white border-lapd-gold shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-lapd-navy uppercase">
              Aktywne Incydenty
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-lapd-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-lapd-navy">7</div>
            <p className="text-xs text-gray-500">Wymagają interwencji</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <div>
          <OfficerStats />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentIncidents />
        <ActivePatrols />
      </div>
      
      <IncidentStatsChart />
      
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;
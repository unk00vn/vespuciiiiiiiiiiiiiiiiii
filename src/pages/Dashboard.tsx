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
import { LoadingSpinner } from "@/components/LoadingSpinner";

const Dashboard = () => {
  const { profile, loading: authLoading, error: authError } = useAuth();
  const [stats, setStats] = useState({ 
    reportsToReview: 0, 
    totalOfficers: 0, 
    pendingAccounts: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!profile) return;
    
    setLoading(true);
    setError(null);
    
    // Safety timeout
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Request timeout. Please try again.");
      }
    }, 8000);

    try {
      const [rCount, oCount, pCount] = await Promise.all([
        supabase.from("reports")
          .select("*", { count: 'exact', head: true })
          .eq("recipient_id", profile.id)
          .eq("status", "Oczekujący"),
        supabase.from("profiles")
          .select("*", { count: 'exact', head: true })
          .eq("status", "approved"),
        supabase.from("profiles")
          .select("*", { count: 'exact', head: true })
          .eq("status", "pending")
      ]);

      setStats({
        reportsToReview: rCount.count || 0,
        totalOfficers: oCount.count || 0,
        pendingAccounts: pCount.count || 0
      });
    } catch (err: any) {
      console.error("Dashboard stats error:", err);
      setError("Failed to load dashboard data: " + err.message);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && !authLoading) {
      fetchStats();
    }
  }, [profile, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lapd-navy">
        <LoadingSpinner message="Loading dashboard..." size="lg" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lapd-navy p-4">
        <div className="bg-red-500/10 border border-red-500/50 p-8 rounded-lg max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h2>
          <p className="text-slate-300 mb-6">{authError}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-lapd-gold text-lapd-navy font-black"
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lapd-navy">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-lapd-gold mx-auto mb-4" />
          <p className="text-lapd-gold">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center border-b border-lapd-gold/30 pb-6">
        <div>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter">
            WELCOME, <span className="text-lapd-gold italic">{profile?.first_name || "OFFICER"}</span>
          </h1>
          <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.3em] mt-2">
            LSPD Central Terminal • Secure Connection Established
          </p>
        </div>
        {(error || authError) && (
          <Button 
            onClick={fetchStats} 
            variant="outline" 
            className="border-red-500 text-red-500 hover:bg-red-500/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> RETRY
          </Button>
        )}
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-lg text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-500 font-bold">{error}</p>
          <Button 
            onClick={fetchStats} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> TRY AGAIN
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: "Pending Accounts", 
              val: stats.pendingAccounts, 
              icon: <Bell className="h-4 w-4" /> 
            },
            { 
              title: "Reports to Review", 
              val: stats.reportsToReview, 
              icon: <FileText className="h-4 w-4" /> 
            },
            { 
              title: "Active Personnel", 
              val: stats.totalOfficers, 
              icon: <Users className="h-4 w-4" /> 
            },
            { 
              title: "System Status", 
              val: "ACTIVE", 
              icon: <AlertTriangle className="h-4 w-4" /> 
            }
          ].map((s, i) => (
            <Card 
              key={i} 
              className="bg-white/5 border-white/10 hover:border-lapd-gold/50 transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {s.title}
                </CardTitle>
                <div className="text-lapd-gold">{s.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-mono font-black text-white">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-slate-700" />
                  ) : s.val}
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
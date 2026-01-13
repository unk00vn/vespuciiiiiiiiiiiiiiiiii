"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, subDays } from "date-fns";

interface DailyReportStats {
  date: string;
  Wysłane: number;
  Otrzymane: number;
  Zakończone: number;
}

export const ReportStatsChart = ({ profileId }: { profileId: string }) => {
  const [data, setData] = useState<DailyReportStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportStats = async () => {
      setLoading(true);
      try {
        const thirtyDaysAgo = subDays(new Date(), 30);
        
        const { data: reportsData, error } = await supabase
          .from("reports")
          .select("created_at, author_id, recipient_id, status")
          .or(`author_id.eq.${profileId},recipient_id.eq.${profileId}`)
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: true });

        if (error) throw error;

        const dailyStatsMap = new Map<string, { Wysłane: number, Otrzymane: number, Zakończone: number }>();
        
        for (let i = 0; i < 30; i++) {
          const date = subDays(new Date(), 29 - i);
          const dateKey = format(date, 'dd/MM');
          dailyStatsMap.set(dateKey, { Wysłane: 0, Otrzymane: 0, Zakończone: 0 });
        }

        reportsData.forEach(report => {
          const date = new Date(report.created_at);
          const dateKey = format(date, 'dd/MM');
          
          if (dailyStatsMap.has(dateKey)) {
            const stats = dailyStatsMap.get(dateKey)!;

            if (report.author_id === profileId) {
              stats.Wysłane += 1;
            }
            if (report.recipient_id === profileId) {
              stats.Otrzymane += 1;
            }
            if (report.status === 'Zakończony' && (report.author_id === profileId || report.recipient_id === profileId)) {
              stats.Zakończone += 1;
            }
            dailyStatsMap.set(dateKey, stats);
          }
        });

        const chartData: DailyReportStats[] = Array.from(dailyStatsMap.entries()).map(([date, stats]) => ({
          date: date,
          ...stats,
        }));

        setData(chartData);

      } catch (e: any) {
        toast.error("Błąd ładowania statystyk raportów: " + e.message);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchReportStats();
    }
  }, [profileId]);

  return (
    <Card className="bg-white/5 border-lapd-gold shadow-md text-white">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-lapd-gold" />
          Statystyki Raportów (Ostatnie 30 dni)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-lapd-gold" />
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tickFormatter={(tick) => tick.split('/')[0]} stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A1A2F', 
                    borderColor: '#C9A635',
                    color: 'white'
                  }}
                />
                <Legend />
                <Bar dataKey="Wysłane" fill="#C9A635" name="Wysłane przez Ciebie" />
                <Bar dataKey="Otrzymane" fill="#10B981" name="Otrzymane do weryfikacji" />
                <Bar dataKey="Zakończone" fill="#3B82F6" name="Zakończone" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
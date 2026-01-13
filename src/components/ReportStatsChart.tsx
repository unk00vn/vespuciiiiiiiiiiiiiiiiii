"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FileText, CheckCircle, Clock, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface MonthlyReportStats {
  month: string;
  Wysłane: number;
  Otrzymane: number;
  Zakończone: number;
}

const getMonthName = (monthIndex: number) => {
  const names = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
  return names[monthIndex];
};

export const ReportStatsChart = ({ profileId }: { profileId: string }) => {
  const [data, setData] = useState<MonthlyReportStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportStats = async () => {
      setLoading(true);
      try {
        // Pobieramy wszystkie raporty, które dotyczą tego profilu (autor lub adresat)
        const { data: reportsData, error } = await supabase
          .from("reports")
          .select("created_at, author_id, recipient_id, status")
          .or(`author_id.eq.${profileId},recipient_id.eq.${profileId}`)
          .order("created_at", { ascending: true });

        if (error) throw error;

        const monthlyStatsMap = new Map<string, { Wysłane: number, Otrzymane: number, Zakończone: number }>();
        const now = new Date();
        const currentYear = now.getFullYear();
        
        // Inicjalizacja statystyk dla ostatnich 6 miesięcy
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          monthlyStatsMap.set(monthKey, { Wysłane: 0, Otrzymane: 0, Zakończone: 0 });
        }

        reportsData.forEach(report => {
          const date = new Date(report.created_at);
          const reportYear = date.getFullYear();
          const monthKey = `${reportYear}-${date.getMonth()}`;
          
          if (monthlyStatsMap.has(monthKey)) {
            const stats = monthlyStatsMap.get(monthKey)!;

            if (report.author_id === profileId) {
              stats.Wysłane += 1;
            }
            if (report.recipient_id === profileId) {
              stats.Otrzymane += 1;
            }
            if (report.status === 'Zakończony' && (report.author_id === profileId || report.recipient_id === profileId)) {
              stats.Zakończone += 1;
            }
            monthlyStatsMap.set(monthKey, stats);
          }
        });

        const chartData: MonthlyReportStats[] = Array.from(monthlyStatsMap.entries()).map(([key, stats]) => {
          const [, monthIndexStr] = key.split('-');
          return {
            month: getMonthName(parseInt(monthIndexStr)),
            ...stats,
          };
        });

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
    <Card className="bg-lapd-white border-lapd-gold shadow-md">
      <CardHeader>
        <CardTitle className="text-lapd-navy flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Statystyki Raportów (Ostatnie 6 miesięcy)
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
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
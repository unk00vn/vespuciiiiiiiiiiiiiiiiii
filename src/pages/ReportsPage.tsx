"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, FileText, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const ReportsPage = () => {
  const { profile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      if (!profile) return;
      
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          author:profiles!author_id(first_name, last_name, badge_number),
          recipient:profiles!recipient_id(first_name, last_name)
        `)
        .or(`author_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setReports(data);
      }
      setLoading(false);
    };
    fetchReports();
  }, [profile]);

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.author?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-lapd-navy">Dziennik Raportów</h1>
          <p className="text-gray-500 text-sm mt-1">Podgląd raportów własnych oraz skierowanych do Ciebie.</p>
        </div>
        <Button asChild className="bg-lapd-gold text-lapd-navy hover:bg-yellow-600 shadow-md font-bold">
          <Link to="/reports/new">
            <PlusCircle className="mr-2 h-4 w-4" /> UTWÓRZ NOWY RAPORT
          </Link>
        </Button>
      </div>

      <Card className="bg-lapd-white border-lapd-gold shadow-xl overflow-hidden">
        <CardHeader className="bg-lapd-navy/5 border-b border-lapd-gold/20 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-lapd-navy font-bold uppercase tracking-wide">Archiwum Systemowe</CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Szukaj po tytule lub autorze..."
                className="pl-10 border-lapd-gold focus:ring-lapd-navy bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-lapd-gold" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-lapd-navy hover:bg-lapd-navy">
                    <TableHead className="text-lapd-white uppercase text-xs font-bold">ID / Data</TableHead>
                    <TableHead className="text-lapd-white uppercase text-xs font-bold">Tytuł Zdarzenia</TableHead>
                    <TableHead className="text-lapd-white uppercase text-xs font-bold">Autor</TableHead>
                    <TableHead className="text-lapd-white uppercase text-xs font-bold">Adresat</TableHead>
                    <TableHead className="text-lapd-white uppercase text-xs font-bold">Status</TableHead>
                    <TableHead className="text-lapd-white text-right uppercase text-xs font-bold px-6">Opcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50 border-b border-gray-100">
                      <TableCell className="font-mono text-[11px] text-gray-500">
                        #{report.id.substring(0, 8)}<br/>{report.date}
                      </TableCell>
                      <TableCell className="font-bold text-lapd-navy">{report.title}</TableCell>
                      <TableCell className="text-sm">
                        {report.author?.first_name} {report.author?.last_name}<br/>
                        <span className="text-[10px] text-gray-400 font-bold">#{report.author?.badge_number}</span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {report.recipient?.first_name} {report.recipient?.last_name}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "uppercase text-[10px] font-bold px-2 py-0.5",
                          report.status === "Zakończony" ? "bg-green-500" : 
                          report.status === "Oczekujący" ? "bg-amber-500" : "bg-blue-500"
                        )}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <Button variant="ghost" size="sm" className="text-lapd-navy hover:bg-lapd-gold/20 font-bold text-xs">
                          SZCZEGÓŁY
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredReports.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-gray-400">
                        Brak zarejestrowanych raportów w Twoim dzienniku.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
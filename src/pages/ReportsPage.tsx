"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, Loader2, Archive, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ReportsPage = () => {
  const { profile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReports = async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from("reports")
      .select(`*, author:profiles!author_id(first_name, last_name, badge_number), recipient:profiles!recipient_id(first_name, last_name, badge_number)`)
      .or(`author_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
      .order("created_at", { ascending: false });

    if (!error && data) setReports(data);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [profile]);

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.author?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeReports = filteredReports.filter(r => r.status === "Oczekujący" || r.status === "W toku");
  const archivedReports = filteredReports.filter(r => r.status === "Zakończony" || r.status === "Odrzucony");

  const ReportTable = ({ data }: { data: any[] }) => (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-lapd-gold font-bold uppercase text-xs">Sygnatura</TableHead>
            <TableHead className="text-white font-bold uppercase text-xs">Zdarzenie</TableHead>
            <TableHead className="text-white font-bold uppercase text-xs">Funkcjonariusz</TableHead>
            <TableHead className="text-white font-bold uppercase text-xs">Status</TableHead>
            <TableHead className="text-right text-lapd-gold font-bold uppercase text-xs">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((report) => (
            <TableRow key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <TableCell className="font-mono text-xs text-lapd-gold/80">#{report.id.substring(0, 8)}</TableCell>
              <TableCell className="font-semibold text-white">{report.title}</TableCell>
              <TableCell className="text-sm text-slate-300">
                <span className="text-lapd-gold font-bold">#{report.author?.badge_number}</span> {report.author?.last_name}
              </TableCell>
              <TableCell>
                <Badge className={`text-[10px] font-bold px-2 py-0.5 border-2 ${
                  report.status === "Zakończony" ? "border-green-500/50 bg-green-500/10 text-green-400" : 
                  report.status === "Odrzucony" ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-amber-500/50 bg-amber-500/10 text-amber-400"
                }`}>
                  {report.status.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" className="h-8 border-lapd-gold/30 text-lapd-gold hover:bg-lapd-gold hover:text-black font-bold text-[10px]">DETALE</Button>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-slate-500 italic">Brak raportów w tej sekcji.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-lapd-gold/30 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">System Raportowy</h1>
          <p className="text-slate-400 font-medium text-sm mt-1">Los Santos Police Department • Vespucci Division</p>
        </div>
        <Button asChild className="bg-lapd-gold text-black font-black h-11 px-6 hover:bg-yellow-500">
          <Link to="/reports/new"><PlusCircle className="mr-2 h-5 w-5" /> UTWÓRZYJ NOWY RAPORT</Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
        <Input 
          placeholder="Szukaj po tytule lub nazwisku..." 
          className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-1 focus:ring-lapd-gold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-white/5 p-1 mb-6 border border-white/10">
          <TabsTrigger value="active" className="data-[state=active]:bg-lapd-gold data-[state=active]:text-black text-slate-400 font-bold px-6">
            <ClipboardList className="mr-2 h-4 w-4" /> AKTYWNE ({activeReports.length})
          </TabsTrigger>
          <TabsTrigger value="archive" className="data-[state=active]:bg-lapd-gold data-[state=active]:text-black text-slate-400 font-bold px-6">
            <Archive className="mr-2 h-4 w-4" /> ARCHIWUM ({archivedReports.length})
          </TabsTrigger>
        </TabsList>

        {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-lapd-gold h-12 w-12" /></div> : (
          <>
            <TabsContent value="active" className="m-0"><ReportTable data={activeReports} /></TabsContent>
            <TabsContent value="archive" className="m-0"><ReportTable data={archivedReports} /></TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default ReportsPage;
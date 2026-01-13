"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, Loader2, Archive, FileText, ClipboardList } from "lucide-react";
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-lapd-gold/20 hover:bg-transparent">
            <TableHead className="text-lapd-gold font-black uppercase text-[10px]">Sygnatura</TableHead>
            <TableHead className="text-lapd-gold font-black uppercase text-[10px]">Zdarzenie</TableHead>
            <TableHead className="text-lapd-gold font-black uppercase text-[10px]">Oficer</TableHead>
            <TableHead className="text-lapd-gold font-black uppercase text-[10px]">Status</TableHead>
            <TableHead className="text-right text-lapd-gold font-black uppercase text-[10px]">Opcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((report) => (
            <TableRow key={report.id} className="border-b border-lapd-gray/30 hover:bg-lapd-navy/20">
              <TableCell className="font-mono text-[10px] text-muted-foreground uppercase">#{report.id.substring(0, 8)}</TableCell>
              <TableCell className="font-bold text-sm tracking-tight">{report.title}</TableCell>
              <TableCell className="text-xs">
                <span className="font-black">#{report.author?.badge_number}</span> {report.author?.last_name}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`text-[9px] font-black uppercase border-2 ${
                  report.status === "Zakończony" ? "border-green-500 text-green-500" : 
                  report.status === "Odrzucony" ? "border-red-500 text-red-500" : "border-lapd-gold text-lapd-gold"
                }`}>
                  {report.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="text-lapd-gold hover:bg-lapd-gold/10 font-black text-[10px]">DETALE</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end border-b-4 border-lapd-gold pb-4">
        <div>
          <h1 className="text-5xl font-black text-lapd-gold uppercase italic tracking-tighter">System Raportowy</h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1">Vespucci Police Station • Los Santos Police Department</p>
        </div>
        <Button asChild className="bg-lapd-gold text-lapd-navy font-black h-12 px-8 hover:scale-105 transition-transform">
          <Link to="/reports/new"><PlusCircle className="mr-2 h-5 w-5" /> NOWY RAPORT</Link>
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-lapd-navy/30 p-4 rounded-lg border border-lapd-gray">
        <Search className="text-lapd-gold h-5 w-5" />
        <Input 
          placeholder="WYSZUKAJ W ARCHIWACH..." 
          className="bg-transparent border-none focus:ring-0 text-lapd-gold font-bold placeholder:text-lapd-gold/30"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-transparent border-b border-lapd-gray w-full justify-start rounded-none h-auto p-0 mb-6">
          <TabsTrigger value="active" className="rounded-none border-b-2 border-transparent data-[state=active]:border-lapd-gold data-[state=active]:bg-transparent text-muted-foreground data-[state=active]:text-lapd-gold px-8 py-4 font-black uppercase text-xs transition-all">
            <ClipboardList className="mr-2 h-4 w-4" /> Raporty Aktywne ({activeReports.length})
          </TabsTrigger>
          <TabsTrigger value="archive" className="rounded-none border-b-2 border-transparent data-[state=active]:border-lapd-gold data-[state=active]:bg-transparent text-muted-foreground data-[state=active]:text-lapd-gold px-8 py-4 font-black uppercase text-xs transition-all">
            <Archive className="mr-2 h-4 w-4" /> Archiwum Systemowe ({archivedReports.length})
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
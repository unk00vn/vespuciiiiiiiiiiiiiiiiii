"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, FileText, Search, Loader2, MapPin, Clock, User, Calendar, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const ReportsPage = () => {
  const { profile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchReports = async () => {
    if (!profile) return;
    
    const { data, error } = await supabase
      .from("reports")
      .select(`
        *,
        author:profiles!author_id(first_name, last_name, badge_number),
        recipient:profiles!recipient_id(first_name, last_name, badge_number)
      `)
      .or(`author_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReports(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [profile]);

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    setStatusUpdating(true);
    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus })
      .eq("id", reportId);

    if (error) {
      toast.error("Błąd podczas aktualizacji statusu: " + error.message);
    } else {
      toast.success(`Status raportu zmieniony na: ${newStatus}`);
      setSelectedReport(null);
      fetchReports();
    }
    setStatusUpdating(false);
  };

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
                          report.status === "Odrzucony" ? "bg-red-500" :
                          report.status === "Oczekujący" ? "bg-amber-500" : "bg-blue-500"
                        )}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-lapd-navy hover:bg-lapd-gold/20 font-bold text-xs"
                          onClick={() => setSelectedReport(report)}
                        >
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

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-lapd-white border-2 border-lapd-gold">
          {selectedReport && (
            <>
              <DialogHeader className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs uppercase border-lapd-navy text-lapd-navy">
                    {selectedReport.category}
                  </Badge>
                  <Badge className={cn(
                    "uppercase text-xs font-bold",
                    selectedReport.priority === "critical" ? "bg-red-600" :
                    selectedReport.priority === "high" ? "bg-orange-500" : "bg-blue-500"
                  )}>
                    Priorytet: {selectedReport.priority}
                  </Badge>
                </div>
                <DialogTitle className="text-2xl font-black text-lapd-navy uppercase tracking-tight">
                  {selectedReport.title}
                </DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  RAPORT ID: {selectedReport.id} | UTWORZONO: {new Date(selectedReport.created_at).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-3 text-lapd-gold" />
                    <span className="font-bold text-lapd-navy mr-2">Autor:</span>
                    {selectedReport.author?.first_name} {selectedReport.author?.last_name} (#{selectedReport.author?.badge_number})
                  </div>
                  <div className="flex items-center text-sm">
                    <Shield className="h-4 w-4 mr-3 text-lapd-gold" />
                    <span className="font-bold text-lapd-navy mr-2">Adresat:</span>
                    {selectedReport.recipient?.first_name} {selectedReport.recipient?.last_name}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-3 text-lapd-gold" />
                    <span className="font-bold text-lapd-navy mr-2">Lokalizacja:</span>
                    {selectedReport.location}
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-3 text-lapd-gold" />
                    <span className="font-bold text-lapd-navy mr-2">Data i Czas:</span>
                    {selectedReport.date} | {selectedReport.time}
                  </div>
                </div>
              </div>

              <div className="py-6">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Opis Zdarzenia</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                  {selectedReport.description}
                </div>
              </div>

              {selectedReport.involved_parties && (
                <div className="py-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Osoby Zaangażowane</h4>
                  <p className="text-sm text-gray-700">{selectedReport.involved_parties}</p>
                </div>
              )}

              <DialogFooter className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Aktualny status: {selectedReport.status}</p>
                </div>
                {/* Przyciski zmiany statusu dostępne dla adresata lub jeśli status jest 'Oczekujący' */}
                {(profile?.id === selectedReport.recipient_id || profile?.role_level >= 3) && selectedReport.status === "Oczekujący" && (
                  <>
                    <Button 
                      onClick={() => updateReportStatus(selectedReport.id, "Odrzucony")}
                      variant="destructive"
                      disabled={statusUpdating}
                      className="font-bold"
                    >
                      ODRZUĆ
                    </Button>
                    <Button 
                      onClick={() => updateReportStatus(selectedReport.id, "Zakończony")}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold"
                      disabled={statusUpdating}
                    >
                      ZATWIERDŹ I ZAKOŃCZ
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setSelectedReport(null)} className="font-bold border-lapd-gold">
                  ZAMKNIJ
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsPage;
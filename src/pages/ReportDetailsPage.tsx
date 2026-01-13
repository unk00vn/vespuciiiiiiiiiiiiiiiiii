"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttachmentList } from "@/components/AttachmentList";
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Paperclip
} from "lucide-react";
import { toast } from "sonner";

const ReportDetailsPage = () => {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    
    const { data: reportData, error: reportError } = await supabase
      .from("reports")
      .select(`
        *,
        author:profiles!author_id(first_name, last_name, badge_number),
        recipient:profiles!recipient_id(first_name, last_name, badge_number)
      `)
      .eq("id", id)
      .single();

    if (reportError) {
      toast.error("Nie znaleziono raportu.");
      navigate("/reports");
      return;
    }

    const { data: attachmentsData } = await supabase
      .from("attachments")
      .select("*")
      .eq("report_id", id);

    setReport(reportData);
    setAttachments(attachmentsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!report || updating) return;
    setUpdating(true);
    
    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus })
      .eq("id", report.id);

    if (error) {
      toast.error("Błąd aktualizacji statusu: " + error.message);
    } else {
      toast.success(`Status zmieniony na: ${newStatus}`);
      fetchData();
      
      await supabase.from("notifications").insert({
        user_id: report.author_id,
        title: "Zmiana statusu raportu",
        description: `Twój raport "${report.title}" został ustawiony jako: ${newStatus}`,
        type: "report"
      });
    }
    setUpdating(false);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <Loader2 className="animate-spin h-10 w-10 text-lapd-gold" />
    </div>
  );

  const isRecipient = profile?.id === report.recipient_id;
  const canUpdate = isRecipient && (report.status === "Oczekujący" || report.status === "W toku");

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild className="border-lapd-gold/30 text-lapd-gold hover:bg-lapd-gold hover:text-black">
          <Link to="/reports">
            <ArrowLeft className="h-4 w-4 mr-2" /> POWRÓT
          </Link>
        </Button>
        <Badge className={`text-xs font-black px-3 py-1 border-2 ${
            report.status === "Zakończony" ? "border-green-500/50 bg-green-500/10 text-green-400" : 
            report.status === "Odrzucony" ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-amber-500/50 bg-amber-500/10 text-amber-400"
        }`}>
            {report.status.toUpperCase()}
        </Badge>
      </div>

      <Card className="bg-lapd-darker border-lapd-gold border-2 shadow-2xl overflow-hidden">
        <CardHeader className="bg-lapd-navy border-b border-lapd-gold/30 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-lapd-gold font-mono text-[10px] uppercase tracking-widest mb-1">SYGNATURA: #{report.id.substring(0, 8)}</p>
              <CardTitle className="text-3xl font-black text-white uppercase tracking-tighter">{report.title}</CardTitle>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs font-bold flex items-center justify-end uppercase">
                <Clock className="h-3 w-3 mr-1" /> {new Date(report.created_at).toLocaleString()}
              </p>
              <p className="text-slate-400 text-xs font-bold flex items-center justify-end uppercase mt-1">
                <MapPin className="h-3 w-3 mr-1" /> {report.location || "BRAK LOKALIZACJI"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
              <p className="text-[10px] font-black text-lapd-gold uppercase mb-3 tracking-widest">AUTOR RAPORTU</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-lapd-gold rounded flex items-center justify-center text-lapd-navy font-black">
                    {report.author?.first_name?.[0]}{report.author?.last_name?.[0]}
                </div>
                <div>
                  <p className="text-white font-bold">#{report.author?.badge_number} {report.author?.first_name} {report.author?.last_name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">OFFICER OPERACYJNY</p>
                </div>
              </div>
            </div>

            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
              <p className="text-[10px] font-black text-lapd-gold uppercase mb-3 tracking-widest">ADRESAT / NADZÓR</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-800 rounded flex items-center justify-center text-lapd-gold font-black border border-lapd-gold/30">
                    {report.recipient?.first_name?.[0]}{report.recipient?.last_name?.[0]}
                </div>
                <div>
                  <p className="text-white font-bold">#{report.recipient?.badge_number} {report.recipient?.first_name} {report.recipient?.last_name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">DOWÓDCA AKCJI / KADRA</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-lapd-gold uppercase tracking-widest flex items-center">
              <Shield className="h-3 w-3 mr-2" /> TREŚĆ OPERACYJNA
            </p>
            <div className="bg-white/[0.02] p-6 rounded border border-white/10 text-slate-200 whitespace-pre-wrap leading-relaxed min-h-[200px] text-sm italic">
              {report.description}
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-4 border-t border-white/5 pt-8">
              <p className="text-[10px] font-black text-lapd-gold uppercase tracking-widest flex items-center">
                <Paperclip className="h-3 w-3 mr-2" /> DOKUMENTACJA FOTOGRAFICZNA
              </p>
              <AttachmentList attachments={attachments} />
            </div>
          )}
        </CardContent>

        {canUpdate && (
          <CardFooter className="bg-lapd-navy/50 p-8 flex justify-center gap-4 border-t border-lapd-gold/20">
            <Button 
                onClick={() => updateStatus("Zakończony")} 
                disabled={updating}
                className="bg-green-600 hover:bg-green-700 text-white font-black uppercase px-8"
            >
              {updating ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />} ZATWIERDŹ RAPORT
            </Button>
            <Button 
                onClick={() => updateStatus("Odrzucony")} 
                disabled={updating}
                variant="destructive"
                className="font-black uppercase px-8"
            >
              {updating ? <Loader2 className="animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />} ODRZUĆ RAPORT
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ReportDetailsPage;
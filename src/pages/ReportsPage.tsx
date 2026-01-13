"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, FileText, Loader2, AlertTriangle } from "lucide-react";
import { useReports } from "@/hooks/useApi";

const ReportsPage = () => {
  const { data: reports, isLoading, isError, error } = useReports();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-lapd-navy" />
        <p className="ml-2 text-lapd-navy">Ładowanie raportów...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
        <h2 className="font-bold">Błąd ładowania danych</h2>
        <p>Nie udało się pobrać raportów: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-lapd-navy">Raporty</h1>
        <Button className="bg-lapd-gold text-lapd-navy hover:bg-yellow-600">
          <PlusCircle className="mr-2 h-4 w-4" />
          Dodaj Nowy Raport
        </Button>
      </div>
      <p className="text-gray-700">Przeglądaj wszystkie raporty policyjne.</p>

      <Card className="bg-lapd-white border-lapd-gold shadow-md">
        <CardHeader>
          <CardTitle className="text-lapd-navy">Lista Raportów</CardTitle>
          <CardDescription className="text-gray-600">
            Tutaj znajdziesz wszystkie zgłoszone raporty.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-lapd-navy text-lapd-white hover:bg-lapd-navy">
                  <TableHead className="text-lapd-white">ID Raportu</TableHead>
                  <TableHead className="text-lapd-white">Tytuł</TableHead>
                  <TableHead className="text-lapd-white">Autor</TableHead>
                  <TableHead className="text-lapd-white">Data</TableHead>
                  <TableHead className="text-lapd-white">Status</TableHead>
                  <TableHead className="text-lapd-white text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-lapd-navy">{report.id.substring(0, 8)}...</TableCell>
                      <TableCell className="text-gray-700">{report.title}</TableCell>
                      <TableCell className="text-gray-700">
                        {report.author?.first_name} {report.author?.last_name} ({report.author?.badge_number})
                      </TableCell>
                      <TableCell className="text-gray-700">{report.date || new Date(report.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          report.status === "Zakończony" ? "bg-green-100 text-green-800" :
                          report.status === "W toku" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {report.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-lapd-navy hover:bg-gray-100">
                          <FileText className="h-4 w-4 mr-1" />
                          Szczegóły
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      Brak raportów do wyświetlenia.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
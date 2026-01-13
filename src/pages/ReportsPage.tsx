"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";

// Dummy data for reports
const dummyReports = [
  { id: "RPT001", title: "Incydent na Vespucci Beach", author: "John Doe", date: "2024-09-01", status: "Zakończony" },
  { id: "RPT002", title: "Kradzież w sklepie 24/7", author: "Jane Smith", date: "2024-09-02", status: "W toku" },
  { id: "RPT003", title: "Zaginiona osoba - Davis", author: "Mike Johnson", date: "2024-09-03", status: "Oczekujący" },
  { id: "RPT004", title: "Kontrola drogowa - autostrada", author: "Sarah Connor", date: "2024-09-04", status: "Zakończony" },
];

const ReportsPage = () => {
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
                {dummyReports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-lapd-navy">{report.id}</TableCell>
                    <TableCell className="text-gray-700">{report.title}</TableCell>
                    <TableCell className="text-gray-700">{report.author}</TableCell>
                    <TableCell className="text-gray-700">{report.date}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
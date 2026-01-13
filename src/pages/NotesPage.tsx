"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

// Dummy data for notes
const dummyNotes = [
  { id: "NOTE001", title: "Ważne informacje o podejrzanym", author: "John Doe", date: "2024-10-20", status: "Aktywna" },
  { id: "NOTE002", title: "Briefing przed operacją 'Phoenix'", author: "Kapitan Smith", date: "2024-10-18", status: "Aktywna" },
  { id: "NOTE003", title: "Lista kontrolna sprzętu", author: "Jane Smith", date: "2024-10-15", status: "Zakończona" },
  { id: "NOTE004", title: "Przypomnienie o szkoleniu strzeleckim", author: "Porucznik Johnson", date: "2024-10-12", status: "Aktywna" },
];

const NotesPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-lapd-navy">Notatki</h1>
        <Button className="bg-lapd-gold text-lapd-navy hover:bg-yellow-600">
          <PlusCircle className="mr-2 h-4 w-4" />
          Dodaj Nową Notatkę
        </Button>
      </div>
      <p className="text-gray-700">Przeglądaj i zarządzaj swoimi notatkami oraz ważnymi informacjami.</p>

      <Card className="bg-lapd-white border-lapd-gold shadow-md">
        <CardHeader>
          <CardTitle className="text-lapd-navy">Lista Notatek</CardTitle>
          <CardDescription className="text-gray-600">
            Tutaj znajdziesz wszystkie swoje notatki.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-lapd-navy text-lapd-white hover:bg-lapd-navy">
                  <TableHead className="text-lapd-white">ID Notatki</TableHead>
                  <TableHead className="text-lapd-white">Tytuł</TableHead>
                  <TableHead className="text-lapd-white">Autor</TableHead>
                  <TableHead className="text-lapd-white">Data</TableHead>
                  <TableHead className="text-lapd-white">Status</TableHead>
                  <TableHead className="text-lapd-white text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyNotes.map((note) => (
                  <TableRow key={note.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-lapd-navy">{note.id}</TableCell>
                    <TableCell className="text-gray-700">{note.title}</TableCell>
                    <TableCell className="text-gray-700">{note.author}</TableCell>
                    <TableCell className="text-gray-700">{note.date}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        note.status === "Aktywna" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {note.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-lapd-navy hover:bg-gray-100">
                        <ClipboardList className="h-4 w-4 mr-1" />
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

export default NotesPage;
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Bell } from "lucide-react";
import { Link } from "react-router-dom";

// Dummy data for announcements
const dummyAnnouncements = [
  { id: "ANN001", title: "Ważne szkolenie z taktyki", author: "Kapitan Smith", date: "2024-10-15", status: "Aktywne" },
  { id: "ANN002", title: "Nowe procedury raportowania incydentów", author: "Porucznik Johnson", date: "2024-10-10", status: "Aktywne" },
  { id: "ANN003", title: "Spotkanie dywizji Metro", author: "Sierżant Davis", date: "2024-10-05", status: "Zakończone" },
  { id: "ANN004", title: "Zmiana grafiku patroli", author: "Kapitan Smith", date: "2024-10-01", status: "Aktywne" },
];

const AnnouncementsPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-lapd-navy">Ogłoszenia</h1>
        <Button className="bg-lapd-gold text-lapd-navy hover:bg-yellow-600">
          <PlusCircle className="mr-2 h-4 w-4" />
          Dodaj Nowe Ogłoszenie
        </Button>
      </div>
      <p className="text-gray-700">Przeglądaj i zarządzaj ogłoszeniami dla funkcjonariuszy LSPD Vespucci.</p>

      <Card className="bg-lapd-white border-lapd-gold shadow-md">
        <CardHeader>
          <CardTitle className="text-lapd-navy">Lista Ogłoszeń</CardTitle>
          <CardDescription className="text-gray-600">
            Tutaj znajdziesz wszystkie aktywne i archiwalne ogłoszenia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-lapd-navy text-lapd-white hover:bg-lapd-navy">
                  <TableHead className="text-lapd-white">ID Ogłoszenia</TableHead>
                  <TableHead className="text-lapd-white">Tytuł</TableHead>
                  <TableHead className="text-lapd-white">Autor</TableHead>
                  <TableHead className="text-lapd-white">Data</TableHead>
                  <TableHead className="text-lapd-white">Status</TableHead>
                  <TableHead className="text-lapd-white text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyAnnouncements.map((announcement) => (
                  <TableRow key={announcement.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-lapd-navy">{announcement.id}</TableCell>
                    <TableCell className="text-gray-700">{announcement.title}</TableCell>
                    <TableCell className="text-gray-700">{announcement.author}</TableCell>
                    <TableCell className="text-gray-700">{announcement.date}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        announcement.status === "Aktywne" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {announcement.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-lapd-navy hover:bg-gray-100">
                        <Bell className="h-4 w-4 mr-1" />
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

export default AnnouncementsPage;
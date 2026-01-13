"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Bell, Loader2, AlertTriangle } from "lucide-react";
import { useAnnouncements } from "@/hooks/useApi";

const AnnouncementsPage = () => {
  const { data: announcements, isLoading, isError, error } = useAnnouncements();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-lapd-navy" />
        <p className="ml-2 text-lapd-navy">Ładowanie ogłoszeń...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
        <h2 className="font-bold">Błąd ładowania danych</h2>
        <p>Nie udało się pobrać ogłoszeń: {error.message}</p>
      </div>
    );
  }

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
                  <TableHead className="text-lapd-white">Data</TableHead>
                  <TableHead className="text-lapd-white">Status</TableHead>
                  <TableHead className="text-lapd-white text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements && announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <TableRow key={announcement.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-lapd-navy">{announcement.id.substring(0, 8)}...</TableCell>
                      <TableCell className="text-gray-700">{announcement.title}</TableCell>
                      <TableCell className="text-gray-700">{new Date(announcement.created_at).toLocaleDateString()}</TableCell>
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      Brak ogłoszeń do wyświetlenia.
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

export default AnnouncementsPage;
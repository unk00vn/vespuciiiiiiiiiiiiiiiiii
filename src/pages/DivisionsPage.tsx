"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Users, Loader2, AlertTriangle } from "lucide-react";
import { useDivisions } from "@/hooks/useApi";

const DivisionsPage = () => {
  const { data: divisions, isLoading, isError, error } = useDivisions();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-lapd-navy" />
        <p className="ml-2 text-lapd-navy">Ładowanie dywizji...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
        <h2 className="font-bold">Błąd ładowania danych</h2>
        <p>Nie udało się pobrać dywizji: {error.message}</p>
      </div>
    );
  }

  // Uwaga: Liczba członków nie jest obecnie pobierana, ponieważ wymagałoby to złożonego zapytania RPC lub dodatkowego hooka.
  // Na razie używamy stałej wartości 0.

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-lapd-navy">Dywizje</h1>
        <Button className="bg-lapd-gold text-lapd-navy hover:bg-yellow-600">
          <PlusCircle className="mr-2 h-4 w-4" />
          Dodaj Nową Dywizję
        </Button>
      </div>
      <p className="text-gray-700">Przeglądaj i zarządzaj dywizjami w LSPD Vespucci.</p>

      <Card className="bg-lapd-white border-lapd-gold shadow-md">
        <CardHeader>
          <CardTitle className="text-lapd-navy">Lista Dywizji</CardTitle>
          <CardDescription className="text-gray-600">
            Tutaj znajdziesz wszystkie aktywne dywizje.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-lapd-navy text-lapd-white hover:bg-lapd-navy">
                  <TableHead className="text-lapd-white">ID Dywizji</TableHead>
                  <TableHead className="text-lapd-white">Nazwa</TableHead>
                  <TableHead className="text-lapd-white">Opis</TableHead>
                  <TableHead className="text-lapd-white">Liczba Członków</TableHead>
                  <TableHead className="text-lapd-white text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {divisions && divisions.length > 0 ? (
                  divisions.map((division) => (
                    <TableRow key={division.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-lapd-navy">{division.id}</TableCell>
                      <TableCell className="text-gray-700">{division.name}</TableCell>
                      <TableCell className="text-gray-700">{division.description}</TableCell>
                      <TableCell className="text-gray-700">0</TableCell> {/* Tymczasowo 0 */}
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-lapd-navy hover:bg-gray-100">
                          <Users className="h-4 w-4 mr-1" />
                          Szczegóły
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      Brak dywizji do wyświetlenia.
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

export default DivisionsPage;
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";

// Dummy data for divisions
const dummyDivisions = [
  { id: "DIV001", name: "Patrol Division", description: "Odpowiedzialna za patrole i reagowanie na zgłoszenia.", members: 150 },
  { id: "DIV002", name: "Detective Bureau", description: "Prowadzi dochodzenia w sprawach kryminalnych.", members: 45 },
  { id: "DIV003", name: "Traffic Division", description: "Zajmuje się egzekwowaniem przepisów ruchu drogowego.", members: 70 },
  { id: "DIV004", name: "SWAT Team", description: "Jednostka specjalna do zadań wysokiego ryzyka.", members: 20 },
];

const DivisionsPage = () => {
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
                {dummyDivisions.map((division) => (
                  <TableRow key={division.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-lapd-navy">{division.id}</TableCell>
                    <TableCell className="text-gray-700">{division.name}</TableCell>
                    <TableCell className="text-gray-700">{division.description}</TableCell>
                    <TableCell className="text-gray-700">{division.members}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-lapd-navy hover:bg-gray-100">
                        <Users className="h-4 w-4 mr-1" />
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

export default DivisionsPage;
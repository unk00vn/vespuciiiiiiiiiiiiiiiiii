"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, User, FileText, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const dummyCitizens = [
  { id: "1", name: "John Doe", dob: "1990-05-12", phone: "555-0192", status: "Czysty", warrants: 0 },
  { id: "2", name: "Jane Smith", dob: "1985-11-23", phone: "555-0432", status: "Poszukiwany", warrants: 2 },
  { id: "3", name: "Mike Oxlong", dob: "1995-02-14", phone: "555-0881", status: "Kartoteka", warrants: 0 },
];

export const CitizenSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState(dummyCitizens);

  const handleSearch = () => {
    const filtered = dummyCitizens.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm)
    );
    setResults(filtered);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Szukaj po imieniu, nazwisku lub numerze telefonu..." 
            className="pl-10 border-lapd-gold focus:ring-lapd-gold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} className="bg-lapd-gold text-lapd-navy hover:bg-yellow-600">
          Szukaj
        </Button>
      </div>

      <Card className="bg-lapd-white border-lapd-gold shadow-md">
        <CardHeader>
          <CardTitle className="text-lapd-navy flex items-center">
            <User className="h-5 w-5 mr-2" />
            Wyniki Wyszukiwania Obywateli
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-lapd-navy text-lapd-white hover:bg-lapd-navy">
                  <TableHead className="text-lapd-white">Imię i Nazwisko</TableHead>
                  <TableHead className="text-lapd-white">Data Urodzenia</TableHead>
                  <TableHead className="text-lapd-white">Telefon</TableHead>
                  <TableHead className="text-lapd-white">Status</TableHead>
                  <TableHead className="text-lapd-white text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((citizen) => (
                  <TableRow key={citizen.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-lapd-navy">{citizen.name}</TableCell>
                    <TableCell className="text-gray-700">{citizen.dob}</TableCell>
                    <TableCell className="text-gray-700">{citizen.phone}</TableCell>
                    <TableCell>
                      <Badge className={
                        citizen.status === "Poszukiwany" ? "bg-red-500" : 
                        citizen.status === "Kartoteka" ? "bg-orange-500" : "bg-green-500"
                      }>
                        {citizen.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" className="text-lapd-navy hover:bg-gray-100">
                        <FileText className="h-4 w-4 mr-1" /> Profil
                      </Button>
                      {citizen.warrants > 0 && (
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                          <ShieldAlert className="h-4 w-4 mr-1" /> Nakazy ({citizen.warrants})
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Brak wyników spełniających kryteria.
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
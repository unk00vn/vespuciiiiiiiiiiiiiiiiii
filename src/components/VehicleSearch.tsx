"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Car, User, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const dummyVehicles = [
  { id: "1", plate: "LS 4421", model: "Vapid Stanier", owner: "John Doe", color: "Czarny", status: "Zarejestrowany" },
  { id: "2", plate: "BC 8812", model: "Bravado Buffalo", owner: "Jane Smith", color: "Biały", status: "Kradziony" },
  { id: "3", plate: "VP 0091", model: "Albany Primo", owner: "Mike Oxlong", color: "Srebrny", status: "Brak OC" },
];

export const VehicleSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState(dummyVehicles);

  const handleSearch = () => {
    const filtered = dummyVehicles.filter(v => 
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Szukaj po tablicy rejestracyjnej lub właścicielu..." 
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
            <Car className="h-5 w-5 mr-2" />
            Wyniki Wyszukiwania Pojazdów
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-lapd-navy text-lapd-white hover:bg-lapd-navy">
                  <TableHead className="text-lapd-white">Tablica</TableHead>
                  <TableHead className="text-lapd-white">Model</TableHead>
                  <TableHead className="text-lapd-white">Właściciel</TableHead>
                  <TableHead className="text-lapd-white">Kolor</TableHead>
                  <TableHead className="text-lapd-white">Status</TableHead>
                  <TableHead className="text-lapd-white text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((vehicle) => (
                  <TableRow key={vehicle.id} className="hover:bg-gray-50">
                    <TableCell className="font-bold text-lapd-navy">{vehicle.plate}</TableCell>
                    <TableCell className="text-gray-700">{vehicle.model}</TableCell>
                    <TableCell className="text-gray-700">{vehicle.owner}</TableCell>
                    <TableCell className="text-gray-700">{vehicle.color}</TableCell>
                    <TableCell>
                      <Badge className={
                        vehicle.status === "Kradziony" ? "bg-red-500" : 
                        vehicle.status === "Brak OC" ? "bg-orange-500" : "bg-green-500"
                      }>
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-lapd-navy hover:bg-gray-100">
                        <User className="h-4 w-4 mr-1" /> Właściciel
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
"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CitizenSearch } from "@/components/CitizenSearch";
import { VehicleSearch } from "@/components/VehicleSearch";
import { Database, User, Car } from "lucide-react";

const DatabasePage = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-lapd-navy flex items-center">
          <Database className="mr-3 h-8 w-8 text-lapd-gold" />
          Baza Danych (MDT)
        </h1>
      </div>
      <p className="text-gray-700">Wyszukiwanie osób oraz pojazdów w centralnym systemie LSPD.</p>

      <Tabs defaultValue="citizens" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 border border-lapd-gold">
          <TabsTrigger value="citizens" className="data-[state=active]:bg-lapd-navy data-[state=active]:text-lapd-white">
            <User className="mr-2 h-4 w-4" /> Obywatele
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="data-[state=active]:bg-lapd-navy data-[state=active]:text-lapd-white">
            <Car className="mr-2 h-4 w-4" /> Pojazdy
          </TabsTrigger>
        </TabsList>
        <TabsContent value="citizens" className="mt-6">
          <CitizenSearch />
        </TabsContent>
        <TabsContent value="vehicles" className="mt-6">
          <VehicleSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabasePage;
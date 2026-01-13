"use client";

import React from "react";
import { ReportForm } from "@/components/ReportForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CreateReportPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <Button variant="outline" asChild className="mr-4 border-lapd-gold text-lapd-navy hover:bg-lapd-gold">
          <Link to="/reports">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do Raportów
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-lapd-navy">Nowy Raport</h1>
      </div>
      
      <p className="text-gray-700">
        Wypełnij formularz, aby utworzyć nowy raport policyjny. 
        Upewnij się, że wszystkie informacje są dokładne i kompletne.
      </p>
      
      <ReportForm />
    </div>
  );
};

export default CreateReportPage;
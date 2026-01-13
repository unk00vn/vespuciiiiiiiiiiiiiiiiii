"use client";

import React from "react";
import { IncidentReportForm } from "@/components/IncidentReportForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const IncidentReportPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <Button variant="outline" asChild className="mr-4 border-lapd-gold text-lapd-navy hover:bg-lapd-gold">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do Dashboardu
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-lapd-navy">Zgłoszenie Incydentu</h1>
      </div>
      
      <p className="text-gray-700">
        Wypełnij formularz, aby zgłosić nowy incydent. 
        Upewnij się, że wszystkie informacje są dokładne i kompletne.
      </p>
      
      <IncidentReportForm />
    </div>
  );
};

export default IncidentReportPage;
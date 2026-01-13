"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell, FileText, Users, AlertTriangle } from "lucide-react";
import { OfficerStats } from "@/components/OfficerStats";
import { QuickActions } from "@/components/QuickActions";
import { RecentIncidents } from "@/components/RecentIncidents";
import { IncidentStatsChart } from "@/components/IncidentStatsChart";
import { ActivePatrols } from "@/components/ActivePatrols";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-lapd-navy">Witaj, Funkcjonariuszu!</h1>
      <p className="text-gray-700">Przeglądaj najważniejsze informacje i szybkie skróty.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-lapd-white border-lapd-gold shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lapd-navy">
              Nowe Powiadomienia
            </CardTitle>
            <Bell className="h-4 w-4 text-lapd-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lapd-navy">3</div>
            <p className="text-xs text-gray-500">Ostatnie 24 godziny</p>
          </CardContent>
        </Card>
        
        <Card className="bg-lapd-white border-lapd-gold shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lapd-navy">
              Raporty do Przejrzenia
            </CardTitle>
            <FileText className="h-4 w-4 text-lapd-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lapd-navy">5</div>
            <p className="text-xs text-gray-500">Wymagają Twojej uwagi</p>
          </CardContent>
        </Card>
        
        <Card className="bg-lapd-white border-lapd-gold shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lapd-navy">
              Aktywni Funkcjonariusze
            </CardTitle>
            <Users className="h-4 w-4 text-lapd-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lapd-navy">42</div>
            <p className="text-xs text-gray-500">Obecnie na służbie</p>
          </CardContent>
        </Card>
        
        <Card className="bg-lapd-white border-lapd-gold shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lapd-navy">
              Aktywne Incydenty
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-lapd-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lapd-navy">7</div>
            <p className="text-xs text-gray-500">Wymagają interwencji</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <div>
          <OfficerStats />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentIncidents />
        <ActivePatrols />
      </div>
      
      <IncidentStatsChart />
      
      <Card className="bg-lapd-white border-lapd-gold shadow-md">
        <CardHeader>
          <CardTitle className="text-lapd-navy">Ostatnie Ogłoszenia</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Ważne szkolenie z taktyki - 15.10.2024</li>
            <li>Nowe procedury raportowania incydentów</li>
            <li>Spotkanie dywizji Metro w piątek</li>
            <li className="font-semibold">ALERG: Poszukiwany niebezpieczny przestępca w rejonie Rockford Hills</li>
          </ul>
        </CardContent>
      </Card>
      
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;
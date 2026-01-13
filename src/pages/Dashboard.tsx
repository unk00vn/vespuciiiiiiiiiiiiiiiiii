"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell, FileText, Users, Loader2, AlertTriangle } from "lucide-react";
import { useDashboardStats } from "@/hooks/useApi";

const Dashboard = () => {
  const { data: stats, isLoading, isError, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-lapd-navy" />
        <p className="ml-2 text-lapd-navy">Ładowanie statystyk...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
        <h2 className="font-bold">Błąd ładowania statystyk</h2>
        <p>Nie udało się pobrać danych: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-lapd-navy">Witaj, Funkcjonariuszu!</h1>
      <p className="text-gray-700">Przeglądaj najważniejsze informacje i szybkie skróty.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-lapd-white border-lapd-gold shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lapd-navy">
              Nowe Powiadomienia
            </CardTitle>
            <Bell className="h-4 w-4 text-lapd-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lapd-navy">{stats?.newNotifications ?? 0}</div>
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
            <div className="text-2xl font-bold text-lapd-navy">{stats?.reportsToReview ?? 0}</div>
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
            <div className="text-2xl font-bold text-lapd-navy">{stats?.activeOfficers ?? 0}</div>
            <p className="text-xs text-gray-500">Obecnie na służbie</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for Announcements */}
      <Card className="bg-lapd-white border-lapd-gold shadow-md">
        <CardHeader>
          <CardTitle className="text-lapd-navy">Ostatnie Ogłoszenia</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-gray-700">
            <li>Ważne szkolenie z taktyki - 15.10.2024</li>
            <li>Nowe procedury raportowania incydentów</li>
            <li>Spotkanie dywizji Metro w piątek</li>
          </ul>
        </CardContent>
      </Card>

      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;
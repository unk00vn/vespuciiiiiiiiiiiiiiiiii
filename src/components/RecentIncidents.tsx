"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, MapPin } from "lucide-react";

interface Incident {
  id: string;
  title: string;
  location: string;
  time: string;
  status: "active" | "resolved" | "pending";
  priority: "low" | "medium" | "high" | "critical";
  officer: string;
}

export const RecentIncidents = () => {
  const incidents: Incident[] = [
    {
      id: "INC-2026-0015",
      title: "Kradzież samochodu",
      location: "Vespucci Beach",
      time: "15 min temu",
      status: "active",
      priority: "medium",
      officer: "Officer Johnson"
    },
    {
      id: "INC-2026-0014",
      title: "Zamach na funkcjonariusza",
      location: "Rockford Hills",
      time: "28 min temu",
      status: "active",
      priority: "critical",
      officer: "SWAT Team"
    },
    {
      id: "INC-2026-0013",
      title: "Domenowy spór",
      location: "Davis",
      time: "45 min temu",
      status: "pending",
      priority: "low",
      officer: "Officer Smith"
    },
    {
      id: "INC-2026-0012",
      title: "Wypadek drogowy",
      location: "Highway 1",
      time: "1 godz. temu",
      status: "resolved",
      priority: "high",
      officer: "Officer Davis"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="bg-lapd-white border-lapd-gold shadow-md">
      <CardHeader>
        <CardTitle className="text-lapd-navy flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Ostatnie Incydenty
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lapd-navy">{incident.title}</h3>
                <Badge className={getPriorityColor(incident.priority)}>
                  {incident.priority === "critical" && "KRYTYCZNY"}
                  {incident.priority === "high" && "WYSOKI"}
                  {incident.priority === "medium" && "ŚREDNI"}
                  {incident.priority === "low" && "NISKI"}
                </Badge>
              </div>
              
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{incident.location}</span>
              </div>
              
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>{incident.time}</span>
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <Badge className={getStatusColor(incident.status)}>
                  {incident.status === "active" && "AKTYWNY"}
                  {incident.status === "resolved" && "ROZWIĄZANY"}
                  {incident.status === "pending" && "OCZEKUJĄCY"}
                </Badge>
                <span className="text-sm text-gray-600">Przypisany: {incident.officer}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
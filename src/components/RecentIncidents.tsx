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
      case "low": return "bg-green-500/20 text-green-400";
      case "medium": return "bg-yellow-500/20 text-yellow-400";
      case "high": return "bg-orange-500/20 text-orange-400";
      case "critical": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-500/20 text-blue-400";
      case "resolved": return "bg-green-500/20 text-green-400";
      case "pending": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <Card className="bg-white/5 border-lapd-gold shadow-md text-white">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-lapd-gold" />
          Ostatnie Incydenty
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="border border-white/10 rounded-lg p-4 hover:bg-white/[0.05] transition-colors">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-white">{incident.title}</h3>
                <Badge className={getPriorityColor(incident.priority)}>
                  {incident.priority === "critical" && "KRYTYCZNY"}
                  {incident.priority === "high" && "WYSOKI"}
                  {incident.priority === "medium" && "ŚREDNI"}
                  {incident.priority === "low" && "NISKI"}
                </Badge>
              </div>
              
              <div className="mt-2 flex items-center text-sm text-slate-400">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{incident.location}</span>
              </div>
              
              <div className="mt-2 flex items-center text-sm text-slate-400">
                <Clock className="h-4 w-4 mr-1" />
                <span>{incident.time}</span>
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <Badge className={getStatusColor(incident.status)}>
                  {incident.status === "active" && "AKTYWNY"}
                  {incident.status === "resolved" && "ROZWIĄZANY"}
                  {incident.status === "pending" && "OCZEKUJĄCY"}
                </Badge>
                <span className="text-sm text-slate-400">Przypisany: {incident.officer}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Clock, Radio } from "lucide-react";

interface Patrol {
  id: string;
  unit: string;
  officers: string[];
  location: string;
  startTime: string;
  status: "active" | "on-call" | "break";
  lastUpdate: string;
}

export const ActivePatrols = () => {
  const patrols: Patrol[] = [
    {
      id: "PAT-001",
      unit: "Patrol 1",
      officers: ["Officer Johnson", "Officer Smith"],
      location: "Vespucci Beach",
      startTime: "08:00",
      status: "active",
      lastUpdate: "2 minuty temu"
    },
    {
      id: "PAT-002",
      unit: "Patrol 2",
      officers: ["Officer Davis", "Officer Wilson"],
      location: "Rockford Hills",
      startTime: "08:15",
      status: "active",
      lastUpdate: "5 minut temu"
    },
    {
      id: "PAT-003",
      unit: "Patrol 3",
      officers: ["Officer Brown"],
      location: "Davis",
      startTime: "07:45",
      status: "on-call",
      lastUpdate: "10 minut temu"
    },
    {
      id: "PAT-004",
      unit: "Patrol 4",
      officers: ["Officer Miller", "Officer Taylor", "Officer Anderson"],
      location: "Downtown",
      startTime: "09:00",
      status: "active",
      lastUpdate: "1 minuta temu"
    },
    {
      id: "PAT-005",
      unit: "Patrol 5",
      officers: ["Officer Thomas"],
      location: "Paleto Bay",
      startTime: "06:30",
      status: "break",
      lastUpdate: "15 minut temu"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "on-call": return "bg-blue-100 text-blue-800";
      case "break": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Aktywny";
      case "on-call": return "Na żądanie";
      case "break": return "Przerwa";
      default: return "Nieznany";
    }
  };

  return (
    <Card className="bg-lapd-white border-lapd-gold shadow-md">
      <CardHeader>
        <CardTitle className="text-lapd-navy flex items-center">
          <Radio className="h-5 w-5 mr-2" />
          Aktywne Patrole
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patrols.map((patrol) => (
            <div key={patrol.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lapd-navy">{patrol.unit}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{patrol.officers.join(", ")}</span>
                  </div>
                </div>
                <Badge className={getStatusColor(patrol.status)}>
                  {getStatusText(patrol.status)}
                </Badge>
              </div>
              
              <div className="mt-3 flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{patrol.location}</span>
              </div>
              
              <div className="mt-2 flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Start: {patrol.startTime}</span>
                </div>
                <span className="text-xs text-gray-500">Ostatnia aktualizacja: {patrol.lastUpdate}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
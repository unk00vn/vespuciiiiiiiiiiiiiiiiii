"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp,
  Star
} from "lucide-react";

interface StatItem {
  name: string;
  value: string | number;
  progress?: number;
  icon: React.ReactNode;
  color: string;
}

export const OfficerStats = () => {
  const stats: StatItem[] = [
    {
      name: "Raporty Zakończone",
      value: "42/50",
      progress: 84,
      icon: <Target className="h-5 w-5" />,
      color: "bg-blue-500"
    },
    {
      name: "Średnia Odpowiedź",
      value: "4.2 min",
      icon: <Clock className="h-5 w-5" />,
      color: "bg-green-500"
    },
    {
      name: "Aktywność Miesiąca",
      value: "92%",
      progress: 92,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "bg-purple-500"
    },
    {
      name: "Wyróżnienia",
      value: "5",
      icon: <Award className="h-5 w-5" />,
      color: "bg-yellow-500"
    }
  ];

  return (
    <Card className="bg-lapd-white border-lapd-gold shadow-md">
      <CardHeader>
        <CardTitle className="text-lapd-navy flex items-center">
          <Star className="h-5 w-5 mr-2" />
          Statystyki Funkcjonariusza
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-2">
                <div className={`p-2 rounded-full ${stat.color} text-white mr-3`}>
                  {stat.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">{stat.name}</h3>
                  <p className="text-2xl font-bold text-lapd-navy">{stat.value}</p>
                </div>
              </div>
              {stat.progress !== undefined && (
                <div className="mt-2">
                  <Progress value={stat.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>{stat.progress}%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="font-medium text-lapd-navy mb-2 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Harmonogram Służby
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="text-sm">Dziś - 08:00 - 16:00</span>
              <Badge className="bg-green-500 hover:bg-green-600">Aktywny</Badge>
            </div>
            <div className="flex justify-between items-center p-2">
              <span className="text-sm">Jutro - 16:00 - 00:00</span>
              <Badge variant="secondary">Zaplanowany</Badge>
            </div>
            <div className="flex justify-between items-center p-2">
              <span className="text-sm">15.01.2026 - 00:00 - 08:00</span>
              <Badge variant="secondary">Zaplanowany</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
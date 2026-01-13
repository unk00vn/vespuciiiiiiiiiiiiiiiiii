"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle, Clock, CheckCircle } from "lucide-react";

const mockData = [
  { name: 'Sty', Incydenty: 45, Rozwiązane: 38, Oczekujące: 7 },
  { name: 'Lut', Incydenty: 52, Rozwiązane: 42, Oczekujące: 10 },
  { name: 'Mar', Incydenty: 48, Rozwiązane: 45, Oczekujące: 3 },
  { name: 'Kwi', Incydenty: 61, Rozwiązane: 55, Oczekujące: 6 },
  { name: 'Maj', Incydenty: 55, Rozwiązane: 50, Oczekujące: 5 },
  { name: 'Cze', Incydenty: 67, Rozwiązane: 60, Oczekujące: 7 },
];

export const IncidentStatsChart = () => {
  return (
    <Card className="bg-lapd-white border-lapd-gold shadow-md">
      <CardHeader>
        <CardTitle className="text-lapd-navy flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Statystyki Incydentów (Ostatnie 6 miesięcy)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Raporty</p>
                <p className="text-2xl font-bold text-lapd-navy">328</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Rozwiązane</p>
                <p className="text-2xl font-bold text-lapd-navy">289</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Oczekujące</p>
                <p className="text-2xl font-bold text-lapd-navy">39</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Skuteczność</p>
                <p className="text-2xl font-bold text-lapd-navy">88%</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0A1A2F', 
                  borderColor: '#C9A635',
                  color: 'white'
                }}
              />
              <Legend />
              <Bar dataKey="Incydenty" fill="#C9A635" name="Wszystkie incydenty" />
              <Bar dataKey="Rozwiązane" fill="#10B981" name="Rozwiązane" />
              <Bar dataKey="Oczekujące" fill="#F59E0B" name="Oczekujące" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Using sonner for toasts

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for Supabase registration logic
    // After registration, account should be pending approval
    console.log("Attempting to register...");
    toast.info("Konto zostało utworzone i oczekuje na akceptację. (Placeholder)");
    navigate("/login"); // Redirect to login after registration
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lapd-navy p-4">
      <Card className="w-full max-w-md bg-lapd-white text-lapd-navy border-lapd-gold shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-lapd-gold">LSPD Vespucci</CardTitle>
          <CardDescription className="text-lg text-gray-700">Panel Rejestracji</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-lapd-navy">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@lspd.com"
                required
                className="mt-1 border-lapd-gold focus:ring-lapd-gold focus:border-lapd-gold"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-lapd-navy">Hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                className="mt-1 border-lapd-gold focus:ring-lapd-gold focus:border-lapd-gold"
              />
            </div>
            <div>
              <Label htmlFor="badgeNumber" className="text-lapd-navy">Numer Odznaki</Label>
              <Input
                id="badgeNumber"
                type="text"
                placeholder="12345"
                required
                className="mt-1 border-lapd-gold focus:ring-lapd-gold focus:border-lapd-gold"
              />
            </div>
            <Button type="submit" className="w-full bg-lapd-gold text-lapd-navy hover:bg-yellow-600 transition-colors duration-200">
              Zarejestruj
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Masz już konto?{" "}
            <Link to="/login" className="text-lapd-gold hover:underline">
              Zaloguj się
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
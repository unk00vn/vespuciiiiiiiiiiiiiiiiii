"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");
  const { signUp, loading } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signUp(email, password, badgeNumber);
    if (error) {
      // Error message is already shown by toast in AuthContext
      console.error("Registration failed:", error.message);
    }
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                className="mt-1 border-lapd-gold focus:ring-lapd-gold focus:border-lapd-gold"
              />
            </div>
            <Button type="submit" className="w-full bg-lapd-gold text-lapd-navy hover:bg-yellow-600 transition-colors duration-200" disabled={loading}>
              {loading ? "Rejestracja..." : "Zarejestruj"}
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
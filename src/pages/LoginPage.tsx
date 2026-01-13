"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, loading, user, profile } = useAuth();
  const navigate = useNavigate();

  // Przekieruj jeśli już zalogowany i zaakceptowany
  useEffect(() => {
    if (user && profile?.status === "approved") {
      navigate("/");
    }
  }, [user, profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (!error) {
      toast.success("Zalogowano pomyślnie!");
      // Nawigacja nastąpi automatycznie przez useEffect
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lapd-navy p-4">
      <Card className="w-full max-w-md bg-lapd-white text-lapd-navy border-lapd-gold shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-lapd-gold">LSPD Vespucci</CardTitle>
          <CardDescription className="text-lg text-gray-700">Panel Logowania</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-lapd-navy font-bold uppercase text-xs">Email</Label>
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
              <Label htmlFor="password" className="text-lapd-navy font-bold uppercase text-xs">Hasło</Label>
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
            <Button type="submit" className="w-full bg-lapd-gold text-lapd-navy hover:bg-yellow-600 transition-colors duration-200 font-bold" disabled={loading}>
              {loading ? "Weryfikacja..." : "ZALOGUJ SIĘ"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Nie masz konta?{" "}
            <Link to="/register" className="text-lapd-gold hover:underline font-bold">
              Zarejestruj się
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
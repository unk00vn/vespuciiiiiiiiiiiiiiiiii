"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ShieldAlert, Loader2 } from "lucide-react";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, badgeNumber);
    setLoading(false);
    if (!error) navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050b14] p-4 font-sans">
      <Card className="w-full max-w-md bg-[#0a121e] text-white border-lapd-gold shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <ShieldAlert className="h-12 w-12 text-lapd-gold mx-auto mb-2" />
          <CardTitle className="text-3xl font-black tracking-tighter uppercase italic">LSPD TERMINAL</CardTitle>
          <CardDescription className="text-slate-400 font-mono text-[10px] uppercase">Rejestracja Nowego Funkcjonariusza</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-lapd-gold font-bold uppercase text-[10px]">Email Służbowy</Label>
              <Input type="email" placeholder="badge@lspd.gov" required value={email} onChange={e => setEmail(e.target.value)} className="bg-black/40 border-lapd-gold/30 focus:border-lapd-gold" />
            </div>
            <div className="space-y-2">
              <Label className="text-lapd-gold font-bold uppercase text-[10px]">Numer Odznaki</Label>
              <Input type="text" placeholder="NP. 101" required value={badgeNumber} onChange={e => setBadgeNumber(e.target.value)} className="bg-black/40 border-lapd-gold/30 focus:border-lapd-gold" />
            </div>
            <div className="space-y-2">
              <Label className="text-lapd-gold font-bold uppercase text-[10px]">Hasło Systemowe</Label>
              <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="bg-black/40 border-lapd-gold/30 focus:border-lapd-gold" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-lapd-gold text-lapd-navy hover:bg-yellow-600 font-black uppercase py-6 shadow-lg transition-all active:scale-95">
              {loading ? <Loader2 className="animate-spin" /> : "WYŚLIJ WNIOSEK O DOSTĘP"}
            </Button>
          </form>
          <p className="mt-6 text-center text-[10px] text-slate-500 font-bold uppercase">
            Masz już dostęp? <Link to="/login" className="text-lapd-gold hover:underline">Zaloguj się</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
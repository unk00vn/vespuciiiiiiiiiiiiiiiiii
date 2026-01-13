"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, loading, user, profile, error } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in and approved
  useEffect(() => {
    if (user && profile?.status === "approved") {
      navigate("/");
    }
  }, [user, profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    const { error: signInError } = await signIn(email, password);
    
    if (!signInError) {
      toast.success("Login successful!");
      // Navigation will happen automatically through useEffect
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lapd-navy p-4">
      <Card className="w-full max-w-md bg-lapd-white text-lapd-navy border-lapd-gold shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-lapd-gold">LSPD Vespucci</CardTitle>
          <CardDescription className="text-lg text-gray-700">Login Panel</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-lapd-navy font-bold uppercase text-xs">
                Email
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john.doe@lspd.com" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 border-lapd-gold focus:ring-lapd-gold focus:border-lapd-gold"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-lapd-navy font-bold uppercase text-xs">
                Password
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="********" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 border-lapd-gold focus:ring-lapd-gold focus:border-lapd-gold"
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-lapd-gold text-lapd-navy hover:bg-yellow-600 transition-colors duration-200 font-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  VERIFYING...
                </>
              ) : (
                "LOGIN"
              )}
            </Button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-lapd-gold hover:underline font-bold">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
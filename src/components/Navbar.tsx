"use client";

import React from "react";
import { Bell, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-lapd-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center space-x-4">
        {/* Możesz dodać tutaj logo lub tytuł strony */}
        <h2 className="text-xl font-semibold text-lapd-navy">Panel LSPD</h2>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="text-lapd-navy hover:bg-gray-100">
          <Bell className="h-5 w-5" />
        </Button>
        <Link to="/profile">
          <Avatar className="h-8 w-8 border-2 border-lapd-gold">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /> {/* Placeholder */}
            <AvatarFallback className="bg-lapd-navy text-lapd-gold">JD</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
};
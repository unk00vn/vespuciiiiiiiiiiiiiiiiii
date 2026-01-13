"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ChatWidget } from "./ChatWidget";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar className="w-72 flex-shrink-0" />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
      <ChatWidget />
    </div>
  );
};
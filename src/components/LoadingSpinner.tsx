"use client";
import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner = ({ 
  message = "Loading...", 
  size = "md",
  className = ""
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16"
  };

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-t-2 border-b-2 border-lapd-gold mb-4`}></div>
      <p className={`${textSize[size]} text-lapd-gold font-mono animate-pulse uppercase`}>
        {message}
      </p>
    </div>
  );
};
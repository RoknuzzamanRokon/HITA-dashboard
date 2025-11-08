/**
 * Back Button Component
 * Simple navigation button to go back to previous page
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "./button";

interface BackButtonProps {
  fallbackUrl?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  fallbackUrl = "/dashboard",
  label = "Back",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Try to go back in history, fallback to specified URL
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`flex items-center space-x-2 ${className}`}
      leftIcon={<ArrowLeft className="w-4 h-4" />}
    >
      {label}
    </Button>
  );
}

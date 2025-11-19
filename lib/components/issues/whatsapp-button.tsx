/**
 * WhatsApp Support Button Component
 */

"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/lib/components/ui/button";

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline";
}

export function WhatsAppButton({
  message = "Hello, I need help with...",
  className = "",
  size = "md",
  variant = "primary",
}: WhatsAppButtonProps) {
  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "+8801739933258";
  
  // Remove any non-digit characters from the phone number
  const cleanNumber = whatsappNumber.replace(/\D/g, "");
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  const handleClick = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      leftIcon={<MessageCircle className="w-5 h-5" />}
      className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
    >
      Contact Support on WhatsApp
    </Button>
  );
}

interface WhatsAppFloatingButtonProps {
  message?: string;
}

export function WhatsAppFloatingButton({ message }: WhatsAppFloatingButtonProps) {
  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "+8801739933258";
  const cleanNumber = whatsappNumber.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message || "Hello, I need help with...");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  const handleClick = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95 group"
      aria-label="Contact support on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
    </button>
  );
}

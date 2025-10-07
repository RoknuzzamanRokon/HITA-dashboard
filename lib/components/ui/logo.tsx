/**
 * Logo Component
 * Reusable logo component for branding
 */

"use client";

import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark" | "gradient";
  showText?: boolean;
  className?: string;
}

export function Logo({
  size = "md",
  variant = "gradient",
  showText = true,
  className = "",
}: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-20 w-20",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-10 w-10",
  };

  const variantClasses = {
    light: "bg-white text-blue-600 shadow-lg",
    dark: "bg-gray-800 text-white",
    gradient:
      "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg",
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-2xl flex items-center justify-center`}
      >
        <svg
          className={iconSizeClasses[size]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      </div>
      {showText && (
        <div>
          <h1
            className={`${textSizeClasses[size]} font-bold ${
              variant === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            Admin Panel
          </h1>
          {size !== "sm" && (
            <p
              className={`text-sm ${
                variant === "light" ? "text-gray-600" : "text-blue-100"
              }`}
            >
              Management System
            </p>
          )}
        </div>
      )}
    </div>
  );
}

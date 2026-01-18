/**
 * API Status Indicator Component
 * Shows current API connection status and fallback mode
 */

"use client";

import React from "react";
import { AlertTriangle, Wifi, WifiOff, Database } from "lucide-react";

interface ApiStatusIndicatorProps {
  status: "checking" | "connected" | "fallback" | "error";
  isUsingFallback?: boolean;
  className?: string;
}

export function ApiStatusIndicator({
  status,
  isUsingFallback = false,
  className = "",
}: ApiStatusIndicatorProps) {
  const getStatusConfig = () => {
    if (isUsingFallback || status === "fallback") {
      return {
        icon: Database,
        text: "Offline Mode",
        description: "Using cached data - API unavailable",
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        borderColor: "border-amber-200 dark:border-amber-800",
      };
    }

    switch (status) {
      case "connected":
        return {
          icon: Wifi,
          text: "Connected",
          description: "API connection active",
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
        };
      case "error":
        return {
          icon: WifiOff,
          text: "Connection Error",
          description: "Unable to connect to API",
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
        };
      case "checking":
      default:
        return {
          icon: AlertTriangle,
          text: "Checking...",
          description: "Verifying API connection",
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          borderColor: "border-gray-200 dark:border-gray-800",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-md border ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <Icon className={`w-4 h-4 ${config.color}`} />
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${config.color}`}>
          {config.text}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {config.description}
        </span>
      </div>
    </div>
  );
}

// Compact version for header
export function CompactApiStatusIndicator({
  status,
  isUsingFallback = false,
  className = "",
}: ApiStatusIndicatorProps) {
  const getStatusConfig = () => {
    if (isUsingFallback || status === "fallback") {
      return {
        icon: Database,
        color: "text-amber-500",
        title: "Offline Mode - Using cached data",
      };
    }

    switch (status) {
      case "connected":
        return {
          icon: Wifi,
          color: "text-green-500",
          title: "API Connected",
        };
      case "error":
        return {
          icon: WifiOff,
          color: "text-red-500",
          title: "API Connection Error",
        };
      case "checking":
      default:
        return {
          icon: AlertTriangle,
          color: "text-gray-500",
          title: "Checking API Connection",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center ${className}`}
      title={config.title}
    >
      <Icon className={`w-4 h-4 ${config.color}`} />
    </div>
  );
}

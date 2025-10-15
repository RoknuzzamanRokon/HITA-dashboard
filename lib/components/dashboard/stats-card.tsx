/**
 * Animated Statistics Card Component
 * Displays key metrics with count-up animations and trend indicators
 */

"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/lib/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  icon: React.ReactNode;
  gradient?:
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "error";
  loading?: boolean;
  className?: string;
}

const gradientClasses = {
  primary: "from-blue-500 to-purple-600",
  secondary: "from-pink-500 to-rose-500",
  accent: "from-cyan-500 to-blue-500",
  success: "from-green-500 to-emerald-600",
  warning: "from-yellow-500 to-orange-500",
  error: "from-red-500 to-pink-600",
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  gradient = "primary",
  loading = false,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Count-up animation for numerical values
  useEffect(() => {
    if (loading || typeof value !== "number") return;

    setIsAnimating(true);
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, value);
      setDisplayValue(Math.floor(current));

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
        setIsAnimating(false);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, loading]);

  const getTrendIcon = () => {
    if (!change) return null;

    switch (change.type) {
      case "increase":
        return <TrendingUp className="w-4 h-4" />;
      case "decrease":
        return <TrendingDown className="w-4 h-4" />;
      case "neutral":
        return <Minus className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!change) return "";

    switch (change.type) {
      case "increase":
        return "text-green-600 bg-green-50";
      case "decrease":
        return "text-red-600 bg-red-50";
      case "neutral":
        return "text-gray-600 bg-gray-50";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <Card
        variant="elevated"
        className={cn("relative overflow-hidden", className)}
      >
        <div className="p-6">
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="elevated"
      hover={true}
      className={cn(
        "relative overflow-hidden group transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        className
      )}
    >
      {/* Gradient background overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300",
          gradientClasses[gradient]
        )}
      />

      <div className="relative p-6">
        {/* Header with icon and trend */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              "p-3 rounded-xl bg-gradient-to-br shadow-lg transform group-hover:scale-110 transition-transform duration-300",
              gradientClasses[gradient]
            )}
          >
            <div className="text-white">{icon}</div>
          </div>

          {change && (
            <div
              className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300",
                getTrendColor(),
                "group-hover:scale-105"
              )}
            >
              {getTrendIcon()}
              <span>{Math.abs(change.value)}%</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <div
            className={cn(
              "text-3xl font-bold text-gray-900 transition-all duration-300",
              isAnimating && "animate-pulse"
            )}
          >
            {typeof value === "number" ? displayValue.toLocaleString() : value}
          </div>
        </div>

        {/* Title */}
        <div className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
          {title}
        </div>
      </div>

      {/* Animated border on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "bg-gradient-to-r p-[1px]",
          gradientClasses[gradient]
        )}
      >
        <div className="w-full h-full bg-white rounded-xl" />
      </div>
    </Card>
  );
};

export default StatsCard;

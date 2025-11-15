/**
 * Chart Wrapper Component
 * Provides consistent styling and animations for all chart types
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import { cn } from "@/lib/utils";

export interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  className?: string;
  actions?: React.ReactNode;
  height?: number;
  isRefreshing?: boolean;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  subtitle,
  children,
  loading = false,
  error,
  className,
  actions,
  height = 300,
  isRefreshing = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card variant="elevated" className={cn("overflow-hidden", className)}>
        <CardHeader title={title} subtitle={subtitle} actions={actions} />
        <CardContent>
          <div className="animate-pulse space-y-4" style={{ height }}>
            {/* Chart skeleton */}
            <div className="flex items-end space-x-2 h-full">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-t flex-1"
                  style={{
                    height: `${Math.random() * 60 + 40}%`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="elevated" className={cn("overflow-hidden", className)}>
        <CardHeader title={title} subtitle={subtitle} actions={actions} />
        <CardContent>
          <div
            className="flex items-center justify-center text-red-500 bg-red-50 rounded-lg border border-red-200"
            style={{ height }}
          >
            <div className="text-center">
              <div className="text-lg font-medium mb-2">
                Failed to load chart
              </div>
              <div className="text-sm text-red-400">{error}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="elevated"
      className={cn(
        "overflow-hidden transition-all duration-700 ease-out relative",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {/* Refresh indicator */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 dark:bg-blue-400 z-10 overflow-hidden">
          <div
            className="h-full bg-blue-600 dark:bg-blue-300 animate-[shimmer_1.5s_ease-in-out_infinite]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s ease-in-out infinite",
            }}
          />
        </div>
      )}
      <CardHeader title={title} subtitle={subtitle} actions={actions} />
      <CardContent>
        <div
          className={cn(
            "transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
            isRefreshing && "opacity-90"
          )}
          style={{ height }}
        >
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartWrapper;

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
  onRetry?: () => void;
  isEmpty?: boolean;
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
  onRetry,
  isEmpty = false,
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
            className="flex items-center justify-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
            style={{ height }}
          >
            <div className="text-center px-4">
              <div className="text-lg font-medium mb-2 text-red-700 dark:text-red-300">
                Failed to load chart
              </div>
              <div className="text-sm text-red-600 dark:text-red-400 mb-4">
                {error}
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md transition-colors"
                  aria-label="Retry loading chart"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Retry</span>
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card variant="elevated" className={cn("overflow-hidden", className)}>
        <CardHeader title={title} subtitle={subtitle} actions={actions} />
        <CardContent>
          <div
            className="flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
            style={{ height }}
          >
            <div className="text-center px-4">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <div className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
                No data available
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                There is currently no data to display for this chart.
              </div>
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
        className,
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
            "transition-all duration-1000 ease-out w-full",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
            isRefreshing && "opacity-90",
          )}
          style={{
            height,
            minHeight: height,
            minWidth: 300,
          }}
        >
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartWrapper;

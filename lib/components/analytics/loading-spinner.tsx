/**
 * Loading Spinner Component
 * Consistent loading spinners and progress indicators
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "white" | "gray";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "primary",
  className,
}) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-solid border-current border-r-transparent",
        {
          // Size variants
          "w-3 h-3": size === "xs",
          "w-4 h-4": size === "sm",
          "w-6 h-6": size === "md",
          "w-8 h-8": size === "lg",
          "w-12 h-12": size === "xl",
        },
        {
          // Color variants
          "text-blue-600": color === "primary",
          "text-gray-600": color === "secondary",
          "text-white": color === "white",
          "text-gray-400": color === "gray",
        },
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Pulsing dot loader
export const PulsingDots: React.FC<{
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white" | "gray";
  className?: string;
}> = ({ size = "md", color = "primary", className }) => {
  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-pulse",
            {
              "w-1 h-1": size === "sm",
              "w-2 h-2": size === "md",
              "w-3 h-3": size === "lg",
            },
            {
              "bg-blue-600": color === "primary",
              "bg-gray-600": color === "secondary",
              "bg-white": color === "white",
              "bg-gray-400": color === "gray",
            }
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1.4s",
          }}
        />
      ))}
    </div>
  );
};

// Progress bar
export const ProgressBar: React.FC<{
  progress: number;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "success" | "warning" | "error";
  showLabel?: boolean;
  className?: string;
}> = ({
  progress,
  size = "md",
  color = "primary",
  showLabel = false,
  className,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div
        className={cn("w-full bg-gray-200 rounded-full overflow-hidden", {
          "h-1": size === "sm",
          "h-2": size === "md",
          "h-3": size === "lg",
        })}
      >
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            {
              "bg-blue-600": color === "primary",
              "bg-gray-600": color === "secondary",
              "bg-green-600": color === "success",
              "bg-yellow-600": color === "warning",
              "bg-red-600": color === "error",
            }
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

// Skeleton loader for chart placeholders
export const SkeletonLoader: React.FC<{
  className?: string;
  variant?: "text" | "rectangular" | "circular";
  animation?: "pulse" | "wave" | "none";
}> = ({ className, variant = "rectangular", animation = "pulse" }) => {
  return (
    <div
      className={cn(
        "bg-gray-200",
        {
          rounded: variant === "rectangular",
          "rounded-full": variant === "circular",
          "rounded-md": variant === "text",
        },
        {
          "animate-pulse": animation === "pulse",
          "animate-bounce": animation === "wave",
        },
        className
      )}
    />
  );
};

// Chart skeleton specifically for analytics
export const ChartSkeleton: React.FC<{
  height?: number;
  type?: "bar" | "line" | "pie" | "area";
  className?: string;
}> = ({ height = 300, type = "bar", className }) => {
  return (
    <div
      className={cn("animate-pulse bg-gray-50 rounded-lg p-4", className)}
      style={{ height }}
    >
      {type === "pie" ? (
        <div className="flex items-center justify-center h-full">
          <div className="w-32 h-32 bg-gray-200 rounded-full" />
        </div>
      ) : (
        <div className="flex items-end justify-between h-full space-x-2">
          {Array.from({
            length: type === "line" || type === "area" ? 12 : 8,
          }).map((_, i) => (
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
      )}
    </div>
  );
};

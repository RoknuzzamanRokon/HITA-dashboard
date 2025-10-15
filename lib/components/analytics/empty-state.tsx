/**
 * Empty State Component
 * Attractive empty states with illustrations and helpful messaging
 */

"use client";

import React from "react";
import { Card, CardContent } from "@/lib/components/ui/card";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  illustration,
  action,
  className,
  size = "md",
}) => {
  return (
    <Card variant="elevated" className={cn("overflow-hidden", className)}>
      <CardContent>
        <div
          className={cn(
            "flex flex-col items-center justify-center text-center space-y-4",
            {
              "py-8": size === "sm",
              "py-12": size === "md",
              "py-16": size === "lg",
            }
          )}
        >
          {/* Icon or Illustration */}
          {illustration ? (
            <div className="mb-4">{illustration}</div>
          ) : icon ? (
            <div
              className={cn(
                "p-4 bg-gray-100 rounded-full mb-4 transition-all duration-300 hover:bg-gray-200",
                {
                  "p-3": size === "sm",
                  "p-4": size === "md",
                  "p-6": size === "lg",
                }
              )}
            >
              {icon}
            </div>
          ) : (
            // Default illustration
            <div className="mb-4">
              <svg
                className={cn("text-gray-300", {
                  "w-16 h-16": size === "sm",
                  "w-20 h-20": size === "md",
                  "w-24 h-24": size === "lg",
                })}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          )}

          {/* Title */}
          <h3
            className={cn("font-semibold text-gray-900", {
              "text-lg": size === "sm",
              "text-xl": size === "md",
              "text-2xl": size === "lg",
            })}
          >
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p
              className={cn("text-gray-600 max-w-md", {
                "text-sm": size === "sm",
                "text-base": size === "md",
                "text-lg": size === "lg",
              })}
            >
              {description}
            </p>
          )}

          {/* Action */}
          {action && <div className="mt-6">{action}</div>}
        </div>
      </CardContent>
    </Card>
  );
};

// Specialized empty states for common scenarios
export const NoDataEmptyState: React.FC<{
  title?: string;
  description?: string;
  action?: React.ReactNode;
}> = ({
  title = "No Data Available",
  description = "There's no data to display for the selected time period.",
  action,
}) => (
  <EmptyState
    title={title}
    description={description}
    action={action}
    icon={
      <svg
        className="w-12 h-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    }
  />
);

export const LoadingErrorEmptyState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
}> = ({
  title = "Failed to Load Data",
  description = "We encountered an error while loading the data. Please try again.",
  onRetry,
}) => (
  <EmptyState
    title={title}
    description={description}
    action={
      onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Try Again
        </button>
      )
    }
    icon={
      <svg
        className="w-12 h-12 text-red-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    }
  />
);

export const ComingSoonEmptyState: React.FC<{
  title?: string;
  description?: string;
}> = ({
  title = "Coming Soon",
  description = "This feature is currently under development and will be available soon.",
}) => (
  <EmptyState
    title={title}
    description={description}
    icon={
      <svg
        className="w-12 h-12 text-blue-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    }
  />
);

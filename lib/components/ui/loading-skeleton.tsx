/**
 * Loading Skeleton Component
 * Provides skeleton loaders for data fetching states
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const baseClasses = "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200";

  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: width || "100%",
        height: height || (variant === "text" ? "1rem" : "100%"),
      }}
    />
  );
}

/**
 * User Details Skeleton
 * Skeleton loader for user details modal
 */
export function UserDetailsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* User Information Card */}
      <div className="border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton width={150} height={24} />
          </div>
          <Skeleton width={80} height={24} className="rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2 border-b border-gray-100"
              >
                <Skeleton width={100} height={16} />
                <Skeleton width={120} height={16} />
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2 border-b border-gray-100"
              >
                <Skeleton width={100} height={16} />
                <Skeleton width={120} height={16} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Points Card */}
      <div className="border rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton width={120} height={24} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="text-center p-3 rounded-xl border">
              <Skeleton width={60} height={32} className="mx-auto mb-2" />
              <Skeleton width={80} height={12} className="mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Card */}
      <div className="border rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton width={140} height={24} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton width={120} height={16} />
            <Skeleton width={60} height={24} className="rounded-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                width={80}
                height={24}
                className="rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Sections */}
      <div className="border rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton width={140} height={24} />
        </div>
        <Skeleton width="100%" height={48} />
      </div>
    </div>
  );
}

/**
 * Card Skeleton
 * Skeleton loader for card components
 */
export function CardSkeleton() {
  return (
    <div className="border rounded-2xl p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton width={150} height={24} />
      </div>
      <div className="space-y-2">
        <Skeleton width="100%" height={16} />
        <Skeleton width="80%" height={16} />
        <Skeleton width="60%" height={16} />
      </div>
    </div>
  );
}

/**
 * Table Skeleton
 * Skeleton loader for table rows
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 p-4 border rounded-lg"
        >
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={12} />
          </div>
          <Skeleton width={80} height={32} />
        </div>
      ))}
    </div>
  );
}

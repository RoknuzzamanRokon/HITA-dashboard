/**
 * Skeleton Components for Better Loading States
 */

"use client";

import React from "react";

// Base skeleton component
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
}

// Chart skeleton
export function ChartSkeleton({
  height = "h-64",
  showHeader = true,
}: {
  height?: string;
  showHeader?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <div className="animate-pulse">
        {showHeader && (
          <>
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-3 w-1/3 mb-6" />
          </>
        )}
        <div className={`${height} space-y-3`}>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-3/6" />
          <Skeleton className="h-4 w-2/6" />
        </div>
      </div>
    </div>
  );
}

// Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
      <div className="p-6">
        <Skeleton className="h-4 w-1/4 mb-4" />
        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
          {/* Rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Dashboard section skeleton
export function DashboardSectionSkeleton({
  height = "h-64",
  showTitle = true,
  className = "",
}: {
  height?: string;
  showTitle?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 ${height} ${className}`}
    >
      <div className="animate-pulse">
        {showTitle && (
          <>
            <Skeleton className="h-5 w-1/4 mb-2" />
            <Skeleton className="h-3 w-1/3 mb-6" />
          </>
        )}
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Grid skeleton for navigation/features
export function GridSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4"
        >
          <div className="animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

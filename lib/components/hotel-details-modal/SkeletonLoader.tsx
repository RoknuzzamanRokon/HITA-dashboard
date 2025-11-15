"use client";

import React from "react";

/**
 * SkeletonLoader Component
 *
 * Displays an animated skeleton UI while hotel details are loading.
 * Matches the content structure to prevent layout shift when data loads.
 *
 * Requirements: 1.2, 1.3, 10.5
 */
export const SkeletonLoader: React.FC = () => {
  return (
    <div
      className="animate-pulse space-y-4 sm:space-y-6"
      role="status"
      aria-label="Loading hotel details"
    >
      {/* Hero Image Skeleton */}
      <div className="w-full h-48 sm:h-64 bg-gray-200 rounded-lg md:h-80 lg:h-96" />

      {/* Title and Basic Info Skeleton */}
      <div className="space-y-2 sm:space-y-3">
        <div className="h-6 sm:h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3" />
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="flex space-x-2 border-b border-gray-200 pb-2">
        <div className="h-9 sm:h-10 bg-gray-200 rounded w-20 sm:w-24" />
        <div className="h-9 sm:h-10 bg-gray-200 rounded w-20 sm:w-24" />
        <div className="h-9 sm:h-10 bg-gray-200 rounded w-20 sm:w-24" />
        <div className="h-9 sm:h-10 bg-gray-200 rounded w-20 sm:w-24" />
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2 sm:space-y-3">
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-20 sm:h-24 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-20 sm:h-24 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Additional Content Blocks */}
      <div className="space-y-3 sm:space-y-4">
        <div className="h-24 sm:h-32 bg-gray-200 rounded" />
        <div className="h-24 sm:h-32 bg-gray-200 rounded" />
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading hotel details, please wait...</span>
    </div>
  );
};

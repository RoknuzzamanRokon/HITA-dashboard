"use client";

/**
 * Skeleton loader component for export jobs
 * Displays placeholder content while jobs are loading
 */

import React from "react";

export function ExportJobCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Job ID skeleton */}
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          {/* Type badge skeleton */}
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
        {/* Status badge skeleton */}
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>

      {/* Progress bar skeleton */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-10"></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2"></div>
      </div>

      {/* Records skeleton */}
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Timestamps skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-48"></div>
        <div className="h-3 bg-gray-200 rounded w-48"></div>
      </div>

      {/* Action buttons skeleton */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
        <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export function ExportJobTableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      {/* Job ID */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>

      {/* Type */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </td>

      {/* Progress */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-32">
          <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
          <div className="w-full bg-gray-200 rounded-full h-1.5"></div>
        </div>
      </td>

      {/* Records */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>

      {/* Created */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );
}

export function ExportJobsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-9 bg-gray-200 rounded w-40 animate-pulse"></div>
      </div>

      {/* Desktop: Table View Skeleton */}
      <div className="hidden lg:block bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-right">
                  <div className="h-3 bg-gray-200 rounded w-16 ml-auto animate-pulse"></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: count }).map((_, index) => (
                <ExportJobTableRowSkeleton key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet: 2-column Card Grid Skeleton */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <ExportJobCardSkeleton key={index} />
        ))}
      </div>

      {/* Mobile: Single-column Card Grid Skeleton */}
      <div className="grid md:hidden grid-cols-1 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <ExportJobCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

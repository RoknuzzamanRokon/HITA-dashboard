"use client";

import React from "react";

interface ExportJobsListSkeletonProps {
  count?: number;
}

export function ExportJobsListSkeleton({
  count = 3,
}: ExportJobsListSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        <div className="h-9 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
      </div>

      {/* Desktop: Table Skeleton */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-md border border-slate-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-right">
                  <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 animate-pulse rounded ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: count }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-2 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet/Mobile: Card Skeletons */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-slate-200 dark:border-gray-700 p-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
              </div>
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
            </div>

            {/* Records */}
            <div className="mb-4">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            </div>

            {/* Timestamps */}
            <div className="space-y-2 mb-4">
              <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
              <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

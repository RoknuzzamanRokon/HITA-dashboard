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
        <div className="h-7 w-40 bg-[rgb(var(--bg-secondary))] animate-pulse rounded" />
        <div className="h-9 w-48 bg-[rgb(var(--bg-secondary))] animate-pulse rounded-lg" />
      </div>

      {/* Desktop: Table Skeleton */}
      <div className="hidden lg:block bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[rgb(var(--bg-secondary))] border-b border-[rgb(var(--border-primary))]">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 w-16 bg-[rgb(var(--bg-secondary))] animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 w-12 bg-[rgb(var(--bg-secondary))] animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 w-16 bg-[rgb(var(--bg-secondary))] animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 w-20 bg-[rgb(var(--bg-secondary))] animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 w-20 bg-[rgb(var(--bg-secondary))] animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 w-20 bg-[rgb(var(--bg-secondary))] animate-pulse rounded" />
                </th>
                <th className="px-6 py-3 text-right">
                  <div className="h-4 w-16 bg-[rgb(var(--bg-secondary))] animate-pulse rounded ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: count }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-[rgb(var(--bg-secondary))] animate-pulse rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-20 bg-[rgb(var(--bg-secondary))] animate-pulse rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-24 bg-[rgb(var(--bg-secondary))] animate-pulse rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-2 w-32 bg-[rgb(var(--bg-secondary))] animate-pulse rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-[rgb(var(--bg-secondary))] animate-pulse rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 bg-[rgb(var(--bg-secondary))] animate-pulse rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-10 w-10 bg-[rgb(var(--bg-secondary))] animate-pulse rounded-lg" />
                      <div className="h-10 w-10 bg-[rgb(var(--bg-secondary))] animate-pulse rounded-lg" />
                      <div className="h-10 w-10 bg-[rgb(var(--bg-secondary))] animate-pulse rounded-lg" />
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
            className="bg-[rgb(var(--bg-primary))] rounded-xl shadow-md border border-[rgb(var(--border-primary))] p-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-[rgb(var(--bg-secondary))] animate-pulse rounded" />
                <div className="h-6 w-24 bg-[rgb(var(--bg-secondary))] animate-pulse rounded-full" />
              </div>
              <div className="h-6 w-24 bg-[rgb(var(--bg-secondary))] animate-pulse rounded-full" />
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 w-full bg-[rgb(var(--bg-secondary))] animate-pulse rounded-full" />
            </div>

            {/* Records */}
            <div className="mb-4">
              <div className="h-4 w-32 bg-[rgb(var(--bg-secondary))] animate-pulse rounded" />
            </div>

            {/* Timestamps */}
            <div className="space-y-2 mb-4">
              <div className="h-3 w-48 bg-[rgb(var(--bg-secondary))] animate-pulse rounded" />
              <div className="h-3 w-48 bg-[rgb(var(--bg-secondary))] animate-pulse rounded" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-4 border-t border-[rgb(var(--border-primary))]">
              <div className="h-10 flex-1 bg-[rgb(var(--bg-secondary))] animate-pulse rounded-lg" />
              <div className="h-10 flex-1 bg-[rgb(var(--bg-secondary))] animate-pulse rounded-lg" />
              <div className="h-10 w-10 bg-[rgb(var(--bg-secondary))] animate-pulse rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Charts Section Component
 * Main dashboard charts with lazy loading
 */

"use client";

import React, { Suspense, lazy } from "react";
import { PermissionGuard } from "@/lib/components/auth/permission-guard";
import { Permission } from "@/lib/utils/rbac";
import { ChartErrorBoundary } from "@/lib/components/dashboard/chart-error-boundary";
import { ChartSkeleton } from "@/lib/components/ui/skeletons";

// Lazy load chart components for better performance
const RevenueTrendChart = lazy(() =>
  import("@/lib/components/dashboard").then((module) => ({
    default: module.RevenueTrendChart,
  })),
);

const UserActivityChart = lazy(() =>
  import("@/lib/components/dashboard").then((module) => ({
    default: module.UserActivityChart,
  })),
);

const BookingSourcesChart = lazy(() =>
  import("@/lib/components/dashboard").then((module) => ({
    default: module.BookingSourcesChart,
  })),
);

const SupplierDataFreshnessCardWithGraphs = lazy(() =>
  import("@/lib/components/dashboard").then((module) => ({
    default: module.SupplierDataFreshnessCardWithGraphs,
  })),
);

interface ChartsSectionProps {
  statsLoading: boolean;
  stats: any;
}

export function ChartsSection({ statsLoading, stats }: ChartsSectionProps) {
  return (
    <ChartErrorBoundary>
      {/* Main Revenue Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Suspense fallback={<ChartSkeleton height="h-80" />}>
            <RevenueTrendChart loading={statsLoading} stats={stats} />
          </Suspense>
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Suspense fallback={<ChartSkeleton height="h-64" />}>
          <UserActivityChart loading={statsLoading} stats={stats} />
        </Suspense>

        <PermissionGuard
          permissions={[
            Permission.VIEW_ALL_TRANSACTIONS,
            Permission.MANAGE_POINTS,
          ]}
        >
          <Suspense fallback={<ChartSkeleton height="h-64" />}>
            <BookingSourcesChart loading={statsLoading} stats={stats} />
          </Suspense>
        </PermissionGuard>

        <PermissionGuard
          permissions={[
            Permission.VIEW_ALL_TRANSACTIONS,
            Permission.MANAGE_POINTS,
          ]}
        >
          <Suspense fallback={<ChartSkeleton height="h-64" />}>
            <SupplierDataFreshnessCardWithGraphs loading={statsLoading} />
          </Suspense>
        </PermissionGuard>
      </div>
    </ChartErrorBoundary>
  );
}

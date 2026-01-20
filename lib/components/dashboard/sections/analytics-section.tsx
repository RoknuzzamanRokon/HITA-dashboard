/**
 * Analytics Section Component
 * Advanced analytics charts with lazy loading
 */

"use client";

import React, { Suspense, lazy } from "react";
import { PermissionGuard } from "@/lib/components/auth/permission-guard";
import { Permission } from "@/lib/utils/rbac";
import { ChartErrorBoundary } from "@/lib/components/dashboard/chart-error-boundary";

// Lazy load analytics components
const CombinedActivityChart = lazy(() =>
  import("@/lib/components/dashboard").then((module) => ({
    default: module.CombinedActivityChart,
  })),
);

const UserRegistrationTrendChart = lazy(() =>
  import("@/lib/components/dashboard").then((module) => ({
    default: module.UserRegistrationTrendChart,
  })),
);

const UserLoginTimelineChart = lazy(() =>
  import("@/lib/components/dashboard").then((module) => ({
    default: module.UserLoginTimelineChart,
  })),
);

const ApiRequestTimelineChart = lazy(() =>
  import("@/lib/components/dashboard").then((module) => ({
    default: module.ApiRequestTimelineChart,
  })),
);

const SupplierFreshnessScatterChart = lazy(() =>
  import("@/lib/components/dashboard").then((module) => ({
    default: module.SupplierFreshnessScatterChart,
  })),
);

// Analytics loading skeleton
function AnalyticsSkeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

interface AnalyticsSectionProps {
  chartsData: any;
  chartsLoading: boolean;
  chartsRefreshing: boolean;
}

export function AnalyticsSection({
  chartsData,
  chartsLoading,
  chartsRefreshing,
}: AnalyticsSectionProps) {
  return (
    <PermissionGuard permissions={[Permission.VIEW_ANALYTICS]}>
      <ChartErrorBoundary
        onError={(error, errorInfo) => {
          console.error("Analytics section error:", error, errorInfo);
        }}
      >
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Combined Activity - 3 columns - Admin/Super User Only */}
            <PermissionGuard
              permissions={[
                Permission.VIEW_ALL_USERS,
                Permission.MANAGE_SYSTEM_SETTINGS,
              ]}
            >
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <Suspense fallback={<AnalyticsSkeleton className="h-64" />}>
                  <CombinedActivityChart
                    registrations={chartsData?.registrations || []}
                    logins={chartsData?.logins || []}
                    apiRequests={chartsData?.apiRequests || []}
                    loading={chartsLoading}
                    isRefreshing={chartsRefreshing}
                  />
                </Suspense>
              </div>
            </PermissionGuard>

            {/* User Registration Trend - 1 column */}
            <div className="col-span-1">
              <Suspense fallback={<AnalyticsSkeleton />}>
                <UserRegistrationTrendChart
                  data={chartsData?.registrations || []}
                  loading={chartsLoading}
                  isRefreshing={chartsRefreshing}
                />
              </Suspense>
            </div>

            {/* User Login Timeline - 1 column */}
            <div className="col-span-1">
              <Suspense fallback={<AnalyticsSkeleton />}>
                <UserLoginTimelineChart
                  data={chartsData?.logins || []}
                  loading={chartsLoading}
                  isRefreshing={chartsRefreshing}
                />
              </Suspense>
            </div>

            {/* API Request Timeline - 1 column */}
            <div className="col-span-1">
              <Suspense fallback={<AnalyticsSkeleton />}>
                <ApiRequestTimelineChart
                  data={chartsData?.apiRequests || []}
                  loading={chartsLoading}
                  isRefreshing={chartsRefreshing}
                />
              </Suspense>
            </div>

            {/* Supplier Freshness - Full width on large screens */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <Suspense fallback={<AnalyticsSkeleton className="h-64" />}>
                <SupplierFreshnessScatterChart
                  suppliers={chartsData?.suppliers || []}
                  loading={chartsLoading}
                  isRefreshing={chartsRefreshing}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </ChartErrorBoundary>
    </PermissionGuard>
  );
}

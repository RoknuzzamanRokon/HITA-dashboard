/**
 * Dashboard Components
 * Export all dashboard-related components
 */

export { default as StatsCard } from "./stats-card";
export type { StatsCardProps } from "./stats-card";

export { default as ChartWrapper } from "./chart-wrapper";
export type { ChartWrapperProps } from "./chart-wrapper";

export {
    RevenueTrendChart,
    UserActivityChart,
    BookingSourcesChart,
} from "./analytics-charts";

export { SupplierFreshnessChart } from "./supplier-freshness-chart";
export { SupplierDataFreshnessCardWithGraphs } from "./supplier-data-freshness-card-with-graphs";

export {
    SupplierHotelCountsChart,
    UserRegistrationTrendChart,
    SupplierFreshnessScatterChart,
    UserLoginTimelineChart,
    ApiRequestTimelineChart,
    PackagePointComparisonChart,
    CombinedActivityChart,
} from "./analytics-charts-new";
export type {
    SupplierHotelCountsChartProps,
    UserRegistrationTrendChartProps,
    SupplierFreshnessScatterChartProps,
    UserLoginTimelineChartProps,
    ApiRequestTimelineChartProps,
    PackagePointComparisonChartProps,
    CombinedActivityChartProps,
} from "./analytics-charts-new";

export { QuickActions } from "./quick-actions";
export { RecentTransactions } from "./recent-transactions";
export { UserAnalyticsSection } from "./user-analytics-section";

export { default as ChartSkeleton } from "./chart-skeleton";
export type { ChartSkeletonProps } from "./chart-skeleton";

export { default as ChartError } from "./chart-error";
export type { ChartErrorProps } from "./chart-error";

export { default as ChartEmptyState } from "./chart-empty-state";
export type { ChartEmptyStateProps } from "./chart-empty-state";

export { ChartErrorBoundary } from "./chart-error-boundary";
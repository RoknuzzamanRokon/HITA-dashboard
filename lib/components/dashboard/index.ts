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

export { RealTimeMetrics } from "./real-time-metrics";
export { LiveActivityFeed } from "./live-activity-feed";
export { QuickActions } from "./quick-actions";
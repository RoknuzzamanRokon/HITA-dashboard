/**
 * Chart Skeleton Component
 * Loading state for chart components with consistent dimensions and styling
 */

interface ChartSkeletonProps {
  height?: number;
  className?: string;
}

export default function ChartSkeleton({
  height = 300,
  className = "",
}: ChartSkeletonProps) {
  return (
    <div
      className={`w-full rounded-lg bg-[rgb(var(--bg-secondary))] p-6 ${className}`}
      style={{ height: `${height}px` }}
      role="status"
      aria-label="Loading chart data"
    >
      {/* Chart title skeleton */}
      <div className="mb-4 h-6 w-48 animate-pulse rounded bg-[rgb(var(--bg-tertiary))]" />

      {/* Chart content skeleton */}
      <div className="flex h-[calc(100%-3rem)] items-end justify-between gap-2">
        {/* Simulated bar chart bars with varying heights */}
        {[65, 80, 45, 90, 70, 55, 85, 60].map((height, index) => (
          <div
            key={index}
            className="flex-1 animate-pulse rounded-t bg-[rgb(var(--bg-tertiary))]"
            style={{
              height: `${height}%`,
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* X-axis labels skeleton */}
      <div className="mt-2 flex justify-between">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
          <div
            key={index}
            className="h-3 w-8 animate-pulse rounded bg-[rgb(var(--bg-tertiary))]"
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        ))}
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading chart data, please wait...</span>
    </div>
  );
}

export type { ChartSkeletonProps };

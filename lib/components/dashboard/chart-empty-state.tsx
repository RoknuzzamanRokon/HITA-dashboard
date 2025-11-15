/**
 * Chart Empty State Component
 * No-data state for chart components with helpful messaging
 */

interface ChartEmptyStateProps {
  title?: string;
  message?: string;
  height?: number;
  className?: string;
}

export default function ChartEmptyState({
  title = "No Data Available",
  message = "There is no data to display at this time. Data will appear here once it becomes available.",
  height = 300,
  className = "",
}: ChartEmptyStateProps) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))] p-6 ${className}`}
      style={{ height: `${height}px` }}
      role="status"
      aria-live="polite"
    >
      {/* Empty state icon */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--bg-tertiary))]">
        <svg
          className="h-8 w-8 text-[rgb(var(--text-tertiary))]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>

      {/* Empty state title */}
      <h3 className="mb-2 text-base font-medium text-[rgb(var(--text-primary))]">
        {title}
      </h3>

      {/* Empty state message */}
      <p className="max-w-sm text-center text-sm text-[rgb(var(--text-secondary))]">
        {message}
      </p>
    </div>
  );
}

export type { ChartEmptyStateProps };

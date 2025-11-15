/**
 * Chart Error Component
 * Error state for chart components with retry functionality
 */

interface ChartErrorProps {
  message?: string;
  onRetry?: () => void;
  height?: number;
  className?: string;
}

export default function ChartError({
  message = "Failed to load chart data",
  onRetry,
  height = 300,
  className = "",
}: ChartErrorProps) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))] p-6 ${className}`}
      style={{ height: `${height}px` }}
      role="alert"
      aria-live="polite"
    >
      {/* Error icon */}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--error))]/10">
        <svg
          className="h-6 w-6 text-[rgb(var(--error))]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      {/* Error message */}
      <h3 className="mb-2 text-base font-medium text-[rgb(var(--text-primary))]">
        Unable to Load Chart
      </h3>
      <p className="mb-4 text-center text-sm text-[rgb(var(--text-secondary))]">
        {message}
      </p>

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-md bg-[rgb(var(--info))] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[rgb(var(--info))]/90 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--border-focus))] focus:ring-offset-2"
          aria-label="Retry loading chart data"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Retry
        </button>
      )}
    </div>
  );
}

export type { ChartErrorProps };

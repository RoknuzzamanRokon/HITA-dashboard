"use client";

import React from "react";
import { AlertCircle, RefreshCw, FileText } from "lucide-react";
import type { ApiError } from "@/lib/types/api";

/**
 * ErrorState Component Props
 */
export interface ErrorStateProps {
  error: ApiError;
  ittid: string;
  requestId?: string | null;
  onRetry: () => void;
  onReport?: () => void;
}

/**
 * ErrorState Component
 *
 * Displays error information with recovery options when hotel details fail to load.
 * Provides network-specific messaging and actionable buttons for retry and reporting.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  ittid,
  requestId,
  onRetry,
  onReport,
}) => {
  // Default report handler
  const handleReport = () => {
    if (onReport) {
      onReport();
    } else {
      const report = generateErrorReport(ittid, error, requestId || null);
      console.error("Error Report:", report);
      alert(
        `Error report generated. Please contact support with Request ID: ${
          requestId || "N/A"
        }`
      );
    }
  };

  // Determine error-specific messaging
  const getErrorMessage = (): string => {
    if (error.status === 0) {
      return "No connection. Please check your network.";
    }
    if (error.status === 401) {
      return "Session expired. Please log in again.";
    }
    if (error.status === 403) {
      return "You don't have permission to view this hotel.";
    }
    if (error.status === 404) {
      return "Hotel details not found.";
    }
    if (error.status >= 500) {
      return "Server error. Please try again later.";
    }
    return error.message || "Unable to load details";
  };

  const errorMessage = getErrorMessage();
  const isNetworkError = error.status === 0;
  const canRetry = error.status === 0 || error.status >= 500;

  return (
    <div
      className="flex flex-col items-center justify-center p-4 sm:p-8 space-y-3 sm:space-y-4 min-h-[300px] sm:min-h-[400px]"
      role="alert"
      aria-live="assertive"
    >
      {/* Error Icon */}
      <AlertCircle
        className="h-12 w-12 sm:h-16 sm:w-16 text-red-500"
        aria-hidden="true"
      />

      {/* Error Message */}
      <div className="text-center max-w-md px-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
          {errorMessage}
        </h3>

        {/* Additional context for network errors */}
        {isNetworkError && (
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Check your internet connection and try again.
          </p>
        )}

        {/* Error Code Display */}
        {error.status > 0 && (
          <p className="text-xs text-gray-500 mt-2 sm:mt-3 font-mono">
            Error code: {error.status}
          </p>
        )}

        {/* Request ID for debugging */}
        {requestId && (
          <p className="text-xs text-gray-400 mt-1 font-mono break-all">
            Request ID: {requestId}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4 w-full sm:w-auto px-4 sm:px-0">
        {/* Retry Button - Primary action for retryable errors */}
        {canRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            aria-label="Retry loading hotel details"
          >
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Retry
          </button>
        )}

        {/* Report Button - Secondary action */}
        <button
          onClick={handleReport}
          className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 bg-gray-200 text-gray-700 text-sm sm:text-base rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          aria-label="Report this issue"
        >
          <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
          Report Issue
        </button>
      </div>

      {/* Additional help text */}
      <p className="text-xs text-gray-500 mt-3 sm:mt-4 text-center max-w-sm px-4">
        If the problem persists, please report the issue with the details above.
      </p>
    </div>
  );
};

/**
 * Generate error report for debugging
 *
 * @param ittid - Hotel ITT ID
 * @param error - API error object
 * @param requestId - Optional request ID for tracking
 * @returns Error report object
 */
export function generateErrorReport(
  ittid: string,
  error: ApiError,
  requestId: string | null
): {
  timestamp: string;
  ittid: string;
  errorCode: number;
  errorMessage: string;
  requestId: string | null;
  userAgent: string;
  url: string;
} {
  return {
    timestamp: new Date().toISOString(),
    ittid,
    errorCode: error.status,
    errorMessage: error.message,
    requestId,
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    url: typeof window !== "undefined" ? window.location.href : "unknown",
  };
}

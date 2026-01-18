/**
 * Fallback Notice Component
 * Shows a notice when using fallback/cached data due to API unavailability
 */

"use client";

import React from "react";
import { Database, X, RefreshCw } from "lucide-react";

interface FallbackNoticeProps {
  isVisible: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function FallbackNotice({
  isVisible,
  onDismiss,
  onRetry,
  isRetrying = false,
}: FallbackNoticeProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Database className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Offline Mode Active
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            The dashboard is currently showing cached data because the API is
            unavailable. Some information may not be up-to-date. The system will
            automatically retry connecting to the API.
          </p>
          <div className="flex items-center space-x-3 mt-3">
            {onRetry && (
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="inline-flex items-center space-x-1 text-sm font-medium text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
                />
                <span>{isRetrying ? "Retrying..." : "Retry Now"}</span>
              </button>
            )}
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Data last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

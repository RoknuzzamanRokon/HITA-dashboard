/**
 * ApiKeyDisplay component
 * Displays API key with masked/unmasked toggle and copy-to-clipboard functionality
 */

"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { clsx } from "clsx";

export interface ApiKeyDisplayProps {
  apiKey: string | null;
  onCopy?: () => void;
}

export const ApiKeyDisplay: React.FC<ApiKeyDisplayProps> = ({
  apiKey,
  onCopy,
}) => {
  const [isMasked, setIsMasked] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  // Handle null/empty API key state
  if (!apiKey) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
        role="status"
        aria-label="No API key available"
      >
        <p className="text-sm text-gray-500 text-center">
          No API key generated yet
        </p>
      </div>
    );
  }

  // Toggle masked/unmasked state
  const toggleMask = () => {
    setIsMasked(!isMasked);
  };

  // Copy to clipboard functionality
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopySuccess(true);

      // Call optional onCopy callback
      if (onCopy) {
        onCopy();
      }

      // Reset success feedback after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy API key:", err);
    }
  };

  // Mask the API key (show first 8 and last 4 characters)
  const getMaskedKey = () => {
    if (apiKey.length <= 12) {
      return "••••••••••••";
    }
    const start = apiKey.substring(0, 8);
    const end = apiKey.substring(apiKey.length - 4);
    return `${start}${"•".repeat(Math.max(apiKey.length - 12, 8))}${end}`;
  };

  const displayKey = isMasked ? getMaskedKey() : apiKey;

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4 space-y-3"
      role="region"
      aria-label="API key display"
    >
      {/* ARIA live region for copy status */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {copySuccess && "API key copied to clipboard"}
        {isMasked ? "API key is hidden" : "API key is visible"}
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700" id="api-key-label">
          API Key
        </label>
        <button
          onClick={toggleMask}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          aria-label={isMasked ? "Show API key" : "Hide API key"}
          aria-pressed={!isMasked}
        >
          {isMasked ? "Show" : "Hide"}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={clsx(
            "flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2",
            "font-mono text-sm text-gray-900 break-all"
          )}
          aria-labelledby="api-key-label"
          aria-live="polite"
        >
          {displayKey}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={copySuccess}
          className="shrink-0"
          aria-label="Copy API key to clipboard"
        >
          {copySuccess ? (
            <>
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </>
          )}
        </Button>
      </div>

      {copySuccess && (
        <p
          className="text-xs text-green-600 flex items-center"
          role="status"
          aria-live="polite"
        >
          <svg
            className="w-3 h-3 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          API key copied to clipboard
        </p>
      )}
    </div>
  );
};

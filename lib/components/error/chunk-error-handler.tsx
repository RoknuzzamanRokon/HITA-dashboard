"use client";

import { useEffect } from "react";

/**
 * Handles chunk loading errors by automatically refreshing the page
 * This prevents users from getting stuck with outdated JavaScript chunks
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      const error = event.error;

      // Check if this is a chunk loading error
      if (
        error?.name === "ChunkLoadError" ||
        (error?.message && error.message.includes("Loading chunk")) ||
        (event.message && event.message.includes("Loading chunk"))
      ) {
        console.warn(
          "🔄 Chunk loading error detected, refreshing page...",
          error
        );

        // Show a brief message before refreshing
        const shouldRefresh = confirm(
          "The application has been updated. Click OK to refresh and get the latest version."
        );

        if (shouldRefresh) {
          window.location.reload();
        }
      }
    };

    // Listen for unhandled errors
    window.addEventListener("error", handleChunkError);

    // Listen for unhandled promise rejections (for dynamic imports)
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;

      if (
        error?.name === "ChunkLoadError" ||
        (error?.message && error.message.includes("Loading chunk"))
      ) {
        console.warn(
          "🔄 Chunk loading promise rejection detected, refreshing page...",
          error
        );

        const shouldRefresh = confirm(
          "The application has been updated. Click OK to refresh and get the latest version."
        );

        if (shouldRefresh) {
          window.location.reload();
        }

        // Prevent the error from being logged to console
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handlePromiseRejection);

    return () => {
      window.removeEventListener("error", handleChunkError);
      window.removeEventListener("unhandledrejection", handlePromiseRejection);
    };
  }, []);

  return null; // This component doesn't render anything
}

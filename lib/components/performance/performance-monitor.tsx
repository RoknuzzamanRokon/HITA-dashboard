/**
 * Performance Monitor Component
 * Helps track component render times and API call durations
 */

"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface PerformanceMonitorProps {
  name: string;
  children: React.ReactNode;
  logToConsole?: boolean;
}

export function PerformanceMonitor({
  name,
  children,
  logToConsole = process.env.NODE_ENV === "development",
}: PerformanceMonitorProps) {
  const renderStartTime = useRef<number>(performance.now());
  const mountTime = useRef<number | null>(null);

  useEffect(() => {
    // Component mounted
    mountTime.current = performance.now();
    const mountDuration = mountTime.current - renderStartTime.current;

    if (logToConsole) {
      console.log(`🚀 ${name} mounted in ${mountDuration.toFixed(2)}ms`);
    }

    return () => {
      // Component unmounted
      if (logToConsole && mountTime.current) {
        const totalLifetime = performance.now() - mountTime.current;
        console.log(`🔄 ${name} unmounted after ${totalLifetime.toFixed(2)}ms`);
      }
    };
  }, [name, logToConsole]);

  useEffect(() => {
    // Component re-rendered
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTime.current;

    if (logToConsole && mountTime.current) {
      console.log(`🔄 ${name} re-rendered in ${renderDuration.toFixed(2)}ms`);
    }

    renderStartTime.current = renderEndTime;
  });

  return <>{children}</>;
}

/**
 * Hook to measure API call performance
 */
export function useApiPerformance() {
  const measureApiCall = useCallback(async function <T>(
    apiCall: () => Promise<T>,
    name: string
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;

      if (process.env.NODE_ENV === "development") {
        console.log(
          `📡 API call "${name}" completed in ${duration.toFixed(2)}ms`
        );
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      if (process.env.NODE_ENV === "development") {
        console.error(
          `❌ API call "${name}" failed after ${duration.toFixed(2)}ms:`,
          error
        );
      }

      throw error;
    }
  },
  []);

  return { measureApiCall };
}

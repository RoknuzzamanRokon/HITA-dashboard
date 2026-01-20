/**
 * Performance Monitor Component
 * Tracks and displays performance metrics for dashboard optimization
 */

"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';

interface PerformanceMetrics {
  timeToFirstByte: number | null;
  timeToInteractive: number | null;
  domContentLoaded: number | null;
  pageLoad: number | null;
  apiResponseTimes: Record<string, number>;
  componentLoadTimes: Record<string, number>;
  memoryUsage: number | null;
  startTime: number;
}

export function PerformanceMonitor() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    timeToFirstByte: null,
    timeToInteractive: null,
    domContentLoaded: null,
    pageLoad: null,
    apiResponseTimes: {},
    componentLoadTimes: {},
    memoryUsage: null,
    startTime: Date.now(),
  });

  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Track performance metrics
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const performance = window.performance;
      const navigation = performance.getEntriesByType("navigation")[0] as any;

      // Only show for admins in development
      const shouldShow = user?.role === 'super_user' && process.env.NODE_ENV === 'development';
      setIsVisible(shouldShow);

      if (!shouldShow) return;

      // Capture key performance metrics
      const newMetrics: PerformanceMetrics = {
        timeToFirstByte: navigation?.responseStart || null,
        timeToInteractive: null,
        domContentLoaded: null,
        pageLoad: null,
        apiResponseTimes: {},
        componentLoadTimes: {},
        memoryUsage: null,
        startTime: metrics.startTime,
      };

      // Measure DOM Content Loaded
      const domContentLoadedTime = performance.timing?.domContentLoadedEventEnd -
        performance.timing?.navigationStart;
      if (domContentLoadedTime) {
        newMetrics.domContentLoaded = domContentLoadedTime;
      }

      // Measure Page Load
      const pageLoadTime = performance.timing?.loadEventEnd -
        performance.timing?.navigationStart;
      if (pageLoadTime) {
        newMetrics.pageLoad = pageLoadTime;
      }

      // Measure Time to Interactive (approximation)
      const timeToInteractive = performance.timing?.domInteractive -
        performance.timing?.navigationStart;
      if (timeToInteractive) {
        newMetrics.timeToInteractive = timeToInteractive;
      }

      setMetrics(newMetrics);

      // Log performance metrics to console
      console.log('📊 Performance Metrics:', {
        timeToFirstByte: `${newMetrics.timeToFirstByte}ms`,
        timeToInteractive: `${newMetrics.timeToInteractive}ms`,
        domContentLoaded: `${newMetrics.domContentLoaded}ms`,
        pageLoad: `${newMetrics.pageLoad}ms`,
        totalLoadTime: `${Date.now() - newMetrics.startTime}ms`,
      });
    }
  }, [user?.role]);

  // Track API response times
  const trackApiResponse = (apiName: string, responseTime: number) => {
    if (!isVisible) return;

    setMetrics(prev => ({
      ...prev,
      apiResponseTimes: {
        ...prev.apiResponseTimes,
        [apiName]: responseTime,
      },
    }));

    console.log(`🚀 API ${apiName} response time: ${responseTime}ms`);
  };

  // Track component load times
  const trackComponentLoad = (componentName: string, loadTime: number) => {
    if (!isVisible) return;

    setMetrics(prev => ({
      ...prev,
      componentLoadTimes: {
        ...prev.componentLoadTimes,
        [componentName]: loadTime,
      },
    }));

    console.log(`📊 Component ${componentName} load time: ${loadTime}ms`);
  };

  if (!isVisible) return null;

  const totalLoadTime = Date.now() - metrics.startTime;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          🚀 Performance Monitor
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>

      <div className="text-xs">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600 dark:text-gray-300">Total Load:</span>
          <span className="font-mono font-semibold text-green-600 dark:text-green-400">
            {totalLoadTime}ms
          </span>
        </div>

        {metrics.domContentLoaded && (
          <div className="flex justify-between mb-1">
            <span className="text-gray-600 dark:text-gray-300">DOM Ready:</span>
            <span className="font-mono text-blue-600 dark:text-blue-400">
              {metrics.domContentLoaded}ms
            </span>
          </div>
        )}

        {metrics.pageLoad && (
          <div className="flex justify-between mb-1">
            <span className="text-gray-600 dark:text-gray-300">Page Load:</span>
            <span className="font-mono text-purple-600 dark:text-purple-400">
              {metrics.pageLoad}ms
            </span>
          </div>
        )}

        {showDetails && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">API Times:</h4>
            {Object.entries(metrics.apiResponseTimes).map(([apiName, time]) => (
              <div key={apiName} className="flex justify-between text-xs mb-0.5">
                <span className="text-gray-500 dark:text-gray-400 truncate max-w-[80px]">
                  {apiName}:
                </span>
                <span className="font-mono text-orange-600 dark:text-orange-400">
                  {time}ms
                </span>
              </div>
            ))}

            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1 mt-2">Components:</h4>
            {Object.entries(metrics.componentLoadTimes).map(([componentName, time]) => (
              <div key={componentName} className="flex justify-between text-xs mb-0.5">
                <span className="text-gray-500 dark:text-gray-400 truncate max-w-[80px]">
                  {componentName}:
                </span>
                <span className="font-mono text-teal-600 dark:text-teal-400">
                  {time}ms
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance indicator */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {totalLoadTime < 1000 ? '⚡ Blazing Fast' : totalLoadTime < 2000 ? '🚀 Fast' : '🐢 Needs Optimization'}
        </span>
        <div className="w-16 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className={`h-full ${
              totalLoadTime < 1000 ? 'bg-green-500' : totalLoadTime < 2000 ? 'bg-blue-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, (2000 - totalLoadTime) / 20)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Hook for tracking performance in components
export function usePerformanceTracking(componentName: string) {
  const startTime = useRef(Date.now());
  const { user } = useAuth();

  useEffect(() => {
    // Only track in development for admins
    if (process.env.NODE_ENV === 'development' && user?.role === 'super_user') {
      const loadTime = Date.now() - startTime.current;
      
      // Log to console
      console.log(`📊 ${componentName} loaded in ${loadTime}ms`);
      
      // You could also send this to analytics
      // analytics.track('component_load', { name: componentName, time: loadTime });
    }
  }, [componentName, user?.role]);
}
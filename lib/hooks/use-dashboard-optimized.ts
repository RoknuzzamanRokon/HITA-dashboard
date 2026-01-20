/**
 * Optimized Dashboard Hook - Simplified Version
 * Provides performance optimizations without breaking existing build
 */

"use client";

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DASHBOARD_QUERY_KEYS } from './use-dashboard-data';

export function useOptimizedDashboard() {
  const queryClient = useQueryClient();
  const [isOptimized, setIsOptimized] = useState(false);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);

  useEffect(() => {
    // Simple optimization: prefetch data after a short delay
    const optimizationTimeout = setTimeout(() => {
      try {
        console.log('🚀 Applying dashboard optimizations...');
        
        // Prefetch dashboard queries
        queryClient.prefetchQuery({
          queryKey: DASHBOARD_QUERY_KEYS.stats,
        });

        queryClient.prefetchQuery({
          queryKey: DASHBOARD_QUERY_KEYS.pointsSummary,
        });

        setIsOptimized(true);
        console.log('✅ Dashboard optimizations applied');
      } catch (error) {
        console.error('❌ Optimization failed:', error);
        setOptimizationError('Optimization failed');
      }
    }, 1000); // Delay to allow critical resources to load first

    return () => clearTimeout(optimizationTimeout);
  }, [queryClient]);

  return {
    isOptimized,
    optimizationError,
  };
}

// Simple performance tracking hook
export function useSimplePerformanceTracking(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      
      return () => {
        const loadTime = performance.now() - startTime;
        console.log(`📊 ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      };
    }
  }, [componentName]);
}
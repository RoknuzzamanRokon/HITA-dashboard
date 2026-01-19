/**
 * Dashboard Prefetch Hook
 * Preloads data before it's needed for instant UI rendering
 */

"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DASHBOARD_QUERY_KEYS } from './use-dashboard-data';

interface PrefetchDashboardDataOptions {
  userRole?: string;
  prefetchDelay?: number;
}

export function usePrefetchDashboardData(options: PrefetchDashboardDataOptions = {}) {
  const {
    userRole,
    prefetchDelay = 1000, // Default: 1 second after page load
  } = options;

  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up prefetching after a short delay to allow critical resources to load first
    const prefetchTimeout = setTimeout(() => {
      console.log('🚀 Prefetching dashboard data for instant rendering...');

      // Prefetch dashboard stats
      queryClient.prefetchQuery({
        queryKey: DASHBOARD_QUERY_KEYS.stats,
        staleTime: 5 * 60 * 1000, // 5 minutes stale time
      });

      // Prefetch points summary
      queryClient.prefetchQuery({
        queryKey: DASHBOARD_QUERY_KEYS.pointsSummary,
        staleTime: 5 * 60 * 1000, // 5 minutes stale time
      });

      // Log prefetching activity
      console.log('✅ Dashboard data prefetching initiated');
    }, prefetchDelay);

    return () => clearTimeout(prefetchTimeout);
  }, [queryClient, prefetchDelay]);

  // Additional optimization: prefetch when user scrolls near bottom of page
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const pageHeight = document.body.scrollHeight;
      const scrollThreshold = 0.7; // 70% of page height

      if (scrollPosition > pageHeight * scrollThreshold) {
        console.log('📊 User scrolled near bottom, prefetching more data...');
        
        // Prefetch charts data when user scrolls down
        // This is handled by the LazySection components with aggressive rootMargin
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// Helper function for manual prefetching
interface ManualPrefetchOptions {
  queryClient: any;
  userRole?: string;
}

export async function prefetchDashboardDataManually({ queryClient, userRole }: ManualPrefetchOptions) {
  try {
    console.log('🔄 Manual prefetch initiated...');

    // Prefetch all dashboard queries in parallel
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: DASHBOARD_QUERY_KEYS.stats,
      }),
      queryClient.prefetchQuery({
        queryKey: DASHBOARD_QUERY_KEYS.pointsSummary,
      }),
    ]);

    console.log('✅ Manual prefetch completed');
    return true;
  } catch (error) {
    console.error('❌ Prefetch failed:', error);
    return false;
  }
}
/**
 * Instant Dashboard Data Hook
 * Provides server-side data fetching and instant client-side hydration
 */

"use client";

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DASHBOARD_QUERY_KEYS } from './use-dashboard-data';
import { apiClient } from '@/lib/api/client';

export function useInstantDashboardData() {
  const queryClient = useQueryClient();
  const [isHydrated, setIsHydrated] = useState(false);
  const [hydrationError, setHydrationError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have server-rendered data in the HTML
    const checkForServerData = () => {
      if (typeof window !== 'undefined') {
        try {
          // Look for server-injected data in the DOM
          const serverDataElement = document.getElementById('__SERVER_DASHBOARD_DATA__');
          
          if (serverDataElement) {
            const serverData = JSON.parse(serverDataElement.textContent || '{}');
            
            console.log('🚀 Found server-rendered dashboard data, hydrating...');
            
            // Hydrate React Query cache with server data
            if (serverData.stats) {
              queryClient.setQueryData(DASHBOARD_QUERY_KEYS.stats, serverData.stats);
            }
            
            if (serverData.pointsSummary) {
              queryClient.setQueryData(DASHBOARD_QUERY_KEYS.pointsSummary, serverData.pointsSummary);
            }
            
            setIsHydrated(true);
            console.log('✅ Dashboard data hydrated from server');
            
            return true;
          }
        } catch (error) {
          console.error('❌ Failed to hydrate server data:', error);
          setHydrationError('Failed to load server data');
        }
      }
      
      return false;
    };

    // Attempt to hydrate from server data
    const hasServerData = checkForServerData();
    
    // If no server data, initiate instant client-side fetch
    if (!hasServerData) {
      console.log('🔄 No server data found, initiating instant client fetch...');
      fetchInstantData();
    }
  }, [queryClient]);

  const fetchInstantData = async () => {
    try {
      // Fetch all dashboard data in parallel
      const [statsResponse, pointsResponse] = await Promise.all([
        apiClient.get('/dashboard/stats', true, 1), // 1 retry
        apiClient.get('/dashboard/points-summary', true, 1), // 1 retry
      ]);

      // Update React Query cache immediately
      if (statsResponse.success && statsResponse.data) {
        queryClient.setQueryData(DASHBOARD_QUERY_KEYS.stats, statsResponse.data);
      }

      if (pointsResponse.success && pointsResponse.data) {
        queryClient.setQueryData(DASHBOARD_QUERY_KEYS.pointsSummary, pointsResponse.data);
      }

      setIsHydrated(true);
      console.log('✅ Instant dashboard data fetched and cached');
    } catch (error) {
      console.error('❌ Instant data fetch failed:', error);
      setHydrationError('Failed to fetch instant data');
    }
  };

  return {
    isHydrated,
    hydrationError,
    refetchInstantData: fetchInstantData,
  };
}

// Server-side data fetching function (for Next.js server components)
export async function fetchServerDashboardData(token: string) {
  try {
    console.log('🚀 Fetching dashboard data on server...');
    
    // Create API client with server-side configuration
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Fetch data in parallel on the server
    const [statsResponse, pointsResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1.0/dashboard/stats`, {
        headers,
        method: 'GET',
        // Note: 'next' config is only available in Next.js server components
        // For regular fetch, we'll handle caching differently
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1.0/dashboard/points-summary`, {
        headers,
        method: 'GET',
        // Note: 'next' config is only available in Next.js server components
      }),
    ]);

    const statsData = await statsResponse.json();
    const pointsData = await pointsResponse.json();

    console.log('✅ Server data fetched successfully');
    
    return {
      stats: statsData,
      pointsSummary: pointsData,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Server data fetch failed:', error);
    return {
      stats: null,
      pointsSummary: null,
      error: 'Failed to fetch server data',
    };
  }
}
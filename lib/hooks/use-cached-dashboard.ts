/**
 * Cached Dashboard Hook with Instant Loading
 * Provides immediate cached data while updating in background
 */

"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/auth-context';
import { usePersistentCache, CACHE_CONFIGS } from './use-persistent-cache';
import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/config';
import type { DashboardStats } from './use-dashboard-data';

// Enhanced dashboard data fetcher with caching
async function fetchDashboardDataWithCache(): Promise<DashboardStats> {
    console.log('🔄 Fetching fresh dashboard data...');

    const response = await apiClient.get<any>(apiEndpoints.users.dashboardStats, true);

    if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch dashboard stats');
    }

    const data = response.data;

    const dashboardStats: DashboardStats = {
        totalUsers: data.total_users || 0,
        superUsers: data.super_users || 0,
        adminUsers: data.admin_users || 0,
        generalUsers: data.general_users || 0,
        activeUsers: data.active_users || 0,
        inactiveUsers: data.inactive_users || 0,
        totalPointsDistributed: parseInt(data.points_distributed) || 0,
        currentPointsBalance: parseInt(data.current_points_balance) || 0,
        recentSignups: data.recent_signups || 0,
        lastUpdated: data.timestamp || new Date().toISOString(),
        pointDistribution: [
            { role: "admin_user", total_points: data.points_distributed?.toString() || "0", user_count: data.admin_users || 0 },
            { role: "general_user", total_points: "0", user_count: data.general_users || 0 },
            { role: "super_user", total_points: "0", user_count: data.super_users || 0 },
        ],
        activityTrends: [],
        topActiveUsers: [],
    };

    console.log('✅ Fresh dashboard data fetched:', dashboardStats);
    return dashboardStats;
}

export function useCachedDashboard() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const cache = usePersistentCache(CACHE_CONFIGS.dashboard);

    // User-specific query key
    const queryKey = user ? [user.id, 'dashboard'] : ['dashboard'];

    const query = useQuery({
        queryKey,
        queryFn: async () => {
            const freshData = await fetchDashboardDataWithCache();

            // Save to persistent cache after successful fetch
            cache.saveToCache('dashboard', freshData);

            return freshData;
        },
        enabled: !!user,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes in memory
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
            // Don't retry if we have cached data
            const cachedData = cache.loadFromCache('dashboard');
            if (cachedData) return false;

            return failureCount < 3 && (error?.response?.status >= 500 || !error?.response);
        },
        // Use cached data as initial data for instant loading
        initialData: () => {
            if (!user) return undefined;

            const cachedData = cache.loadFromCache('dashboard');
            if (cachedData) {
                console.log('⚡ Using cached dashboard data for instant loading');
                return cachedData;
            }
            return undefined;
        },
        // Always show cached data immediately, then update in background
        placeholderData: (previousData) => {
            if (previousData) return previousData;

            if (!user) return undefined;

            const cachedData = cache.loadFromCache('dashboard');
            if (cachedData) {
                console.log('⚡ Using cached dashboard data as placeholder');
                return cachedData;
            }
            return undefined;
        }
    });

    // Force refresh function
    const forceRefresh = async () => {
        console.log('🔄 Force refreshing dashboard data...');
        cache.clearCache('dashboard');
        await queryClient.invalidateQueries({ queryKey });
    };

    // Check if using cached data
    const isUsingCachedData = !query.isFetching && !cache.isCacheStale('dashboard');

    return {
        ...query,
        forceRefresh,
        isUsingCachedData,
        cacheAge: user ? (() => {
            try {
                const cacheKey = `cache_${user.id}_dashboard`;
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const { timestamp } = JSON.parse(cached);
                    return Date.now() - timestamp;
                }
            } catch (error) {
                // Ignore errors
            }
            return null;
        })() : null
    };
}
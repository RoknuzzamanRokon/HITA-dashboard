/**
 * Cached User Analytics Hook
 * Provides cached user activity data with instant loading
 */

"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/auth-context';
import { usePersistentCache, CACHE_CONFIGS } from './use-persistent-cache';
import { fetchMyActivity, type MyActivityResponse } from '@/lib/api/audit';

// Enhanced user analytics data fetcher with caching
async function fetchUserAnalyticsWithCache(days: number = 30): Promise<MyActivityResponse> {
    console.log('🔄 Fetching fresh user analytics data...');

    const response = await fetchMyActivity(days);

    if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch user analytics');
    }

    console.log('✅ Fresh user analytics data fetched');
    return response.data;
}

export function useCachedUserAnalytics(days: number = 30) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const cache = usePersistentCache(CACHE_CONFIGS.userAnalytics);

    // User-specific query key
    const queryKey = user ? [user.id, 'user-analytics', days] : ['user-analytics', days];

    const query = useQuery({
        queryKey,
        queryFn: async () => {
            const freshData = await fetchUserAnalyticsWithCache(days);

            // Save to persistent cache after successful fetch
            cache.saveToCache('user-analytics', freshData);

            return freshData;
        },
        enabled: !!user,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes in memory
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
            // Don't retry if we have cached data
            const cachedData = cache.loadFromCache('user-analytics');
            if (cachedData) return false;

            return failureCount < 3 && (error?.response?.status >= 500 || !error?.response);
        },
        // Use cached data as initial data for instant loading
        initialData: () => {
            if (!user) return undefined;

            const cachedData = cache.loadFromCache('user-analytics');
            if (cachedData) {
                console.log('⚡ Using cached user analytics data for instant loading');
                return cachedData;
            }
            return undefined;
        },
        // Always show cached data immediately, then update in background
        placeholderData: (previousData) => {
            if (previousData) return previousData;

            if (!user) return undefined;

            const cachedData = cache.loadFromCache('user-analytics');
            if (cachedData) {
                console.log('⚡ Using cached user analytics data as placeholder');
                return cachedData;
            }
            return undefined;
        }
    });

    // Force refresh function
    const forceRefresh = async () => {
        console.log('🔄 Force refreshing user analytics data...');
        cache.clearCache('user-analytics');
        await queryClient.invalidateQueries({ queryKey });
    };

    // Check if using cached data
    const isUsingCachedData = !query.isFetching && !cache.isCacheStale('user-analytics');

    return {
        ...query,
        forceRefresh,
        isUsingCachedData,
        cacheAge: user ? (() => {
            try {
                const cacheKey = `cache_${user.id}_user-analytics`;
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
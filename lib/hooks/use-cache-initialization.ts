/**
 * Cache Initialization Hook
 * Sets up caching system when user logs in and manages cache lifecycle
 */

"use client";

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/auth-context';
import { usePersistentCache, CACHE_CONFIGS } from './use-persistent-cache';
import { prefetchDashboardDataManually } from './use-dashboard-prefetch';

export function useCacheInitialization() {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const dashboardCache = usePersistentCache(CACHE_CONFIGS.dashboard);
    const usersCache = usePersistentCache(CACHE_CONFIGS.users);

    // Initialize cache system when user logs in
    const initializeCache = useCallback(async () => {
        if (!user || !isAuthenticated) return;

        console.log('🚀 Initializing cache system for user:', user.username);

        try {
            // Clear any existing cache for different users
            const currentUserId = localStorage.getItem('current-cache-user-id');
            if (currentUserId && currentUserId !== user.id) {
                console.log('🧹 Clearing cache for previous user');

                // Clear all cache entries for the previous user
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(`cache_${currentUserId}_`)) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));

                // Clear React Query cache
                queryClient.clear();
            }

            // Set current user ID for cache management
            localStorage.setItem('current-cache-user-id', user.id);

            // Check if we have cached data for this user
            const hasDashboardCache = dashboardCache.loadFromCache('dashboard');
            const hasUsersCache = usersCache.loadFromCache('users');

            console.log('📊 Cache status:', {
                dashboard: !!hasDashboardCache,
                users: !!hasUsersCache
            });

            // If no cache exists, prefetch critical data
            if (!hasDashboardCache || !hasUsersCache) {
                console.log('🔄 No cache found, prefetching critical data...');

                // Prefetch dashboard data
                await prefetchDashboardDataManually({
                    queryClient,
                    userRole: user.role
                });

                console.log('✅ Cache initialization completed');
            } else {
                console.log('⚡ Using existing cache for instant loading');
            }

            // Set up cache warming for next session
            scheduleBackgroundCacheWarming();

        } catch (error) {
            console.error('❌ Cache initialization failed:', error);
        }
    }, [user, isAuthenticated, queryClient, dashboardCache, usersCache]);

    // Schedule background cache warming
    const scheduleBackgroundCacheWarming = useCallback(() => {
        // Warm up cache in the background after 30 seconds
        setTimeout(() => {
            if (user && isAuthenticated) {
                console.log('🔥 Warming up cache in background...');

                // Prefetch additional data that might be needed
                queryClient.prefetchQuery({
                    queryKey: [user.id, 'user-analytics'],
                    staleTime: 10 * 60 * 1000, // 10 minutes
                });
            }
        }, 30000); // 30 seconds delay
    }, [user, isAuthenticated, queryClient]);

    // Clear cache when user logs out
    const clearUserCache = useCallback(() => {
        if (!user) return;

        console.log('🧹 Clearing cache for user logout:', user.username);

        try {
            // Clear persistent cache
            dashboardCache.clearAllUserCaches();
            usersCache.clearAllUserCaches();

            // Clear React Query cache
            queryClient.clear();

            // Remove current user ID
            localStorage.removeItem('current-cache-user-id');

            console.log('✅ Cache cleared successfully');
        } catch (error) {
            console.error('❌ Failed to clear cache:', error);
        }
    }, [user, dashboardCache, usersCache, queryClient]);

    // Initialize cache when user logs in
    useEffect(() => {
        if (isAuthenticated && user) {
            initializeCache();
        }
    }, [isAuthenticated, user, initializeCache]);

    // Clear cache when user logs out
    useEffect(() => {
        if (!isAuthenticated && !user) {
            // Small delay to ensure auth state is stable
            setTimeout(clearUserCache, 100);
        }
    }, [isAuthenticated, user, clearUserCache]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Don't clear cache on unmount, only on logout
        };
    }, []);

    return {
        initializeCache,
        clearUserCache,
        scheduleBackgroundCacheWarming
    };
}

// Cache status utility
export function getCacheStatus(userId: string) {
    if (!userId) return null;

    try {
        const dashboardCacheKey = `cache_${userId}_dashboard`;
        const usersCacheKey = `cache_${userId}_users`;
        const analyticsCacheKey = `cache_${userId}_general-users-analytics`;

        const dashboardCache = localStorage.getItem(dashboardCacheKey);
        const usersCache = localStorage.getItem(usersCacheKey);
        const analyticsCache = localStorage.getItem(analyticsCacheKey);

        const dashboardAge = dashboardCache ?
            Date.now() - JSON.parse(dashboardCache).timestamp : null;
        const usersAge = usersCache ?
            Date.now() - JSON.parse(usersCache).timestamp : null;
        const analyticsAge = analyticsCache ?
            Date.now() - JSON.parse(analyticsCache).timestamp : null;

        return {
            dashboard: {
                exists: !!dashboardCache,
                age: dashboardAge,
                isStale: dashboardAge ? dashboardAge > 10 * 60 * 1000 : true // 10 minutes
            },
            users: {
                exists: !!usersCache,
                age: usersAge,
                isStale: usersAge ? usersAge > 10 * 60 * 1000 : true // 10 minutes
            },
            analytics: {
                exists: !!analyticsCache,
                age: analyticsAge,
                isStale: analyticsAge ? analyticsAge > 10 * 60 * 1000 : true // 10 minutes
            }
        };
    } catch (error) {
        console.error('Failed to get cache status:', error);
        return null;
    }
}
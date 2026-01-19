/**
 * Cached Users Hook with Instant Loading
 * Provides immediate cached data while updating in background
 */

"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/auth-context';
import { usePersistentCache, CACHE_CONFIGS } from './use-persistent-cache';
import { UserService } from '@/lib/api/users';
import { apiClient } from '@/lib/api/client';
import type { UserListItem } from '@/lib/types/user';

// Enhanced users data fetcher with caching
async function fetchUsersDataWithCache(): Promise<UserListItem[]> {
    console.log('🔄 Fetching fresh users data...');

    const response = await UserService.getAllUsers();

    if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch users');
    }

    const users = response.data || [];
    console.log('✅ Fresh users data fetched:', users.length, 'users');
    return users;
}

// Enhanced user analytics fetcher
async function fetchUserAnalyticsWithCache() {
    console.log('🔄 Fetching fresh user analytics...');

    try {
        const response = await UserService.getAllUsers();

        if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to fetch user analytics');
        }

        // Calculate analytics from users data
        const users = response.data || [];
        const analytics = {
            totalUsers: users.length,
            activeUsers: users.filter((u: any) => u.isActive).length,
            newUsersThisMonth: users.filter((u: any) => {
                const createdAt = new Date(u.createdAt || u.created_at);
                const now = new Date();
                const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
                return createdAt >= monthAgo;
            }).length,
            userGrowthRate: 0 // Could be calculated with historical data
        };

        console.log('✅ Fresh user analytics calculated');
        return analytics;
    } catch (error) {
        console.warn('⚠️ User analytics fetch failed, using fallback');
        return {
            totalUsers: 0,
            activeUsers: 0,
            newUsersThisMonth: 0,
            userGrowthRate: 0
        };
    }
}

// General users analytics fetcher for the analytics section
async function fetchGeneralUsersAnalyticsWithCache() {
    console.log('🔄 Fetching fresh general users analytics...');

    try {
        // Make direct API call to get raw response from /user/all-general-user
        const response = await apiClient.get<any>("/user/all-general-user");

        if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to fetch general users analytics');
        }

        console.log('✅ Fresh general users analytics fetched');
        return response.data;
    } catch (error) {
        console.warn('⚠️ General users analytics fetch failed, using fallback');
        throw error;
    }
}

export function useCachedUsers() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const cache = usePersistentCache(CACHE_CONFIGS.users);

    // User-specific query key
    const queryKey = user ? [user.id, 'users'] : ['users'];

    const query = useQuery({
        queryKey,
        queryFn: async () => {
            const freshData = await fetchUsersDataWithCache();

            // Save to persistent cache after successful fetch
            cache.saveToCache('users', freshData);

            return freshData;
        },
        enabled: !!user,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes in memory
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
            // Don't retry if we have cached data
            const cachedData = cache.loadFromCache('users');
            if (cachedData) return false;

            return failureCount < 3 && (error?.response?.status >= 500 || !error?.response);
        },
        // Use cached data as initial data for instant loading
        initialData: () => {
            if (!user) return undefined;

            const cachedData = cache.loadFromCache('users');
            if (cachedData) {
                console.log('⚡ Using cached users data for instant loading');
                return cachedData;
            }
            return undefined;
        },
        // Always show cached data immediately, then update in background
        placeholderData: (previousData) => {
            if (previousData) return previousData;

            if (!user) return undefined;

            const cachedData = cache.loadFromCache('users');
            if (cachedData) {
                console.log('⚡ Using cached users data as placeholder');
                return cachedData;
            }
            return undefined;
        }
    });

    // Force refresh function
    const forceRefresh = async () => {
        console.log('🔄 Force refreshing users data...');
        cache.clearCache('users');
        await queryClient.invalidateQueries({ queryKey });
    };

    // Check if using cached data
    const isUsingCachedData = !query.isFetching && !cache.isCacheStale('users');

    return {
        ...query,
        forceRefresh,
        isUsingCachedData,
        cacheAge: user ? (() => {
            try {
                const cacheKey = `cache_${user.id}_users`;
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

export function useCachedUserAnalytics() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const cache = usePersistentCache(CACHE_CONFIGS.usersList);

    // User-specific query key
    const queryKey = user ? [user.id, 'user-analytics'] : ['user-analytics'];

    const query = useQuery({
        queryKey,
        queryFn: async () => {
            const freshData = await fetchUserAnalyticsWithCache();

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
                console.log('⚡ Using cached user analytics for instant loading');
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
                console.log('⚡ Using cached user analytics as placeholder');
                return cachedData;
            }
            return undefined;
        }
    });

    // Force refresh function
    const forceRefresh = async () => {
        console.log('🔄 Force refreshing user analytics...');
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

export function useCachedGeneralUsersAnalytics() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const cache = usePersistentCache(CACHE_CONFIGS.usersList);

    // User-specific query key
    const queryKey = user ? [user.id, 'general-users-analytics'] : ['general-users-analytics'];

    const query = useQuery({
        queryKey,
        queryFn: async () => {
            const freshData = await fetchGeneralUsersAnalyticsWithCache();

            // Save to persistent cache after successful fetch
            cache.saveToCache('general-users-analytics', freshData);

            return freshData;
        },
        enabled: !!user,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes in memory
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
            // Don't retry if we have cached data
            const cachedData = cache.loadFromCache('general-users-analytics');
            if (cachedData) return false;

            return failureCount < 3 && (error?.response?.status >= 500 || !error?.response);
        },
        // Use cached data as initial data for instant loading
        initialData: () => {
            if (!user) return undefined;

            const cachedData = cache.loadFromCache('general-users-analytics');
            if (cachedData) {
                console.log('⚡ Using cached general users analytics for instant loading');
                return cachedData;
            }
            return undefined;
        },
        // Always show cached data immediately, then update in background
        placeholderData: (previousData) => {
            if (previousData) return previousData;

            if (!user) return undefined;

            const cachedData = cache.loadFromCache('general-users-analytics');
            if (cachedData) {
                console.log('⚡ Using cached general users analytics as placeholder');
                return cachedData;
            }
            return undefined;
        }
    });

    // Force refresh function
    const forceRefresh = async () => {
        console.log('🔄 Force refreshing general users analytics...');
        cache.clearCache('general-users-analytics');
        await queryClient.invalidateQueries({ queryKey });
    };

    // Check if using cached data
    const isUsingCachedData = !query.isFetching && !cache.isCacheStale('general-users-analytics');

    return {
        ...query,
        forceRefresh,
        isUsingCachedData,
        cacheAge: user ? (() => {
            try {
                const cacheKey = `cache_${user.id}_general-users-analytics`;
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
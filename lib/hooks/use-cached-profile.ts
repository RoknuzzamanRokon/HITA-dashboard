/**
 * Cached Profile Hook
 * Provides cached user profile data with instant loading
 */

"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/auth-context';
import { usePersistentCache, CACHE_CONFIGS } from './use-persistent-cache';
import { TokenStorage } from '@/lib/auth/token-storage';

interface UserProfile {
    id: string;
    username: string;
    email: string;
    user_status: string;
    available_points: number;
    total_points: number;
    supplier_info: {
        total_active: number;
        active_list: string[];
        temporary_off: number;
        temporary_off_supplier: string[];
    };
    created_at: string;
    updated_at: string;
    need_to_next_upgrade: string;
}

// Enhanced profile data fetcher with caching
async function fetchProfileWithCache(): Promise<UserProfile> {
    console.log('🔄 Fetching fresh profile data...');

    const token = TokenStorage.getToken();

    if (!token) {
        throw new Error("Authentication token not found. Please login again.");
    }

    const response = await fetch("http://127.0.0.1:8001/v1.0/user/check-me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized. Please login again.");
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Fresh profile data fetched:', data);
    return data;
}

export function useCachedProfile() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const cache = usePersistentCache(CACHE_CONFIGS.profile);

    // User-specific query key
    const queryKey = user ? [user.id, 'profile'] : ['profile'];

    const query = useQuery({
        queryKey,
        queryFn: async () => {
            const freshData = await fetchProfileWithCache();

            // Save to persistent cache after successful fetch
            cache.saveToCache('profile', freshData);

            return freshData;
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000, // 5 minutes (profile changes less frequently)
        gcTime: 30 * 60 * 1000, // 30 minutes in memory
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
            // Don't retry if we have cached data
            const cachedData = cache.loadFromCache('profile');
            if (cachedData) return false;

            return failureCount < 3 && (error?.response?.status >= 500 || !error?.response);
        },
        // Use cached data as initial data for instant loading
        initialData: () => {
            if (!user) return undefined;

            const cachedData = cache.loadFromCache('profile');
            if (cachedData) {
                console.log('⚡ Using cached profile data for instant loading');
                return cachedData;
            }
            return undefined;
        },
        // Always show cached data immediately, then update in background
        placeholderData: (previousData) => {
            if (previousData) return previousData;

            if (!user) return undefined;

            const cachedData = cache.loadFromCache('profile');
            if (cachedData) {
                console.log('⚡ Using cached profile data as placeholder');
                return cachedData;
            }
            return undefined;
        }
    });

    // Force refresh function
    const forceRefresh = async () => {
        console.log('🔄 Force refreshing profile data...');
        cache.clearCache('profile');
        await queryClient.invalidateQueries({ queryKey });
    };

    // Update profile function (for optimistic updates)
    const updateProfile = (updater: (profile: UserProfile) => UserProfile) => {
        queryClient.setQueryData(queryKey, updater);
        // Also update cache
        const currentData = queryClient.getQueryData(queryKey) as UserProfile;
        if (currentData) {
            cache.saveToCache('profile', currentData);
        }
    };

    // Check if using cached data
    const isUsingCachedData = !query.isFetching && !cache.isCacheStale('profile');

    return {
        ...query,
        forceRefresh,
        updateProfile,
        isUsingCachedData,
        cacheAge: user ? (() => {
            try {
                const cacheKey = `cache_${user.id}_profile`;
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
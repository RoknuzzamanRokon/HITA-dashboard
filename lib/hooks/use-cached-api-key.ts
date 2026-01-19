/**
 * Cached API Key Hook
 * Provides cached API key data with instant loading
 */

"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/auth-context';
import { usePersistentCache, CACHE_CONFIGS } from './use-persistent-cache';
import { TokenStorage } from '@/lib/auth/token-storage';

interface ApiKeyData {
    security: {
        apiKey: string;
    };
    apiKeyInfo: {
        status: string;
        generatedAt: string;
        expiresAt: string;
        daysUntilExpiration: number;
    };
}

// Enhanced API key data fetcher with caching
async function fetchApiKeyWithCache(): Promise<ApiKeyData> {
    console.log('🔄 Fetching fresh API key data...');

    const token = TokenStorage.getToken();

    if (!token) {
        throw new Error("Authentication token not found. Please login again.");
    }

    const response = await fetch(
        "http://127.0.0.1:8001/v1.0/auth/check-api-key",
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch API key");
    }

    const data = await response.json();
    console.log('✅ Fresh API key data fetched');
    return data;
}

export function useCachedApiKey() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const cache = usePersistentCache(CACHE_CONFIGS.apiKey);

    // User-specific query key
    const queryKey = user ? [user.id, 'api-key'] : ['api-key'];

    const query = useQuery({
        queryKey,
        queryFn: async () => {
            const freshData = await fetchApiKeyWithCache();

            // Save to persistent cache after successful fetch
            cache.saveToCache('api-key', freshData);

            return freshData;
        },
        enabled: false, // Only fetch when explicitly requested
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes in memory
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
            // Don't retry if we have cached data
            const cachedData = cache.loadFromCache('api-key');
            if (cachedData) return false;

            return failureCount < 3 && (error?.response?.status >= 500 || !error?.response);
        },
        // Use cached data as initial data for instant loading
        initialData: () => {
            if (!user) return undefined;

            const cachedData = cache.loadFromCache('api-key');
            if (cachedData) {
                console.log('⚡ Using cached API key data for instant loading');
                return cachedData;
            }
            return undefined;
        },
        // Always show cached data immediately, then update in background
        placeholderData: (previousData) => {
            if (previousData) return previousData;

            if (!user) return undefined;

            const cachedData = cache.loadFromCache('api-key');
            if (cachedData) {
                console.log('⚡ Using cached API key data as placeholder');
                return cachedData;
            }
            return undefined;
        }
    });

    // Force refresh function
    const forceRefresh = async () => {
        console.log('🔄 Force refreshing API key data...');
        cache.clearCache('api-key');
        await queryClient.invalidateQueries({ queryKey });
    };

    // Fetch API key function (since it's disabled by default)
    const fetchApiKey = async () => {
        console.log('🔄 Manually fetching API key data...');
        await queryClient.refetchQueries({ queryKey });
    };

    // Check if using cached data
    const isUsingCachedData = !query.isFetching && !cache.isCacheStale('api-key');

    return {
        ...query,
        forceRefresh,
        fetchApiKey,
        isUsingCachedData,
        cacheAge: user ? (() => {
            try {
                const cacheKey = `cache_${user.id}_api-key`;
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
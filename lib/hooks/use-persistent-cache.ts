/**
 * Persistent Cache Hook with Background Updates
 * Stores data in localStorage with user-specific keys and automatic background refresh
 */

"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/auth-context';

interface CacheConfig {
    key: string;
    staleTime: number; // How long data is considered fresh (ms)
    backgroundUpdateInterval: number; // Auto update interval (ms)
    enabled: boolean;
}

interface CachedData {
    data: any;
    timestamp: number;
    userId: string;
    version: string;
}

export function usePersistentCache(config: CacheConfig) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const backgroundUpdateRef = useRef<NodeJS.Timeout | null>(null);
    const isUpdatingRef = useRef(false);

    // Generate user-specific cache key
    const getCacheKey = useCallback((key: string) => {
        return user ? `cache_${user.id}_${key}` : null;
    }, [user]);

    // Save data to localStorage
    const saveToCache = useCallback((key: string, data: any) => {
        if (!user) return;

        const cacheKey = getCacheKey(key);
        if (!cacheKey) return;

        const cachedData: CachedData = {
            data,
            timestamp: Date.now(),
            userId: user.id,
            version: '1.0'
        };

        try {
            localStorage.setItem(cacheKey, JSON.stringify(cachedData));
            console.log(`💾 Cached data for ${key}:`, { timestamp: new Date(cachedData.timestamp) });
        } catch (error) {
            console.error('Failed to save cache:', error);
        }
    }, [user, getCacheKey]);

    // Load data from localStorage
    const loadFromCache = useCallback((key: string): any | null => {
        if (!user) return null;

        const cacheKey = getCacheKey(key);
        if (!cacheKey) return null;

        try {
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const cachedData: CachedData = JSON.parse(cached);

            // Verify cache belongs to current user
            if (cachedData.userId !== user.id) {
                localStorage.removeItem(cacheKey);
                return null;
            }

            const age = Date.now() - cachedData.timestamp;
            console.log(`📖 Loaded cached data for ${key}:`, {
                age: Math.round(age / 1000) + 's',
                timestamp: new Date(cachedData.timestamp)
            });

            return cachedData.data;
        } catch (error) {
            console.error('Failed to load cache:', error);
            return null;
        }
    }, [user, getCacheKey]);

    // Check if cache is stale
    const isCacheStale = useCallback((key: string): boolean => {
        if (!user) return true;

        const cacheKey = getCacheKey(key);
        if (!cacheKey) return true;

        try {
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return true;

            const cachedData: CachedData = JSON.parse(cached);
            const age = Date.now() - cachedData.timestamp;

            return age > config.staleTime;
        } catch (error) {
            return true;
        }
    }, [user, getCacheKey, config.staleTime]);

    // Clear cache for specific key
    const clearCache = useCallback((key: string) => {
        if (!user) return;

        const cacheKey = getCacheKey(key);
        if (!cacheKey) return;

        localStorage.removeItem(cacheKey);
        console.log(`🗑️ Cleared cache for ${key}`);
    }, [user, getCacheKey]);

    // Clear all user caches
    const clearAllUserCaches = useCallback(() => {
        if (!user) return;

        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`cache_${user.id}_`)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`🗑️ Cleared all caches for user ${user.id}:`, keysToRemove.length);
    }, [user]);

    // Background update function
    const performBackgroundUpdate = useCallback(async () => {
        if (!config.enabled || !user || isUpdatingRef.current) return;

        isUpdatingRef.current = true;
        console.log(`🔄 Background update started for ${config.key}`);

        try {
            // Invalidate and refetch the query
            await queryClient.invalidateQueries({
                queryKey: [user.id, config.key],
                refetchType: 'active'
            });

            console.log(`✅ Background update completed for ${config.key}`);
        } catch (error) {
            console.error(`❌ Background update failed for ${config.key}:`, error);
        } finally {
            isUpdatingRef.current = false;
        }
    }, [config.enabled, config.key, user, queryClient]);

    // Setup background updates
    useEffect(() => {
        if (!config.enabled || !user) return;

        // Clear any existing interval
        if (backgroundUpdateRef.current) {
            clearInterval(backgroundUpdateRef.current);
        }

        // Set up new interval for background updates
        backgroundUpdateRef.current = setInterval(() => {
            performBackgroundUpdate();
        }, config.backgroundUpdateInterval);

        console.log(`⏰ Background updates scheduled every ${config.backgroundUpdateInterval / 1000}s for ${config.key}`);

        return () => {
            if (backgroundUpdateRef.current) {
                clearInterval(backgroundUpdateRef.current);
                backgroundUpdateRef.current = null;
            }
        };
    }, [config.enabled, config.backgroundUpdateInterval, config.key, user, performBackgroundUpdate]);

    // Cleanup on user change
    useEffect(() => {
        return () => {
            if (backgroundUpdateRef.current) {
                clearInterval(backgroundUpdateRef.current);
            }
        };
    }, [user?.id]);

    return {
        saveToCache,
        loadFromCache,
        isCacheStale,
        clearCache,
        clearAllUserCaches,
        performBackgroundUpdate
    };
}

// Predefined cache configurations
export const CACHE_CONFIGS = {
    dashboard: {
        key: 'dashboard',
        staleTime: 10 * 60 * 1000, // 10 minutes
        backgroundUpdateInterval: 10 * 60 * 1000, // 10 minutes
        enabled: true
    },
    dashboardCharts: {
        key: 'dashboard-charts',
        staleTime: 10 * 60 * 1000, // 10 minutes
        backgroundUpdateInterval: 10 * 60 * 1000, // 10 minutes
        enabled: true
    },
    pointsSummary: {
        key: 'points-summary',
        staleTime: 10 * 60 * 1000, // 10 minutes
        backgroundUpdateInterval: 10 * 60 * 1000, // 10 minutes
        enabled: true
    },
    userAnalytics: {
        key: 'user-analytics',
        staleTime: 10 * 60 * 1000, // 10 minutes
        backgroundUpdateInterval: 10 * 60 * 1000, // 10 minutes
        enabled: true
    },
    profile: {
        key: 'profile',
        staleTime: 5 * 60 * 1000, // 5 minutes (profile changes less frequently)
        backgroundUpdateInterval: 5 * 60 * 1000, // 5 minutes
        enabled: true
    },
    apiKey: {
        key: 'api-key',
        staleTime: 10 * 60 * 1000, // 10 minutes
        backgroundUpdateInterval: 10 * 60 * 1000, // 10 minutes
        enabled: true
    },
    supplierInfo: {
        key: 'supplier-info',
        staleTime: 5 * 60 * 1000, // 5 minutes
        backgroundUpdateInterval: 5 * 60 * 1000, // 5 minutes
        enabled: true
    },
    users: {
        key: 'users',
        staleTime: 10 * 60 * 1000, // 10 minutes
        backgroundUpdateInterval: 10 * 60 * 1000, // 10 minutes
        enabled: true
    },
    usersList: {
        key: 'users-list',
        staleTime: 10 * 60 * 1000, // 10 minutes
        backgroundUpdateInterval: 10 * 60 * 1000, // 10 minutes
        enabled: true
    },
    generalUsersAnalytics: {
        key: 'general-users-analytics',
        staleTime: 10 * 60 * 1000, // 10 minutes
        backgroundUpdateInterval: 10 * 60 * 1000, // 10 minutes
        enabled: true
    }
} as const;
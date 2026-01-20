/**
 * Cached Supplier Info Hook
 * Provides cached supplier information with instant loading
 */

"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/auth-context';
import { usePersistentCache, CACHE_CONFIGS } from './use-persistent-cache';
import { TokenStorage } from '@/lib/auth/token-storage';

interface SupplierInfo {
    supplier_info: {
        supplier_name: string;
        total_hotel: number;
        has_hotels: boolean;
        last_checked: string;
        total_mappings: number;
        last_updated: string;
        summary_generated_at: string;
    };
    user_info: {
        user_id: string;
        username: string;
        user_role: string;
        access_level: string;
    };
}

// Enhanced supplier info data fetcher with caching
async function fetchSupplierInfoWithCache(supplierName: string): Promise<SupplierInfo> {
    console.log('🔄 Fetching fresh supplier info data for:', supplierName);

    const token = TokenStorage.getToken();

    if (!token) {
        throw new Error("Authentication token not found. Please login again.");
    }

    const response = await fetch(
        `http://127.0.0.1:8001/v1.0/hotels/get-supplier-info?supplier=${supplierName}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized. Please login again.");
        }
        throw new Error(`Failed to fetch supplier info: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Fresh supplier info data fetched for:', supplierName);
    return data;
}

export function useCachedSupplierInfo(supplierName: string | null) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const cache = usePersistentCache(CACHE_CONFIGS.supplierInfo);

    // User and supplier-specific query key
    const queryKey = user && supplierName ? [user.id, 'supplier-info', supplierName] : null;

    const query = useQuery({
        queryKey: queryKey || ['supplier-info', 'disabled'],
        queryFn: async () => {
            if (!supplierName) throw new Error('Supplier name is required');

            const freshData = await fetchSupplierInfoWithCache(supplierName);

            // Save to persistent cache after successful fetch
            cache.saveToCache(`supplier-info-${supplierName}`, freshData);

            return freshData;
        },
        enabled: !!user && !!supplierName,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes in memory (shorter since supplier info changes less)
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
            // Don't retry if we have cached data
            if (supplierName) {
                const cachedData = cache.loadFromCache(`supplier-info-${supplierName}`);
                if (cachedData) return false;
            }

            return failureCount < 3 && (error?.response?.status >= 500 || !error?.response);
        },
        // Use cached data as initial data for instant loading
        initialData: () => {
            if (!user || !supplierName) return undefined;

            const cachedData = cache.loadFromCache(`supplier-info-${supplierName}`);
            if (cachedData) {
                console.log('⚡ Using cached supplier info data for instant loading:', supplierName);
                return cachedData;
            }
            return undefined;
        },
        // Always show cached data immediately, then update in background
        placeholderData: (previousData) => {
            if (previousData) return previousData;

            if (!user || !supplierName) return undefined;

            const cachedData = cache.loadFromCache(`supplier-info-${supplierName}`);
            if (cachedData) {
                console.log('⚡ Using cached supplier info data as placeholder:', supplierName);
                return cachedData;
            }
            return undefined;
        }
    });

    // Force refresh function
    const forceRefresh = async () => {
        if (!supplierName) return;

        console.log('🔄 Force refreshing supplier info data for:', supplierName);
        cache.clearCache(`supplier-info-${supplierName}`);
        if (queryKey) {
            await queryClient.invalidateQueries({ queryKey });
        }
    };

    // Check if using cached data
    const isUsingCachedData = !query.isFetching && supplierName && !cache.isCacheStale(`supplier-info-${supplierName}`);

    return {
        ...query,
        forceRefresh,
        isUsingCachedData,
        cacheAge: user && supplierName ? (() => {
            try {
                const cacheKey = `cache_${user.id}_supplier-info-${supplierName}`;
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
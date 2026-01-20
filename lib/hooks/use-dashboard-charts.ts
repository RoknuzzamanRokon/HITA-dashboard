/**
 * Dashboard Charts Hook with Caching
 * Manages fetching and transformation of chart data for analytics visualizations
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/auth-context';
import { usePersistentCache, CACHE_CONFIGS } from './use-persistent-cache';
import { apiClient } from "@/lib/api/client";
import { config } from "@/lib/config";
import { useResilientData } from "./use-resilient-data";
import {
    transformSupplierData,
    transformTimeSeriesData,
    transformPackageData,
    DashboardApiResponse,
    SupplierChartData,
    TimeSeriesChartData,
    PackageChartData,
} from "@/lib/utils/chart-data-transformers";

// Enhanced dashboard charts data fetcher with caching
async function fetchDashboardChartsWithCache(): Promise<DashboardChartsData> {
    console.log('🔄 Fetching fresh dashboard charts data...');

    const response = await apiClient.get<DashboardApiResponse>(
        '/dashboard/new-user',
        true // Requires authentication
    );

    if (!response.success) {
        const errorMessage = response.error?.message ||
            (response.error && Object.keys(response.error).length > 0
                ? JSON.stringify(response.error)
                : 'Dashboard charts API returned unsuccessful response');
        throw new Error(errorMessage);
    }

    // Validate response data structure
    if (!response.data) {
        throw new Error('Dashboard charts API returned no data');
    }

    const data = response.data;
    console.log('✅ Dashboard charts data received');

    // Safely access nested properties with fallbacks
    const platformOverview = data.platform_overview || {};
    const activityMetrics = data.activity_metrics || {};
    const platformTrends = data.platform_trends || {};

    // Transform the data using utilities with comprehensive error handling
    let transformed: DashboardChartsData;
    try {
        transformed = {
            suppliers: transformSupplierData(
                platformOverview.available_suppliers
            ),
            registrations: transformTimeSeriesData(
                platformTrends.user_registrations?.time_series
            ),
            logins: transformTimeSeriesData(
                activityMetrics.user_logins?.time_series
            ),
            apiRequests: transformTimeSeriesData(
                activityMetrics.api_requests?.time_series
            ),
            packages: transformPackageData(
                platformOverview.available_packages
            ),
        };
    } catch (transformError) {
        console.error('❌ Error transforming chart data:', transformError);
        // Set empty data on transformation error
        transformed = {
            suppliers: [],
            registrations: [],
            logins: [],
            apiRequests: [],
            packages: [],
        };
    }

    console.log('📊 Transformed charts data:', {
        suppliersCount: transformed.suppliers.length,
        registrationsCount: transformed.registrations.length,
        loginsCount: transformed.logins.length,
        apiRequestsCount: transformed.apiRequests.length,
        packagesCount: transformed.packages.length,
    });

    return transformed;
}

// Cached dashboard charts hook
export function useCachedDashboardCharts() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const cache = usePersistentCache(CACHE_CONFIGS.dashboardCharts);

    // User-specific query key
    const queryKey = user ? [user.id, 'dashboard-charts'] : ['dashboard-charts'];

    const query = useQuery({
        queryKey,
        queryFn: async () => {
            const freshData = await fetchDashboardChartsWithCache();

            // Save to persistent cache after successful fetch
            cache.saveToCache('dashboard-charts', freshData);

            return freshData;
        },
        enabled: !!user,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes in memory
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
            // Don't retry if we have cached data
            const cachedData = cache.loadFromCache('dashboard-charts');
            if (cachedData) return false;

            return failureCount < 3 && (error?.response?.status >= 500 || !error?.response);
        },
        // Use cached data as initial data for instant loading
        initialData: () => {
            if (!user) return undefined;

            const cachedData = cache.loadFromCache('dashboard-charts');
            if (cachedData) {
                console.log('⚡ Using cached dashboard charts data for instant loading');
                return cachedData;
            }
            return undefined;
        },
        // Always show cached data immediately, then update in background
        placeholderData: (previousData) => {
            if (previousData) return previousData;

            if (!user) return undefined;

            const cachedData = cache.loadFromCache('dashboard-charts');
            if (cachedData) {
                console.log('⚡ Using cached dashboard charts data as placeholder');
                return cachedData;
            }
            return undefined;
        }
    });

    // Force refresh function
    const forceRefresh = async () => {
        console.log('🔄 Force refreshing dashboard charts data...');
        cache.clearCache('dashboard-charts');
        await queryClient.invalidateQueries({ queryKey });
    };

    // Check if using cached data
    const isUsingCachedData = !query.isFetching && !cache.isCacheStale('dashboard-charts');

    return {
        chartsData: query.data || null,
        loading: query.isLoading,
        error: query.error ? (query.error as Error).message : null,
        refetch: forceRefresh,
        lastFetch: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
        isRefreshing: query.isFetching && !query.isLoading,
        forceRefresh,
        isUsingCachedData,
        cacheAge: user ? (() => {
            try {
                const cacheKey = `cache_${user.id}_dashboard-charts`;
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

export interface DashboardChartsData {
    suppliers: SupplierChartData[];
    registrations: TimeSeriesChartData[];
    logins: TimeSeriesChartData[];
    apiRequests: TimeSeriesChartData[];
    packages: PackageChartData[];
}

export interface UseDashboardChartsReturn {
    chartsData: DashboardChartsData | null;
    loading: boolean;
    error: string | null;
    refetch: (isBackground?: boolean) => Promise<void>;
    lastFetch: Date | null;
    isRefreshing: boolean;
}

// Legacy hook for backward compatibility (now uses caching internally)
export const useDashboardCharts = (
    realTimeInterval?: number,
    userRole?: string
): UseDashboardChartsReturn => {
    const cachedResult = useCachedDashboardCharts();

    // Set up real-time updates if needed
    useEffect(() => {
        if (!realTimeInterval || realTimeInterval <= 0) return;

        const interval = setInterval(() => {
            console.log('🔄 Real-time chart update triggered');
            cachedResult.forceRefresh(); // Use cached version's refresh
        }, realTimeInterval);

        return () => clearInterval(interval);
    }, [realTimeInterval, cachedResult.forceRefresh]);

    return {
        chartsData: cachedResult.chartsData,
        loading: cachedResult.loading,
        error: cachedResult.error,
        refetch: async (isBackground = false) => {
            await cachedResult.forceRefresh();
        },
        lastFetch: cachedResult.lastFetch,
        isRefreshing: cachedResult.isRefreshing,
    };
};

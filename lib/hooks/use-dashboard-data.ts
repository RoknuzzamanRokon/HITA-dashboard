/**
 * Optimized Dashboard Data Hook using React Query
 * Provides smart caching, deduplication, and background updates
 */

"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/config";
import { useAuth } from "@/lib/contexts/auth-context";
import { useResilientData } from "./use-resilient-data";

// Query keys for cache management
export const DASHBOARD_QUERY_KEYS = {
    stats: ['dashboard', 'stats'] as const,
    charts: ['dashboard', 'charts'] as const,
    pointsSummary: ['dashboard', 'points-summary'] as const,
} as const;

// Dashboard stats interface
export interface DashboardStats {
    totalUsers: number;
    superUsers: number;
    adminUsers: number;
    generalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalPointsDistributed: number;
    currentPointsBalance: number;
    recentSignups: number;
    lastUpdated: string;
    pointDistribution: Array<{
        role: string;
        total_points: string;
        user_count: number;
    }>;
    activityTrends: Array<{
        date: string;
        transaction_count: number;
        points_transferred: string;
    }>;
    topActiveUsers: Array<{
        id: string;
        username: string;
        email: string;
        transaction_count: number;
    }>;
}

// Fetch dashboard stats
async function fetchDashboardStats(): Promise<DashboardStats> {
    console.log('🔄 Fetching dashboard stats...');

    const response = await apiClient.get<any>(apiEndpoints.users.dashboardStats, true);

    if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch dashboard stats');
    }

    const data = response.data;

    return {
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
}

// Fetch points summary for charts
async function fetchPointsSummary() {
    console.log('🔄 Fetching points summary...');

    const response = await apiClient.get<any>('/dashboard/points-summary', true);

    if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch points summary');
    }

    return response.data;
}

// Hook for dashboard stats with caching and resilience
export function useDashboardStats(realTimeEnabled = false, config: any = {}) {
    const { user } = useAuth();
    const { handleApiError, handleApiSuccess, getFallbackData, isUsingFallback } = useResilientData();

    return useQuery({
        queryKey: DASHBOARD_QUERY_KEYS.stats,
        queryFn: async () => {
            try {
                const data = await fetchDashboardStats();
                handleApiSuccess('dashboard-stats');
                return data;
            } catch (error) {
                const useFallback = handleApiError(error, 'dashboard-stats');
                if (useFallback) {
                    console.log('📊 Using fallback dashboard stats data');
                    return getFallbackData('stats');
                }
                throw error;
            }
        },
        enabled: !!user && config.enabled !== false,
        // Refetch every 30 seconds if real-time is enabled
        refetchInterval: realTimeEnabled ? 30000 : false,
        // Show cached data while refetching in background
        refetchIntervalInBackground: true,
        // Don't show loading state when refetching
        notifyOnChangeProps: ['data', 'error'],
        // Retry configuration
        retry: (failureCount, error: any) => {
            // Don't retry if we're using fallback data
            if (isUsingFallback) return false;
            // Retry up to 3 times for network errors
            return failureCount < 3 && (error?.response?.status >= 500 || !error?.response);
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Optimize caching for instant perception
        staleTime: config.staleTime || 5 * 60 * 1000, // 5 minutes - data is considered fresh
        gcTime: config.gcTime || 30 * 60 * 1000, // 30 minutes - how long data stays in cache (garbage collection time)
        refetchOnWindowFocus: config.refetchOnWindowFocus !== undefined ? config.refetchOnWindowFocus : false, // Don't refetch when window regains focus
        refetchOnReconnect: config.refetchOnReconnect !== undefined ? config.refetchOnReconnect : true, // Refetch when network reconnects
        refetchOnMount: config.refetchOnMount !== undefined ? config.refetchOnMount : true, // Refetch on mount by default
    });
}

// Hook for points summary with caching and resilience
export function usePointsSummary(realTimeEnabled = false, config: any = {}) {
    const { user } = useAuth();
    const { handleApiError, handleApiSuccess, getFallbackData, isUsingFallback } = useResilientData();

    return useQuery({
        queryKey: DASHBOARD_QUERY_KEYS.pointsSummary,
        queryFn: async () => {
            try {
                const data = await fetchPointsSummary();
                handleApiSuccess('points-summary');
                return data;
            } catch (error) {
                const useFallback = handleApiError(error, 'points-summary');
                if (useFallback) {
                    console.log('📊 Using fallback points summary data');
                    return getFallbackData('pointsSummary');
                }
                throw error;
            }
        },
        enabled: !!user && config.enabled !== false,
        refetchInterval: realTimeEnabled ? 30000 : false,
        refetchIntervalInBackground: true,
        notifyOnChangeProps: ['data', 'error'],
        // Retry configuration
        retry: (failureCount, error: any) => {
            if (isUsingFallback) return false;
            return failureCount < 3 && (error?.response?.status >= 500 || !error?.response);
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Optimize caching for instant perception
        staleTime: config.staleTime || 5 * 60 * 1000, // 5 minutes - data is considered fresh
        gcTime: config.gcTime || 30 * 60 * 1000, // 30 minutes - how long data stays in cache (garbage collection time)
        refetchOnWindowFocus: config.refetchOnWindowFocus !== undefined ? config.refetchOnWindowFocus : false, // Don't refetch when window regains focus
        refetchOnReconnect: config.refetchOnReconnect !== undefined ? config.refetchOnReconnect : true, // Refetch when network reconnects
        refetchOnMount: config.refetchOnMount !== undefined ? config.refetchOnMount : true, // Refetch on mount by default
    });
}

// Hook to manually refresh all dashboard data
export function useDashboardRefresh() {
    const queryClient = useQueryClient();

    const refreshAll = async () => {
        console.log('🔄 Refreshing all dashboard data...');

        // Invalidate and refetch all dashboard queries
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.stats }),
            queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.pointsSummary }),
        ]);
    };

    return { refreshAll };
}
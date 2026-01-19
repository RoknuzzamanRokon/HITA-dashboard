/**
 * Dashboard Charts Hook
 * Manages fetching and transformation of chart data for analytics visualizations
 */

"use client";

import { useState, useEffect, useCallback } from "react";
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

export const useDashboardCharts = (
    realTimeInterval?: number,
    userRole?: string
): UseDashboardChartsReturn => {
    const [chartsData, setChartsData] = useState<DashboardChartsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetch, setLastFetch] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { handleApiError, handleApiSuccess, getFallbackData, isUsingFallback } = useResilientData();

    const fetchCharts = useCallback(async (isBackground = false) => {
        // Prevent duplicate calls within 5 seconds
        if (lastFetch && Date.now() - lastFetch.getTime() < 5000 && !isBackground) {
            console.log('🚫 Skipping duplicate API call - too recent');
            return;
        }

        try {
            if (!isBackground) {
                setLoading(true);
            } else {
                setIsRefreshing(true);
            }
            setError(null);

            console.log('🔄 Fetching dashboard charts data from:', '/dashboard/new-user');

            // NOTE: The '/dashboard/new-user' endpoint currently returns the same data for all users
            // regardless of their role (super_user, admin_user, user, general_user).
            // This should ideally be handled by the backend to return role-specific data.
            // 
            // Expected behavior:
            // - super_user: Should see all platform data (all users, all suppliers, all activity)
            // - admin_user: Should see their organization's data only
            // - user: Should see only their own data
            // - general_user: Should see only their own data
            //
            // TODO: Backend should implement role-based data filtering on this endpoint
            // or provide separate endpoints like:
            // - /dashboard/admin (for super_user/admin_user)
            // - /dashboard/user (for user/general_user)

            // Fetch data from the new dashboard endpoint
            const response = await apiClient.get<DashboardApiResponse>(
                '/dashboard/new-user',
                true // Requires authentication
            );

            if (!response.success) {
                const errorMessage = response.error?.message ||
                    (response.error && Object.keys(response.error).length > 0
                        ? JSON.stringify(response.error)
                        : 'Dashboard charts API returned unsuccessful response');
                console.warn('⚠️ Dashboard charts API unavailable:', {
                    success: response.success,
                    error: response.error,
                    errorMessage,
                });
                throw new Error(errorMessage);
            }

            // Validate response data structure
            if (!response.data) {
                throw new Error('Dashboard charts API returned no data');
            }

            const data = response.data;
            console.log('✅ Dashboard charts data received');

            // Log warning if non-admin user is seeing all platform data
            if (userRole && userRole !== 'super_user' && userRole !== 'admin_user') {
                console.warn(
                    '⚠️ SECURITY NOTICE: User with role "' + userRole + '" is receiving platform-wide data. ' +
                    'The backend endpoint /dashboard/new-user should filter data based on user role. ' +
                    'Expected: Users with roles "user" and "general_user" should only see their own data.'
                );
            }

            // Safely access nested properties with fallbacks
            const platformOverview = data.platform_overview || {};
            const activityMetrics = data.activity_metrics || {};
            const platformTrends = data.platform_trends || {};

            // Transform the data using utilities from task 1 with comprehensive error handling
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

            setChartsData(transformed);
            setLastFetch(new Date());
            handleApiSuccess('dashboard-charts'); // Mark API as successful
        } catch (err) {
            console.warn('⚠️ Dashboard charts fetch error:', {
                error: err,
                message: err instanceof Error ? err.message : 'Unknown error',
                isBackground,
            });

            // Try to use fallback data
            const useFallback = handleApiError(err, 'dashboard-charts');
            if (useFallback) {
                console.log('📊 Using fallback charts data');
                const fallbackData = getFallbackData('chartsData') as DashboardChartsData;
                setChartsData(fallbackData);
                setLastFetch(new Date());
                setError(null); // Clear error when using fallback
            } else if (!isBackground) {
                const errorMessage = err instanceof Error
                    ? err.message
                    : "Failed to fetch dashboard charts data";
                setError(errorMessage);

                // Set empty data on error to prevent undefined issues
                setChartsData({
                    suppliers: [],
                    registrations: [],
                    logins: [],
                    apiRequests: [],
                    packages: [],
                });
            }
        } finally {
            if (!isBackground) {
                setLoading(false);
            } else {
                setIsRefreshing(false);
            }
        }
    }, [userRole]); // Add userRole as dependency since it's used in the function

    // Initial fetch
    useEffect(() => {
        fetchCharts();
    }, [fetchCharts]);

    // Real-time updates
    useEffect(() => {
        if (!realTimeInterval || realTimeInterval <= 0) return;

        const interval = setInterval(() => {
            console.log('🔄 Real-time chart update triggered');
            fetchCharts(true); // Background fetch
        }, realTimeInterval);

        return () => clearInterval(interval);
    }, [realTimeInterval, fetchCharts, userRole]);

    return {
        chartsData,
        loading,
        error,
        refetch: fetchCharts,
        lastFetch,
        isRefreshing,
    };
};

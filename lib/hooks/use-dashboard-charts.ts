/**
 * Dashboard Charts Hook
 * Manages fetching and transformation of chart data for analytics visualizations
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import { config } from "@/lib/config";
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

export const useDashboardCharts = (realTimeInterval?: number): UseDashboardChartsReturn => {
    const [chartsData, setChartsData] = useState<DashboardChartsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetch, setLastFetch] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchCharts = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) {
                setLoading(true);
            } else {
                setIsRefreshing(true);
            }
            setError(null);

            console.log('🔄 Fetching dashboard charts data from:', '/dashboard/new-user');

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

            const data = response.data!;
            console.log('✅ Dashboard charts data received');

            // Transform the data using utilities from task 1
            const transformed: DashboardChartsData = {
                suppliers: transformSupplierData(
                    data.platform_overview?.available_suppliers || []
                ),
                registrations: transformTimeSeriesData(
                    data.platform_trends?.user_registrations?.time_series || []
                ),
                logins: transformTimeSeriesData(
                    data.activity_metrics?.user_logins?.time_series || []
                ),
                apiRequests: transformTimeSeriesData(
                    data.activity_metrics?.api_requests?.time_series || []
                ),
                packages: transformPackageData(
                    data.platform_overview?.available_packages || []
                ),
            };

            console.log('📊 Transformed charts data:', {
                suppliersCount: transformed.suppliers.length,
                registrationsCount: transformed.registrations.length,
                loginsCount: transformed.logins.length,
                apiRequestsCount: transformed.apiRequests.length,
                packagesCount: transformed.packages.length,
            });

            setChartsData(transformed);
            setLastFetch(new Date());
        } catch (err) {
            console.warn('⚠️ Dashboard charts fetch error:', {
                error: err,
                message: err instanceof Error ? err.message : 'Unknown error',
                isBackground,
            });

            if (!isBackground) {
                const errorMessage = err instanceof Error
                    ? err.message
                    : "Failed to fetch dashboard charts data";
                setError(errorMessage);
            }
        } finally {
            if (!isBackground) {
                setLoading(false);
            } else {
                setIsRefreshing(false);
            }
        }
    }, []);

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
    }, [realTimeInterval, fetchCharts]);

    return {
        chartsData,
        loading,
        error,
        refetch: fetchCharts,
        lastFetch,
        isRefreshing,
    };
};

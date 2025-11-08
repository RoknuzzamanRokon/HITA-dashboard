/**
 * User Management Analytics Hook
 * Fetches and manages user management analytics data
 */

"use client";

import { useState, useEffect } from "react";

export interface UserManagementAnalytics {
    user_lifecycle: {
        new_users_30d: number;
        activation_rate: number;
        user_growth_rate: number;
    };
    recent_activity: {
        api_keys_issued: number;
    };
    provider_access: {
        total_providers: number;
        active_providers: number;
    };
}

export interface UseUserManagementAnalyticsReturn {
    userManagement: UserManagementAnalytics | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    lastFetch: Date | null;
}

export const useUserManagementAnalytics = (
    realTimeInterval?: number
): UseUserManagementAnalyticsReturn => {
    const [userManagement, setUserManagement] =
        useState<UserManagementAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetch, setLastFetch] = useState<Date | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock data for now since the endpoint doesn't exist
            const mockData: UserManagementAnalytics = {
                user_lifecycle: {
                    new_users_30d: 12,
                    activation_rate: 85.5,
                    user_growth_rate: 15.2,
                },
                recent_activity: {
                    api_keys_issued: 8,
                },
                provider_access: {
                    total_providers: 21,
                    active_providers: 18,
                },
            };

            setUserManagement(mockData);
            setLastFetch(new Date());
        } catch (err) {
            setError("Failed to fetch user management analytics");
            console.error("User management analytics error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, []);

    // Real-time updates
    useEffect(() => {
        if (!realTimeInterval || realTimeInterval <= 0) return;

        const interval = setInterval(() => {
            fetchData();
        }, realTimeInterval);

        return () => clearInterval(interval);
    }, [realTimeInterval]);

    return {
        userManagement,
        loading,
        error,
        refetch: fetchData,
        lastFetch,
    };
};

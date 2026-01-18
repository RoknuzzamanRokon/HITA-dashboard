/**
 * Resilient Data Hook
 * Provides fallback data and graceful error handling
 */

"use client";

import { useState, useEffect } from 'react';

// Mock data for fallback when API is unavailable
export const FALLBACK_DASHBOARD_DATA = {
    stats: {
        totalUsers: 156,
        superUsers: 3,
        adminUsers: 12,
        generalUsers: 141,
        activeUsers: 134,
        inactiveUsers: 22,
        totalPointsDistributed: 45000,
        currentPointsBalance: 12500,
        recentSignups: 8,
        lastUpdated: new Date().toISOString(),
        pointDistribution: [
            { role: "admin_user", total_points: "25000", user_count: 12 },
            { role: "general_user", total_points: "15000", user_count: 141 },
            { role: "super_user", total_points: "5000", user_count: 3 },
        ],
        activityTrends: [
            { date: "2024-01-15", transaction_count: 45, points_transferred: "2500" },
            { date: "2024-01-16", transaction_count: 52, points_transferred: "3200" },
            { date: "2024-01-17", transaction_count: 38, points_transferred: "1800" },
            { date: "2024-01-18", transaction_count: 61, points_transferred: "4100" },
        ],
        topActiveUsers: [
            { id: "1", username: "admin_user", email: "admin@example.com", transaction_count: 25 },
            { id: "2", username: "power_user", email: "power@example.com", transaction_count: 18 },
            { id: "3", username: "active_user", email: "active@example.com", transaction_count: 12 },
        ],
    },
    pointsSummary: {
        transaction_types: [
            { type: "hotel_booking", total_points: "15000", count: 45 },
            { type: "points_transfer", total_points: "12000", count: 32 },
            { type: "admin_allocation", total_points: "8000", count: 18 },
            { type: "bonus_points", total_points: "5000", count: 25 },
        ],
        points_by_role: [
            { role: "admin_user", current_points: "25000000", user_count: 12 },
            { role: "general_user", current_points: "15000000", user_count: 141 },
            { role: "super_user", current_points: "5000000", user_count: 3 },
        ],
    },
    chartsData: {
        suppliers: [
            { id: "1", name: "Hotel Chain A", lastUpdate: "2024-01-18", hotelCount: 150, freshness: 95 },
            { id: "2", name: "Hotel Chain B", lastUpdate: "2024-01-17", hotelCount: 89, freshness: 87 },
            { id: "3", name: "Hotel Chain C", lastUpdate: "2024-01-16", hotelCount: 234, freshness: 92 },
        ],
        registrations: [
            { date: "2024-01-15", count: 12 },
            { date: "2024-01-16", count: 18 },
            { date: "2024-01-17", count: 8 },
            { date: "2024-01-18", count: 15 },
        ],
        logins: [
            { date: "2024-01-15", count: 145 },
            { date: "2024-01-16", count: 167 },
            { date: "2024-01-17", count: 134 },
            { date: "2024-01-18", count: 189 },
        ],
        apiRequests: [
            { date: "2024-01-15", count: 2340 },
            { date: "2024-01-16", count: 2890 },
            { date: "2024-01-17", count: 2156 },
            { date: "2024-01-18", count: 3245 },
        ],
    },
};

interface UseResilientDataOptions {
    enableFallback?: boolean;
    fallbackDelay?: number;
    maxRetries?: number;
}

export function useResilientData(options: UseResilientDataOptions = {}) {
    const {
        enableFallback = true,
        fallbackDelay = 5000, // 5 seconds
        maxRetries = 3,
    } = options;

    const [isUsingFallback, setIsUsingFallback] = useState(false);
    const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'fallback' | 'error'>('checking');
    const [retryCount, setRetryCount] = useState(0);

    // Check if we should use fallback data
    const shouldUseFallback = (error: any) => {
        if (!enableFallback) return false;

        // Use fallback for network errors, timeouts, and server errors
        const isNetworkError = !error?.response;
        const isServerError = error?.response?.status >= 500;
        const isTimeout = error?.code === 'ECONNABORTED' || error?.response?.status === 504;

        return isNetworkError || isServerError || isTimeout;
    };

    // Handle API errors gracefully
    const handleApiError = (error: any, context: string) => {
        console.warn(`⚠️ API Error in ${context}:`, error);

        if (shouldUseFallback(error)) {
            if (retryCount < maxRetries) {
                console.log(`🔄 Retrying API call (${retryCount + 1}/${maxRetries})...`);
                setRetryCount(prev => prev + 1);
                return false; // Don't use fallback yet, retry first
            } else {
                console.log(`🔄 Max retries reached, switching to fallback data for ${context}`);
                setIsUsingFallback(true);
                setApiStatus('fallback');
                return true; // Use fallback data
            }
        }

        setApiStatus('error');
        return false;
    };

    // Reset retry count on successful API call
    const handleApiSuccess = (context: string) => {
        if (retryCount > 0) {
            console.log(`✅ API recovered for ${context}, resetting retry count`);
            setRetryCount(0);
        }
        if (isUsingFallback) {
            console.log(`✅ API recovered, switching back from fallback data`);
            setIsUsingFallback(false);
        }
        setApiStatus('connected');
    };

    // Get fallback data for specific context
    const getFallbackData = (context: 'stats' | 'pointsSummary' | 'chartsData') => {
        return FALLBACK_DASHBOARD_DATA[context];
    };

    return {
        isUsingFallback,
        apiStatus,
        retryCount,
        maxRetries,
        handleApiError,
        handleApiSuccess,
        getFallbackData,
        shouldUseFallback,
    };
}
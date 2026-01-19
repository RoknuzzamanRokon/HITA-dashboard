/**
 * Optimized Dashboard Page - Simplified Version
 * Provides performance improvements while maintaining compatibility
 */

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { apiClient } from "@/lib/api/client";
import { testDashboardStatsAPI } from "@/lib/utils/api-test";
import { TokenStorage } from "@/lib/auth/token-storage";
import { UserAnalyticsSection } from "@/lib/components/dashboard";
import { LazySection } from "@/lib/components/ui/lazy-section";
import {
  DashboardSectionSkeleton,
  ChartSkeleton,
} from "@/lib/components/ui/skeletons";
import { FallbackNotice } from "@/lib/components/ui/fallback-notice";

// Optimized hooks
import {
  useDashboardStats,
  usePointsSummary,
  useDashboardRefresh,
} from "@/lib/hooks/use-dashboard-data";
import { useDashboardCharts } from "@/lib/hooks/use-dashboard-charts";
import { useSmartRealtime } from "@/lib/hooks/use-smart-realtime";
import { useOptimizedDashboard } from "@/lib/hooks/use-dashboard-optimized";

// Optimized section components
import {
  DashboardHeader,
  WelcomeSection,
  QuickActionsSection,
  ChartsSection,
  AnalyticsSection,
  NavigationSection,
} from "@/lib/components/dashboard/sections";

// Enhanced loading skeleton with instant perception
function InstantSectionSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800 ${height}`}>
      <div className="h-full w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent opacity-50"></div>
    </div>
  );
}

function EnhancedSectionSkeleton({ height = "h-64" }: { height?: string }) {
  return <DashboardSectionSkeleton height={height} />;
}

export default function OptimizedDashboardPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { user } = useAuth();

  // Local state
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "fallback" | "error"
  >("checking");
  const [testingAPI, setTestingAPI] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Apply optimizations
  const { isOptimized } = useOptimizedDashboard();

  // Smart real-time system with optimized intervals
  const {
    isEnabled: realTimeEnabled,
    canToggle,
    toggleRealtime,
    interval: realtimeInterval,
    userRole,
  } = useSmartRealtime({
    adminInterval: 60000, // 1 minute for admins
    userInterval: 300000, // 5 minutes for users
    enableForUsers: false, // Only admins get real-time by default
    pauseWhenHidden: true, // Pause when tab is not visible
  });

  // Optimized data fetching with React Query - parallel loading
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    dataUpdatedAt: statsLastFetch,
  } = useDashboardStats(realTimeEnabled);

  const { data: pointsData, isLoading: pointsLoading } =
    usePointsSummary(realTimeEnabled);

  const {
    chartsData,
    loading: chartsLoading,
    error: chartsError,
    isRefreshing: chartsRefreshing,
  } = useDashboardCharts(realtimeInterval, user?.role);

  const { refreshAll } = useDashboardRefresh();

  // Save real-time preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "dashboard-realtime-enabled",
        realTimeEnabled.toString(),
      );
    }
  }, [realTimeEnabled]);

  // Check API connection on mount with timeout to prevent blocking
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        // Use a timeout to prevent API check from blocking UI
        const timeoutId = setTimeout(() => {
          if (apiStatus === "checking") {
            setApiStatus("connected"); // Assume connected if check takes too long
          }
        }, 2000);

        const response = await apiClient.healthCheck();
        clearTimeout(timeoutId);
        setApiStatus(response.success ? "connected" : "error");
      } catch (error) {
        setApiStatus("error");
      }
    };

    if (isAuthenticated) {
      checkApiConnection();
    }
  }, [isAuthenticated, apiStatus]);

  // Event handlers
  const handleTestAPI = async () => {
    setTestingAPI(true);
    try {
      await testDashboardStatsAPI();
      alert("✅ API test successful! Check console for details.");
    } catch (error) {
      alert(
        `❌ API test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setTestingAPI(false);
    }
  };

  const handleRefreshStats = async () => {
    await refreshAll();
  };

  const handleCheckToken = () => {
    const token = TokenStorage.getToken();
    const refreshToken = TokenStorage.getRefreshToken();

    console.log("🔐 Current tokens:", {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      tokenPreview: token ? `${token.substring(0, 20)}...` : "None",
    });

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < currentTime;

        alert(`Token Status:
- Expires: ${new Date(payload.exp * 1000).toLocaleString()}
- Current: ${new Date(currentTime * 1000).toLocaleString()}
- Is Expired: ${isExpired}
- User: ${payload.sub || payload.username || "unknown"}`);
      } catch (e) {
        alert("Could not parse token: " + e);
      }
    } else {
      alert("No authentication token found!");
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-primary))]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const lastFetch = statsLastFetch ? new Date(statsLastFetch) : null;
  const isAnyLoading = statsLoading || pointsLoading || chartsLoading;
  const isReady = isOptimized && !isAnyLoading;

  return (
    <div className="mx-auto">
      {/* Dashboard Header - Always visible */}
      <DashboardHeader
        realTimeEnabled={realTimeEnabled}
        onToggleRealTime={canToggle ? toggleRealtime : undefined}
        onRefresh={handleRefreshStats}
        onTestAPI={handleTestAPI}
        onCheckToken={handleCheckToken}
        isLoading={isAnyLoading}
        isTestingAPI={testingAPI}
        lastFetch={lastFetch}
        canToggleRealtime={canToggle}
        userRole={userRole}
        apiStatus={apiStatus}
        isUsingFallback={isUsingFallback}
      />

      {/* Fallback Notice - Show when using cached data */}
      <FallbackNotice
        isVisible={isUsingFallback}
        onRetry={handleRefreshStats}
        isRetrying={isAnyLoading}
      />

      {/* Welcome Section - Optimized loading */}
      <div className="mb-8">
        <Suspense fallback={<InstantSectionSkeleton height="h-32" />}>
          <WelcomeSection />
        </Suspense>
      </div>

      {/* Quick Actions Section - Optimized loading */}
      <div className="mb-8">
        <Suspense fallback={<InstantSectionSkeleton height="h-48" />}>
          <QuickActionsSection
            onRefreshData={handleRefreshStats}
            isLoading={isAnyLoading}
          />
        </Suspense>
      </div>

      {/* User Analytics Section - Always visible for all users */}
      <div className="mb-8">
        <Suspense fallback={<EnhancedSectionSkeleton />}>
          <UserAnalyticsSection />
        </Suspense>
      </div>

      {/* Main Charts Section - Lazy loaded with aggressive prefetching */}
      <LazySection fallback={<ChartSkeleton height="h-96" />} rootMargin="200px">
        <ChartsSection statsLoading={statsLoading} stats={stats} />
      </LazySection>

      {/* Advanced Analytics Section - Lazy loaded with aggressive prefetching */}
      <LazySection
        fallback={<ChartSkeleton height="h-80" />}
        rootMargin="300px"
      >
        <AnalyticsSection
          chartsData={chartsData}
          chartsLoading={chartsLoading}
          chartsRefreshing={chartsRefreshing}
        />
      </LazySection>

      {/* Navigation Section - Lazy loaded */}
      <LazySection fallback={<EnhancedSectionSkeleton height="h-40" />}>
        <NavigationSection />
      </LazySection>
    </div>
  );
}
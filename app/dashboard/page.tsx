/**
 * Optimized Dashboard Page
 * Features: React Query caching, lazy loading, component splitting, performance monitoring
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

// Optimized section components
import {
  DashboardHeader,
  WelcomeSection,
  QuickActionsSection,
  ChartsSection,
  AnalyticsSection,
  NavigationSection,
} from "@/lib/components/dashboard/sections";

// Loading skeleton for sections
function SectionSkeleton({ height = "h-64" }: { height?: string }) {
  return <DashboardSectionSkeleton height={height} />;
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { user } = useAuth();

  // Local state
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");
  const [testingAPI, setTestingAPI] = useState(false);

  // Smart real-time system
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
  });

  // Optimized data fetching with React Query
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
  const { apiStatus, isUsingFallback } = useResilientData();

  // Save real-time preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "dashboard-realtime-enabled",
        realTimeEnabled.toString(),
      );
    }
  }, [realTimeEnabled]);

  // Check API connection on mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await apiClient.healthCheck();
        setApiStatus(response.success ? "connected" : "disconnected");
      } catch (error) {
        setApiStatus("disconnected");
      }
    };

    if (isAuthenticated) {
      checkApiConnection();
    }
  }, [isAuthenticated]);

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

      {/* Welcome Section - Lazy loaded */}
      <LazySection fallback={<SectionSkeleton height="h-32" />}>
        <WelcomeSection />
      </LazySection>

      {/* Quick Actions Section - Lazy loaded */}
      <LazySection fallback={<SectionSkeleton height="h-48" />}>
        <QuickActionsSection
          onRefreshData={handleRefreshStats}
          isLoading={isAnyLoading}
        />
      </LazySection>

      {/* User Analytics Section - Always visible for all users */}
      <div className="mb-8">
        <Suspense fallback={<SectionSkeleton />}>
          <UserAnalyticsSection />
        </Suspense>
      </div>

      {/* Main Charts Section - Lazy loaded */}
      <LazySection fallback={<ChartSkeleton height="h-96" />} rootMargin="50px">
        <ChartsSection statsLoading={statsLoading} stats={stats} />
      </LazySection>

      {/* Advanced Analytics Section - Lazy loaded */}
      <LazySection
        fallback={<ChartSkeleton height="h-80" />}
        rootMargin="100px"
      >
        <AnalyticsSection
          chartsData={chartsData}
          chartsLoading={chartsLoading}
          chartsRefreshing={chartsRefreshing}
        />
      </LazySection>

      {/* Navigation Section - Lazy loaded */}
      <LazySection fallback={<SectionSkeleton height="h-40" />}>
        <NavigationSection />
      </LazySection>
    </div>
  );
}

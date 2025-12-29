/**
 * Dashboard page - protected route
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { apiClient } from "@/lib/api/client";
import {
  StatsCard,
  RevenueTrendChart,
  UserActivityChart,
  BookingSourcesChart,
  SupplierFreshnessChart,
  SupplierDataFreshnessCardWithGraphs,
  QuickActions,
  RecentTransactions,
  SupplierHotelCountsChart,
  UserRegistrationTrendChart,
  SupplierFreshnessScatterChart,
  UserLoginTimelineChart,
  ApiRequestTimelineChart,
  CombinedActivityChart,
  UserAnalyticsSection,
} from "@/lib/components/dashboard";
import { ChartErrorBoundary } from "@/lib/components/dashboard/chart-error-boundary";
import { useDashboardStats } from "@/lib/hooks/use-dashboard-stats";
import { useDashboardCharts } from "@/lib/hooks/use-dashboard-charts";
import {
  Users,
  UserCheck,
  Shield,
  UserCog,
  Coins,
  Wallet,
  UserPlus,
  Activity,
  RefreshCw,
} from "lucide-react";
import { testDashboardStatsAPI } from "@/lib/utils/api-test";
import { TokenStorage } from "@/lib/auth/token-storage";
import { PermissionGuard } from "@/lib/components/auth/permission-guard";
import { Permission } from "@/lib/utils/rbac";
import {
  RoleBasedNav,
  RoleBasedQuickActions,
} from "@/lib/components/navigation/role-based-nav";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { user } = useAuth();

  // State declarations must come before hooks that use them
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");
  const [testingAPI, setTestingAPI] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(() => {
    // Load real-time preference from localStorage, default to false
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dashboard-realtime-enabled");
      return saved === "true";
    }
    return false;
  });

  // Save real-time preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "dashboard-realtime-enabled",
        realTimeEnabled.toString()
      );
    }
  }, [realTimeEnabled]);

  // Dashboard stats hook with conditional real-time updates
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch,
    lastFetch,
  } = useDashboardStats(realTimeEnabled ? 30000 : 0); // Real-time updates every 30 seconds when enabled

  // Dashboard charts hook with conditional real-time updates
  const {
    chartsData,
    loading: chartsLoading,
    error: chartsError,
    refetch: refetchCharts,
    isRefreshing: chartsRefreshing,
  } = useDashboardCharts(
    realTimeEnabled ? 30000 : 0,
    user?.role // Pass user role to enable security logging
  );

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

  // Test API connection manually
  const handleTestAPI = async () => {
    setTestingAPI(true);
    try {
      await testDashboardStatsAPI();
      alert("✅ API test successful! Check console for details.");
    } catch (error) {
      alert(
        `❌ API test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setTestingAPI(false);
    }
  };

  // Refresh dashboard stats
  const handleRefreshStats = async () => {
    await refetch();
    await refetchCharts();
  };

  // Check token status
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

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              Real-Time Dashboard
            </h1>
            <div className="mt-1 flex items-center space-x-4">
              <PermissionGuard
                permissions={[
                  Permission.VIEW_ALL_USERS,
                  Permission.MANAGE_SYSTEM_SETTINGS,
                ]}
                fallback={
                  <p className="text-sm text-[rgb(var(--text-secondary))]">
                    Welcome to your Dashboard
                  </p>
                }
              >
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  Welcome to the Admin Management Panel
                </p>
              </PermissionGuard>
              {lastFetch && (
                <div className="flex items-center space-x-2 text-xs text-[rgb(var(--text-tertiary))]">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      statsLoading || chartsLoading || chartsRefreshing
                        ? "bg-blue-500 dark:bg-blue-400 animate-pulse"
                        : realTimeEnabled
                        ? "bg-green-500 dark:bg-green-400"
                        : "bg-gray-400 dark:bg-gray-600"
                    }`}
                  ></div>
                  <span>
                    {statsLoading || chartsLoading
                      ? "Loading..."
                      : chartsRefreshing
                      ? "Updating..."
                      : `Last updated: ${lastFetch.toLocaleTimeString()}`}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              title={
                realTimeEnabled
                  ? "Disable automatic updates every 30 seconds"
                  : "Enable automatic updates every 30 seconds"
              }
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                realTimeEnabled
                  ? "bg-green-600 dark:bg-green-500 text-white"
                  : "bg-gray-600 dark:bg-gray-700 text-white"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>
                {realTimeEnabled ? "Auto-refresh ON" : "Auto-refresh OFF"}
              </span>
            </button>
            <button
              onClick={handleRefreshStats}
              disabled={statsLoading}
              title="Manually refresh dashboard data"
              className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md disabled:opacity-50 flex items-center space-x-2 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${statsLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <PermissionGuard
              permissions={[
                Permission.MANAGE_SYSTEM_SETTINGS,
                Permission.VIEW_ANALYTICS,
              ]}
            >
              <button
                onClick={handleTestAPI}
                disabled={testingAPI}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md disabled:opacity-50 flex items-center space-x-2 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${testingAPI ? "animate-spin" : ""}`}
                />
                <span>Test API</span>
              </button>
              <button
                onClick={handleCheckToken}
                className="px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-md flex items-center space-x-2 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Check Token</span>
              </button>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Welcome Section - Admin/Super User Only */}
      <PermissionGuard
        permissions={[
          Permission.VIEW_ALL_USERS,
          Permission.MANAGE_SYSTEM_SETTINGS,
        ]}
      >
        <div className="border-4 border-dashed mb-8 border-gray-200 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Welcome to the Admin Management Panel
            </h2>
            <p className="text-gray-600 mb-6">
              You have successfully logged in. The authentication system is
              working correctly.
            </p>
          </div>
        </div>
      </PermissionGuard>

      {/* Quick Actions Panel - Admin/Super User Only */}
      <PermissionGuard
        permissions={[
          Permission.CREATE_USERS,
          Permission.MANAGE_SYSTEM_SETTINGS,
        ]}
      >
        <div className="mb-8">
          <QuickActions
            onRefreshData={handleRefreshStats}
            isLoading={statsLoading}
          />
        </div>
      </PermissionGuard>

      {/* User Analytics Section - Available for ALL users */}
      <div className="mb-8">
        <UserAnalyticsSection />
      </div>

      {/* Analytics Charts and Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RevenueTrendChart loading={statsLoading} stats={stats} />
        </div>
      </div>

      {/* Second Row - User Activity and Points/Supplier Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <UserActivityChart loading={statsLoading} stats={stats} />
        <PermissionGuard
          permissions={[
            Permission.VIEW_ALL_TRANSACTIONS,
            Permission.MANAGE_POINTS,
          ]}
        >
          <BookingSourcesChart loading={statsLoading} stats={stats} />
        </PermissionGuard>
        <PermissionGuard
          permissions={[
            Permission.VIEW_ALL_TRANSACTIONS,
            Permission.MANAGE_POINTS,
          ]}
        >
          <SupplierDataFreshnessCardWithGraphs loading={statsLoading} />
        </PermissionGuard>
      </div>

      {/* New Analytics Charts Section */}
      <PermissionGuard permissions={[Permission.VIEW_ANALYTICS]}>
        <ChartErrorBoundary
          onError={(error, errorInfo) => {
            console.error("Chart section error:", error, errorInfo);
          }}
        >
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Combined Activity - 3 columns - Admin/Super User Only */}
              <PermissionGuard
                permissions={[
                  Permission.VIEW_ALL_USERS,
                  Permission.MANAGE_SYSTEM_SETTINGS,
                ]}
              >
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <CombinedActivityChart
                    registrations={chartsData?.registrations || []}
                    logins={chartsData?.logins || []}
                    apiRequests={chartsData?.apiRequests || []}
                    loading={chartsLoading}
                    isRefreshing={chartsRefreshing}
                  />
                </div>
              </PermissionGuard>

              {/* User Registration Trend - 1 column */}
              <div className="col-span-1">
                <UserRegistrationTrendChart
                  data={chartsData?.registrations || []}
                  loading={chartsLoading}
                  isRefreshing={chartsRefreshing}
                />
              </div>

              {/* User Login Timeline - 1 column */}
              <div className="col-span-1">
                <UserLoginTimelineChart
                  data={chartsData?.logins || []}
                  loading={chartsLoading}
                  isRefreshing={chartsRefreshing}
                />
              </div>

              {/* API Request Timeline - 1 column */}
              <div className="col-span-1">
                <ApiRequestTimelineChart
                  data={chartsData?.apiRequests || []}
                  loading={chartsLoading}
                  isRefreshing={chartsRefreshing}
                />
              </div>

              {/* Supplier Freshness - 2 columns */}
              <div className="col-span-1 md:col-span-2">
                <SupplierFreshnessScatterChart
                  suppliers={chartsData?.suppliers || []}
                  loading={chartsLoading}
                  isRefreshing={chartsRefreshing}
                />
              </div>
            </div>
          </div>
        </ChartErrorBoundary>
      </PermissionGuard>

      {/* Role-Based Navigation */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-[rgb(var(--text-primary))] mb-4">
          Available Features
        </h2>
        <RoleBasedNav variant="grid" />
      </div>
    </div>
  );
}

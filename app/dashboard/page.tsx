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
  LiveActivityFeed,
  QuickActions,
  RecentTransactions,
  SupplierHotelCountsChart,
  UserRegistrationTrendChart,
  SupplierFreshnessScatterChart,
  UserLoginTimelineChart,
  ApiRequestTimelineChart,
  PackagePointComparisonChart,
  CombinedActivityChart,
} from "@/lib/components/dashboard";
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
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

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
  } = useDashboardCharts(realTimeEnabled ? 30000 : 0);

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
                      realTimeEnabled
                        ? "bg-green-500 dark:bg-green-400 animate-pulse"
                        : "bg-gray-400 dark:bg-gray-600"
                    }`}
                  ></div>
                  <span>Last updated: {lastFetch.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                realTimeEnabled
                  ? "bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600"
                  : "bg-gray-600 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{realTimeEnabled ? "Real-time ON" : "Real-time OFF"}</span>
            </button>
            <button
              onClick={handleRefreshStats}
              disabled={statsLoading}
              className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 flex items-center space-x-2 transition-colors"
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
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${testingAPI ? "animate-spin" : ""}`}
                />
                <span>Test API</span>
              </button>
              <button
                onClick={handleCheckToken}
                className="px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-md hover:bg-purple-700 dark:hover:bg-purple-600 flex items-center space-x-2 transition-colors"
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

      {/* Dashboard Stats Error */}
      {statsError && (
        <div className="mb-6">
          <div className="p-4 rounded-md bg-red-50 border border-red-200">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-3 bg-red-500"></div>
              <span className="text-sm font-medium text-red-800">
                Dashboard Stats Error: {statsError}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Charts Error */}
      {chartsError && (
        <div className="mb-6">
          <div className="p-4 rounded-md bg-red-50 border border-red-200">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-3 bg-red-500"></div>
              <span className="text-sm font-medium text-red-800">
                Dashboard Charts Error: {chartsError}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* User Statistics Grid - Admin Only */}
      <PermissionGuard
        permissions={[
          Permission.VIEW_ALL_USERS,
          Permission.MANAGE_SYSTEM_SETTINGS,
        ]}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            change={{
              value: stats?.recentSignups || 0,
              type: "increase",
            }}
            icon={<Users className="w-6 h-6" />}
            gradient="primary"
            loading={statsLoading}
          />

          <StatsCard
            title="Active Users"
            value={stats?.activeUsers || 0}
            change={{
              value: stats?.totalUsers
                ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
                : 0,
              type: "increase",
            }}
            icon={<UserCheck className="w-6 h-6" />}
            gradient="success"
            loading={statsLoading}
          />

          <StatsCard
            title="Admin Users"
            value={stats?.adminUsers || 0}
            change={{
              value: stats?.superUsers || 0,
              type: "neutral",
            }}
            icon={<Shield className="w-6 h-6" />}
            gradient="accent"
            loading={statsLoading}
          />

          <StatsCard
            title="General Users"
            value={stats?.generalUsers || 0}
            change={{
              value: stats?.totalUsers
                ? Math.round((stats.generalUsers / stats.totalUsers) * 100)
                : 0,
              type: "increase",
            }}
            icon={<UserCog className="w-6 h-6" />}
            gradient="secondary"
            loading={statsLoading}
          />
        </div>
      </PermissionGuard>

      {/* Points Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <PermissionGuard
          permissions={[
            Permission.VIEW_ALL_TRANSACTIONS,
            Permission.MANAGE_POINTS,
          ]}
        >
          <StatsCard
            title="Points Distributed"
            value={
              stats?.totalPointsDistributed
                ? `${(stats.totalPointsDistributed / 1000000).toFixed(1)}M`
                : "0"
            }
            change={{
              value:
                stats?.currentPointsBalance && stats?.totalPointsDistributed
                  ? Math.round(
                      (stats.currentPointsBalance /
                        stats.totalPointsDistributed) *
                        100
                    )
                  : 0,
              type: "increase",
            }}
            icon={<Coins className="w-6 h-6" />}
            gradient="warning"
            loading={statsLoading}
          />
        </PermissionGuard>

        <PermissionGuard
          permissions={[
            Permission.VIEW_ALL_TRANSACTIONS,
            Permission.MANAGE_POINTS,
          ]}
        >
          <StatsCard
            title="Current Balance"
            value={
              stats?.currentPointsBalance
                ? `${(stats.currentPointsBalance / 1000000).toFixed(1)}M`
                : "0"
            }
            change={{
              value:
                stats?.totalPointsDistributed && stats?.currentPointsBalance
                  ? Math.round(
                      ((stats.totalPointsDistributed -
                        stats.currentPointsBalance) /
                        stats.totalPointsDistributed) *
                        100
                    )
                  : 0,
              type: "decrease",
            }}
            icon={<Wallet className="w-6 h-6" />}
            gradient="success"
            loading={statsLoading}
          />
        </PermissionGuard>

        <PermissionGuard
          permissions={[
            Permission.VIEW_ALL_USERS,
            Permission.MANAGE_SYSTEM_SETTINGS,
          ]}
        >
          <StatsCard
            title="Recent Signups"
            value={stats?.recentSignups || 0}
            change={{
              value: stats?.totalUsers
                ? Math.round((stats.recentSignups / stats.totalUsers) * 100)
                : 0,
              type: "increase",
            }}
            icon={<UserPlus className="w-6 h-6" />}
            gradient="primary"
            loading={statsLoading}
          />
        </PermissionGuard>

        <PermissionGuard
          permissions={[
            Permission.VIEW_ALL_USERS,
            Permission.MANAGE_SYSTEM_SETTINGS,
          ]}
        >
          <StatsCard
            title="Inactive Users"
            value={stats?.inactiveUsers || 0}
            change={{
              value: stats?.totalUsers
                ? Math.round((stats.inactiveUsers / stats.totalUsers) * 100)
                : 0,
              type: "neutral",
            }}
            icon={<Activity className="w-6 h-6" />}
            gradient="error"
            loading={statsLoading}
          />
        </PermissionGuard>
      </div>

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

      {/* Recent Activity & Transactions */}
      <div className="mb-8">
        <RecentTransactions isEnabled={realTimeEnabled} limit={8} />
      </div>

      {/* Analytics Charts and Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RevenueTrendChart loading={statsLoading} stats={stats} />
        </div>
        <PermissionGuard
          permissions={[
            Permission.VIEW_ANALYTICS,
            Permission.MANAGE_SYSTEM_SETTINGS,
          ]}
        >
          <div className="lg:row-span-2">
            <LiveActivityFeed isEnabled={realTimeEnabled} />
          </div>
        </PermissionGuard>
        <UserActivityChart loading={statsLoading} stats={stats} />
        <PermissionGuard
          permissions={[
            Permission.VIEW_ALL_TRANSACTIONS,
            Permission.MANAGE_POINTS,
          ]}
        >
          <BookingSourcesChart loading={statsLoading} stats={stats} />
        </PermissionGuard>
      </div>

      {/* New Analytics Charts Section */}
      <PermissionGuard
        permissions={[Permission.VIEW_ANALYTICS, Permission.VIEW_ALL_USERS]}
      >
        <div className="mb-8">
          <h2 className="text-lg font-medium text-[rgb(var(--text-primary))] mb-4">
            Platform Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Supplier Hotel Counts - 2 columns */}
            <div className="col-span-1 md:col-span-2">
              <SupplierHotelCountsChart
                suppliers={chartsData?.suppliers || []}
                loading={chartsLoading}
              />
            </div>

            {/* Package Points - 1 column */}
            <div className="col-span-1">
              <PackagePointComparisonChart
                packages={chartsData?.packages || []}
                loading={chartsLoading}
              />
            </div>

            {/* Combined Activity - 3 columns */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <CombinedActivityChart
                registrations={chartsData?.registrations || []}
                logins={chartsData?.logins || []}
                apiRequests={chartsData?.apiRequests || []}
                loading={chartsLoading}
              />
            </div>

            {/* User Registration Trend - 1 column */}
            <div className="col-span-1">
              <UserRegistrationTrendChart
                data={chartsData?.registrations || []}
                loading={chartsLoading}
              />
            </div>

            {/* User Login Timeline - 1 column */}
            <div className="col-span-1">
              <UserLoginTimelineChart
                data={chartsData?.logins || []}
                loading={chartsLoading}
              />
            </div>

            {/* API Request Timeline - 1 column */}
            <div className="col-span-1">
              <ApiRequestTimelineChart
                data={chartsData?.apiRequests || []}
                loading={chartsLoading}
              />
            </div>

            {/* Supplier Freshness - 2 columns */}
            <div className="col-span-1 md:col-span-2">
              <SupplierFreshnessScatterChart
                suppliers={chartsData?.suppliers || []}
                loading={chartsLoading}
              />
            </div>
          </div>
        </div>
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

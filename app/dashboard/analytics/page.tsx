/**
 * Analytics Dashboard Page
 * Beautiful data visualization with colorful charts and smooth animations
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { BackButton } from "@/lib/components/ui/back-button";
import {
  AnalyticsCharts,
  TimePeriodSelector,
  EmptyState,
  LoadingSpinner,
  SkeletonLoader,
  UserManagementOverview,
  ProviderAccessChart,
  InteractiveCharts,
} from "@/lib/components/analytics";
import { useDashboardStats } from "@/lib/hooks/use-dashboard-stats";
import { useUserManagementAnalytics } from "@/lib/hooks/use-user-management-analytics";
import { TokenStorage } from "@/lib/auth/token-storage";
import {
  BarChart3,
  TrendingUp,
  RefreshCw,
  Activity,
  Users,
  DollarSign,
  Target,
  Database,
  Shield,
  Zap,
  Clock,
  CheckCircle,
} from "lucide-react";

export type TimePeriod = "7d" | "30d" | "90d" | "1y";

interface ExportData {
  export_metadata: {
    export_timestamp: string;
    export_format: string;
    exported_by: {
      user_id: string;
      username: string;
      role: string;
    };
    data_scope: string;
    export_version: string;
  };
  user_analytics: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    users_with_api_keys: number;
    api_adoption_rate: number;
    role_distribution: {
      admin_user: number;
      general_user: number;
      super_user: number;
    };
    user_engagement_metrics: {
      activation_rate: number;
      api_integration_rate: number;
    };
  };
  system_analytics: {
    database_health: {
      total_hotels: number;
      total_locations: number;
      data_integrity: string;
      system_status: string;
    };
    capacity_metrics: {
      hotel_capacity: number;
      location_coverage: number;
      system_utilization: string;
    };
  };
  hotel_analytics: {
    error?: string;
  };
  points_analytics: {
    points_economy: {
      total_points_distributed: string;
      current_points_balance: string;
      points_utilization_rate: string;
      points_system_health: string;
    };
  };
  performance_analytics: {
    activity_metrics: {
      recent_activity_7d: number;
      avg_daily_activity: number;
      system_performance: string;
    };
    system_health_score: number;
    performance_benchmarks: {
      response_time: string;
      uptime: string;
      error_rate: string;
    };
  };
  export_summary: {
    total_data_points: number;
    data_categories_exported: number;
    export_completeness: string;
    data_quality: string;
    export_size_estimate: string;
  };
}

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Dashboard stats with real-time updates disabled for analytics
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch,
    lastFetch,
  } = useDashboardStats(0); // No real-time updates for analytics

  // User management analytics
  const {
    userManagement,
    loading: userMgmtLoading,
    error: userMgmtError,
    refetch: refetchUserMgmt,
    lastFetch: lastUserMgmtFetch,
  } = useUserManagementAnalytics(0); // No real-time updates for analytics

  // Handle time period change with animation
  const handlePeriodChange = async (period: TimePeriod) => {
    setSelectedPeriod(period);
    setIsRefreshing(true);

    // Simulate data fetching delay for smooth animation
    await new Promise((resolve) => setTimeout(resolve, 800));
    await Promise.all([refetch(), refetchUserMgmt()]);
    setIsRefreshing(false);
  };

  // Fetch export data
  const fetchExportData = async () => {
    setExportLoading(true);
    try {
      // Get authentication token
      const token = TokenStorage.getToken();

      if (!token) {
        console.error("No authentication token available for export data");
        setExportLoading(false);
        return;
      }

      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";
      const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1.0";
      const apiUrl = `${apiBaseUrl}/${apiVersion}`;

      const response = await fetch(`${apiUrl}/dashboard/export-data`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error(
            "Authentication failed for export data - token may be expired"
          );
        } else {
          console.error(
            `Export data API request failed with status: ${response.status}`
          );
        }
        return;
      }

      const data = await response.json();
      setExportData(data);
    } catch (error) {
      // Silently handle errors - don't show error messages
      console.error("Failed to fetch export data:", error);
    } finally {
      setExportLoading(false);
    }
  };

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), refetchUserMgmt(), fetchExportData()]);
    setIsRefreshing(false);
  };

  // Load export data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchExportData();
    }
  }, [isAuthenticated]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Overview</h1>
          <p className="text-slate-500 mt-1">
            Monitor your system performance and user growth
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TimePeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            loading={isRefreshing}
          />
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing || statsLoading || userMgmtLoading}
            className="h-10 w-10"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                isRefreshing || statsLoading || userMgmtLoading
                  ? "animate-spin"
                  : ""
              }`}
            />
          </Button>
        </div>
      </div>

      {/* Error State */}
      {(statsError || userMgmtError) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Activity className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-red-900">Error Loading Data</h3>
            <p className="text-sm text-red-700 mt-1">
              {statsError || userMgmtError}
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-green-50 text-green-700 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +{stats?.recentSignups || 0}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {exportLoading ? (
                <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
              ) : (
                exportData?.user_analytics.total_users?.toLocaleString() ||
                stats?.totalUsers?.toLocaleString() ||
                "0"
              )}
            </h3>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">API Adoption</span>
              <span className="font-medium text-slate-900">
                {exportData
                  ? `${exportData.user_analytics.api_adoption_rate.toFixed(1)}%`
                  : "N/A"}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000"
                style={{
                  width: `${
                    exportData?.user_analytics.api_adoption_rate || 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Active
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Users</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {exportLoading ? (
                <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
              ) : (
                exportData?.user_analytics.active_users?.toLocaleString() ||
                stats?.activeUsers?.toLocaleString() ||
                "0"
              )}
            </h3>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Activation Rate</span>
              <span className="font-medium text-slate-900">
                {exportData
                  ? `${exportData.user_analytics.user_engagement_metrics.activation_rate.toFixed(
                      1
                    )}%`
                  : "N/A"}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000"
                style={{
                  width: `${
                    exportData?.user_analytics.user_engagement_metrics
                      .activation_rate || 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Points Distributed Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-violet-50 rounded-xl group-hover:bg-violet-100 transition-colors">
              <Target className="w-6 h-6 text-violet-600" />
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full">
              Total Dist.
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Points Distributed
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {exportLoading ? (
                <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
              ) : exportData?.points_analytics.points_economy
                  .total_points_distributed ? (
                `${(
                  parseInt(
                    exportData.points_analytics.points_economy
                      .total_points_distributed
                  ) / 1000000
                ).toFixed(1)}M`
              ) : stats?.totalPointsDistributed ? (
                `${(stats.totalPointsDistributed / 1000000).toFixed(1)}M`
              ) : (
                "0"
              )}
            </h3>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Utilization</span>
              <span className="font-medium text-slate-900">
                {exportData
                  ? `${exportData.points_analytics.points_economy.points_utilization_rate}%`
                  : "N/A"}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div
                className="bg-violet-500 h-1.5 rounded-full transition-all duration-1000"
                style={{
                  width: exportData?.points_analytics.points_economy
                    .points_utilization_rate
                    ? `${parseFloat(
                        exportData.points_analytics.points_economy
                          .points_utilization_rate
                      )}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        </div>

        {/* System Health Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
              <Database className="w-6 h-6 text-amber-600" />
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${
                exportData?.system_analytics.database_health.system_status ===
                "operational"
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              {exportData?.system_analytics.database_health.system_status ||
                "Unknown"}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">System Health</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {exportData?.performance_analytics.system_health_score || 0}%
            </h3>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Uptime</span>
              <span className="font-medium text-slate-900">
                {exportData?.performance_analytics.performance_benchmarks
                  .uptime || "N/A"}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-1000"
                style={{
                  width: `${
                    exportData?.performance_analytics.system_health_score || 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Analytics Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Analytics Trends
                </h3>
                <p className="text-sm text-slate-500">
                  User activity and growth over time
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Users
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  Activity
                </span>
              </div>
            </div>
            {statsLoading || isRefreshing ? (
              <SkeletonLoader className="h-[350px] w-full rounded-xl" />
            ) : stats ? (
              <AnalyticsCharts
                stats={stats}
                timePeriod={selectedPeriod}
                loading={isRefreshing}
              />
            ) : (
              <EmptyState
                title="No Data Available"
                description="No analytics data found for this period."
                icon={<BarChart3 className="w-12 h-12 text-slate-300" />}
              />
            )}
          </div>

          {/* Provider Access Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                Provider Access
              </h3>
              <p className="text-sm text-slate-500">
                Distribution of provider access types
              </p>
            </div>
            <ProviderAccessChart
              data={userManagement || undefined}
              loading={userMgmtLoading || isRefreshing}
            />
          </div>
        </div>

        {/* Right Column - Stats & Activity */}
        <div className="space-y-8">
          {/* User Role Distribution */}
          {exportData && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                User Distribution
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Admin Users
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {exportData.user_analytics.role_distribution.admin_user}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-slate-800 h-2 rounded-full"
                      style={{
                        width: `${
                          (exportData.user_analytics.role_distribution
                            .admin_user /
                            exportData.user_analytics.total_users) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      General Users
                    </span>
                    <span className="text-sm font-bold text-blue-900">
                      {exportData.user_analytics.role_distribution.general_user}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (exportData.user_analytics.role_distribution
                            .general_user /
                            exportData.user_analytics.total_users) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-violet-900">
                      Super Users
                    </span>
                    <span className="text-sm font-bold text-violet-900">
                      {exportData.user_analytics.role_distribution.super_user}
                    </span>
                  </div>
                  <div className="w-full bg-violet-200 rounded-full h-2">
                    <div
                      className="bg-violet-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (exportData.user_analytics.role_distribution
                            .super_user /
                            exportData.user_analytics.total_users) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Real-Time Activity */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Live Activity
                </h3>
                <p className="text-sm text-slate-500">Real-time system events</p>
              </div>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Active Users
                  </p>
                  <p className="text-xs text-slate-500">
                    {stats?.activeUsers || 0} users online now
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Daily Actions
                  </p>
                  <p className="text-xs text-slate-500">
                    {exportData?.performance_analytics.activity_metrics
                      .avg_daily_activity || 0}{" "}
                    avg. per day
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Growth</p>
                  <p className="text-xs text-slate-500">
                    {userManagement?.user_lifecycle.user_growth_rate.toFixed(
                      1
                    ) || 0}
                    % increase
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Performance Mini-Cards */}
          {exportData && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Response Time
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {
                    exportData.performance_analytics.performance_benchmarks
                      .response_time
                  }
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Error Rate
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {
                    exportData.performance_analytics.performance_benchmarks
                      .error_rate
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">Deep Dive</h3>
          <p className="text-sm text-slate-500">
            Detailed analysis and interactive visualizations
          </p>
        </div>
        <InteractiveCharts stats={stats} exportData={exportData} />
      </div>
    </div>
  );
}

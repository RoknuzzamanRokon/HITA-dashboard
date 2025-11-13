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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="mx-auto space-y-8 p-6">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Header Section */}
        <div className="relative flex items-center justify-between backdrop-blur-sm bg-white/60 rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <BackButton fallbackUrl="/dashboard" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl text-white shadow-lg animate-pulse-slow">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <span>Analytics Dashboard</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="hover:text-blue-600 hover:underline transition-colors"
              >
                Dashboard
              </button>
              <span>/</span>
              <span className="text-gray-900 font-medium">Analytics</span>
            </div>
            <p className="text-gray-600">
              Comprehensive insights and data visualization
            </p>
            {(lastFetch || lastUserMgmtFetch) && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Activity className="w-4 h-4" />
                <span>
                  Last updated:{" "}
                  {(lastFetch || lastUserMgmtFetch)?.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <TimePeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
              loading={isRefreshing}
            />
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing || statsLoading || userMgmtLoading}
              leftIcon={
                <RefreshCw
                  className={`w-4 h-4 ${
                    isRefreshing || statsLoading || userMgmtLoading
                      ? "animate-spin"
                      : ""
                  }`}
                />
              }
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Error State */}
        {(statsError || userMgmtError) && (
          <Card variant="elevated" className="border-red-200 bg-red-50">
            <CardContent>
              <div className="space-y-2">
                {statsError && (
                  <div className="flex items-center space-x-3 text-red-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-medium">Dashboard stats error:</span>
                    <span>{statsError}</span>
                  </div>
                )}
                {userMgmtError && (
                  <div className="flex items-center space-x-3 text-red-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-medium">User management error:</span>
                    <span>{userMgmtError}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Summary */}
        {exportData && (
          <Card
            variant="elevated"
            className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>Analytics Summary</span>
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    Last updated:{" "}
                    {new Date(
                      exportData.export_metadata.export_timestamp
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-xl font-bold text-blue-900">
                    {exportData.export_summary.total_data_points}
                  </div>
                  <div className="text-sm text-blue-700">Data Points</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-xl font-bold text-green-900">
                    {exportData.export_summary.data_categories_exported}
                  </div>
                  <div className="text-sm text-green-700">Categories</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-xl font-bold text-purple-900 capitalize">
                    {exportData.export_summary.export_completeness}
                  </div>
                  <div className="text-sm text-purple-700">Completeness</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-xl font-bold text-orange-900 capitalize">
                    {exportData.export_summary.data_quality}
                  </div>
                  <div className="text-sm text-orange-700">Quality</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Overview - Enhanced with Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-semibold text-white/80 bg-white/20 px-3 py-1 rounded-full">
                  +{stats?.recentSignups || 0} new
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white/80 mb-1">
                  Total Users
                </p>
                <div className="text-3xl font-bold text-white">
                  {exportLoading ? (
                    <div className="h-9 w-20 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    exportData?.user_analytics.total_users?.toLocaleString() ||
                    stats?.totalUsers?.toLocaleString() ||
                    "0"
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex-1 bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-1000"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                  <span className="text-xs text-white/90 font-semibold">
                    75%
                  </span>
                </div>
                <p className="text-xs text-white/70 flex items-center mt-2">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {exportData
                    ? `${exportData.user_analytics.api_adoption_rate.toFixed(
                        1
                      )}% API adoption`
                    : `Growing steadily`}
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-semibold text-white/80 bg-white/20 px-3 py-1 rounded-full animate-pulse">
                  Live
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white/80 mb-1">
                  Active Users
                </p>
                <div className="text-3xl font-bold text-white">
                  {exportLoading ? (
                    <div className="h-9 w-20 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    exportData?.user_analytics.active_users?.toLocaleString() ||
                    stats?.activeUsers?.toLocaleString() ||
                    "0"
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex-1 bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-1000 animate-pulse"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                  <span className="text-xs text-white/90 font-semibold">
                    85%
                  </span>
                </div>
                <p className="text-xs text-white/70 flex items-center mt-2">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {exportData
                    ? `${exportData.user_analytics.user_engagement_metrics.activation_rate.toFixed(
                        1
                      )}% activation`
                    : `High engagement`}
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-semibold text-white/80 bg-white/20 px-3 py-1 rounded-full">
                  Total
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white/80 mb-1">
                  Points Distributed
                </p>
                <div className="text-3xl font-bold text-white">
                  {exportLoading ? (
                    <div className="h-9 w-24 bg-white/20 rounded animate-pulse"></div>
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
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex-1 bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-white to-pink-200 h-2 rounded-full transition-all duration-1000"
                      style={{ width: "92%" }}
                    ></div>
                  </div>
                  <span className="text-xs text-white/90 font-semibold">
                    92%
                  </span>
                </div>
                <p className="text-xs text-white/70 flex items-center mt-2">
                  <Target className="w-3 h-3 mr-1" />
                  {exportData
                    ? `${exportData.points_analytics.points_economy.points_utilization_rate}% utilization`
                    : "High distribution"}
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-semibold text-white/80 bg-white/20 px-3 py-1 rounded-full">
                  Available
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white/80 mb-1">
                  Current Balance
                </p>
                <div className="text-3xl font-bold text-white">
                  {exportLoading ? (
                    <div className="h-9 w-24 bg-white/20 rounded animate-pulse"></div>
                  ) : exportData?.points_analytics.points_economy
                      .current_points_balance ? (
                    `${(
                      parseInt(
                        exportData.points_analytics.points_economy
                          .current_points_balance
                      ) / 1000000
                    ).toFixed(1)}M`
                  ) : stats?.currentPointsBalance ? (
                    `${(stats.currentPointsBalance / 1000000).toFixed(1)}M`
                  ) : (
                    "0"
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex-1 bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-white to-yellow-200 h-2 rounded-full transition-all duration-1000"
                      style={{ width: "68%" }}
                    ></div>
                  </div>
                  <span className="text-xs text-white/90 font-semibold">
                    68%
                  </span>
                </div>
                <p className="text-xs text-white/70 flex items-center mt-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {exportData?.points_analytics.points_economy
                    .points_system_health === "operational"
                    ? "System healthy"
                    : "Ready to use"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Health & Performance Metrics */}
        {exportData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <span>System Health</span>
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">
                        Database Status
                      </span>
                    </div>
                    <span className="text-sm font-medium text-green-700 capitalize">
                      {
                        exportData.system_analytics.database_health
                          .system_status
                      }
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-900">
                        {(
                          exportData.system_analytics.database_health
                            .total_hotels / 1000000
                        ).toFixed(1)}
                        M
                      </div>
                      <div className="text-sm text-blue-700">Hotels</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-900">
                        {(
                          exportData.system_analytics.database_health
                            .total_locations / 1000000
                        ).toFixed(1)}
                        M
                      </div>
                      <div className="text-sm text-purple-700">Locations</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Data Integrity
                    </span>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 capitalize">
                        {
                          exportData.system_analytics.database_health
                            .data_integrity
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      System Utilization
                    </span>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {
                        exportData.system_analytics.capacity_metrics
                          .system_utilization
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Analytics */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span>Performance Analytics</span>
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-900">
                      {exportData.performance_analytics.system_health_score}
                    </div>
                    <div className="text-sm text-green-700">Health Score</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${exportData.performance_analytics.system_health_score}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-900">
                        Response Time
                      </span>
                      <span className="text-sm font-bold text-blue-700">
                        {
                          exportData.performance_analytics
                            .performance_benchmarks.response_time
                        }
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-900">Uptime</span>
                      <span className="text-sm font-bold text-green-700">
                        {
                          exportData.performance_analytics
                            .performance_benchmarks.uptime
                        }
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium text-purple-900">
                        Error Rate
                      </span>
                      <span className="text-sm font-bold text-purple-700">
                        {
                          exportData.performance_analytics
                            .performance_benchmarks.error_rate
                        }
                      </span>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-900">
                      {exportData.performance_analytics.activity_metrics.recent_activity_7d.toLocaleString()}
                    </div>
                    <div className="text-sm text-orange-700">
                      Activities (7 days)
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      Avg:{" "}
                      {
                        exportData.performance_analytics.activity_metrics
                          .avg_daily_activity
                      }
                      /day
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Role Distribution */}
        {exportData && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>User Role Distribution</span>
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
                  <div className="text-3xl font-bold text-red-900 mb-2">
                    {exportData.user_analytics.role_distribution.admin_user}
                  </div>
                  <div className="text-sm font-medium text-red-700 mb-1">
                    Admin Users
                  </div>
                  <div className="text-xs text-red-600">
                    {(
                      (exportData.user_analytics.role_distribution.admin_user /
                        exportData.user_analytics.total_users) *
                      100
                    ).toFixed(1)}
                    % of total
                  </div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-900 mb-2">
                    {exportData.user_analytics.role_distribution.general_user}
                  </div>
                  <div className="text-sm font-medium text-blue-700 mb-1">
                    General Users
                  </div>
                  <div className="text-xs text-blue-600">
                    {(
                      (exportData.user_analytics.role_distribution
                        .general_user /
                        exportData.user_analytics.total_users) *
                      100
                    ).toFixed(1)}
                    % of total
                  </div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
                  <div className="text-3xl font-bold text-purple-900 mb-2">
                    {exportData.user_analytics.role_distribution.super_user}
                  </div>
                  <div className="text-sm font-medium text-purple-700 mb-1">
                    Super Users
                  </div>
                  <div className="text-xs text-purple-600">
                    {(
                      (exportData.user_analytics.role_distribution.super_user /
                        exportData.user_analytics.total_users) *
                      100
                    ).toFixed(1)}
                    % of total
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    API Integration
                  </span>
                  <span className="text-gray-600">
                    {exportData.user_analytics.users_with_api_keys} users (
                    {exportData.user_analytics.api_adoption_rate.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Management Analytics */}
        <UserManagementOverview
          data={userManagement || undefined}
          loading={userMgmtLoading || isRefreshing}
        />

        {/* Provider Access Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProviderAccessChart
              data={userManagement || undefined}
              loading={userMgmtLoading || isRefreshing}
            />
          </div>

          {/* Additional User Lifecycle Metrics */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>User Lifecycle</span>
              </h3>
            </CardHeader>
            <CardContent>
              {userMgmtLoading || isRefreshing ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : userManagement ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">
                      {userManagement.user_lifecycle.new_users_30d}
                    </div>
                    <div className="text-sm text-blue-700">
                      New Users (30 days)
                    </div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">
                      {userManagement.user_lifecycle.activation_rate.toFixed(1)}
                      %
                    </div>
                    <div className="text-sm text-green-700">
                      Activation Rate
                    </div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">
                      {userManagement.user_lifecycle.user_growth_rate.toFixed(
                        1
                      )}
                      %
                    </div>
                    <div className="text-sm text-purple-700">Growth Rate</div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-900">
                      {userManagement.recent_activity.api_keys_issued}
                    </div>
                    <div className="text-sm text-orange-700">
                      API Keys Issued
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No lifecycle data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Real-Time Activity Feed - NEW FEATURE */}
        <Card className="relative overflow-hidden border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <div className="relative">
                  <Activity className="w-6 h-6 text-blue-600" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                </div>
                <span>Real-Time Activity</span>
              </h3>
              <div className="flex items-center space-x-2 text-sm text-green-600 font-semibold">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Updates</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Active Now</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.activeUsers || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Actions Today</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {exportData?.performance_analytics.activity_metrics
                        .avg_daily_activity || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Growth Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userManagement?.user_lifecycle.user_growth_rate.toFixed(
                        1
                      ) || 0}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Charts - NEW FEATURE */}
        <InteractiveCharts stats={stats} exportData={exportData} />

        {/* Main Analytics Charts */}
        {statsLoading || isRefreshing ? (
          <div className="space-y-6">
            <SkeletonLoader className="h-96 w-full rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonLoader className="h-80 w-full rounded-xl" />
              <SkeletonLoader className="h-80 w-full rounded-xl" />
            </div>
          </div>
        ) : stats ? (
          <AnalyticsCharts
            stats={stats}
            timePeriod={selectedPeriod}
            loading={isRefreshing}
          />
        ) : (
          <EmptyState
            title="No Analytics Data Available"
            description="We couldn't find any analytics data for the selected time period."
            icon={<BarChart3 className="w-12 h-12 text-gray-400" />}
            action={
              <Button onClick={handleRefresh} variant="primary">
                Try Again
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}

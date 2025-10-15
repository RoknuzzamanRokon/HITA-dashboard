/**
 * Analytics Dashboard Page
 * Beautiful data visualization with colorful charts and smooth animations
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import {
  AnalyticsCharts,
  TimePeriodSelector,
  EmptyState,
  LoadingSpinner,
  SkeletonLoader,
} from "@/lib/components/analytics";
import { useDashboardStats } from "@/lib/hooks/use-dashboard-stats";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  RefreshCw,
  Activity,
  Users,
  DollarSign,
  Target,
} from "lucide-react";

export type TimePeriod = "7d" | "30d" | "90d" | "1y";

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dashboard stats with real-time updates disabled for analytics
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch,
    lastFetch,
  } = useDashboardStats(0); // No real-time updates for analytics

  // Handle time period change with animation
  const handlePeriodChange = async (period: TimePeriod) => {
    setSelectedPeriod(period);
    setIsRefreshing(true);

    // Simulate data fetching delay for smooth animation
    await new Promise((resolve) => setTimeout(resolve, 800));
    await refetch();
    setIsRefreshing(false);
  };

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span>Analytics Dashboard</span>
          </h1>
          <p className="text-gray-600">
            Comprehensive insights and data visualization
          </p>
          {lastFetch && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Activity className="w-4 h-4" />
              <span>Last updated: {lastFetch.toLocaleTimeString()}</span>
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
            disabled={isRefreshing || statsLoading}
            leftIcon={
              <RefreshCw
                className={`w-4 h-4 ${
                  isRefreshing || statsLoading ? "animate-spin" : ""
                }`}
              />
            }
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {statsError && (
        <Card variant="elevated" className="border-red-200 bg-red-50">
          <CardContent>
            <div className="flex items-center space-x-3 text-red-700">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="font-medium">Error loading analytics data:</span>
              <span>{statsError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="gradient" className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <SkeletonLoader className="h-8 w-16" />
                  ) : (
                    stats?.totalUsers?.toLocaleString() || "0"
                  )}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />+
                  {stats?.recentSignups || 0} this period
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <SkeletonLoader className="h-8 w-16" />
                  ) : (
                    stats?.activeUsers?.toLocaleString() || "0"
                  )}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats?.totalUsers
                    ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
                    : 0}
                  % active
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Points Distributed
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <SkeletonLoader className="h-8 w-20" />
                  ) : stats?.totalPointsDistributed ? (
                    `${(stats.totalPointsDistributed / 1000000).toFixed(1)}M`
                  ) : (
                    "0"
                  )}
                </p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <Target className="w-3 h-3 mr-1" />
                  Across all users
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Current Balance
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <SkeletonLoader className="h-8 w-20" />
                  ) : stats?.currentPointsBalance ? (
                    `${(stats.currentPointsBalance / 1000000).toFixed(1)}M`
                  ) : (
                    "0"
                  )}
                </p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Target className="w-3 h-3 mr-1" />
                  Available points
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
  );
}

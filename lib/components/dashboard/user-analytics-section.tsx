/**
 * User Analytics Section Component
 * Displays personal analytics for all users including activity, usage, and security metrics
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import {
  Activity,
  TrendingUp,
  Shield,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Eye,
  Key,
  Users,
  PieChart,
  Calendar,
  Clock as ClockIcon,
} from "lucide-react";
import { fetchMyActivity, type MyActivityResponse } from "@/lib/api/audit";
import { useCachedUserAnalytics } from "@/lib/hooks/use-cached-user-analytics";

interface UserAnalytics {
  totalLogins: number;
  apiCalls: number;
  failedAttempts: number;
  lastLogin: string;
  securityScore: number;
  recentActivities: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}

export function UserAnalyticsSection() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);

  // Use cached user analytics data
  const {
    data: apiData,
    isLoading: loading,
    error: queryError,
    isUsingCachedData,
    cacheAge,
    forceRefresh,
  } = useCachedUserAnalytics(30);

  const [error, setError] = useState<string | null>(null);

  // Update analytics when cached data changes
  useEffect(() => {
    try {
      if (apiData) {
        // Validate that we have the expected data structure
        if (!apiData.authentication && !apiData.summary && !apiData.user) {
          console.warn(
            "⚠️ User analytics: API data structure is unexpected:",
            apiData,
          );
          setError("Analytics data format is not supported");
          return;
        }

        // Map API response to analytics format with safe property access
        const mappedData: UserAnalytics = {
          totalLogins: apiData.authentication?.successful_logins || 0,
          apiCalls: apiData.summary?.total_endpoint_calls || 0,
          failedAttempts: apiData.authentication?.failed_logins || 0,
          lastLogin: apiData.user?.account_created || new Date().toISOString(),
          securityScore: apiData.authentication?.success_rate || 0,
          recentActivities: (apiData.recent_activities || [])
            .slice(0, 4)
            .map((activity: any) => ({
              id: activity.id?.toString() || Math.random().toString(),
              type: activity.action || "unknown",
              description: `${activity.action_label || activity.action || "Activity"}${
                activity.endpoint ? ` - ${activity.endpoint}` : ""
              }`,
              timestamp: activity.created_at || new Date().toISOString(),
              status:
                activity.details?.success === false
                  ? "error"
                  : ("success" as "success" | "warning" | "error"),
            })),
        };

        console.log("✅ User analytics mapped successfully:", mappedData);
        setAnalytics(mappedData);
        setError(null);
      } else if (queryError) {
        console.error("❌ User analytics query error:", queryError);
        setError(
          queryError instanceof Error
            ? queryError.message
            : "Failed to load analytics",
        );
      }
    } catch (err) {
      console.error("❌ Error processing user analytics data:", err);
      setError("Failed to process analytics data");
      setAnalytics(null);
    }
  }, [apiData, queryError]);

  const getIconForActivity = (type: string) => {
    switch (type) {
      case "login":
        return <Key className="w-4 h-4" />;
      case "api_call":
      case "api_access":
        return <Activity className="w-4 h-4" />;
      case "export":
        return <BarChart3 className="w-4 h-4" />;
      case "failed_login":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "error":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">
            Unable to Load Analytics
          </h3>
          <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">
            {error}
          </p>
          {isUsingCachedData && (
            <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-700 dark:text-blue-300">
              ⚡ Showing cached data (
              {cacheAge ? Math.round(cacheAge / 1000) : 0}s old)
            </div>
          )}
          <button
            onClick={() => forceRefresh()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-color" />
            Your Activity Analytics
            {isUsingCachedData && (
              <span className="text-sm font-normal text-blue-600 bg-blue-100 px-2 py-1 rounded">
                ⚡ Cached ({cacheAge ? Math.round(cacheAge / 1000) : 0}s)
              </span>
            )}
          </h2>
          <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
            Track your usage patterns and security status{" "}
            {apiData?.period?.days && `(Last ${apiData.period.days} days)`}
          </p>
        </div>
        {isUsingCachedData && (
          <button
            onClick={() => forceRefresh()}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logins */}
        <Card
          className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200"
          hover={false}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Successful Logins
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {analytics.totalLogins}
              </p>
              <p className="text-xs text-blue-600 mt-1">Last 30 days</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <Key className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        {/* API Calls */}
        <Card
          className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200"
          hover={false}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                API Requests
              </p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {analytics.apiCalls}
              </p>
              <p className="text-xs text-purple-600 mt-1">Last 30 days</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        {/* Security Score */}
        <Card
          className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200"
          hover={false}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Success Rate</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {analytics.securityScore}%
              </p>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <p className="text-xs text-green-600">
                  {analytics.securityScore >= 95
                    ? "Excellent"
                    : analytics.securityScore >= 80
                      ? "Good"
                      : "Fair"}
                </p>
              </div>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        {/* Failed Attempts */}
        <Card
          className={`p-6 bg-gradient-to-br ${
            analytics.failedAttempts > 0
              ? "from-yellow-50 to-yellow-100/50 border-yellow-200"
              : "from-gray-50 to-gray-100/50 border-gray-200"
          }`}
          hover={false}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  analytics.failedAttempts > 0
                    ? "text-yellow-600"
                    : "text-gray-600"
                }`}
              >
                Failed Attempts
              </p>
              <p
                className={`text-3xl font-bold mt-2 ${
                  analytics.failedAttempts > 0
                    ? "text-yellow-900"
                    : "text-gray-900"
                }`}
              >
                {analytics.failedAttempts}
              </p>
              <p
                className={`text-xs mt-1 ${
                  analytics.failedAttempts > 0
                    ? "text-yellow-600"
                    : "text-gray-600"
                }`}
              >
                Last 30 days
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${
                analytics.failedAttempts > 0 ? "bg-yellow-500" : "bg-gray-400"
              }`}
            >
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card className="p-6" hover={false}>
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-primary-color" />
          <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
            Recent Activity
          </h3>
        </div>

        <div className="space-y-4">
          {analytics.recentActivities.length > 0 ? (
            analytics.recentActivities.map((activity, index: number) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b border-[rgb(var(--border-primary))] last:border-b-0 last:pb-0"
              >
                <div
                  className={`p-2 rounded-lg ${getStatusColor(
                    activity.status,
                  )}`}
                >
                  {getIconForActivity(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                    {activity.description}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant={
                    activity.status === "success"
                      ? "success"
                      : activity.status === "warning"
                        ? "warning"
                        : "error"
                  }
                  size="sm"
                >
                  {activity.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                No recent activities
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Usage Trends & Top Activities */}
      {apiData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Endpoints */}
          <Card className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-color" />
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                  Top Endpoints
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {apiData.endpoint_usage?.top_endpoints
                ?.slice(0, 5)
                .map((endpoint: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
                        {endpoint.endpoint}
                      </span>
                      <span className="text-sm font-semibold text-purple-600">
                        {endpoint.calls} calls
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${endpoint.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )) || []}
              {(!apiData.endpoint_usage?.top_endpoints ||
                apiData.endpoint_usage.top_endpoints.length === 0) && (
                <p className="text-sm text-[rgb(var(--text-secondary))] text-center py-4">
                  No endpoint data available
                </p>
              )}
            </div>
          </Card>

          {/* Top Activities Breakdown */}
          <Card className="p-6" hover={false}>
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-primary-color" />
              <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                Activity Breakdown
              </h3>
            </div>

            <div className="space-y-4">
              {apiData?.activity_breakdown?.map(
                (activity: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getIconForActivity(activity.action)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                          {activity.action_label}
                        </p>
                        <p className="text-xs text-[rgb(var(--text-secondary))]">
                          {activity.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {activity.count}
                    </span>
                  </div>
                ),
              ) || []}
              {(!apiData?.activity_breakdown ||
                apiData.activity_breakdown.length === 0) && (
                <p className="text-sm text-[rgb(var(--text-secondary))] text-center py-4">
                  No activity data available
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Additional Analytics - HTTP Methods & Status Codes */}
      {apiData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HTTP Methods Breakdown */}
          <Card className="p-6" hover={false}>
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-primary-color" />
              <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                HTTP Methods Usage
              </h3>
            </div>

            <div className="space-y-4">
              {apiData?.http_methods?.breakdown?.map(
                (method: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <span className="text-sm font-bold text-purple-600">
                          {method.method}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                          {method.method} Requests
                        </p>
                        <p className="text-xs text-[rgb(var(--text-secondary))]">
                          {method.percentage.toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {method.count}
                    </span>
                  </div>
                ),
              ) || []}
              {(!apiData?.http_methods?.breakdown ||
                apiData.http_methods.breakdown.length === 0) && (
                <p className="text-sm text-[rgb(var(--text-secondary))] text-center py-4">
                  No HTTP method data available
                </p>
              )}
            </div>
          </Card>

          {/* Status Codes Breakdown */}
          <Card className="p-6" hover={false}>
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-primary-color" />
              <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                Response Status Codes
              </h3>
            </div>

            <div className="space-y-4">
              {apiData?.status_codes?.breakdown?.map(
                (status: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${status.status_code === 200 ? "bg-green-100" : "bg-yellow-100"}`}
                      >
                        <span
                          className={`text-sm font-bold ${status.status_code === 200 ? "text-green-600" : "text-yellow-600"}`}
                        >
                          {status.status_code}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                          {status.status_code === 200 ? "Success" : "Errors"}
                        </p>
                        <p className="text-xs text-[rgb(var(--text-secondary))]">
                          {status.percentage.toFixed(1)}% of responses
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[rgb(var(--text-primary))]">
                      {status.count}
                    </span>
                  </div>
                ),
              ) || []}
              {(!apiData?.status_codes?.breakdown ||
                apiData.status_codes.breakdown.length === 0) && (
                <p className="text-sm text-[rgb(var(--text-secondary))] text-center py-4">
                  No status code data available
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Usage Patterns - Time Analysis */}
      {apiData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Distribution */}
          <Card className="p-6" hover={false}>
            <div className="flex items-center gap-2 mb-6">
              <ClockIcon className="w-5 h-5 text-primary-color" />
              <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                Most Active Hours
              </h3>
            </div>

            <div className="space-y-4">
              {apiData?.patterns?.hourly_distribution
                ?.sort((a: any, b: any) => b.count - a.count)
                ?.slice(0, 3)
                ?.map((hour: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ClockIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                          {hour.hour_label}
                        </p>
                        <p className="text-xs text-[rgb(var(--text-secondary))]">
                          {Math.round(
                            (hour.count /
                              (apiData?.patterns?.hourly_distribution?.reduce(
                                (sum: number, h: any) => sum + h.count,
                                0,
                              ) || 1)) *
                              100,
                          )}
                          % of activity
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {hour.count} activities
                    </span>
                  </div>
                )) || []}
              {(!apiData?.patterns?.hourly_distribution ||
                apiData.patterns.hourly_distribution.length === 0) && (
                <p className="text-sm text-[rgb(var(--text-secondary))] text-center py-4">
                  No hourly data available
                </p>
              )}
            </div>
          </Card>

          {/* Day of Week Distribution */}
          <Card className="p-6" hover={false}>
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-primary-color" />
              <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                Activity by Day of Week
              </h3>
            </div>

            <div className="space-y-4">
              {apiData?.patterns?.day_of_week_distribution
                ?.sort((a: any, b: any) => b.count - a.count)
                ?.slice(0, 3)
                ?.map((day: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                          {day.day_name}
                        </p>
                        <p className="text-xs text-[rgb(var(--text-secondary))]">
                          {day.percentage.toFixed(1)}% of activity
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {day.count} activities
                    </span>
                  </div>
                )) || []}
              {(!apiData?.patterns?.day_of_week_distribution ||
                apiData.patterns.day_of_week_distribution.length === 0) && (
                <p className="text-sm text-[rgb(var(--text-secondary))] text-center py-4">
                  No day of week data available
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Performance Insights */}
      {apiData && (
        <Card
          className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200"
          hover={false}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-indigo-900">
                  Activity Insights
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-indigo-600 mb-1">
                    Avg. Daily Activities
                  </p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {apiData?.summary?.average_daily_activities?.toFixed(1) ||
                      "0.0"}
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    activities per day
                  </p>
                </div>
                <div>
                  <p className="text-sm text-indigo-600 mb-1">
                    Most Active Day
                  </p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {apiData?.patterns?.most_active_day_of_week || "N/A"}
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    {apiData?.summary?.most_active_day?.count || 0} activities
                  </p>
                </div>
                <div>
                  <p className="text-sm text-indigo-600 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {apiData?.authentication?.success_rate || 0}%
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    {(apiData?.authentication?.success_rate || 0) >= 95
                      ? "Excellent performance"
                      : "Good performance"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

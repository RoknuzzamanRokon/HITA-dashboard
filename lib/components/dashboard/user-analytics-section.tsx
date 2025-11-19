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
} from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - will integrate with audit API
    const mockData: UserAnalytics = {
      totalLogins: 127,
      apiCalls: 1543,
      failedAttempts: 3,
      lastLogin: new Date().toISOString(),
      securityScore: 95,
      recentActivities: [
        {
          id: "1",
          type: "login",
          description: "Successful login from Chrome",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: "success",
        },
        {
          id: "2",
          type: "api_call",
          description: "Hotel search API request",
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          status: "success",
        },
        {
          id: "3",
          type: "export",
          description: "Created hotel export job",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          status: "success",
        },
        {
          id: "4",
          type: "failed_login",
          description: "Failed login attempt",
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          status: "warning",
        },
      ],
    };

    setTimeout(() => {
      setAnalytics(mockData);
      setLoading(false);
    }, 500);
  }, []);

  const getIconForActivity = (type: string) => {
    switch (type) {
      case "login":
        return <Key className="w-4 h-4" />;
      case "api_call":
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

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-color" />
            Your Activity Analytics
          </h2>
          <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
            Track your usage patterns and security status
          </p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logins */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200" hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Logins</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{analytics.totalLogins}</p>
              <p className="text-xs text-blue-600 mt-1">All time</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <Key className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        {/* API Calls */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200" hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">API Requests</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{analytics.apiCalls}</p>
              <p className="text-xs text-purple-600 mt-1">All time</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        {/* Security Score */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200" hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Security Score</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{analytics.securityScore}%</p>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <p className="text-xs text-green-600">Excellent</p>
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
              <p className={`text-sm font-medium ${analytics.failedAttempts > 0 ? "text-yellow-600" : "text-gray-600"}`}>
                Failed Attempts
              </p>
              <p className={`text-3xl font-bold mt-2 ${analytics.failedAttempts > 0 ? "text-yellow-900" : "text-gray-900"}`}>
                {analytics.failedAttempts}
              </p>
              <p className={`text-xs mt-1 ${analytics.failedAttempts > 0 ? "text-yellow-600" : "text-gray-600"}`}>
                Last 30 days
              </p>
            </div>
            <div className={`p-3 rounded-lg ${analytics.failedAttempts > 0 ? "bg-yellow-500" : "bg-gray-400"}`}>
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
          {analytics.recentActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 pb-4 border-b border-[rgb(var(--border-primary))] last:border-b-0 last:pb-0"
            >
              <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
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
                variant={activity.status === "success" ? "success" : activity.status === "warning" ? "warning" : "error"}
                size="sm"
              >
                {activity.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Usage Trends & Top Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Month vs Last Month */}
        <Card className="p-6" hover={false}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-color" />
              <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                Monthly Comparison
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[rgb(var(--text-primary))]">Logins</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-green-600">+23%</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-[rgb(var(--text-secondary))] mt-1">
                <span>This month: 45</span>
                <span>Last month: 37</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[rgb(var(--text-primary))]">API Calls</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-green-600">+156%</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-[rgb(var(--text-secondary))] mt-1">
                <span>This month: 823</span>
                <span>Last month: 321</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[rgb(var(--text-primary))]">Exports</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-green-600">+40%</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-[rgb(var(--text-secondary))] mt-1">
                <span>This month: 14</span>
                <span>Last month: 10</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Top Activities Breakdown */}
        <Card className="p-6" hover={false}>
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-primary-color" />
            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
              Top Activities
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Key className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">Login Sessions</p>
                  <p className="text-xs text-[rgb(var(--text-secondary))]">Authentication</p>
                </div>
              </div>
              <span className="text-lg font-bold text-blue-600">127</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">API Requests</p>
                  <p className="text-xs text-[rgb(var(--text-secondary))]">Data queries</p>
                </div>
              </div>
              <span className="text-lg font-bold text-purple-600">1,543</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">Export Jobs</p>
                  <p className="text-xs text-[rgb(var(--text-secondary))]">Data exports</p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-600">24</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Eye className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">Page Views</p>
                  <p className="text-xs text-[rgb(var(--text-secondary))]">Navigation</p>
                </div>
              </div>
              <span className="text-lg font-bold text-orange-600">892</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200" hover={false}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-indigo-900">
                Performance Insights
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-indigo-600 mb-1">Avg. Session Time</p>
                <p className="text-2xl font-bold text-indigo-900">8m 32s</p>
                <p className="text-xs text-indigo-600 mt-1">+12% from last week</p>
              </div>
              <div>
                <p className="text-sm text-indigo-600 mb-1">Most Active Day</p>
                <p className="text-2xl font-bold text-indigo-900">Tuesday</p>
                <p className="text-xs text-indigo-600 mt-1">37 activities</p>
              </div>
              <div>
                <p className="text-sm text-indigo-600 mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-indigo-900">98.2%</p>
                <p className="text-xs text-indigo-600 mt-1">Excellent performance</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

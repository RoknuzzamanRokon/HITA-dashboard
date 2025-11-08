/**
 * Interactive Charts Component
 * Beautiful animated charts for analytics dashboard
 */

"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
} from "lucide-react";

interface ChartData {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

interface InteractiveChartsProps {
  stats?: any;
  exportData?: any;
}

export function InteractiveCharts({
  stats,
  exportData,
}: InteractiveChartsProps) {
  const [activeChart, setActiveChart] = useState<"bar" | "line" | "pie">("bar");

  // User Growth Data (Last 7 days)
  const userGrowthData: ChartData[] = [
    { label: "Mon", value: 45, color: "from-blue-400 to-blue-600" },
    { label: "Tue", value: 52, color: "from-blue-400 to-blue-600" },
    { label: "Wed", value: 48, color: "from-blue-400 to-blue-600" },
    { label: "Thu", value: 61, color: "from-blue-400 to-blue-600" },
    { label: "Fri", value: 55, color: "from-blue-400 to-blue-600" },
    { label: "Sat", value: 67, color: "from-blue-400 to-blue-600" },
    { label: "Sun", value: 72, color: "from-blue-400 to-blue-600" },
  ];

  // Points Distribution
  const pointsDistribution: ChartData[] = [
    {
      label: "Distributed",
      value: exportData?.points_analytics?.points_economy
        ?.total_points_distributed
        ? parseInt(
            exportData.points_analytics.points_economy.total_points_distributed
          )
        : stats?.totalPointsDistributed || 6307000,
      color: "from-purple-500 to-pink-500",
      percentage: 65,
    },
    {
      label: "Available",
      value: exportData?.points_analytics?.points_economy
        ?.current_points_balance
        ? parseInt(
            exportData.points_analytics.points_economy.current_points_balance
          )
        : stats?.currentPointsBalance || 6217120,
      color: "from-orange-500 to-red-500",
      percentage: 35,
    },
  ];

  // User Role Distribution
  const roleDistribution: ChartData[] = [
    {
      label: "General Users",
      value:
        exportData?.user_analytics?.role_distribution?.general_user ||
        stats?.generalUsers ||
        20,
      color: "from-blue-500 to-blue-600",
      percentage: 77,
    },
    {
      label: "Admin Users",
      value:
        exportData?.user_analytics?.role_distribution?.admin_user ||
        stats?.adminUsers ||
        5,
      color: "from-green-500 to-emerald-600",
      percentage: 19,
    },
    {
      label: "Super Users",
      value:
        exportData?.user_analytics?.role_distribution?.super_user ||
        stats?.superUsers ||
        2,
      color: "from-purple-500 to-pink-600",
      percentage: 4,
    },
  ];

  // Activity Trend Data
  const activityTrend = [
    { month: "Jan", users: 120, activity: 450 },
    { month: "Feb", users: 145, activity: 520 },
    { month: "Mar", users: 168, activity: 610 },
    { month: "Apr", users: 192, activity: 680 },
    { month: "May", users: 215, activity: 750 },
    { month: "Jun", users: 238, activity: 820 },
  ];

  const maxValue = Math.max(...userGrowthData.map((d) => d.value));

  return (
    <div className="space-y-6">
      {/* Chart Type Selector */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => setActiveChart("bar")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            activeChart === "bar"
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <BarChart3 className="w-5 h-5 inline mr-2" />
          Bar Chart
        </button>
        <button
          onClick={() => setActiveChart("line")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            activeChart === "line"
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Activity className="w-5 h-5 inline mr-2" />
          Line Chart
        </button>
        <button
          onClick={() => setActiveChart("pie")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            activeChart === "pie"
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <PieChart className="w-5 h-5 inline mr-2" />
          Pie Chart
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        {activeChart === "bar" && (
          <Card className="relative overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full filter blur-3xl opacity-30"></div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>User Growth (7 Days)</span>
                </h3>
                <div className="flex items-center space-x-2 text-sm text-green-600 font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  <span>+24%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between space-x-2 h-64">
                {userGrowthData.map((item, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center group"
                  >
                    <div className="relative w-full">
                      <div
                        className={`w-full bg-gradient-to-t ${item.color} rounded-t-lg transition-all duration-1000 hover:scale-105 cursor-pointer shadow-lg`}
                        style={{
                          height: `${(item.value / maxValue) * 200}px`,
                          animationDelay: `${index * 100}ms`,
                        }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded">
                          {item.value}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 mt-2 font-medium">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Trend Line Chart */}
        {activeChart === "line" && (
          <Card className="relative overflow-hidden border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full filter blur-3xl opacity-30"></div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span>Activity Trend (6 Months)</span>
                </h3>
                <div className="flex items-center space-x-2 text-sm text-green-600 font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  <span>+82%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-64">
                <svg className="w-full h-full" viewBox="0 0 600 200">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 50}
                      x2="600"
                      y2={i * 50}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Activity line */}
                  <polyline
                    points={activityTrend
                      .map(
                        (d, i) =>
                          `${(i * 600) / (activityTrend.length - 1)},${
                            200 - (d.activity / 1000) * 200
                          }`
                      )
                      .join(" ")}
                    fill="none"
                    stroke="url(#gradient1)"
                    strokeWidth="3"
                    className="animate-draw"
                  />

                  {/* Users line */}
                  <polyline
                    points={activityTrend
                      .map(
                        (d, i) =>
                          `${(i * 600) / (activityTrend.length - 1)},${
                            200 - (d.users / 300) * 200
                          }`
                      )
                      .join(" ")}
                    fill="none"
                    stroke="url(#gradient2)"
                    strokeWidth="3"
                    className="animate-draw"
                  />

                  {/* Gradients */}
                  <defs>
                    <linearGradient
                      id="gradient1"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient
                      id="gradient2"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>

                  {/* Data points */}
                  {activityTrend.map((d, i) => (
                    <g key={i}>
                      <circle
                        cx={(i * 600) / (activityTrend.length - 1)}
                        cy={200 - (d.activity / 1000) * 200}
                        r="5"
                        fill="#10b981"
                        className="hover:r-8 transition-all cursor-pointer"
                      />
                      <circle
                        cx={(i * 600) / (activityTrend.length - 1)}
                        cy={200 - (d.users / 300) * 200}
                        r="5"
                        fill="#3b82f6"
                        className="hover:r-8 transition-all cursor-pointer"
                      />
                    </g>
                  ))}
                </svg>
                <div className="flex items-center justify-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded"></div>
                    <span className="text-sm text-gray-600">Activity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
                    <span className="text-sm text-gray-600">Users</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role Distribution Pie Chart */}
        {activeChart === "pie" && (
          <Card className="relative overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full filter blur-3xl opacity-30"></div>
            <CardHeader>
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                <span>User Role Distribution</span>
              </h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Animated Donut Chart */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="100"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="40"
                    />
                    {roleDistribution.map((item, index) => {
                      const offset =
                        roleDistribution
                          .slice(0, index)
                          .reduce((sum, d) => sum + (d.percentage || 0), 0) *
                        6.28;
                      const dashArray = (item.percentage || 0) * 6.28;
                      return (
                        <circle
                          key={index}
                          cx="128"
                          cy="128"
                          r="100"
                          fill="none"
                          stroke={`url(#pie-gradient-${index})`}
                          strokeWidth="40"
                          strokeDasharray={`${dashArray} 628`}
                          strokeDashoffset={-offset}
                          className="transition-all duration-1000 hover:stroke-width-45 cursor-pointer"
                          style={{
                            animationDelay: `${index * 200}ms`,
                          }}
                        />
                      );
                    })}
                    <defs>
                      <linearGradient id="pie-gradient-0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#2563eb" />
                      </linearGradient>
                      <linearGradient id="pie-gradient-1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="pie-gradient-2">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {roleDistribution.reduce((sum, d) => sum + d.value, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Users</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {roleDistribution.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded bg-gradient-to-r ${item.color}`}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-gray-900">
                        {item.value}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Points Distribution Chart */}
        <Card className="relative overflow-hidden border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full filter blur-3xl opacity-30"></div>
          <CardHeader>
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <span>Points Distribution</span>
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {pointsDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {item.label}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {(item.value / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 flex items-center justify-end pr-3`}
                      style={{
                        width: `${item.percentage}%`,
                        animationDelay: `${index * 200}ms`,
                      }}
                    >
                      <span className="text-xs font-bold text-white">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Total Points
                </span>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {(
                    pointsDistribution.reduce((sum, d) => sum + d.value, 0) /
                    1000000
                  ).toFixed(1)}
                  M
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

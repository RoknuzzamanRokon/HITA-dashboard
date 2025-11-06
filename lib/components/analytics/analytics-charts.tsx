/**
 * Analytics Charts Component
 * Beautiful data visualization with colorful charts and smooth animations
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import { ChartSkeleton } from "./loading-spinner";
import { EmptyState } from "./empty-state";
import { cn } from "@/lib/utils";
import { TrendingUp, Users, Activity, DollarSign } from "lucide-react";

export type TimePeriod = "7d" | "30d" | "90d" | "1y";

export interface AnalyticsChartsProps {
  stats: any;
  timePeriod: TimePeriod;
  loading?: boolean;
  className?: string;
}

// Color palette for charts
const chartColors = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#8b5cf6",
  warning: "#f59e0b",
  error: "#ef4444",
  gradients: {
    blue: ["#3b82f6", "#1d4ed8"],
    green: ["#10b981", "#059669"],
    purple: ["#8b5cf6", "#7c3aed"],
    orange: ["#f59e0b", "#d97706"],
    pink: ["#ec4899", "#db2777"],
  },
};

// Custom tooltip component with enhanced styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2 text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">
              {typeof entry.value === "number"
                ? entry.value.toLocaleString()
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Animated chart wrapper
const AnimatedChartWrapper: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  height?: number;
  icon?: React.ReactNode;
  className?: string;
}> = ({
  title,
  subtitle,
  children,
  loading,
  height = 350,
  icon,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card variant="elevated" className={cn("overflow-hidden", className)}>
        <CardHeader
          title={title}
          subtitle={subtitle}
          actions={
            icon && <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
          }
        />
        <CardContent>
          <ChartSkeleton height={height} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="elevated"
      className={cn(
        "overflow-hidden transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      <CardHeader
        title={title}
        subtitle={subtitle}
        actions={
          icon && (
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
              {icon}
            </div>
          )
        }
      />
      <CardContent>
        <div
          className={cn(
            "transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
          style={{ height }}
        >
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  stats,
  timePeriod,
  loading = false,
  className,
}) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!loading) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading, timePeriod]);

  // Transform activity trends data
  const activityData =
    stats?.activityTrends?.map((trend: any) => ({
      date: new Date(trend.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      points: parseInt(trend.points_transferred) / 1000, // Convert to thousands
      transactions: trend.transaction_count,
      users: Math.floor(Math.random() * 50) + 20, // Mock user activity data
    })) || [];

  // Transform point distribution data
  const distributionData =
    stats?.pointDistribution?.map((item: any, index: number) => ({
      name: item.role
        .replace("_", " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase()),
      value: parseInt(item.total_points) / 1000000, // Convert to millions
      count: Math.floor(Math.random() * 100) + 10, // Mock user count
      color: Object.values(chartColors.gradients)[
        index % Object.values(chartColors.gradients).length
      ][0],
    })) || [];

  // User growth data (mock data based on stats)
  const userGrowthData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2024, i, 1).toLocaleDateString("en-US", { month: "short" }),
    totalUsers: Math.floor((stats?.totalUsers || 1000) * (0.7 + i * 0.03)),
    activeUsers: Math.floor((stats?.activeUsers || 500) * (0.6 + i * 0.04)),
    newUsers: Math.floor(Math.random() * 50) + 10,
  }));

  if (!stats || (!activityData.length && !distributionData.length)) {
    return (
      <div className={className}>
        <EmptyState
          title="No Analytics Data Available"
          description="We couldn't find any analytics data for the selected time period."
          icon={<Activity className="w-12 h-12 text-gray-400" />}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Activity Trends Chart */}
      <AnimatedChartWrapper
        title="Activity Trends"
        subtitle="Daily transaction activity and points transferred"
        loading={loading}
        height={400}
        icon={<TrendingUp className="w-5 h-5" />}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={activityData} key={`activity-${animationKey}`}>
            <defs>
              <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartColors.gradients.blue[0]}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartColors.gradients.blue[1]}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="transactionsGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={chartColors.gradients.green[0]}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartColors.gradients.green[1]}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="points"
              stroke={chartColors.gradients.blue[0]}
              strokeWidth={3}
              fill="url(#pointsGradient)"
              name="Points (K)"
              animationDuration={1500}
              animationBegin={0}
            />
            <Bar
              yAxisId="right"
              dataKey="transactions"
              fill={chartColors.gradients.green[0]}
              name="Transactions"
              radius={[4, 4, 0, 0]}
              animationDuration={1200}
              animationBegin={300}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="users"
              stroke={chartColors.gradients.purple[0]}
              strokeWidth={3}
              dot={{
                fill: chartColors.gradients.purple[0],
                strokeWidth: 2,
                r: 4,
              }}
              name="Active Users"
              animationDuration={1800}
              animationBegin={600}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </AnimatedChartWrapper>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <AnimatedChartWrapper
          title="User Growth"
          subtitle="Monthly user acquisition and retention"
          loading={loading}
          height={320}
          icon={<Users className="w-5 h-5" />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userGrowthData} key={`growth-${animationKey}`}>
              <defs>
                <linearGradient
                  id="totalUsersGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={chartColors.gradients.purple[0]}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartColors.gradients.purple[1]}
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient
                  id="activeUsersGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={chartColors.gradients.orange[0]}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartColors.gradients.orange[1]}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                stroke="#666"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalUsers"
                stackId="1"
                stroke={chartColors.gradients.purple[0]}
                fill="url(#totalUsersGradient)"
                name="Total Users"
                animationDuration={1500}
                animationBegin={0}
              />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stackId="2"
                stroke={chartColors.gradients.orange[0]}
                fill="url(#activeUsersGradient)"
                name="Active Users"
                animationDuration={1500}
                animationBegin={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </AnimatedChartWrapper>

        {/* Points Distribution Pie Chart */}
        <AnimatedChartWrapper
          title="Points Distribution"
          subtitle="Points allocated by user role"
          loading={loading}
          height={320}
          icon={<DollarSign className="w-5 h-5" />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart key={`distribution-${animationKey}`}>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const { name, percent } = props;
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1500}
                animationBegin={0}
              >
                {distributionData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200">
                        <p className="font-semibold text-gray-900 mb-2">
                          {data.name}
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Points:</span>
                            <span className="font-medium">
                              {data.value.toFixed(1)}M
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Users:</span>
                            <span className="font-medium">{data.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </AnimatedChartWrapper>
      </div>
    </div>
  );
};

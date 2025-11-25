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
import { TrendingUp, Users, Activity, DollarSign, Award, TrendingDown } from "lucide-react";
import { fetchPointsSummary, type PointsSummaryResponse } from "@/lib/api/dashboard";

export type TimePeriod = "7d" | "30d" | "90d" | "1y";

export interface AnalyticsChartsProps {
  timePeriod?: TimePeriod;
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
    cyan: ["#06b6d4", "#0891b2"],
    red: ["#ef4444", "#dc2626"],
  },
};

const ROLE_COLORS: Record<string, string> = {
  admin_user: chartColors.gradients.red[0],
  general_user: chartColors.gradients.blue[0],
  super_user: chartColors.gradients.purple[0],
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
  timePeriod = "30d",
  className,
}) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [data, setData] = useState<PointsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetchPointsSummary();
        
        if (response.success && response.data) {
          setData(response.data);
          setError(null);
          setAnimationKey((prev) => prev + 1);
        } else {
          setError(response.error?.message || 'Failed to load analytics data');
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timePeriod]);

  // Transform points by role data for pie chart
  const pointsByRoleData = data?.points_by_role.map((item) => ({
    name: item.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: parseInt(item.current_points),
    users: item.user_count,
    utilization: parseFloat(item.points_utilization),
    color: ROLE_COLORS[item.role] || chartColors.primary,
  })) || [];

  // Transform transaction types data for bar chart
  const transactionTypesData = data?.transaction_types.map((item) => ({
    name: item.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: item.count,
    points: parseInt(item.total_points),
    avgPoints: item.avg_points,
    percentage: item.percentage_of_total,
  })).sort((a, b) => b.count - a.count) || [];

  // Transform top holders data for horizontal bar chart
  const topHoldersData = data?.top_point_holders.slice(0, 10).map((holder) => ({
    username: holder.username,
    currentPoints: holder.current_points,
    pointsUsed: holder.points_used,
    role: holder.role,
  })) || [];

  if (error) {
    return (
      <div className={className}>
        <EmptyState
          title="Unable to Load Analytics"
          description={error}
          icon={<Activity className="w-12 h-12 text-gray-400" />}
        />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200" hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Points</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {(parseInt(data.points_economy.total_points_in_system) / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-blue-600 mt-1">In system</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200" hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Utilization Rate</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {parseFloat(data.points_economy.points_utilization_rate).toFixed(1)}%
              </p>
              <p className="text-xs text-green-600 mt-1">Points used</p>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200" hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Balance</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {(parseFloat(data.points_economy.average_user_balance) / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-purple-600 mt-1">Per user</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200" hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Transactions</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">
                {data.recent_transactions_30d}
              </p>
              <p className="text-xs text-orange-600 mt-1">Last 30 days</p>
            </div>
            <div className="p-3 bg-orange-500 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Distribution by Role */}
        <AnimatedChartWrapper
          title="Points Distribution by Role"
          subtitle="Current points allocated across user roles"
          loading={loading}
          height={350}
          icon={<DollarSign className="w-5 h-5" />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart key={`role-${animationKey}`}>
              <Pie
                data={pointsByRoleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const { name, percent } = props;
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1500}
                animationBegin={0}
              >
                {pointsByRoleData.map((entry: any, index: number) => (
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
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-600">Points:</span>
                            <span className="font-medium">
                              {(data.value / 1000000).toFixed(2)}M
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-600">Users:</span>
                            <span className="font-medium">{data.users}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-600">Utilization:</span>
                            <span className="font-medium">{data.utilization}%</span>
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

        {/* Transaction Types */}
        <AnimatedChartWrapper
          title="Transaction Types"
          subtitle="Breakdown of transaction types and volumes"
          loading={loading}
          height={350}
          icon={<Activity className="w-5 h-5" />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transactionTypesData} key={`trans-${animationKey}`}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                stroke="#666"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="count"
                fill={chartColors.gradients.green[0]}
                name="Count"
                radius={[4, 4, 0, 0]}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </AnimatedChartWrapper>
      </div>

      {/* Top Point Holders */}
      <AnimatedChartWrapper
        title="Top Point Holders"
        subtitle="Users with the highest point balances"
        loading={loading}
        height={450}
        icon={<Award className="w-5 h-5" />}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topHoldersData}
            layout="vertical"
            key={`holders-${animationKey}`}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <YAxis
              type="category"
              dataKey="username"
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200">
                      <p className="font-semibold text-gray-900 mb-2">
                        {data.username}
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Role:</span>
                          <span className="font-medium capitalize">
                            {data.role.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Current Points:</span>
                          <span className="font-medium">
                            {data.currentPoints.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Points Used:</span>
                          <span className="font-medium">
                            {data.pointsUsed.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar
              dataKey="currentPoints"
              fill={chartColors.gradients.purple[0]}
              name="Current Points"
              radius={[0, 4, 4, 0]}
              animationDuration={1500}
            />
            <Bar
              dataKey="pointsUsed"
              fill={chartColors.gradients.orange[0]}
              name="Points Used"
              radius={[0, 4, 4, 0]}
              animationDuration={1500}
              animationBegin={200}
            />
          </BarChart>
        </ResponsiveContainer>
      </AnimatedChartWrapper>

      {/* Financial Insights Card */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200" hover={false}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-indigo-900">
                Financial Insights
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-indigo-600 mb-1">Top Holder</p>
                <p className="text-xl font-bold text-indigo-900">
                  {data.financial_insights.highest_point_holder.username}
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  {(data.financial_insights.highest_point_holder.current_points / 1000000).toFixed(1)}M points
                </p>
              </div>
              <div>
                <p className="text-sm text-indigo-600 mb-1">Most Active Type</p>
                <p className="text-xl font-bold text-indigo-900 capitalize">
                  {data.financial_insights.most_active_transaction_type.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-indigo-600 mt-1">Transaction type</p>
              </div>
              <div>
                <p className="text-sm text-indigo-600 mb-1">Activity Level</p>
                <p className="text-xl font-bold text-indigo-900 capitalize">
                  {data.financial_insights.transaction_activity_level}
                </p>
                <p className="text-xs text-indigo-600 mt-1">Past 30 days</p>
              </div>
              <div>
                <p className="text-sm text-indigo-600 mb-1">Users w/ Points</p>
                <p className="text-xl font-bold text-indigo-900">
                  {data.data_quality.users_with_points}
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  {data.financial_insights.total_roles_with_points} roles
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

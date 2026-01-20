/**
 * Analytics Charts Components
 * Interactive charts with smooth animations and custom tooltips
 * Updated to fetch data from Points Summary API
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
} from "recharts";
import ChartWrapper from "./chart-wrapper";
import {
  fetchPointsSummary,
  type PointsSummaryResponse,
} from "@/lib/api/dashboard";

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

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 backdrop-blur-sm">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}:{" "}
            {typeof entry.value === "number"
              ? entry.value.toLocaleString()
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Revenue Trend Chart - Fetches data from API
export const RevenueTrendChart: React.FC<{
  loading?: boolean;
  stats?: any;
}> = ({ loading: externalLoading = false }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [data, setData] = useState<PointsSummaryResponse | null>(null);
  const [internalLoading, setInternalLoading] = useState(true);
  const [containerReady, setContainerReady] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setInternalLoading(true);
        const response = await fetchPointsSummary();

        if (response.success && response.data) {
          setData(response.data);
          setAnimationKey((prev) => prev + 1);
        }
      } catch (err) {
        console.error("Error loading chart data:", err);
      } finally {
        setInternalLoading(false);
      }
    };

    loadData();
  }, []);

  // Ensure container is ready before rendering chart
  useEffect(() => {
    const timer = setTimeout(() => {
      setContainerReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const loading = externalLoading || internalLoading;

  // Generate chart data from API transaction types
  const chartData =
    data?.transaction_types?.slice(0, 6).map((item, index) => ({
      date: item.type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      points: parseInt(item.total_points),
      transactions: item.count,
    })) || [];

  return (
    <ChartWrapper
      title="Activity Trends"
      subtitle="Daily transaction activity and points transferred"
      loading={loading}
      height={350}
    >
      {containerReady ? (
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={300}
          minHeight={200}
        >
          <AreaChart data={chartData} key={animationKey}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
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
              dataKey="points"
              stroke="#8884d8"
              strokeWidth={3}
              fill="url(#revenueGradient)"
              name="Points Transferred"
              animationDuration={1500}
              animationBegin={0}
            />
            <Area
              type="monotone"
              dataKey="transactions"
              stroke="#82ca9d"
              strokeWidth={3}
              fill="url(#usersGradient)"
              name="Transactions"
              animationDuration={1500}
              animationBegin={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading chart...</div>
        </div>
      )}
    </ChartWrapper>
  );
};

// User Activity Chart - Fetches data from API
export const UserActivityChart: React.FC<{
  loading?: boolean;
  stats?: any;
}> = ({ loading: externalLoading = false }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [data, setData] = useState<PointsSummaryResponse | null>(null);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setInternalLoading(true);
        const response = await fetchPointsSummary();

        if (response.success && response.data) {
          setData(response.data);
          setAnimationKey((prev) => prev + 1);
        }
      } catch (err) {
        console.error("Error loading chart data:", err);
      } finally {
        setInternalLoading(false);
      }
    };

    loadData();
  }, []);

  const loading = externalLoading || internalLoading;

  // Use API data from points_by_role
  const chartData =
    data?.points_by_role?.map((item) => ({
      category: item.role
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      count: item.user_count,
      color: ROLE_COLORS[item.role] || chartColors.primary,
    })) || [];

  return (
    <ChartWrapper
      title="User Distribution"
      subtitle="User types and activity status"
      loading={loading}
      height={300}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={250}
        minHeight={200}
      >
        <BarChart data={chartData} key={animationKey}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="category"
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
          <Bar
            dataKey="count"
            fill="#10b981"
            name="User Count"
            radius={[4, 4, 0, 0]}
            animationDuration={1200}
            animationBegin={0}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

// Booking Sources Chart - Uses Points Distribution data from API
export const BookingSourcesChart: React.FC<{
  loading?: boolean;
  stats?: any;
}> = ({ loading: externalLoading = false }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [data, setData] = useState<PointsSummaryResponse | null>(null);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setInternalLoading(true);
        const response = await fetchPointsSummary();

        if (response.success && response.data) {
          setData(response.data);
          setAnimationKey((prev) => prev + 1);
        }
      } catch (err) {
        console.error("Error loading chart data:", err);
      } finally {
        setInternalLoading(false);
      }
    };

    loadData();
  }, []);

  const loading = externalLoading || internalLoading;

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${value.toFixed(1)}M`}
      </text>
    );
  };

  // Transform point distribution data from API only
  const chartData =
    data?.points_by_role?.map((item) => ({
      name: item.role
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      value: parseInt(item.current_points) / 1000000, // Convert to millions
      color: ROLE_COLORS[item.role] || chartColors.primary,
    })) || [];

  return (
    <ChartWrapper
      title="Points Distribution"
      subtitle="Points distributed by user role"
      loading={loading}
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart key={animationKey}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            animationDuration={1500}
            animationBegin={0}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

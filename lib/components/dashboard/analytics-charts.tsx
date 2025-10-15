/**
 * Analytics Charts Components
 * Interactive charts with smooth animations and custom tooltips
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

// Sample data - in a real app, this would come from props or API
const revenueData = [
  { month: "Jan", revenue: 12000, users: 450 },
  { month: "Feb", revenue: 15000, users: 520 },
  { month: "Mar", revenue: 18000, users: 680 },
  { month: "Apr", revenue: 22000, users: 750 },
  { month: "May", revenue: 25000, users: 890 },
  { month: "Jun", revenue: 28000, users: 920 },
];

const userActivityData = [
  { day: "Mon", active: 120, inactive: 30 },
  { day: "Tue", active: 150, inactive: 25 },
  { day: "Wed", active: 180, inactive: 20 },
  { day: "Thu", active: 200, inactive: 15 },
  { day: "Fri", active: 250, inactive: 10 },
  { day: "Sat", active: 180, inactive: 35 },
  { day: "Sun", active: 160, inactive: 40 },
];

const bookingSourceData = [
  { name: "Direct", value: 35, color: "#8884d8" },
  { name: "Booking.com", value: 25, color: "#82ca9d" },
  { name: "Expedia", value: 20, color: "#ffc658" },
  { name: "Airbnb", value: 15, color: "#ff7c7c" },
  { name: "Others", value: 5, color: "#8dd1e1" },
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 backdrop-blur-sm">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Revenue Trend Chart
export const RevenueTrendChart: React.FC<{
  loading?: boolean;
  stats?: any;
}> = ({ loading = false, stats }) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!loading) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading]);

  // Transform activity trends data for the chart
  const chartData =
    stats?.activityTrends?.map((trend: any) => ({
      date: new Date(trend.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      points: parseInt(trend.points_transferred),
      transactions: trend.transaction_count,
    })) ||
    revenueData.map((item) => ({
      ...item,
      points: item.revenue,
      transactions: item.users,
    }));

  return (
    <ChartWrapper
      title="Activity Trends"
      subtitle="Daily transaction activity and points transferred"
      loading={loading}
      height={350}
    >
      <ResponsiveContainer width="100%" height="100%">
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
          <XAxis dataKey="month" stroke="#666" fontSize={12} tickLine={false} />
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
    </ChartWrapper>
  );
};

// User Activity Chart
export const UserActivityChart: React.FC<{
  loading?: boolean;
  stats?: any;
}> = ({ loading = false, stats }) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!loading) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading]);

  // Use real data or fallback to mock data
  const chartData = stats
    ? [
        { category: "Super Users", count: stats.superUsers, color: "#8884d8" },
        { category: "Admin Users", count: stats.adminUsers, color: "#82ca9d" },
        {
          category: "General Users",
          count: stats.generalUsers,
          color: "#ffc658",
        },
        {
          category: "Active Users",
          count: stats.activeUsers,
          color: "#ff7c7c",
        },
        {
          category: "Inactive Users",
          count: stats.inactiveUsers,
          color: "#8dd1e1",
        },
      ]
    : userActivityData;

  return (
    <ChartWrapper
      title="User Distribution"
      subtitle="User types and activity status"
      loading={loading}
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
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

// Booking Sources Chart
export const BookingSourcesChart: React.FC<{
  loading?: boolean;
  stats?: any;
}> = ({ loading = false, stats }) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!loading) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading]);

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
        {stats?.pointDistribution
          ? `${value.toFixed(1)}M`
          : `${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Transform point distribution data for the chart
  const chartData =
    stats?.pointDistribution?.map((item: any, index: number) => ({
      name: item.role
        .replace("_", " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase()),
      value: parseInt(item.total_points) / 1000000, // Convert to millions
      color:
        bookingSourceData[index % bookingSourceData.length]?.color || "#8884d8",
    })) || bookingSourceData;

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
            {bookingSourceData.map((entry, index) => (
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

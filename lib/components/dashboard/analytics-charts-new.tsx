/**
 * New Analytics Charts Components
 * Interactive charts for dashboard analytics with supplier, user, and API metrics
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Dot,
} from "recharts";
import ChartWrapper from "./chart-wrapper";
import {
  SupplierChartData,
  TimeSeriesChartData,
} from "@/lib/utils/chart-data-transformers";

// ============================================================================
// Custom Tooltip Components
// ============================================================================

interface SupplierTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const SupplierTooltip: React.FC<SupplierTooltipProps> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          {data.name}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Hotel Count:{" "}
          <span className="font-semibold">
            {data.hotelCount.toLocaleString()}
          </span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Last Updated:{" "}
          {new Date(data.lastUpdated).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    );
  }
  return null;
};

interface RegistrationTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const RegistrationTooltip: React.FC<RegistrationTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{label}</p>
        <p className="text-sm text-gray-900 dark:text-gray-100">
          Registrations: <span className="font-semibold">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// ============================================================================
// Chart Components
// ============================================================================

export interface SupplierHotelCountsChartProps {
  suppliers: SupplierChartData[];
  loading?: boolean;
  height?: number;
}

/**
 * SupplierHotelCountsChart
 * Displays a horizontal bar chart of hotel counts per supplier
 * Sorted by hotel count in descending order with color gradient
 */
export const SupplierHotelCountsChart: React.FC<
  SupplierHotelCountsChartProps
> = ({ suppliers, loading = false, height = 350 }) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!loading) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading, suppliers]);

  // Generate color gradient based on hotel count magnitude
  const getBarColor = (hotelCount: number, maxCount: number): string => {
    const ratio = hotelCount / maxCount;
    if (ratio > 0.7) return "#8884d8"; // Strong blue for high counts
    if (ratio > 0.4) return "#82ca9d"; // Green for medium counts
    return "#ffc658"; // Yellow for lower counts
  };

  const maxCount = Math.max(...suppliers.map((s) => s.hotelCount), 1);

  return (
    <ChartWrapper
      title="Supplier Hotel Inventory"
      subtitle="Hotel counts by supplier"
      loading={loading}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={suppliers}
          layout="horizontal"
          key={animationKey}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            stroke="#666"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#666"
            fontSize={12}
            tickLine={false}
            width={100}
          />
          <Tooltip content={<SupplierTooltip />} />
          <Bar
            dataKey="hotelCount"
            radius={[0, 4, 4, 0]}
            animationDuration={1200}
            animationBegin={0}
          >
            {suppliers.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.hotelCount, maxCount)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export interface UserRegistrationTrendChartProps {
  data: TimeSeriesChartData[];
  loading?: boolean;
  height?: number;
}

/**
 * UserRegistrationTrendChart
 * Displays a line chart with area fill showing user registration trends
 * Shows last 30 days of registration data with smooth curve interpolation
 */
export const UserRegistrationTrendChart: React.FC<
  UserRegistrationTrendChartProps
> = ({ data, loading = false, height = 350 }) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!loading) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading, data]);

  // Custom dot component - only show on non-zero values
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.value === 0) {
      return null;
    }
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#8884d8"
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

  return (
    <ChartWrapper
      title="User Registration Trends"
      subtitle="Last 30 days of user registrations"
      loading={loading}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          key={animationKey}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            stroke="#666"
            fontSize={12}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="#666"
            fontSize={12}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<RegistrationTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            strokeWidth={2}
            fill="url(#colorRegistrations)"
            animationDuration={1200}
            animationBegin={0}
            dot={<CustomDot />}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

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
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
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
  PackageChartData,
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

interface LoginTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const LoginTooltip: React.FC<LoginTooltipProps> = ({
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
          Logins: <span className="font-semibold">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

interface ApiRequestTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const ApiRequestTooltip: React.FC<ApiRequestTooltipProps> = ({
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
          API Requests:{" "}
          <span className="font-semibold">{data.value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

interface PackageTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const PackageTooltip: React.FC<PackageTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          {data.type}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
          Points:{" "}
          <span className="font-semibold">{data.points.toLocaleString()}</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {data.description}
        </p>
      </div>
    );
  }
  return null;
};

interface FreshnessTooltipProps {
  active?: boolean;
  payload?: any[];
}

const FreshnessTooltip: React.FC<FreshnessTooltipProps> = ({
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
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Days Since Update:{" "}
          <span className="font-semibold">{data.daysSinceUpdate}</span>
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

export interface SupplierFreshnessScatterChartProps {
  suppliers: SupplierChartData[];
  loading?: boolean;
  height?: number;
}

/**
 * SupplierFreshnessScatterChart
 * Displays a scatter plot showing supplier data freshness
 * Color-coded by data age: green (< 7 days), yellow (7-30 days), red (> 30 days)
 * Bubble size scaled by hotel count
 */
export const SupplierFreshnessScatterChart: React.FC<
  SupplierFreshnessScatterChartProps
> = ({ suppliers, loading = false, height = 400 }) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!loading) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading, suppliers]);

  // Transform data for scatter chart
  // X-axis: supplier index (for positioning)
  // Y-axis: days since last update
  // Z-axis: hotel count (for bubble size)
  const scatterData = suppliers.map((supplier, index) => ({
    x: index,
    y: supplier.daysSinceUpdate,
    z: supplier.hotelCount,
    name: supplier.name,
    hotelCount: supplier.hotelCount,
    lastUpdated: supplier.lastUpdated,
    daysSinceUpdate: supplier.daysSinceUpdate,
    freshnessColor: supplier.freshnessColor,
  }));

  // Custom shape for scatter points with color coding
  const CustomShape = (props: any) => {
    const { cx, cy, payload } = props;
    const radius = Math.max(6, Math.min(20, Math.sqrt(payload.z) / 10));

    return (
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={payload.freshnessColor}
        stroke="#fff"
        strokeWidth={2}
        opacity={0.8}
      />
    );
  };

  // Generate x-axis ticks with supplier names
  const xAxisTicks = suppliers.map((_, index) => index);

  return (
    <ChartWrapper
      title="Supplier Data Freshness"
      subtitle="Data age by supplier (bubble size = hotel count)"
      loading={loading}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          key={animationKey}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            dataKey="x"
            name="Supplier"
            stroke="#666"
            fontSize={11}
            tickLine={false}
            ticks={xAxisTicks}
            tickFormatter={(value) => {
              const supplier = suppliers[value];
              return supplier ? supplier.name : "";
            }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Days Since Update"
            stroke="#666"
            fontSize={12}
            tickLine={false}
            label={{
              value: "Days Since Last Update",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12, fill: "#666" },
            }}
          />
          <ZAxis
            type="number"
            dataKey="z"
            range={[100, 1000]}
            name="Hotel Count"
          />
          <Tooltip
            content={<FreshnessTooltip />}
            cursor={{ strokeDasharray: "3 3" }}
          />
          <Scatter
            data={scatterData}
            shape={<CustomShape />}
            animationDuration={1200}
            animationBegin={0}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export interface UserLoginTimelineChartProps {
  data: TimeSeriesChartData[];
  loading?: boolean;
  height?: number;
}

/**
 * UserLoginTimelineChart
 * Displays a line chart with area fill showing user login activity
 * Shows last 30 days of login data with distinct color from registrations
 * Handles zero values by showing baseline
 */
export const UserLoginTimelineChart: React.FC<UserLoginTimelineChartProps> = ({
  data,
  loading = false,
  height = 350,
}) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!loading) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading, data]);

  return (
    <ChartWrapper
      title="User Login Activity"
      subtitle="Last 30 days of user logins"
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
            <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
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
          <Tooltip content={<LoginTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#82ca9d"
            strokeWidth={2}
            fill="url(#colorLogins)"
            animationDuration={1200}
            animationBegin={0}
            connectNulls
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export interface ApiRequestTimelineChartProps {
  data: TimeSeriesChartData[];
  loading?: boolean;
  height?: number;
}

/**
 * ApiRequestTimelineChart
 * Displays a line chart with area fill showing API request volume
 * Shows last 30 days of API request data with unique color scheme
 * Uses smooth curve interpolation with area fill
 */
export const ApiRequestTimelineChart: React.FC<
  ApiRequestTimelineChartProps
> = ({ data, loading = false, height = 350 }) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!loading) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading, data]);

  return (
    <ChartWrapper
      title="API Request Volume"
      subtitle="Last 30 days of API requests"
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
            <linearGradient id="colorApiRequests" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ffc658" stopOpacity={0.1} />
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
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<ApiRequestTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#ffc658"
            strokeWidth={2}
            fill="url(#colorApiRequests)"
            animationDuration={1200}
            animationBegin={0}
            connectNulls
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export interface PackagePointComparisonChartProps {
  packages: PackageChartData[];
  loading?: boolean;
  height?: number;
}

/**
 * PackagePointComparisonChart
 * Displays a horizontal bar chart comparing package point allocations
 * Sorted by point value in descending order with color coding by tier
 * Formats point values with K/M suffixes
 */
export const PackagePointComparisonChart: React.FC<
  PackagePointComparisonChartProps
> = ({ packages, loading = false, height = 350 }) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!loading) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading, packages]);

  // Color coding by package tier based on point value
  const getPackageColor = (points: number, maxPoints: number): string => {
    const ratio = points / maxPoints;
    if (ratio > 0.7) return "#8b5cf6"; // Purple for premium packages
    if (ratio > 0.4) return "#3b82f6"; // Blue for mid-tier packages
    if (ratio > 0.2) return "#10b981"; // Green for standard packages
    return "#f59e0b"; // Orange for basic packages
  };

  const maxPoints = Math.max(...packages.map((p) => p.points), 1);

  return (
    <ChartWrapper
      title="Package Point Allocations"
      subtitle="Point values by package type"
      loading={loading}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={packages}
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
            tickFormatter={(value) => {
              // Format with K/M suffixes
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
              return value.toString();
            }}
          />
          <YAxis
            type="category"
            dataKey="type"
            stroke="#666"
            fontSize={12}
            tickLine={false}
            width={150}
          />
          <Tooltip content={<PackageTooltip />} />
          <Bar
            dataKey="points"
            radius={[0, 4, 4, 0]}
            animationDuration={1200}
            animationBegin={0}
          >
            {packages.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getPackageColor(entry.points, maxPoints)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

interface CombinedActivityTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CombinedActivityTooltip: React.FC<CombinedActivityTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={`item-${index}`}
            className="text-sm text-gray-700 dark:text-gray-300"
            style={{ color: entry.color }}
          >
            {entry.name}:{" "}
            <span className="font-semibold">
              {typeof entry.value === "number"
                ? entry.value.toLocaleString()
                : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export interface CombinedActivityChartProps {
  registrations: TimeSeriesChartData[];
  logins: TimeSeriesChartData[];
  apiRequests: TimeSeriesChartData[];
  loading?: boolean;
  height?: number;
}

/**
 * CombinedActivityChart
 * Displays a multi-line chart with three metrics: registrations, logins, and API requests
 * Features interactive legend to toggle line visibility and synchronized tooltip
 * Shows last 30 days of data for all metrics
 */
export const CombinedActivityChart: React.FC<CombinedActivityChartProps> = ({
  registrations,
  logins,
  apiRequests,
  loading = false,
  height = 400,
}) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [visibleLines, setVisibleLines] = useState({
    registrations: true,
    logins: true,
    apiRequests: true,
  });

  useEffect(() => {
    if (!loading) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading, registrations, logins, apiRequests]);

  // Combine all data by date
  const combinedData = React.useMemo(() => {
    const dateMap = new Map<string, any>();

    // Add registrations
    registrations.forEach((item) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, { date: item.date });
      }
      dateMap.get(item.date)!.registrations = item.value;
    });

    // Add logins
    logins.forEach((item) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, { date: item.date });
      }
      dateMap.get(item.date)!.logins = item.value;
    });

    // Add API requests
    apiRequests.forEach((item) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, { date: item.date });
      }
      dateMap.get(item.date)!.apiRequests = item.value;
    });

    // Convert to array and sort by date
    return Array.from(dateMap.values()).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [registrations, logins, apiRequests]);

  // Toggle line visibility
  const handleLegendClick = (dataKey: keyof typeof visibleLines) => {
    setVisibleLines((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  };

  // Custom legend component
  const CustomLegend = () => {
    const legendItems = [
      {
        key: "registrations" as const,
        label: "Registrations",
        color: "#8884d8",
      },
      { key: "logins" as const, label: "Logins", color: "#82ca9d" },
      { key: "apiRequests" as const, label: "API Requests", color: "#ffc658" },
    ];

    return (
      <div className="flex justify-center gap-6 mb-4">
        {legendItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleLegendClick(item.key)}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              opacity: visibleLines[item.key] ? 1 : 0.4,
            }}
          >
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <ChartWrapper
      title="Platform Activity Overview"
      subtitle="Combined metrics: registrations, logins, and API requests"
      loading={loading}
      height={height}
    >
      <CustomLegend />
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={combinedData}
          key={animationKey}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
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
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CombinedActivityTooltip />} />

          {visibleLines.registrations && (
            <Line
              type="monotone"
              dataKey="registrations"
              name="Registrations"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              animationDuration={1200}
              animationBegin={0}
              connectNulls
            />
          )}

          {visibleLines.logins && (
            <Line
              type="monotone"
              dataKey="logins"
              name="Logins"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              animationDuration={1200}
              animationBegin={100}
              connectNulls
            />
          )}

          {visibleLines.apiRequests && (
            <Line
              type="monotone"
              dataKey="apiRequests"
              name="API Requests"
              stroke="#ffc658"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              animationDuration={1200}
              animationBegin={200}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

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
import {
  fetchSupplierInfo,
  type SupplierInfoResponse,
} from "@/lib/api/dashboard";

// ============================================================================
// Responsive Utilities
// ============================================================================

/**
 * Hook to detect screen size for responsive chart adjustments
 */
const useResponsiveChart = () => {
  const [dimensions, setDimensions] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setDimensions({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
};

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
      <div
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
        role="tooltip"
        aria-live="polite"
      >
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          {data.name}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Hotel Count:{" "}
          <span className="font-semibold">
            {data.hotelCount.toLocaleString()}
          </span>
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
          Last Updated:{" "}
          {new Date(data.lastUpdated).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Status: <span className="capitalize">{data.availabilityStatus}</span>
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
      <div
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
        role="tooltip"
        aria-live="polite"
      >
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
      <div
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
        role="tooltip"
        aria-live="polite"
      >
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
      <div
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
        role="tooltip"
        aria-live="polite"
      >
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
      <div
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
        role="tooltip"
        aria-live="polite"
      >
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          {data.type}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
          Points:{" "}
          <span className="font-semibold">{data.points.toLocaleString()}</span>
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
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
      <div
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
        role="tooltip"
        aria-live="polite"
      >
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
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
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
  suppliers?: SupplierChartData[];
  loading?: boolean;
  height?: number;
  isRefreshing?: boolean;
}

/**
 * SupplierHotelCountsChart
 * Beautiful redesigned chart showing hotel inventory by supplier
 * Features: Gradient cards, statistics, color-coded bars, freshness indicators
 */
export const SupplierHotelCountsChart: React.FC<
  SupplierHotelCountsChartProps
> = ({
  suppliers: externalSuppliers,
  loading: externalLoading = false,
  height = 500,
  isRefreshing = false,
}) => {
  const [animationKey, setAnimationKey] = useState(0);
  const { isMobile, isTablet } = useResponsiveChart();
  const [apiData, setApiData] = useState<SupplierInfoResponse | null>(null);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setInternalLoading(true);
        const response = await fetchSupplierInfo();

        if (response.success && response.data) {
          setApiData(response.data);
          setAnimationKey((prev) => prev + 1);
        }
      } catch (err) {
        console.error("Error loading supplier data:", err);
      } finally {
        setInternalLoading(false);
      }
    };

    loadData();
  }, []);

  const loading = externalLoading || internalLoading;

  // Transform API data to chart format, sorted by hotel count descending
  const suppliers =
    apiData?.accessibleSuppliers
      ?.map((supplier) => ({
        name: supplier.supplierName,
        hotelCount: supplier.totalHotels,
        lastUpdated: supplier.lastUpdated,
        availabilityStatus: supplier.availabilityStatus,
        // Calculate days since update for freshness
        daysSinceUpdate: Math.floor(
          (new Date().getTime() - new Date(supplier.lastUpdated).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        // Color code by freshness
        freshnessColor: (() => {
          const days = Math.floor(
            (new Date().getTime() - new Date(supplier.lastUpdated).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          if (days < 7) return "#10b981"; // Green - fresh
          if (days < 30) return "#f59e0b"; // Yellow - moderate
          return "#ef4444"; // Red - stale
        })(),
      }))
      .sort((a, b) => b.hotelCount - a.hotelCount) || [];

  // Check for empty data
  const isEmpty = !loading && suppliers.length === 0;

  // Enhanced color gradient with vibrant colors
  const getBarGradient = (
    hotelCount: number,
    maxCount: number,
    index: number
  ): string => {
    const ratio = hotelCount / maxCount;
    // Use array of vibrant colors and rotate through them
    const colors = [
      "#8b5cf6", // Purple
      "#3b82f6", // Blue
      "#10b981", // Green
      "#f59e0b", // Orange
      "#ec4899", // Pink
      "#06b6d4", // Cyan
    ];
    return colors[index % colors.length];
  };

  const maxCount =
    suppliers && suppliers.length > 0
      ? Math.max(...suppliers.map((s) => s.hotelCount), 1)
      : 1;

  // Calculate statistics
  const totalHotels = suppliers.reduce((sum, s) => sum + s.hotelCount, 0);
  const avgHotels =
    suppliers.length > 0 ? Math.round(totalHotels / suppliers.length) : 0;
  const freshSuppliers = suppliers.filter((s) => s.daysSinceUpdate < 7).length;

  // Responsive dimensions
  const responsiveHeight = isMobile ? 400 : isTablet ? 450 : height;
  const fontSize = isMobile ? 10 : 12;
  const yAxisWidth = isMobile ? 90 : isTablet ? 110 : 130;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No supplier data available
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          🏨 Supplier Hotel Inventory
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Real-time hotel distribution across{" "}
          {apiData?.supplierAnalytics.activeSuppliers || 0} active suppliers
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Hotels Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg transform transition-transform hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">
              Total Hotels
            </span>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏨</span>
            </div>
          </div>
          <p className="text-3xl font-bold">{totalHotels.toLocaleString()}</p>
          <p className="text-blue-100 text-xs mt-1">Across all suppliers</p>
        </div>

        {/* Average per Supplier Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg transform transition-transform hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100 text-sm font-medium">
              Avg per Supplier
            </span>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <p className="text-3xl font-bold">{avgHotels.toLocaleString()}</p>
          <p className="text-purple-100 text-xs mt-1">Mean hotel count</p>
        </div>

        {/* Fresh Data Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg transform transition-transform hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100 text-sm font-medium">
              Fresh Data
            </span>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </div>
          <p className="text-3xl font-bold">
            {freshSuppliers}/{suppliers.length}
          </p>
          <p className="text-green-100 text-xs mt-1">Updated within 7 days</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Data Freshness:
        </span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Fresh ({"<"}7d)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Moderate (7-30d)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Stale ({">"}30d)
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-inner border border-gray-100 dark:border-gray-700">
        <ResponsiveContainer width="100%" height={responsiveHeight - 300}>
          <BarChart
            data={suppliers}
            layout="horizontal"
            key={animationKey}
            margin={{
              top: 10,
              right: isMobile ? 15 : 40,
              left: isMobile ? 10 : 25,
              bottom: 10,
            }}
            aria-label="Bar chart showing hotel counts by supplier"
            role="img"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              opacity={0.5}
            />
            <XAxis
              type="number"
              stroke="#6b7280"
              fontSize={fontSize}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value.toString();
              }}
              aria-label="Hotel count axis"
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#6b7280"
              fontSize={fontSize}
              tickLine={false}
              axisLine={false}
              width={yAxisWidth}
              aria-label="Supplier name axis"
            />
            <Tooltip
              content={<SupplierTooltip />}
              cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
            />
            <Bar
              dataKey="hotelCount"
              radius={[0, 8, 8, 0]}
              animationDuration={1500}
              animationBegin={0}
              aria-label="Hotel count bars"
            >
              {suppliers.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarGradient(entry.hotelCount, maxCount, index)}
                  opacity={0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          Last updated:{" "}
          {apiData?.responseMetadata.generatedAt
            ? new Date(apiData.responseMetadata.generatedAt).toLocaleString()
            : "N/A"}
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Live Data
        </span>
      </div>
    </div>
  );
};

export interface UserRegistrationTrendChartProps {
  data: TimeSeriesChartData[];
  loading?: boolean;
  height?: number;
  isRefreshing?: boolean;
}

/**
 * UserRegistrationTrendChart
 * Displays a line chart with area fill showing user registration trends
 * Shows last 30 days of registration data with smooth curve interpolation
 */
export const UserRegistrationTrendChart: React.FC<
  UserRegistrationTrendChartProps
> = ({ data, loading = false, height = 350, isRefreshing = false }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const { isMobile, isTablet } = useResponsiveChart();

  useEffect(() => {
    if (!loading && !isRefreshing) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading, isRefreshing, data]);

  // Check for empty data
  const isEmpty = !loading && (!data || data.length === 0);

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
        r={isMobile ? 3 : 4}
        fill="#8884d8"
        stroke="#fff"
        strokeWidth={2}
        aria-label={`Registration count: ${payload.value}`}
      />
    );
  };

  // Responsive dimensions
  const responsiveHeight = isMobile ? 280 : isTablet ? 300 : height;
  const fontSize = isMobile ? 10 : 12;
  const xAxisHeight = isMobile ? 50 : 60;
  const xAxisAngle = isMobile ? -60 : -45;

  return (
    <ChartWrapper
      title="User Registration Trends"
      subtitle="Last 30 days of user registrations"
      loading={loading}
      height={responsiveHeight}
      isRefreshing={isRefreshing}
      isEmpty={isEmpty}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          key={animationKey}
          margin={{
            top: 10,
            right: isMobile ? 10 : 30,
            left: isMobile ? -10 : 0,
            bottom: 0,
          }}
          aria-label="Area chart showing user registration trends over time"
          role="img"
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
            fontSize={fontSize}
            tickLine={false}
            angle={xAxisAngle}
            textAnchor="end"
            height={xAxisHeight}
            aria-label="Date axis"
          />
          <YAxis
            stroke="#666"
            fontSize={fontSize}
            tickLine={false}
            allowDecimals={false}
            aria-label="Registration count axis"
          />
          <Tooltip content={<RegistrationTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            strokeWidth={isMobile ? 1.5 : 2}
            fill="url(#colorRegistrations)"
            animationDuration={1200}
            animationBegin={0}
            dot={<CustomDot />}
            aria-label="Registration trend line"
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
  isRefreshing?: boolean;
}

/**
 * SupplierFreshnessScatterChart
 * Displays a scatter plot showing supplier data freshness
 * Color-coded by data age: green (< 7 days), yellow (7-30 days), red (> 30 days)
 * Bubble size scaled by hotel count
 */
export const SupplierFreshnessScatterChart: React.FC<
  SupplierFreshnessScatterChartProps
> = ({ suppliers, loading = false, height = 400, isRefreshing = false }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const { isMobile, isTablet } = useResponsiveChart();

  useEffect(() => {
    if (!loading && !isRefreshing) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading, isRefreshing, suppliers]);

  // Check for empty data
  const isEmpty = !loading && (!suppliers || suppliers.length === 0);

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
    const baseRadius = isMobile ? 4 : 6;
    const maxRadius = isMobile ? 15 : 20;
    const radius = Math.max(
      baseRadius,
      Math.min(maxRadius, Math.sqrt(payload.z) / 10)
    );

    return (
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={payload.freshnessColor}
        stroke="#fff"
        strokeWidth={isMobile ? 1 : 2}
        opacity={0.8}
        aria-label={`${payload.name}: ${payload.daysSinceUpdate} days since update, ${payload.hotelCount} hotels`}
      />
    );
  };

  // Generate x-axis ticks with supplier names
  const xAxisTicks = suppliers.map((_, index) => index);

  // Responsive dimensions
  const responsiveHeight = isMobile ? 320 : isTablet ? 360 : height;
  const fontSize = isMobile ? 9 : isTablet ? 10 : 11;
  const yAxisFontSize = isMobile ? 10 : 12;
  const bottomMargin = isMobile ? 60 : isTablet ? 70 : 80;
  const xAxisAngle = isMobile ? -60 : -45;

  return (
    <ChartWrapper
      title="Supplier Data Freshness"
      subtitle="Data age by supplier (bubble size = hotel count)"
      loading={loading}
      height={responsiveHeight}
      isRefreshing={isRefreshing}
      isEmpty={isEmpty}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          key={animationKey}
          margin={{
            top: 20,
            right: isMobile ? 10 : 30,
            left: isMobile ? 5 : 20,
            bottom: bottomMargin,
          }}
          aria-label="Scatter plot showing supplier data freshness with color coding"
          role="img"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            dataKey="x"
            name="Supplier"
            stroke="#666"
            fontSize={fontSize}
            tickLine={false}
            ticks={xAxisTicks}
            tickFormatter={(value) => {
              const supplier = suppliers[value];
              return supplier ? supplier.name : "";
            }}
            angle={xAxisAngle}
            textAnchor="end"
            height={bottomMargin}
            aria-label="Supplier name axis"
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Days Since Update"
            stroke="#666"
            fontSize={yAxisFontSize}
            tickLine={false}
            label={
              !isMobile
                ? {
                    value: "Days Since Last Update",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: yAxisFontSize, fill: "#666" },
                  }
                : undefined
            }
            aria-label="Days since last update axis"
          />
          <ZAxis
            type="number"
            dataKey="z"
            range={isMobile ? [50, 500] : [100, 1000]}
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
            aria-label="Data freshness scatter points"
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
  isRefreshing?: boolean;
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
  isRefreshing = false,
}) => {
  const [animationKey, setAnimationKey] = useState(0);
  const { isMobile, isTablet } = useResponsiveChart();

  useEffect(() => {
    if (!loading && !isRefreshing) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading, isRefreshing, data]);

  // Check for empty data
  const isEmpty = !loading && (!data || data.length === 0);

  // Responsive dimensions
  const responsiveHeight = isMobile ? 280 : isTablet ? 300 : height;
  const fontSize = isMobile ? 10 : 12;
  const xAxisHeight = isMobile ? 50 : 60;
  const xAxisAngle = isMobile ? -60 : -45;

  return (
    <ChartWrapper
      title="User Login Activity"
      subtitle="Last 30 days of user logins"
      loading={loading}
      height={responsiveHeight}
      isRefreshing={isRefreshing}
      isEmpty={isEmpty}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          key={animationKey}
          margin={{
            top: 10,
            right: isMobile ? 10 : 30,
            left: isMobile ? -10 : 0,
            bottom: 0,
          }}
          aria-label="Area chart showing user login activity over time"
          role="img"
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
            fontSize={fontSize}
            tickLine={false}
            angle={xAxisAngle}
            textAnchor="end"
            height={xAxisHeight}
            aria-label="Date axis"
          />
          <YAxis
            stroke="#666"
            fontSize={fontSize}
            tickLine={false}
            allowDecimals={false}
            aria-label="Login count axis"
          />
          <Tooltip content={<LoginTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#82ca9d"
            strokeWidth={isMobile ? 1.5 : 2}
            fill="url(#colorLogins)"
            animationDuration={1200}
            animationBegin={0}
            connectNulls
            isAnimationActive={true}
            aria-label="Login activity trend line"
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
  isRefreshing?: boolean;
}

/**
 * ApiRequestTimelineChart
 * Displays a line chart with area fill showing API request volume
 * Shows last 30 days of API request data with unique color scheme
 * Uses smooth curve interpolation with area fill
 */
export const ApiRequestTimelineChart: React.FC<
  ApiRequestTimelineChartProps
> = ({ data, loading = false, height = 350, isRefreshing = false }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const { isMobile, isTablet } = useResponsiveChart();

  useEffect(() => {
    if (!loading && !isRefreshing) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading, isRefreshing, data]);

  // Check for empty data
  const isEmpty = !loading && (!data || data.length === 0);

  // Responsive dimensions
  const responsiveHeight = isMobile ? 280 : isTablet ? 300 : height;
  const fontSize = isMobile ? 10 : 12;
  const xAxisHeight = isMobile ? 50 : 60;
  const xAxisAngle = isMobile ? -60 : -45;

  return (
    <ChartWrapper
      title="API Request Volume"
      subtitle="Last 30 days of API requests"
      loading={loading}
      height={responsiveHeight}
      isRefreshing={isRefreshing}
      isEmpty={isEmpty}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          key={animationKey}
          margin={{
            top: 10,
            right: isMobile ? 10 : 30,
            left: isMobile ? -10 : 0,
            bottom: 0,
          }}
          aria-label="Area chart showing API request volume over time"
          role="img"
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
            fontSize={fontSize}
            tickLine={false}
            angle={xAxisAngle}
            textAnchor="end"
            height={xAxisHeight}
            aria-label="Date axis"
          />
          <YAxis
            stroke="#666"
            fontSize={fontSize}
            tickLine={false}
            allowDecimals={false}
            tickFormatter={(value) => value.toLocaleString()}
            aria-label="API request count axis"
          />
          <Tooltip content={<ApiRequestTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#ffc658"
            strokeWidth={isMobile ? 1.5 : 2}
            fill="url(#colorApiRequests)"
            animationDuration={1200}
            animationBegin={0}
            connectNulls
            isAnimationActive={true}
            aria-label="API request volume trend line"
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
  isRefreshing?: boolean;
}

/**
 * PackagePointComparisonChart
 * Displays a horizontal bar chart comparing package point allocations
 * Sorted by point value in descending order with color coding by tier
 * Formats point values with K/M suffixes
 */
export const PackagePointComparisonChart: React.FC<
  PackagePointComparisonChartProps
> = ({ packages, loading = false, height = 350, isRefreshing = false }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const { isMobile, isTablet } = useResponsiveChart();

  useEffect(() => {
    if (!loading && !isRefreshing) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading, isRefreshing, packages]);

  // Check for empty data
  const isEmpty = !loading && (!packages || packages.length === 0);

  // Sort packages by points in descending order
  const sortedPackages = [...(packages || [])].sort(
    (a, b) => b.points - a.points
  );

  // Color coding by tier
  const getBarColor = (points: number, index: number): string => {
    if (points >= 10000) return "#10b981"; // Green - Premium
    if (points >= 5000) return "#3b82f6"; // Blue - Standard
    if (points >= 1000) return "#f59e0b"; // Orange - Basic
    return "#6b7280"; // Gray - Minimal
  };

  // Responsive dimensions
  const responsiveHeight = isMobile ? 280 : isTablet ? 320 : height;
  const fontSize = isMobile ? 10 : 12;
  const yAxisWidth = isMobile ? 80 : isTablet ? 100 : 120;

  return (
    <ChartWrapper
      title="Package Point Comparison"
      subtitle="Point allocations by package type"
      loading={loading}
      height={responsiveHeight}
      isRefreshing={isRefreshing}
      isEmpty={isEmpty}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedPackages}
          layout="horizontal"
          key={animationKey}
          margin={{
            top: 10,
            right: isMobile ? 15 : 40,
            left: isMobile ? 10 : 25,
            bottom: 10,
          }}
          aria-label="Horizontal bar chart showing package point allocations"
          role="img"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis
            type="number"
            stroke="#6b7280"
            fontSize={fontSize}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
              return value.toString();
            }}
            aria-label="Points axis"
          />
          <YAxis
            type="category"
            dataKey="type"
            stroke="#6b7280"
            fontSize={fontSize}
            tickLine={false}
            axisLine={false}
            width={yAxisWidth}
            aria-label="Package type axis"
          />
          <Tooltip content={<PackageTooltip />} />
          <Bar
            dataKey="points"
            radius={[0, 8, 8, 0]}
            animationDuration={1500}
            animationBegin={0}
            aria-label="Package points bars"
          >
            {sortedPackages.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.points, index)}
                opacity={0.9}
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
      <div
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
        role="tooltip"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={`item-${index}`}
            className="text-sm font-medium"
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
  isRefreshing?: boolean;
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
  isRefreshing = false,
}) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [visibleLines, setVisibleLines] = useState({
    registrations: true,
    logins: true,
    apiRequests: true,
  });
  const { isMobile, isTablet } = useResponsiveChart();

  useEffect(() => {
    if (!loading && !isRefreshing) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [loading, isRefreshing, registrations, logins, apiRequests]);

  // Check for empty data
  const isEmpty =
    !loading &&
    (!registrations || registrations.length === 0) &&
    (!logins || logins.length === 0) &&
    (!apiRequests || apiRequests.length === 0);

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

  // Responsive dimensions
  const responsiveHeight = isMobile ? 320 : isTablet ? 360 : height;
  const fontSize = isMobile ? 10 : 12;
  const xAxisHeight = isMobile ? 50 : 60;
  const xAxisAngle = isMobile ? -60 : -45;
  const dotRadius = isMobile ? 2 : 3;
  const activeDotRadius = isMobile ? 4 : 5;
  const strokeWidth = isMobile ? 1.5 : 2;

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
      <div
        className={`flex ${
          isMobile ? "flex-col gap-2" : "justify-center gap-6"
        } mb-4`}
        role="group"
        aria-label="Chart legend - click to toggle metrics"
      >
        {legendItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleLegendClick(item.key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleLegendClick(item.key);
              }
            }}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            style={{
              opacity: visibleLines[item.key] ? 1 : 0.4,
            }}
            aria-pressed={visibleLines[item.key]}
            aria-label={`Toggle ${item.label} line ${
              visibleLines[item.key] ? "off" : "on"
            }`}
          >
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span
              className={`${
                isMobile ? "text-xs" : "text-sm"
              } text-gray-700 dark:text-gray-300`}
            >
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
      height={responsiveHeight}
      isRefreshing={isRefreshing}
      isEmpty={isEmpty}
    >
      <CustomLegend />
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={combinedData}
          key={animationKey}
          margin={{
            top: 5,
            right: isMobile ? 10 : 30,
            left: isMobile ? 5 : 20,
            bottom: 5,
          }}
          aria-label="Multi-line chart showing combined platform activity metrics"
          role="img"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            stroke="#666"
            fontSize={fontSize}
            tickLine={false}
            angle={xAxisAngle}
            textAnchor="end"
            height={xAxisHeight}
            aria-label="Date axis"
          />
          <YAxis
            stroke="#666"
            fontSize={fontSize}
            tickLine={false}
            allowDecimals={false}
            tickFormatter={(value) => value.toLocaleString()}
            aria-label="Activity count axis"
          />
          <Tooltip content={<CombinedActivityTooltip />} />

          {visibleLines.registrations && (
            <Line
              type="monotone"
              dataKey="registrations"
              name="Registrations"
              stroke="#8884d8"
              strokeWidth={strokeWidth}
              dot={{ r: dotRadius }}
              activeDot={{ r: activeDotRadius }}
              animationDuration={1200}
              animationBegin={0}
              connectNulls
              aria-label="Registrations trend line"
            />
          )}

          {visibleLines.logins && (
            <Line
              type="monotone"
              dataKey="logins"
              name="Logins"
              stroke="#82ca9d"
              strokeWidth={strokeWidth}
              dot={{ r: dotRadius }}
              activeDot={{ r: activeDotRadius }}
              animationDuration={1200}
              animationBegin={100}
              connectNulls
              aria-label="Logins trend line"
            />
          )}

          {visibleLines.apiRequests && (
            <Line
              type="monotone"
              dataKey="apiRequests"
              name="API Requests"
              stroke="#ffc658"
              strokeWidth={strokeWidth}
              dot={{ r: dotRadius }}
              activeDot={{ r: activeDotRadius }}
              animationDuration={1200}
              animationBegin={200}
              connectNulls
              aria-label="API requests trend line"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

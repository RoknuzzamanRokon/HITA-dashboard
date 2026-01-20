/**
 * Supplier Data Freshness Chart Component
 * Shows the freshness and last update status of supplier data - DYNAMIC VERSION
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import ChartWrapper from "./chart-wrapper";
import {
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  fetchSupplierFreshness,
  type SupplierFreshnessData,
  type SupplierFreshnessResponse,
  formatLastUpdated,
} from "@/lib/api/supplier-freshness";

// Color mapping for freshness status
const getStatusColor = (status: string) => {
  switch (status) {
    case "fresh":
      return "#10b981"; // Green
    case "stale":
      return "#f59e0b"; // Yellow/Orange
    case "outdated":
      return "#ef4444"; // Red
    default:
      return "#6b7280"; // Gray
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "fresh":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "stale":
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case "outdated":
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default:
      return <RefreshCw className="w-4 h-4 text-gray-600" />;
  }
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 backdrop-blur-sm">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <p className="flex items-center gap-2">
            {getStatusIcon(data.status)}
            <span className="capitalize">{data.status}</span>
          </p>
          <p className="text-gray-600">
            Last Updated: {formatLastUpdated(data.lastUpdated)}
          </p>
          <p className="text-gray-600">
            Records: {data.recordCount?.toLocaleString() || "N/A"}
          </p>
          {data.errorCount > 0 && (
            <p className="text-red-600">Errors: {data.errorCount}</p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const SupplierFreshnessChart: React.FC<{
  loading?: boolean;
}> = ({ loading: externalLoading = false }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [data, setData] = useState<SupplierFreshnessResponse | null>(null);
  const [internalLoading, setInternalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setInternalLoading(true);
      setError(null);

      const response = await fetchSupplierFreshness();

      if (response.success && response.data) {
        setData(response.data);
        setAnimationKey((prev) => prev + 1);
        setLastRefresh(new Date());
        console.log("✅ Supplier freshness data loaded successfully");
      } else {
        const errorMessage =
          response.error?.message || "Failed to load supplier freshness data";
        setError(errorMessage);
        console.error("❌ Failed to load supplier freshness:", errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Network error occurred";
      setError(errorMessage);
      console.error("❌ Error loading supplier freshness data:", err);
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loading = externalLoading || internalLoading;

  // Transform data for chart
  const chartData =
    data?.suppliers?.map((item) => ({
      supplier: item.supplier,
      hoursAgo: item.hoursAgo,
      status: item.status,
      recordCount: item.recordCount,
      lastUpdated: item.lastUpdated,
      errorCount: item.errorCount || 0,
      color: getStatusColor(item.status),
    })) || [];

  // Handle error state
  if (error && !data) {
    return (
      <ChartWrapper
        title="Supplier Data Freshness"
        subtitle="Last update status for each supplier"
        loading={false}
        height={300}
      >
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <WifiOff className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to Load Data
          </h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </ChartWrapper>
    );
  }

  return (
    <ChartWrapper
      title="Supplier Data Freshness"
      subtitle={`Last update status for each supplier${
        lastRefresh
          ? ` • Updated ${formatLastUpdated(lastRefresh.toISOString())}`
          : ""
      }`}
      loading={loading}
      height={300}
    >
      <div className="space-y-4">
        {/* Status Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Fresh (&lt;{data?.thresholds?.freshHours || 6}h)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>
              Stale ({data?.thresholds?.freshHours || 6}-
              {data?.thresholds?.staleHours || 24}h)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Outdated (&gt;{data?.thresholds?.staleHours || 24}h)</span>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} key={animationKey}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="supplier"
              stroke="#666"
              fontSize={11}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="#666"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              label={{ value: "Hours Ago", angle: -90, position: "insideLeft" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="hoursAgo"
              radius={[2, 2, 0, 0]}
              animationDuration={1200}
              animationBegin={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-semibold text-green-800">
              {data?.summary?.freshCount || 0}
            </div>
            <div className="text-green-600">Fresh</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <div className="font-semibold text-yellow-800">
              {data?.summary?.staleCount || 0}
            </div>
            <div className="text-yellow-600">Stale</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-800">
              {data?.summary?.outdatedCount || 0}
            </div>
            <div className="text-red-600">Outdated</div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3 py-1 text-xs bg-gray-100 disabled:opacity-50 rounded flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>
    </ChartWrapper>
  );
};

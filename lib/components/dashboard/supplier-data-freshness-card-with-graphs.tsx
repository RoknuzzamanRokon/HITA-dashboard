/**
 * Enhanced Supplier Data Freshness Card Component
 * Interactive card with three sections that show graphs when clicked
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
  PieChart,
  Pie,
  LineChart,
  Line,
} from "recharts";
import {
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Database,
  Calendar,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
} from "lucide-react";
import {
  fetchSupplierFreshness,
  type SupplierFreshnessData,
  type SupplierFreshnessResponse,
  formatLastUpdated,
} from "@/lib/api/supplier-freshness";

interface SupplierDataFreshnessCardProps {
  loading?: boolean;
}

type FreshnessSection = "fresh" | "stale" | "outdated" | null;
type GraphType = "bar" | "pie" | "line";

const getSectionConfig = (section: FreshnessSection) => {
  switch (section) {
    case "fresh":
      return {
        title: "Fresh Data",
        icon: CheckCircle,
        bgColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-800",
        textColor: "text-green-800 dark:text-green-200",
        iconColor: "text-green-600 dark:text-green-400",
        hoverColor: "",
        chartColor: "#10b981",
      };
    case "stale":
      return {
        title: "Stale Data",
        icon: Clock,
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        borderColor: "border-yellow-200 dark:border-yellow-800",
        textColor: "text-yellow-800 dark:text-yellow-200",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        hoverColor: "",
        chartColor: "#f59e0b",
      };
    case "outdated":
      return {
        title: "Outdated Data",
        icon: AlertTriangle,
        bgColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-800",
        textColor: "text-red-800 dark:text-red-200",
        iconColor: "text-red-600 dark:text-red-400",
        hoverColor: "",
        chartColor: "#ef4444",
      };
    default:
      return {
        title: "",
        icon: Database,
        bgColor: "bg-gray-50 dark:bg-gray-900/20",
        borderColor: "border-gray-200 dark:border-gray-800",
        textColor: "text-gray-800 dark:text-gray-200",
        iconColor: "text-gray-600 dark:text-gray-400",
        hoverColor: "",
        chartColor: "#6b7280",
      };
  }
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          {label}
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Hours Ago: {data.hoursAgo}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Records: {data.recordCount?.toLocaleString() || "N/A"}
          </p>
          {data.errorCount > 0 && (
            <p className="text-red-600 dark:text-red-400">
              Errors: {data.errorCount}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const SupplierDataFreshnessCardWithGraphs: React.FC<
  SupplierDataFreshnessCardProps
> = ({ loading: externalLoading = false }) => {
  const [data, setData] = useState<SupplierFreshnessResponse | null>(null);
  const [internalLoading, setInternalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] =
    useState<FreshnessSection>(null);
  const [graphType, setGraphType] = useState<GraphType>("bar");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setInternalLoading(true);
      setError(null);

      const response = await fetchSupplierFreshness();

      if (response.success && response.data) {
        setData(response.data);
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
  }, []);

  const loading = externalLoading || internalLoading;

  // Filter suppliers by selected section
  const getFilteredSuppliers = (
    section: FreshnessSection
  ): SupplierFreshnessData[] => {
    if (!data || !section) return [];
    return data.suppliers.filter((supplier) => supplier.status === section);
  };

  const filteredSuppliers = getFilteredSuppliers(selectedSection);
  const sectionConfig = getSectionConfig(selectedSection);

  // Prepare chart data
  const chartData = filteredSuppliers.map((supplier) => ({
    supplier: supplier.supplier,
    hoursAgo: supplier.hoursAgo,
    recordCount: supplier.recordCount,
    errorCount: supplier.errorCount || 0,
    lastUpdated: supplier.lastUpdated,
  }));

  // Prepare pie chart data
  const pieData = filteredSuppliers.map((supplier) => ({
    name: supplier.supplier,
    value: supplier.recordCount,
    hoursAgo: supplier.hoursAgo,
    errorCount: supplier.errorCount || 0,
  }));

  const renderChart = () => {
    if (filteredSuppliers.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No {selectedSection} suppliers found</p>
        </div>
      );
    }

    switch (graphType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="supplier"
                stroke="#666"
                fontSize={12}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Hours Ago",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="hoursAgo"
                fill={sectionConfig.chartColor}
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) =>
                  `${name}: ${value.toLocaleString()}`
                }
                outerRadius={80}
                fill={sectionConfig.chartColor}
                dataKey="value"
                animationDuration={1000}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`${sectionConfig.chartColor}${Math.floor(
                      0.5 + (index * 0.5) / pieData.length
                    )
                      .toString(16)
                      .padStart(2, "0")}`}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [value.toLocaleString(), "Records"]}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="supplier"
                stroke="#666"
                fontSize={12}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Hours Ago",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="hoursAgo"
                stroke={sectionConfig.chartColor}
                strokeWidth={3}
                dot={{ fill: sectionConfig.chartColor, strokeWidth: 2, r: 6 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Unable to Load Data
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Supplier Data Freshness
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {lastRefresh
                ? `Last updated ${formatLastUpdated(lastRefresh.toISOString())}`
                : "Click a section to view graph"}
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-gray-500 dark:text-gray-400 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Three Sections */}
      <div className="p-6 space-y-3">
        {(["fresh", "stale", "outdated"] as const).map((section) => {
          const config = getSectionConfig(section);
          const Icon = config.icon;
          const count = data?.summary?.[`${section}Count`] || 0;
          const isSelected = selectedSection === section;

          return (
            <button
              key={section}
              onClick={() => setSelectedSection(isSelected ? null : section)}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? `${config.bgColor} ${config.borderColor}`
                  : `bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-6 h-6 ${
                      isSelected
                        ? config.iconColor
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  />
                  <div className="text-left">
                    <h4
                      className={`font-medium ${
                        isSelected
                          ? config.textColor
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {config.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {count} supplier{count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-2xl font-bold ${
                      isSelected
                        ? config.textColor
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {count}
                  </span>
                  <ChevronRight
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isSelected ? "rotate-90" : ""
                    } ${
                      isSelected
                        ? config.iconColor
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Graph Section */}
      {selectedSection && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {sectionConfig.title} - Data Visualization
              </h4>

              {/* Graph Type Selector */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setGraphType("bar")}
                  className={`p-2 rounded-lg transition-colors ${
                    graphType === "bar"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  title="Bar Chart"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGraphType("pie")}
                  className={`p-2 rounded-lg transition-colors ${
                    graphType === "pie"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  title="Pie Chart"
                >
                  <PieChartIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGraphType("line")}
                  className={`p-2 rounded-lg transition-colors ${
                    graphType === "line"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  title="Line Chart"
                >
                  <TrendingUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chart Container */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              {renderChart()}
            </div>

            {/* Chart Info */}
            {filteredSuppliers.length > 0 && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Showing {filteredSuppliers.length} {selectedSection} supplier
                  {filteredSuppliers.length !== 1 ? "s" : ""} • Total Records:{" "}
                  {filteredSuppliers
                    .reduce((sum, s) => sum + s.recordCount, 0)
                    .toLocaleString()}{" "}
                  • Total Errors:{" "}
                  {filteredSuppliers.reduce(
                    (sum, s) => sum + (s.errorCount || 0),
                    0
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

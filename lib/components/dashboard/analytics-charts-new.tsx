/**
 * New Analytics Charts Components
 * Interactive charts for dashboard analytics with supplier, user, and API metrics
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
import { SupplierChartData } from "@/lib/utils/chart-data-transformers";

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

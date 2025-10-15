/**
 * Real-time Metrics Component
 * Shows live system metrics and activity
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Users,
  TrendingUp,
  Clock,
  Database,
  Wifi,
  WifiOff,
  AlertCircle,
} from "lucide-react";

interface SystemMetrics {
  activeConnections: number;
  requestsPerMinute: number;
  responseTime: number;
  uptime: string;
  memoryUsage: number;
  cpuUsage: number;
}

interface RealTimeMetricsProps {
  isEnabled: boolean;
  lastUpdate?: Date | null;
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({
  isEnabled,
  lastUpdate,
}) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeConnections: 0,
    requestsPerMinute: 0,
    responseTime: 0,
    uptime: "0h 0m",
    memoryUsage: 0,
    cpuUsage: 0,
  });

  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("connecting");

  // Simulate real-time metrics (in a real app, this would come from your API)
  useEffect(() => {
    if (!isEnabled) return;

    const updateMetrics = () => {
      setMetrics((prev) => ({
        activeConnections: Math.max(
          0,
          prev.activeConnections + Math.floor(Math.random() * 6) - 2
        ),
        requestsPerMinute: Math.max(
          0,
          45 + Math.floor(Math.random() * 20) - 10
        ),
        responseTime: Math.max(10, 120 + Math.floor(Math.random() * 100) - 50),
        uptime: calculateUptime(),
        memoryUsage: Math.max(
          0,
          Math.min(100, prev.memoryUsage + Math.floor(Math.random() * 6) - 3)
        ),
        cpuUsage: Math.max(
          0,
          Math.min(100, prev.cpuUsage + Math.floor(Math.random() * 10) - 5)
        ),
      }));
      setConnectionStatus("connected");
    };

    // Initial update
    updateMetrics();

    // Update every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [isEnabled]);

  const calculateUptime = () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 2); // Simulate 2 hours uptime
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-600";
      case "disconnected":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="w-4 h-4 text-green-600" />;
      case "disconnected":
        return <WifiOff className="w-4 h-4 text-red-600" />;
      default:
        return (
          <AlertCircle className="w-4 h-4 text-yellow-600 animate-pulse" />
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">System Metrics</h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span
            className={`text-sm font-medium ${getStatusColor(
              connectionStatus
            )}`}
          >
            {connectionStatus.charAt(0).toUpperCase() +
              connectionStatus.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Active Connections */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Active Connections
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {metrics.activeConnections}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Requests per Minute */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Requests/min</p>
              <p className="text-2xl font-bold text-green-900">
                {metrics.requestsPerMinute}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">
                Response Time
              </p>
              <p className="text-2xl font-bold text-yellow-900">
                {metrics.responseTime}ms
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Uptime</p>
              <p className="text-2xl font-bold text-purple-900">
                {metrics.uptime}
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Memory Usage</p>
              <p className="text-2xl font-bold text-red-900">
                {metrics.memoryUsage}%
              </p>
            </div>
            <Database className="w-8 h-8 text-red-500" />
          </div>
          <div className="mt-2 bg-red-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.memoryUsage}%` }}
            ></div>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">CPU Usage</p>
              <p className="text-2xl font-bold text-indigo-900">
                {metrics.cpuUsage}%
              </p>
            </div>
            <Activity className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="mt-2 bg-indigo-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.cpuUsage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {lastUpdate && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Last updated: {lastUpdate.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

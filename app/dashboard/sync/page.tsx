"use client";

/**
 * Sync History Page
 *
 * Beautiful interface for monitoring and managing content synchronization
 * Features:
 * - Real-time sync status monitoring
 * - Sync history timeline
 * - Manual sync triggers
 * - Sync statistics and metrics
 */

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { PermissionGuard } from "@/lib/components/auth/permission-guard";
import { Permission } from "@/lib/utils/rbac";
import { RealTimeTimestamp } from "@/lib/components/ui/real-time-timestamp";
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  TrendingUp,
  AlertTriangle,
  Play,
  Settings,
  Filter,
  Download,
} from "lucide-react";

interface SyncJob {
  id: string;
  type: "hotel" | "mapping" | "content" | "full";
  status: "running" | "completed" | "failed" | "pending";
  startedAt: string;
  completedAt?: string;
  duration?: number;
  itemsProcessed?: number;
  itemsTotal?: number;
  error?: string;
  progress?: number;
}

interface SyncStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageDuration: number;
  lastSyncTime: string;
  itemsSyncedToday: number;
}

export default function SyncPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    averageDuration: 0,
    lastSyncTime: "",
    itemsSyncedToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "running" | "completed" | "failed"
  >("all");

  // Mock data for demonstration
  useEffect(() => {
    const loadSyncData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSyncJobs([
        {
          id: "1",
          type: "full",
          status: "running",
          startedAt: new Date(Date.now() - 5 * 60000).toISOString(),
          itemsProcessed: 1250,
          itemsTotal: 5000,
          progress: 25,
        },
        {
          id: "2",
          type: "hotel",
          status: "completed",
          startedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
          completedAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
          duration: 1800,
          itemsProcessed: 500,
          itemsTotal: 500,
          progress: 100,
        },
        {
          id: "3",
          type: "mapping",
          status: "completed",
          startedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
          completedAt: new Date(Date.now() - 4.5 * 3600000).toISOString(),
          duration: 1800,
          itemsProcessed: 1200,
          itemsTotal: 1200,
          progress: 100,
        },
        {
          id: "4",
          type: "content",
          status: "failed",
          startedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
          error: "Connection timeout",
          itemsProcessed: 150,
          itemsTotal: 1000,
          progress: 15,
        },
      ]);

      setSyncStats({
        totalSyncs: 124,
        successfulSyncs: 118,
        failedSyncs: 6,
        averageDuration: 1850,
        lastSyncTime: new Date(Date.now() - 2 * 3600000).toISOString(),
        itemsSyncedToday: 2950,
      });

      setIsLoading(false);
    };

    if (isAuthenticated) {
      loadSyncData();
    }
  }, [isAuthenticated]);

  const handleStartSync = async (type: SyncJob["type"]) => {
    setIsSyncing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newJob: SyncJob = {
      id: Date.now().toString(),
      type,
      status: "running",
      startedAt: new Date().toISOString(),
      itemsProcessed: 0,
      itemsTotal: 0,
      progress: 0,
    };

    setSyncJobs((prev) => [newJob, ...prev]);
    setIsSyncing(false);
  };

  const filteredJobs = syncJobs.filter((job) => {
    if (selectedFilter === "all") return true;
    return job.status === selectedFilter;
  });

  const getStatusIcon = (status: SyncJob["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "running":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: SyncJob["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "running":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission={Permission.VIEW_SYSTEM_SETTINGS}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                Sync History
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor and manage content synchronization operations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleStartSync("full")}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4" />
                {isSyncing ? "Starting..." : "Start Full Sync"}
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total Syncs</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {syncStats.totalSyncs}
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>+12% from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Success Rate</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {Math.round(
                (syncStats.successfulSyncs / syncStats.totalSyncs) * 100,
              )}
              %
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <span>{syncStats.successfulSyncs} successful</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Avg Duration</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatDuration(syncStats.averageDuration)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <span>
                Last sync:{" "}
                <RealTimeTimestamp
                  dateString={syncStats.lastSyncTime}
                  updateInterval={30000}
                />
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Items Today</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {syncStats.itemsSyncedToday.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <span>Synced in last 24h</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Sync Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { type: "hotel" as const, label: "Sync Hotels", icon: Database },
              {
                type: "mapping" as const,
                label: "Sync Mappings",
                icon: RefreshCw,
              },
              {
                type: "content" as const,
                label: "Sync Content",
                icon: Activity,
              },
              { type: "full" as const, label: "Full Sync", icon: Play },
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => handleStartSync(type)}
                disabled={isSyncing}
                className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Sync Jobs List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Sync History
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                {(["all", "running", "completed", "failed"] as const).map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        selectedFilter === filter
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ),
                )}
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Sync Jobs List */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No sync jobs found</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(job.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                          {job.type} Sync
                        </h3>
                        <p className="text-sm text-gray-500">
                          Started{" "}
                          <RealTimeTimestamp
                            dateString={job.startedAt}
                            updateInterval={30000}
                          />
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        job.status,
                      )}`}
                    >
                      {job.status}
                    </span>
                  </div>

                  {job.status === "running" && job.progress !== undefined && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>
                          {job.itemsProcessed?.toLocaleString()} /{" "}
                          {job.itemsTotal?.toLocaleString()} items
                        </span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 font-medium text-gray-900 capitalize">
                        {job.type}
                      </span>
                    </div>
                    {job.duration && (
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {formatDuration(job.duration)}
                        </span>
                      </div>
                    )}
                    {job.itemsProcessed !== undefined && (
                      <div>
                        <span className="text-gray-500">Items:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {job.itemsProcessed.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {job.completedAt && (
                      <div>
                        <span className="text-gray-500">Completed:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          <RealTimeTimestamp
                            dateString={job.completedAt}
                            updateInterval={30000}
                          />
                        </span>
                      </div>
                    )}
                  </div>

                  {job.error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Error:</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">{job.error}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}

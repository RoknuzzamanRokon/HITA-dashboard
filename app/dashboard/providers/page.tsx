/**
 * Provider Selection and Overview Page
 * Displays available providers with statistics and sync status
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronRight,
  BarChart3,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { ProvidersApi } from "@/lib/api/providers";
import { useAuth } from "@/lib/contexts/auth-context";
import type { Provider, ProviderStats } from "@/lib/types/provider";

export default function ProvidersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    setError(null);

    try {
      const [providersResponse, statsResponse] = await Promise.all([
        ProvidersApi.getProviders(),
        ProvidersApi.getProviderStats(),
      ]);

      if (providersResponse.success && providersResponse.data) {
        setProviders(providersResponse.data);
      } else {
        setError(
          providersResponse.error?.message || "Failed to load providers"
        );
      }

      if (statsResponse.success && statsResponse.data) {
        setProviderStats(statsResponse.data);
      }
    } catch (err) {
      setError("Failed to load provider data");
      console.error("Error loading providers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = (providerName: string) => {
    router.push(`/dashboard/providers/${encodeURIComponent(providerName)}`);
  };

  const handleRefreshProvider = async (providerName: string) => {
    setRefreshing(providerName);

    try {
      const response = await ProvidersApi.triggerProviderSync(providerName);

      if (response.success) {
        // Refresh the stats after triggering sync
        setTimeout(() => {
          loadProviders();
        }, 1000);
      } else {
        setError(response.error?.message || "Failed to refresh provider");
      }
    } catch (err) {
      setError("Failed to refresh provider");
      console.error("Error refreshing provider:", err);
    } finally {
      setRefreshing(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "in_progress":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 text-green-700 border-green-200";
      case "error":
        return "bg-red-50 text-red-700 border-red-200";
      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Provider Content Management
          </h1>
          <p className="text-gray-600">Manage provider content and mappings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Provider Content Management
          </h1>
          <p className="text-gray-600">Manage provider content and mappings</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={loadProviders}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Provider Content Management
        </h1>
        <p className="text-gray-600">Manage provider content and mappings</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Total Providers
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {providers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Hotels</p>
              <p className="text-2xl font-bold text-gray-900">
                {providerStats
                  .reduce((sum, stat) => sum + stat.totalHotels, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Mapped Hotels</p>
              <p className="text-2xl font-bold text-gray-900">
                {providerStats
                  .reduce((sum, stat) => sum + stat.mappedHotels, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Syncs</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  providerStats.filter(
                    (stat) => stat.syncStatus === "in_progress"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => {
          const stats = providerStats.find(
            (stat) => stat.name === provider.name
          );
          const isRefreshing = refreshing === provider.name;

          return (
            <div
              key={provider.name}
              className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
              onClick={() => handleProviderSelect(provider.name)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Database className="h-8 w-8 text-blue-500" />
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {provider.description || "Content Provider"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                {stats && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Hotels</p>
                        <p className="text-xl font-bold text-gray-900">
                          {stats.totalHotels.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Mapped</p>
                        <p className="text-xl font-bold text-green-600">
                          {stats.mappedHotels.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Mapping Progress</span>
                        <span className="text-gray-900">
                          {Math.round(
                            (stats.mappedHotels / stats.totalHotels) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (stats.mappedHotels / stats.totalHotels) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div
                        className={`flex items-center px-2 py-1 rounded-full text-xs border ${getStatusColor(
                          stats.syncStatus
                        )}`}
                      >
                        {getStatusIcon(stats.syncStatus)}
                        <span className="ml-1 capitalize">
                          {stats.syncStatus.replace("_", " ")}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRefreshProvider(provider.name);
                        }}
                        disabled={isRefreshing}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                        title="Refresh provider data"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${
                            isRefreshing ? "animate-spin" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {stats.lastSyncDate && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          Last sync: {formatDate(stats.lastSyncDate)}
                        </div>
                        {stats.errorCount && stats.errorCount > 0 && (
                          <div className="flex items-center text-xs text-red-500 mt-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {stats.errorCount} errors
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {providers.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Providers Available
          </h3>
          <p className="text-gray-600">
            No content providers are currently configured or accessible.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Provider Selection and Overview Page (Root Route)
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
    router.push(`/providers/${encodeURIComponent(providerName)}`);
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
    <div className="max-w-4xl mx-auto">
      {/* Header - styled like Profile page */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
              <Database className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                Provider Content Management
              </h1>
              <p className="text-blue-100 mb-3">Manage provider content and mappings</p>
              <div className="flex items-center space-x-3">
                <div className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
                  Total Providers: {providers.length}
                </div>
                <div className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                  Total Hotels: {providerStats.reduce((s, st) => s + st.totalHotels, 0).toLocaleString()}
                </div>
                <div className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Active Syncs: {providerStats.filter((st) => st.syncStatus === 'in_progress').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout - left content, right sidebar (like Profile page) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Providers list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-500" />
                Providers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {providers.map((provider) => {
                const stats = providerStats.find((stat) => stat.name === provider.name);
                const isRefreshing = refreshing === provider.name;

                return (
                  <div
                    key={provider.name}
                    className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                    onClick={() => handleProviderSelect(provider.name)}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                          <p className="text-sm text-gray-600">
                            {provider.description || 'Content Provider'}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>

                      {stats && (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">Total Hotels</p>
                              <p className="text-base font-semibold text-gray-900">
                                {stats.totalHotels.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">Mapped</p>
                              <p className="text-base font-semibold text-gray-900">
                                {stats.mappedHotels.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">Unmapped</p>
                              <p className="text-base font-semibold text-gray-900">
                                {stats.unmappedHotels.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">Last Sync</p>
                              <p className="text-base font-semibold text-gray-900">
                                {stats.lastSyncDate ? formatDate(stats.lastSyncDate) : 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-xs text-gray-500 mb-1">Mapping Progress</p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min((stats.mappedHotels / stats.totalHotels) * 100, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(stats.syncStatus)}`}>
                              {getStatusIcon(stats.syncStatus)}
                              <span className="ml-1 font-medium">
                                {stats.syncStatus === 'success'
                                  ? 'Synced'
                                  : stats.syncStatus === 'error'
                                  ? 'Failed'
                                  : stats.syncStatus === 'in_progress'
                                  ? 'Syncing'
                                  : 'Pending'}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRefreshProvider(provider.name);
                              }}
                              disabled={isRefreshing || stats.syncStatus === 'in_progress'}
                              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                            >
                              <RefreshCw className={`h-4 w-4 text-gray-500 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
                            </button>
                          </div>

                          {stats.lastSyncDate && (
                            <div className="mt-3 flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              Last updated: {formatDate(stats.lastSyncDate)}
                            </div>
                          )}
                          {stats.errorCount && stats.errorCount > 0 && (
                            <div className="flex items-center text-xs text-red-500 mt-1">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {stats.errorCount} errors
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Providers Available</h3>
                <p className="text-gray-600">No content providers are currently configured or accessible.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Overview
            </h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Total Providers</p>
                <p className="text-3xl font-bold text-blue-600">{providers.length}</p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Hotels</p>
                <p className="text-xl font-semibold text-gray-700">
                  {providerStats.reduce((sum, stat) => sum + stat.totalHotels, 0).toLocaleString()}
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                  Active Syncs: {providerStats.filter((st) => st.syncStatus === 'in_progress').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

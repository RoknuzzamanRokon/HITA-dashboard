/**
 * Cache Status Component
 * Shows cache information for debugging and monitoring
 */

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { getCacheStatus, clearAllCaches } from "@/lib/utils/service-worker";
import { getCacheStatus as getLocalCacheStatus } from "@/lib/hooks/use-cache-initialization";
import { Button } from "./button";
import { Card } from "./card";

interface CacheStatusProps {
  showInProduction?: boolean;
}

export function CacheStatus({ showInProduction = false }: CacheStatusProps) {
  const { user } = useAuth();
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<any>(null);
  const [localCacheStatus, setLocalCacheStatus] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Only show in development or if explicitly enabled
  const shouldShow = process.env.NODE_ENV === "development" || showInProduction;

  useEffect(() => {
    if (!shouldShow || !user) return;

    const updateStatus = async () => {
      try {
        const [swStatus, localStatus] = await Promise.all([
          getCacheStatus(),
          getLocalCacheStatus(user.id),
        ]);

        setServiceWorkerStatus(swStatus);
        setLocalCacheStatus(localStatus);
      } catch (error) {
        console.error("Failed to get cache status:", error);
      }
    };

    updateStatus();

    // Update every 30 seconds
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, [shouldShow, user]);

  const handleClearCaches = async () => {
    setIsLoading(true);
    try {
      await clearAllCaches();

      // Refresh status after clearing
      setTimeout(async () => {
        const [swStatus, localStatus] = await Promise.all([
          getCacheStatus(),
          user ? getLocalCacheStatus(user.id) : null,
        ]);

        setServiceWorkerStatus(swStatus);
        setLocalCacheStatus(localStatus);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to clear caches:", error);
      setIsLoading(false);
    }
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        size="sm"
        variant="outline"
        className="mb-2 bg-white dark:bg-gray-800 shadow-lg"
      >
        {isVisible ? "📊 Hide Cache" : "📊 Cache"}
      </Button>

      {/* Cache Status Panel */}
      {isVisible && (
        <Card className="w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 shadow-xl border">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Cache Status
              </h3>
              <Button
                onClick={handleClearCaches}
                size="sm"
                variant="danger"
                disabled={isLoading}
              >
                {isLoading ? "Clearing..." : "Clear All"}
              </Button>
            </div>

            {/* User Info */}
            {user && (
              <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  User: {user.username}
                </div>
                <div className="text-blue-700 dark:text-blue-300">
                  ID: {user.id}
                </div>
              </div>
            )}

            {/* Service Worker Cache Status */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Worker Caches
              </h4>
              {serviceWorkerStatus ? (
                <div className="space-y-1">
                  {Object.entries(serviceWorkerStatus).map(
                    ([cacheName, count]) => (
                      <div
                        key={cacheName}
                        className="flex justify-between text-xs"
                      >
                        <span className="text-gray-600 dark:text-gray-400">
                          {cacheName}:
                        </span>
                        <span className="font-mono text-gray-900 dark:text-gray-100">
                          {String(count)} items
                        </span>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  No service worker caches
                </div>
              )}
            </div>

            {/* Local Storage Cache Status */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Local Storage Caches
              </h4>
              {localCacheStatus ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Dashboard:
                    </span>
                    <span
                      className={`font-mono ${
                        localCacheStatus.dashboard.exists
                          ? localCacheStatus.dashboard.isStale
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {localCacheStatus.dashboard.exists
                        ? localCacheStatus.dashboard.isStale
                          ? "Stale"
                          : "Fresh"
                        : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Users:
                    </span>
                    <span
                      className={`font-mono ${
                        localCacheStatus.users.exists
                          ? localCacheStatus.users.isStale
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {localCacheStatus.users.exists
                        ? localCacheStatus.users.isStale
                          ? "Stale"
                          : "Fresh"
                        : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Analytics:
                    </span>
                    <span
                      className={`font-mono ${
                        localCacheStatus.analytics?.exists
                          ? localCacheStatus.analytics.isStale
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {localCacheStatus.analytics?.exists
                        ? localCacheStatus.analytics.isStale
                          ? "Stale"
                          : "Fresh"
                        : "None"}
                    </span>
                  </div>

                  {/* Cache Ages */}
                  {localCacheStatus.dashboard.age && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Dashboard age:{" "}
                      {Math.round(localCacheStatus.dashboard.age / 1000)}s
                    </div>
                  )}
                  {localCacheStatus.users.age && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Users age: {Math.round(localCacheStatus.users.age / 1000)}
                      s
                    </div>
                  )}
                  {localCacheStatus.analytics?.age && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Analytics age:{" "}
                      {Math.round(localCacheStatus.analytics.age / 1000)}s
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  No local caches
                </div>
              )}
            </div>

            {/* Cache Legend */}
            <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Fresh (≤10min)</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                <span>Stale (&gt;10min)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>None</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

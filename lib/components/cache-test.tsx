/**
 * Cache Test Component
 * Simple component to test if caching is working
 */

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useCachedUsers } from "@/lib/hooks/use-cached-users";
import { useCachedDashboard } from "@/lib/hooks/use-cached-dashboard";

export function CacheTest() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any>({});

  // Test cached users
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    isUsingCachedData: usersUsingCache,
    cacheAge: usersCacheAge,
  } = useCachedUsers();

  // Test cached dashboard
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    isUsingCachedData: dashboardUsingCache,
    cacheAge: dashboardCacheAge,
  } = useCachedDashboard();

  useEffect(() => {
    setTestResults({
      user: user ? { id: user.id, username: user.username } : null,
      users: {
        data: usersData ? `${usersData.length} users` : "No data",
        loading: usersLoading,
        error: usersError?.message || null,
        usingCache: usersUsingCache,
        cacheAge: usersCacheAge ? Math.round(usersCacheAge / 1000) + "s" : null,
      },
      dashboard: {
        data: dashboardData ? "Has data" : "No data",
        loading: dashboardLoading,
        error: dashboardError?.message || null,
        usingCache: dashboardUsingCache,
        cacheAge: dashboardCacheAge
          ? Math.round(dashboardCacheAge / 1000) + "s"
          : null,
      },
    });
  }, [
    user,
    usersData,
    usersLoading,
    usersError,
    usersUsingCache,
    usersCacheAge,
    dashboardData,
    dashboardLoading,
    dashboardError,
    dashboardUsingCache,
    dashboardCacheAge,
  ]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-lg max-w-md">
      <h3 className="text-sm font-bold mb-2">Cache Test Results</h3>
      <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-64">
        {JSON.stringify(testResults, null, 2)}
      </pre>
    </div>
  );
}

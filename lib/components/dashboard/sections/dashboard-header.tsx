/**
 * Dashboard Header Section
 * Contains title, status indicators, and action buttons
 */

"use client";

import React from "react";
import { Activity, RefreshCw, Shield } from "lucide-react";
import { PermissionGuard } from "@/lib/components/auth/permission-guard";
import { Permission } from "@/lib/utils/rbac";
import { CompactApiStatusIndicator } from "@/lib/components/ui/api-status-indicator";

interface DashboardHeaderProps {
  realTimeEnabled: boolean;
  onToggleRealTime?: () => void;
  onRefresh: () => void;
  onTestAPI: () => void;
  onCheckToken: () => void;
  isLoading: boolean;
  isTestingAPI: boolean;
  lastFetch: Date | null;
  canToggleRealtime?: boolean;
  userRole?: string;
  apiStatus?: "checking" | "connected" | "fallback" | "error";
  isUsingFallback?: boolean;
}

export function DashboardHeader({
  realTimeEnabled,
  onToggleRealTime,
  onRefresh,
  onTestAPI,
  onCheckToken,
  isLoading,
  isTestingAPI,
  lastFetch,
  canToggleRealtime = false,
  userRole,
  apiStatus = "checking",
  isUsingFallback = false,
}: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
            Real-Time Dashboard
          </h1>
          <div className="mt-1 flex items-center space-x-4">
            <PermissionGuard
              permissions={[
                Permission.VIEW_ALL_USERS,
                Permission.MANAGE_SYSTEM_SETTINGS,
              ]}
              fallback={
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  Welcome to your Dashboard
                </p>
              }
            >
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                Welcome to the Admin Management Panel
              </p>
            </PermissionGuard>
            {lastFetch && (
              <div className="flex items-center space-x-2 text-xs text-[rgb(var(--text-tertiary))]">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isLoading
                      ? "bg-blue-500 dark:bg-blue-400 animate-pulse"
                      : realTimeEnabled
                        ? "bg-green-500 dark:bg-green-400"
                        : "bg-gray-400 dark:bg-gray-600"
                  }`}
                ></div>
                <span>
                  {isLoading
                    ? "Loading..."
                    : `Last updated: ${lastFetch.toLocaleTimeString()}`}
                </span>
                <CompactApiStatusIndicator
                  status={apiStatus}
                  isUsingFallback={isUsingFallback}
                  className="ml-2"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {canToggleRealtime && onToggleRealTime && (
            <button
              onClick={onToggleRealTime}
              title={
                realTimeEnabled
                  ? `Disable automatic updates (${userRole === "super_user" ? "1 min" : "5 min"} interval)`
                  : `Enable automatic updates (${userRole === "super_user" ? "1 min" : "5 min"} interval)`
              }
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                realTimeEnabled
                  ? "bg-green-600 dark:bg-green-500 text-white"
                  : "bg-gray-600 dark:bg-gray-700 text-white"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>
                {realTimeEnabled ? "Auto-refresh ON" : "Auto-refresh OFF"}
              </span>
            </button>
          )}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Manually refresh dashboard data"
            className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md disabled:opacity-50 flex items-center space-x-2 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
          <PermissionGuard
            permissions={[
              Permission.MANAGE_SYSTEM_SETTINGS,
              Permission.VIEW_ANALYTICS,
            ]}
          >
            <button
              onClick={onTestAPI}
              disabled={isTestingAPI}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md disabled:opacity-50 flex items-center space-x-2 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${isTestingAPI ? "animate-spin" : ""}`}
              />
              <span>Test API</span>
            </button>
            <button
              onClick={onCheckToken}
              className="px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-md flex items-center space-x-2 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Check Token</span>
            </button>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
}

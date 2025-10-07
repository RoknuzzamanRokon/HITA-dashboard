/**
 * Dashboard page - protected route
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { apiClient } from "@/lib/api/client";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { user } = useAuth();
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

  // Check API connection on mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await apiClient.healthCheck();
        setApiStatus(response.success ? "connected" : "disconnected");
      } catch (error) {
        setApiStatus("disconnected");
      }
    };

    if (isAuthenticated) {
      checkApiConnection();
    }
  }, [isAuthenticated]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to the Admin Management Panel
        </p>
      </div>

      {/* API Status Indicator */}
      <div className="mb-6">
        <div
          className={`p-4 rounded-md ${
            apiStatus === "connected"
              ? "bg-green-50 border border-green-200"
              : apiStatus === "disconnected"
              ? "bg-red-50 border border-red-200"
              : "bg-yellow-50 border border-yellow-200"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${
                apiStatus === "connected"
                  ? "bg-green-500"
                  : apiStatus === "disconnected"
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
            ></div>
            <span
              className={`text-sm font-medium ${
                apiStatus === "connected"
                  ? "text-green-800"
                  : apiStatus === "disconnected"
                  ? "text-red-800"
                  : "text-yellow-800"
              }`}
            >
              API Status:{" "}
              {apiStatus === "connected"
                ? "Connected"
                : apiStatus === "disconnected"
                ? "Disconnected - Backend server may not be running"
                : "Checking connection..."}
            </span>
          </div>
        </div>
      </div>

      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Welcome to the Admin Management Panel
          </h2>
          <p className="text-gray-600 mb-6">
            You have successfully logged in. The authentication system is
            working correctly.
          </p>

          {user && (
            <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                User Information
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Username:</dt>
                  <dd className="text-gray-900">{user.username}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email:</dt>
                  <dd className="text-gray-900">{user.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Role:</dt>
                  <dd className="text-gray-900">{user.role}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Status:</dt>
                  <dd className="text-gray-900">
                    {user.isActive ? "Active" : "Inactive"}
                  </dd>
                </div>
                {user.pointBalance !== undefined && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Points:</dt>
                    <dd className="text-gray-900">{user.pointBalance}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

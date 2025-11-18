"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Activity,
  Coins,
  RefreshCw,
} from "lucide-react";
import { TokenStorage } from "@/lib/auth/token-storage";

interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: string;
  api_key_info: {
    api_key: string;
    created: string;
    expires: string;
    active_for_days: number;
  } | null;
  points: {
    total_points: number;
    current_points: number;
    total_used_points: number;
    paid_status: string;
    total_rq: number;
  };
  active_suppliers: string[];
  total_suppliers: number;
  created_at: string;
  updated_at: string;
  user_status: string;
  is_active: boolean;
  using_rq_status: string;
  created_by: string;
  viewed_by?: {
    user_id: string;
    username: string;
    email: string;
    role: string;
  };
}

export function UserInfoSection() {
  const [userId, setUserId] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = async () => {
    if (!userId.trim()) {
      setError("Please enter a user ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the token using TokenStorage utility
      const token = TokenStorage.getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      console.log("Fetching user info for ID:", userId.trim());
      console.log("Token exists:", !!token);

      const response = await fetch(
        `http://127.0.0.1:8001/v1.0/user/check-user-info/${userId.trim()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error(`Failed to fetch user info: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("User info received:", data);
      setUserInfo(data);
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch user info"
      );
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchUserInfo();
    }
  };

  return (
    <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md p-6 border border-[rgb(var(--border-primary))]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] flex items-center">
          <User className="w-5 h-5 mr-2 text-primary-color" />
          User Information
        </h2>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
          Search User by ID
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter User ID (e.g., 5779356081)"
            className="flex-1 px-4 py-2 border border-[rgb(var(--border-primary))] rounded-md bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-primary-color focus:border-transparent"
          />
          <button
            onClick={fetchUserInfo}
            disabled={loading || !userId.trim()}
            className="px-6 py-2 bg-primary-color text-white rounded-md hover:bg-primary-hover disabled:opacity-50 flex items-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Search</span>
          </button>
        </div>
        <p className="mt-2 text-xs text-[rgb(var(--text-tertiary))]">
          Press Enter or click Search to fetch user information
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* User Info Display */}
      {userInfo && (
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-[rgb(var(--text-tertiary))] mt-0.5" />
              <div>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  Username
                </p>
                <p className="text-base font-medium text-[rgb(var(--text-primary))]">
                  {userInfo.username}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-[rgb(var(--text-tertiary))] mt-0.5" />
              <div>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  Email
                </p>
                <p className="text-base font-medium text-[rgb(var(--text-primary))]">
                  {userInfo.email}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-[rgb(var(--text-tertiary))] mt-0.5" />
              <div>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  Role
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 border-primary-color text-primary-color bg-transparent">
                  {userInfo.role}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Activity className="w-5 h-5 text-[rgb(var(--text-tertiary))] mt-0.5" />
              <div>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  Status
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 bg-transparent ${
                    userInfo.is_active
                      ? "border-green-600 dark:border-green-400 text-green-600 dark:text-green-400"
                      : "border-red-600 dark:border-red-400 text-red-600 dark:text-red-400"
                  }`}
                >
                  {userInfo.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* API Key Info */}
          {userInfo.api_key_info && (
            <div className="border-t border-[rgb(var(--border-primary))] pt-4">
              <h3 className="text-lg font-medium text-[rgb(var(--text-primary))] mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                API Key Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[rgb(var(--bg-secondary))] p-4 rounded-lg border border-[rgb(var(--border-primary))]">
                  <p className="text-sm text-[rgb(var(--text-secondary))] mb-1">
                    API Key
                  </p>
                  <p className="text-sm font-mono text-[rgb(var(--text-primary))] break-all">
                    {userInfo.api_key_info.api_key}
                  </p>
                </div>
                <div className="bg-[rgb(var(--bg-secondary))] p-4 rounded-lg border border-[rgb(var(--border-primary))]">
                  <p className="text-sm text-[rgb(var(--text-secondary))] mb-1">
                    Expires
                  </p>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                    {new Date(userInfo.api_key_info.expires).toLocaleString()}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Active for {userInfo.api_key_info.active_for_days} days
                  </p>
                </div>
                <div className="bg-[rgb(var(--bg-secondary))] p-4 rounded-lg border border-[rgb(var(--border-primary))]">
                  <p className="text-sm text-[rgb(var(--text-secondary))] mb-1">
                    Created
                  </p>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                    {new Date(userInfo.api_key_info.created).toLocaleString()}
                  </p>
                </div>
                <div className="bg-[rgb(var(--bg-secondary))] p-4 rounded-lg border border-[rgb(var(--border-primary))]">
                  <p className="text-sm text-[rgb(var(--text-secondary))] mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 bg-transparent ${
                      userInfo.api_key_info.active_for_days > 0
                        ? "border-green-600 dark:border-green-400 text-green-600 dark:text-green-400"
                        : "border-red-600 dark:border-red-400 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {userInfo.api_key_info.active_for_days > 0
                      ? "Active"
                      : "Expired"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Points Info */}
          <div className="border-t border-[rgb(var(--border-primary))] pt-4">
            <h3 className="text-lg font-medium text-[rgb(var(--text-primary))] mb-4 flex items-center">
              <Coins className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
              Points Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[rgb(var(--bg-secondary))] p-4 rounded-lg border border-[rgb(var(--border-primary))]">
                <p className="text-sm text-primary-color mb-1">Total Points</p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                  {userInfo.points.total_points.toLocaleString()}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] p-4 rounded-lg border border-[rgb(var(--border-primary))]">
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                  Current Points
                </p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                  {userInfo.points.current_points.toLocaleString()}
                </p>
              </div>
              <div className="bg-[rgb(var(--bg-secondary))] p-4 rounded-lg border border-[rgb(var(--border-primary))]">
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">
                  Used Points
                </p>
                <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                  {userInfo.points.total_used_points.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-[rgb(var(--text-secondary))]">
                  Payment Status:{" "}
                  <span className="font-medium text-[rgb(var(--text-primary))]">
                    {userInfo.points.paid_status}
                  </span>
                </span>
                <span className="text-sm text-[rgb(var(--text-secondary))]">
                  Total Requests:{" "}
                  <span className="font-medium text-[rgb(var(--text-primary))]">
                    {userInfo.points.total_rq}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Suppliers Info */}
          <div className="border-t border-[rgb(var(--border-primary))] pt-4">
            <h3 className="text-lg font-medium text-[rgb(var(--text-primary))] mb-3">
              Active Suppliers ({userInfo.total_suppliers})
            </h3>
            <div className="flex flex-wrap gap-2">
              {userInfo.active_suppliers.map((supplier) => (
                <span
                  key={supplier}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 border-primary-color text-primary-color bg-transparent hover:bg-primary-light transition-colors duration-200"
                >
                  {supplier}
                </span>
              ))}
            </div>
          </div>

          {/* Timestamps and Metadata */}
          <div className="border-t border-[rgb(var(--border-primary))] pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
                <span className="text-[rgb(var(--text-secondary))]">
                  Created:
                </span>
                <span className="text-[rgb(var(--text-primary))]">
                  {new Date(userInfo.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
                <span className="text-[rgb(var(--text-secondary))]">
                  Updated:
                </span>
                <span className="text-[rgb(var(--text-primary))]">
                  {new Date(userInfo.updated_at).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
                <span className="text-[rgb(var(--text-secondary))]">
                  Created By:
                </span>
                <span className="text-[rgb(var(--text-primary))] text-xs">
                  {userInfo.created_by}
                </span>
              </div>
              {userInfo.viewed_by && (
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
                  <span className="text-[rgb(var(--text-secondary))]">
                    Viewed By:
                  </span>
                  <span className="text-[rgb(var(--text-primary))] text-xs">
                    {userInfo.viewed_by.username} ({userInfo.viewed_by.role})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color mb-4"></div>
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            Fetching user information...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !userInfo && !error && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <User className="w-16 h-16 text-[rgb(var(--text-tertiary))] mb-4" />
          <h3 className="text-lg font-medium text-[rgb(var(--text-primary))] mb-2">
            No User Selected
          </h3>
          <p className="text-sm text-[rgb(var(--text-secondary))] max-w-md">
            Enter a user ID in the search box above to view their information,
            points, and active suppliers.
          </p>
        </div>
      )}
    </div>
  );
}

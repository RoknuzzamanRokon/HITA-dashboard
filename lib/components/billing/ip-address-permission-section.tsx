"use client";

import React, { useState } from "react";
import {
  Globe,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  List,
  Loader2,
} from "lucide-react";
import { TokenStorage } from "@/lib/auth/token-storage";

interface IpEntry {
  id: number;
  ip_address: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  user: {
    id: string;
    username: string;
    email: string;
  };
  ip_whitelist: {
    total_entries: number;
    entries: IpEntry[];
  };
  managed_by: {
    id: string;
    username: string;
  };
}

type TabType = "list" | "activate" | "deactivate";

export function IpAddressPermissionSection() {
  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [userId, setUserId] = useState("");
  const [ipList, setIpList] = useState<IpEntry[]>([]);
  const [userInfo, setUserInfo] = useState<ApiResponse["user"] | null>(null);
  const [managedBy, setManagedBy] = useState<ApiResponse["managed_by"] | null>(
    null,
  );
  const [newIp, setNewIp] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingIp, setRemovingIp] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleShowList = async () => {
    if (!userId.trim()) {
      setError("Please enter a user ID");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = TokenStorage.getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";
      const response = await fetch(
        `${apiBaseUrl}/v1.0/permissions/ip/list/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.detail || "Failed to fetch IP list",
        );
      }

      const data: ApiResponse = await response.json();

      // Extract IP entries from the response
      const entries = data.ip_whitelist?.entries || [];
      setIpList(entries);
      setUserInfo(data.user);
      setManagedBy(data.managed_by);

      setSuccess(
        `Found ${entries.length} active IP address${entries.length !== 1 ? "es" : ""} for ${data.user?.username || "user"}`,
      );
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error fetching IP list:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch IP list");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateIp = async () => {
    if (!userId.trim()) {
      setError("Please enter a user ID");
      return;
    }

    if (!newIp.trim()) {
      setError("Please enter an IP address");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = TokenStorage.getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        "http://127.0.0.1:8001/v1.0/permissions/ip/active-permission",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: userId,
            ip: [newIp],
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            errorData.detail ||
            "Failed to activate IP address",
        );
      }

      const result = await response.json();
      console.log("Activate IP response:", result);
      setSuccess(`Successfully activated IP address: ${newIp}`);
      setNewIp("");

      // Refresh the IP list if we're on the list tab
      if (activeTab === "list") {
        setTimeout(() => {
          handleShowList();
        }, 1000);
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error activating IP:", err);
      setError(
        err instanceof Error ? err.message : "Failed to activate IP address",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateIp = async () => {
    if (!userId.trim()) {
      setError("Please enter a user ID");
      return;
    }

    if (!newIp.trim()) {
      setError("Please enter an IP address");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = TokenStorage.getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";
      const response = await fetch(`${apiBaseUrl}/v1.0/permissions/ip/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          ip_addresses: [newIp],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            errorData.detail ||
            "Failed to deactivate IP address",
        );
      }

      const result = await response.json();
      console.log("Remove IP response:", result);

      // Update success message based on response
      const removedCount = result.removed_ips?.length || 1;
      const targetUser = result.target_user?.username || "user";
      setSuccess(
        `Successfully removed ${removedCount} IP address(es) from ${targetUser}'s whitelist`,
      );
      setNewIp("");

      // Refresh the IP list if we're on the list tab
      if (activeTab === "list") {
        setTimeout(() => {
          handleShowList();
        }, 1000);
      }

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error deactivating IP:", err);
      setError(
        err instanceof Error ? err.message : "Failed to deactivate IP address",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveIpFromList = async (ipAddress: string) => {
    if (!userId.trim()) {
      setError("User ID is required");
      return;
    }

    setRemovingIp(ipAddress);
    setError(null);
    setSuccess(null);

    try {
      const token = TokenStorage.getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";
      const response = await fetch(`${apiBaseUrl}/v1.0/permissions/ip/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          ip_addresses: [ipAddress],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            errorData.detail ||
            "Failed to remove IP address",
        );
      }

      const result = await response.json();
      console.log("Remove IP from list response:", result);

      // Update success message based on response
      const removedCount = result.removed_ips?.length || 1;
      const targetUser = result.target_user?.username || "user";
      setSuccess(
        `Successfully removed ${removedCount} IP address(es) from ${targetUser}'s whitelist`,
      );

      // Remove the IP from local state immediately for better UX
      setIpList((prev) =>
        prev.filter((entry) => entry.ip_address !== ipAddress),
      );

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error removing IP from list:", err);
      setError(
        err instanceof Error ? err.message : "Failed to remove IP address",
      );
    } finally {
      setRemovingIp(null);
    }
  };

  return (
    <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md p-6 border border-[rgb(var(--border-primary))] h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] flex items-center">
          <Globe className="w-5 h-5 mr-2 text-cyan-600 dark:text-cyan-400" />
          IP Address Permissions
        </h2>
      </div>

      <div className="space-y-4">
        {/* User ID Input */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
            User ID
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID"
            className="w-full px-4 py-2 border border-[rgb(var(--border-primary))] rounded-md bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-[rgb(var(--border-primary))]">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "list"
                ? "text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400"
                : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
            }`}
          >
            <List className="w-4 h-4 inline mr-1" />
            Show Listed
          </button>
          <button
            onClick={() => setActiveTab("activate")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "activate"
                ? "text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400"
                : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
            }`}
          >
            <CheckCircle className="w-4 h-4 inline mr-1" />
            Activate IP
          </button>
          <button
            onClick={() => setActiveTab("deactivate")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "deactivate"
                ? "text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400"
                : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
            }`}
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Deactivate IP
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-2">
          {/* Show Listed Tab */}
          {activeTab === "list" && (
            <div className="space-y-4">
              <button
                onClick={handleShowList}
                disabled={loading}
                className="w-full px-4 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded-md hover:bg-cyan-700 dark:hover:bg-cyan-600 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <List className="w-4 h-4" />
                )}
                <span>{loading ? "Loading..." : "Show IP List"}</span>
              </button>

              {ipList.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {userInfo && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            User: {userInfo.username}
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            ID: {userInfo.id} | Email: {userInfo.email}
                          </p>
                        </div>
                        {managedBy && (
                          <div className="text-right">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              Managed by: {managedBy.username}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                    Active IP Addresses ({ipList.length})
                  </p>
                  {ipList.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 bg-[rgb(var(--bg-secondary))] rounded-md border border-[rgb(var(--border-primary))] hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[rgb(var(--text-primary))] font-mono font-bold text-lg flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400" />
                          {entry.ip_address}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-black text-xs font-semibold rounded-full">
                            ACTIVE
                          </span>
                          <button
                            onClick={() =>
                              handleRemoveIpFromList(entry.ip_address)
                            }
                            disabled={removingIp === entry.ip_address}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                            title="Remove IP address"
                          >
                            {removingIp === entry.ip_address ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[rgb(var(--text-secondary))]">
                            Created:
                          </span>
                          <span className="ml-2 text-[rgb(var(--text-primary))] font-medium">
                            {new Date(entry.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[rgb(var(--text-secondary))]">
                            Updated:
                          </span>
                          <span className="ml-2 text-[rgb(var(--text-primary))] font-medium">
                            {new Date(entry.updated_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs">
                        <span className="text-[rgb(var(--text-secondary))]">
                          Entry ID:
                        </span>
                        <span className="ml-2 text-[rgb(var(--text-primary))] font-mono">
                          #{entry.id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activate IP Tab */}
          {activeTab === "activate" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                  IP Address
                </label>
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="Enter IP address (e.g., 127.0.0.1)"
                  className="w-full px-4 py-2 border border-[rgb(var(--border-primary))] rounded-md bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleActivateIp}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>{loading ? "Activating..." : "Activate IP Address"}</span>
              </button>
            </div>
          )}

          {/* Deactivate IP Tab */}
          {activeTab === "deactivate" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                  IP Address
                </label>
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="Enter IP address (e.g., 127.0.0.1)"
                  className="w-full px-4 py-2 border border-[rgb(var(--border-primary))] rounded-md bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleDeactivateIp}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>
                  {loading ? "Deactivating..." : "Deactivate IP Address"}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <p className="text-sm text-green-600 dark:text-green-400">
              {success}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

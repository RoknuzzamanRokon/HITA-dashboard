"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { TokenStorage } from "@/lib/auth/token-storage";

interface SupplierListResponse {
  active_supplier: number;
  total_on_supplier: number;
  total_off_supplier: number;
  off_supplier_list: string[];
  on_supplier_list: string[];
}

export function SupplierPermissionSection() {
  const [userId, setUserId] = useState("");
  const [availableSuppliers, setAvailableSuppliers] = useState<string[]>([]);
  const [selectedActiveSupplier, setSelectedActiveSupplier] = useState("");
  const [selectedDeactiveSupplier, setSelectedDeactiveSupplier] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingSuppliers, setFetchingSuppliers] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableSuppliers();
  }, []);

  const fetchAvailableSuppliers = async () => {
    setFetchingSuppliers(true);
    try {
      const token = TokenStorage.getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        "http://127.0.0.1:8001/v1.0/user/check-active-my-supplier",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }

      const data: SupplierListResponse = await response.json();
      setAvailableSuppliers(data.on_supplier_list);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setError(err instanceof Error ? err.message : "Failed to load suppliers");
    } finally {
      setFetchingSuppliers(false);
    }
  };

  const handleActivateSupplier = async () => {
    if (!userId.trim()) {
      setError("Please enter a user ID");
      return;
    }

    if (!selectedActiveSupplier) {
      setError("Please select a supplier to activate");
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
        `http://127.0.0.1:8001/v1.0/permissions/admin/give-supplier-active?user_id=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            provider_activision_list: [selectedActiveSupplier],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to activate supplier");
      }

      const result = await response.json();
      setSuccess(
        `Successfully activated ${selectedActiveSupplier} for user ${userId}`
      );
      setSelectedActiveSupplier("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error activating supplier:", err);
      setError(
        err instanceof Error ? err.message : "Failed to activate supplier"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateSupplier = async () => {
    if (!userId.trim()) {
      setError("Please enter a user ID");
      return;
    }

    if (!selectedDeactiveSupplier) {
      setError("Please select a supplier to deactivate");
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
        `http://127.0.0.1:8001/v1.0/permissions/admin/give-supplier-deactivate?user_id=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            provider_deactivation_list: [selectedDeactiveSupplier],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to deactivate supplier");
      }

      const result = await response.json();
      setSuccess(
        `Successfully deactivated ${selectedDeactiveSupplier} for user ${userId}`
      );
      setSelectedDeactiveSupplier("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deactivating supplier:", err);
      setError(
        err instanceof Error ? err.message : "Failed to deactivate supplier"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md p-6 border border-[rgb(var(--border-primary))] h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] flex items-center">
          <Package className="w-5 h-5 mr-2 text-primary-color" />
          Supplier Permissions
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
            className="w-full px-4 py-2 border border-[rgb(var(--border-primary))] rounded-md bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-primary-color focus:border-transparent"
          />
        </div>

        {/* Active Supplier Section */}
        <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
          <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
            Activate Supplier
          </h3>
          <div className="flex space-x-2">
            <select
              value={selectedActiveSupplier}
              onChange={(e) => setSelectedActiveSupplier(e.target.value)}
              disabled={fetchingSuppliers || loading}
              className="flex-1 px-4 py-2 border border-[rgb(var(--border-primary))] rounded-md bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-primary-color focus:border-transparent disabled:opacity-50"
            >
              <option value="">
                {fetchingSuppliers
                  ? "Loading suppliers..."
                  : "Select a supplier"}
              </option>
              {availableSuppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
            <button
              onClick={handleActivateSupplier}
              disabled={loading || fetchingSuppliers}
              className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 flex items-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Activate</span>
            </button>
          </div>
        </div>

        {/* Deactivate Supplier Section */}
        <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
          <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-3 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-400" />
            Deactivate Supplier
          </h3>
          <div className="flex space-x-2">
            <select
              value={selectedDeactiveSupplier}
              onChange={(e) => setSelectedDeactiveSupplier(e.target.value)}
              disabled={fetchingSuppliers || loading}
              className="flex-1 px-4 py-2 border border-[rgb(var(--border-primary))] rounded-md bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-primary-color focus:border-transparent disabled:opacity-50"
            >
              <option value="">
                {fetchingSuppliers
                  ? "Loading suppliers..."
                  : "Select a supplier"}
              </option>
              {availableSuppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
            <button
              onClick={handleDeactivateSupplier}
              disabled={loading || fetchingSuppliers}
              className="px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-md hover:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>Deactivate</span>
            </button>
          </div>
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

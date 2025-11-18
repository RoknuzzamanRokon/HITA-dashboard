"use client";

import React, { useState } from "react";
import { Gift, Send, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";
import { TokenStorage } from "@/lib/auth/token-storage";

interface GivePointsResponse {
  message: string;
}

const ALLOCATION_TYPES = [
  {
    value: "admin_user_package",
    label: "Admin User Package",
    description: "Full admin access package",
  },
  {
    value: "one_year_package",
    label: "One Year Package",
    description: "Annual subscription",
  },
  {
    value: "one_month_package",
    label: "One Month Package",
    description: "Monthly subscription",
  },
  {
    value: "per_request_point",
    label: "Per Request Point",
    description: "Pay per request",
  },
  {
    value: "guest_point",
    label: "Guest Point",
    description: "Guest user points",
  },
];

export function GivePointsSection() {
  const [activeTab, setActiveTab] = useState<"give" | "reset">("give");

  // Give Points State
  const [giveReceiverId, setGiveReceiverId] = useState("");
  const [allocationType, setAllocationType] = useState("one_month_package");
  const [giveLoading, setGiveLoading] = useState(false);
  const [giveSuccess, setGiveSuccess] = useState<string | null>(null);
  const [giveError, setGiveError] = useState<string | null>(null);

  // Reset Points State
  const [resetUserId, setResetUserId] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleGivePoints = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!giveReceiverId.trim()) {
      setGiveError("Please enter receiver ID");
      return;
    }

    setGiveLoading(true);
    setGiveError(null);
    setGiveSuccess(null);

    try {
      const token = TokenStorage.getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      console.log("Giving points to:", giveReceiverId);
      console.log("Allocation type:", allocationType);

      const response = await fetch(
        "http://127.0.0.1:8001/v1.0/user/points/give",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiver_id: giveReceiverId,
            allocation_type: allocationType,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error(`Failed to give points: ${response.statusText}`);
      }

      const data: GivePointsResponse = await response.json();
      console.log("Points given successfully:", data);
      setGiveSuccess(data.message);

      setTimeout(() => {
        setGiveReceiverId("");
        setGiveSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error giving points:", err);
      setGiveError(
        err instanceof Error ? err.message : "Failed to give points"
      );
    } finally {
      setGiveLoading(false);
    }
  };

  const handleResetPoints = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetUserId.trim()) {
      setResetError("Please enter user ID");
      return;
    }

    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    try {
      const token = TokenStorage.getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      console.log("Resetting points for user:", resetUserId);

      const response = await fetch(
        `http://127.0.0.1:8001/v1.0/user/reset-point/${resetUserId.trim()}`,
        {
          method: "POST",
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
        throw new Error(`Failed to reset points: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Points reset successfully:", data);
      setResetSuccess(data.message || "Points reset successfully!");

      setTimeout(() => {
        setResetUserId("");
        setResetSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error resetting points:", err);
      setResetError(
        err instanceof Error ? err.message : "Failed to reset points"
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md p-6 border border-[rgb(var(--border-primary))] h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] flex items-center">
          <Gift className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
          Points
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-[rgb(var(--border-primary))]">
        <button
          onClick={() => setActiveTab("give")}
          className={`px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 ${
            activeTab === "give"
              ? "border-green-600 dark:border-green-400 text-green-600 dark:text-green-400"
              : "border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
          }`}
        >
          Give Points
        </button>
        <button
          onClick={() => setActiveTab("reset")}
          className={`px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 ${
            activeTab === "reset"
              ? "border-orange-600 dark:border-orange-400 text-orange-600 dark:text-orange-400"
              : "border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
          }`}
        >
          Reset Points
        </button>
      </div>

      {/* Give Points Tab */}
      {activeTab === "give" && (
        <form
          onSubmit={handleGivePoints}
          className="space-y-4 flex-1 flex flex-col"
        >
          {/* Receiver ID */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
              Receiver User ID
            </label>
            <input
              type="text"
              value={giveReceiverId}
              onChange={(e) => setGiveReceiverId(e.target.value)}
              placeholder="Enter user ID (e.g., b6146d77-e)"
              className="w-full px-4 py-2 border border-[rgb(var(--border-primary))] rounded-md bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-[rgb(var(--text-tertiary))]">
              Search for user information above to get the user ID
            </p>
          </div>

          {/* Allocation Type */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
              Allocation Type
            </label>
            <select
              value={allocationType}
              onChange={(e) => setAllocationType(e.target.value)}
              className="w-full px-4 py-2 border border-[rgb(var(--border-primary))] rounded-md bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {ALLOCATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Success Message */}
          {giveSuccess && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <p className="text-sm text-green-600 dark:text-green-400">
                {giveSuccess}
              </p>
            </div>
          )}

          {/* Error Message */}
          {giveError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {giveError}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={giveLoading}
            className="w-full px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all duration-200 font-medium hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <Send className={`w-5 h-5 ${giveLoading ? "animate-pulse" : ""}`} />
            <span>{giveLoading ? "Sending..." : "Give Points"}</span>
          </button>

          {/* Info Box */}
          <div className="mt-auto p-4 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-md">
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              <strong className="text-[rgb(var(--text-primary))]">Note:</strong>{" "}
              Points will be allocated based on the selected package type. Make
              sure the receiver ID is correct before submitting.
            </p>
          </div>
        </form>
      )}

      {/* Reset Points Tab */}
      {activeTab === "reset" && (
        <form
          onSubmit={handleResetPoints}
          className="space-y-4 flex-1 flex flex-col"
        >
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
              User ID
            </label>
            <input
              type="text"
              value={resetUserId}
              onChange={(e) => setResetUserId(e.target.value)}
              placeholder="Enter user ID (e.g., b6146d77-e)"
              className="w-full px-4 py-2 border border-[rgb(var(--border-primary))] rounded-md bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-[rgb(var(--text-tertiary))]">
              Search for user information above to get the user ID
            </p>
          </div>

          {/* Success Message */}
          {resetSuccess && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <p className="text-sm text-green-600 dark:text-green-400">
                {resetSuccess}
              </p>
            </div>
          )}

          {/* Error Message */}
          {resetError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {resetError}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={resetLoading}
            className="w-full px-6 py-3 bg-orange-600 dark:bg-orange-500 text-white rounded-md hover:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all duration-200 font-medium hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <RotateCcw
              className={`w-5 h-5 ${resetLoading ? "animate-spin" : ""}`}
            />
            <span>{resetLoading ? "Resetting..." : "Reset Points"}</span>
          </button>

          {/* Warning Box */}
          <div className="mt-auto p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              <strong>Warning:</strong> This action will reset all points for
              the user. This action cannot be undone. Make sure you have the
              correct user ID.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

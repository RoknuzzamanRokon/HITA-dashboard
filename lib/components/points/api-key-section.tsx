"use client";

import React, { useState } from "react";
import {
  Key,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { TokenStorage } from "@/lib/auth/token-storage";

interface ApiKeyInfo {
  api_key: string;
  created: string;
  expires: string;
  active_for_days: number;
}

export function ApiKeySection() {
  const [activeTab, setActiveTab] = useState<"generate" | "revoke">("generate");

  // Generate API Key State
  const [generateUserId, setGenerateUserId] = useState("");
  const [activeForDays, setActiveForDays] = useState(7);
  const [apiKeyInfo, setApiKeyInfo] = useState<ApiKeyInfo | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);

  // Revoke API Key State
  const [revokeUserId, setRevokeUserId] = useState("");
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [revokeSuccess, setRevokeSuccess] = useState<string | null>(null);

  const handleCopyKey = () => {
    if (apiKeyInfo?.api_key) {
      navigator.clipboard.writeText(apiKeyInfo.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!generateUserId.trim()) {
      setGenerateError("Please enter a user ID");
      return;
    }

    if (activeForDays < 1 || activeForDays > 365) {
      setGenerateError("Active days must be between 1 and 365");
      return;
    }

    setGenerateLoading(true);
    setGenerateError(null);
    setGenerateSuccess(null);

    try {
      const token = TokenStorage.getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      console.log("Generating API key for user:", generateUserId);
      console.log("Active for days:", activeForDays);

      const response = await fetch(
        `http://127.0.0.1:8001/v1.0/auth/generate-api-key/${generateUserId.trim()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active_for: activeForDays,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            `Failed to generate API key: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("API key generated:", data);

      setApiKeyInfo(data);
      setGenerateSuccess("API key generated successfully!");
      setShowKey(true);

      setTimeout(() => setGenerateSuccess(null), 3000);
    } catch (err) {
      console.error("Error generating API key:", err);
      setGenerateError(
        err instanceof Error ? err.message : "Failed to generate API key"
      );
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleRevokeKey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!revokeUserId.trim()) {
      setRevokeError("Please enter a user ID");
      return;
    }

    setRevokeLoading(true);
    setRevokeError(null);
    setRevokeSuccess(null);

    try {
      const token = TokenStorage.getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      console.log("Revoking API key for user:", revokeUserId);

      const response = await fetch(
        `http://127.0.0.1:8001/v1.0/auth/revoke-api-key/${revokeUserId.trim()}`,
        {
          method: "DELETE",
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Failed to revoke API key: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("API key revoked:", data);
      setRevokeSuccess(data.message || "API key revoked successfully!");

      setTimeout(() => {
        setRevokeUserId("");
        setRevokeSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error revoking API key:", err);
      setRevokeError(
        err instanceof Error ? err.message : "Failed to revoke API key"
      );
    } finally {
      setRevokeLoading(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 10) return key;
    return `${key.substring(0, 10)}${"*".repeat(
      key.length - 14
    )}${key.substring(key.length - 4)}`;
  };

  return (
    <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md p-6 border border-[rgb(var(--border-primary))] h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] flex items-center">
          <Key className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
          API Key Management
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-[rgb(var(--border-primary))]">
        <button
          onClick={() => setActiveTab("generate")}
          className={`px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 ${
            activeTab === "generate"
              ? "border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400"
              : "border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
          }`}
        >
          Generate API Key
        </button>
        <button
          onClick={() => setActiveTab("revoke")}
          className={`px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 ${
            activeTab === "revoke"
              ? "border-red-600 dark:border-red-400 text-red-600 dark:text-red-400"
              : "border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
          }`}
        >
          Revoke API Key
        </button>
      </div>

      {/* Generate API Key Tab */}
      {activeTab === "generate" && (
        <form
          onSubmit={handleGenerateKey}
          className="space-y-4 flex-1 flex flex-col"
        >
          {/* User ID Input */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
              User ID
            </label>
            <input
              type="text"
              value={generateUserId}
              onChange={(e) => setGenerateUserId(e.target.value)}
              placeholder="Enter user ID"
              className="w-full px-4 py-2 border border-[rgb(var(--border-primary))] rounded-md bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Active For Days Input */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
              Active For (Days)
            </label>
            <input
              type="number"
              value={activeForDays}
              onChange={(e) => setActiveForDays(parseInt(e.target.value) || 7)}
              min="1"
              max="365"
              className="w-full px-4 py-2 border border-[rgb(var(--border-primary))] rounded-md bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-[rgb(var(--text-tertiary))]">
              API key will be valid for {activeForDays} days
            </p>
          </div>

          {/* Success Message */}
          {generateSuccess && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <p className="text-sm text-green-600 dark:text-green-400">
                {generateSuccess}
              </p>
            </div>
          )}

          {/* Error Message */}
          {generateError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {generateError}
              </p>
            </div>
          )}

          {/* Generate Button */}
          <div>
            <button
              type="submit"
              disabled={generateLoading || !generateUserId.trim()}
              className="w-full px-6 py-3 bg-purple-600 dark:bg-purple-500 text-white rounded-md hover:bg-purple-700 dark:hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all duration-200 font-medium hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <RefreshCw
                className={`w-5 h-5 ${generateLoading ? "animate-spin" : ""}`}
              />
              <span>
                {generateLoading ? "Generating..." : "Generate API Key"}
              </span>
            </button>
          </div>

          {/* API Key Display */}
          {apiKeyInfo && (
            <div className="space-y-4 border-t border-[rgb(var(--border-primary))] pt-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                  Generated API Key
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={
                        showKey
                          ? apiKeyInfo.api_key
                          : maskApiKey(apiKeyInfo.api_key)
                      }
                      readOnly
                      className="w-full px-4 py-2 pr-10 border border-[rgb(var(--border-primary))] rounded-md bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))] transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      {showKey ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="px-4 py-2 bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-primary))] rounded-md hover:bg-[rgb(var(--bg-hover))] flex items-center space-x-2 transition-all duration-200 border border-[rgb(var(--border-primary))] hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
                  <div>
                    <span className="text-[rgb(var(--text-secondary))]">
                      Created:
                    </span>
                    <p className="text-[rgb(var(--text-primary))] font-medium">
                      {new Date(apiKeyInfo.created).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
                  <div>
                    <span className="text-[rgb(var(--text-secondary))]">
                      Expires:
                    </span>
                    <p className="text-[rgb(var(--text-primary))] font-medium">
                      {new Date(apiKeyInfo.expires).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <span className="text-[rgb(var(--text-secondary))]">
                  Active for:
                </span>
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  {apiKeyInfo.active_for_days} days
                </span>
              </div>

              {/* Warning */}
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">
                  <strong>Important:</strong> Store this API key securely. It
                  will not be shown again. If you lose it, you'll need to
                  generate a new one.
                </p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-auto p-4 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-md">
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              <strong className="text-[rgb(var(--text-primary))]">Note:</strong>{" "}
              Enter the user ID and specify how many days the API key should be
              active. The key will be generated immediately.
            </p>
          </div>
        </form>
      )}

      {/* Revoke API Key Tab */}
      {activeTab === "revoke" && (
        <form
          onSubmit={handleRevokeKey}
          className="space-y-4 flex-1 flex flex-col"
        >
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
              User ID
            </label>
            <input
              type="text"
              value={revokeUserId}
              onChange={(e) => setRevokeUserId(e.target.value)}
              placeholder="Enter user ID"
              className="w-full px-4 py-2 border border-[rgb(var(--border-primary))] rounded-md bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-[rgb(var(--text-tertiary))]">
              Search for user information above to get the user ID
            </p>
          </div>

          {/* Success Message */}
          {revokeSuccess && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <p className="text-sm text-green-600 dark:text-green-400">
                {revokeSuccess}
              </p>
            </div>
          )}

          {/* Error Message */}
          {revokeError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {revokeError}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={revokeLoading}
            className="w-full px-6 py-3 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all duration-200 font-medium hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <Trash2
              className={`w-5 h-5 ${revokeLoading ? "animate-pulse" : ""}`}
            />
            <span>{revokeLoading ? "Revoking..." : "Revoke API Key"}</span>
          </button>

          {/* Warning Box */}
          <div className="mt-auto p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              <strong>Warning:</strong> This action will permanently revoke the
              user's API key. They will need to generate a new one to access the
              API. This action cannot be undone.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

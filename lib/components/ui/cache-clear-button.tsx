/**
 * Cache Clear Button Component
 * Provides a button to clear all frontend caches
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { CacheManager } from "@/lib/utils/cache-manager";
import { Trash2, RefreshCw, Info } from "lucide-react";

interface CacheClearButtonProps {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "gradient"
    | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  showCacheInfo?: boolean;
  onCacheCleared?: () => void;
  className?: string;
}

export function CacheClearButton({
  variant = "outline",
  size = "md",
  showCacheInfo = false,
  onCacheCleared,
  className = "",
}: CacheClearButtonProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{
    localStorage: number;
    sessionStorage: number;
    cookies: number;
    serviceWorker: number;
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load cache info on component mount
  useEffect(() => {
    if (showCacheInfo) {
      loadCacheInfo();
    }
  }, [showCacheInfo]);

  const loadCacheInfo = async () => {
    try {
      const info = await CacheManager.getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error("Failed to load cache info:", error);
    }
  };

  const handleClearCache = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsClearing(true);
    setShowConfirm(false);

    try {
      await CacheManager.clearAllCache();

      // Refresh cache info
      if (showCacheInfo) {
        await loadCacheInfo();
      }

      // Call callback if provided
      if (onCacheCleared) {
        onCacheCleared();
      }

      // Show success message
      alert(
        "✅ All frontend caches cleared successfully!\n\nThe page will refresh to apply changes.",
      );

      // Refresh the page instead of full reload
      window.location.href = window.location.href;
    } catch (error) {
      console.error("Failed to clear cache:", error);
      alert("❌ Failed to clear some caches. Check console for details.");
    } finally {
      setIsClearing(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const getTotalCacheSize = () => {
    if (!cacheInfo) return 0;
    return (
      cacheInfo.localStorage +
      cacheInfo.sessionStorage +
      cacheInfo.cookies +
      cacheInfo.serviceWorker
    );
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-red-600 font-medium">
          Clear all caches?
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={handleClearCache}
          disabled={isClearing}
          title="Confirm Clear Cache"
        >
          {isClearing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isClearing}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showCacheInfo && cacheInfo && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Info className="h-4 w-4" />
          <span>Cache: {CacheManager.formatBytes(getTotalCacheSize())}</span>
        </div>
      )}

      <Button
        variant={variant}
        size={size}
        onClick={handleClearCache}
        disabled={isClearing}
        className="flex items-center justify-center"
        title="Clear Cache"
      >
        {isClearing ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

// Advanced cache clear component with detailed information
export function AdvancedCacheClearButton() {
  const [cacheInfo, setCacheInfo] = useState<{
    localStorage: number;
    sessionStorage: number;
    cookies: number;
    serviceWorker: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCacheInfo();
  }, []);

  const loadCacheInfo = async () => {
    setIsLoading(true);
    try {
      const info = await CacheManager.getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error("Failed to load cache info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCacheCleared = () => {
    // Reload cache info after clearing
    setTimeout(() => {
      loadCacheInfo();
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading cache info...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cache Information */}
      {cacheInfo && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Cache Information
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Local Storage:</span>
              <span className="font-medium">
                {CacheManager.formatBytes(cacheInfo.localStorage)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Session Storage:</span>
              <span className="font-medium">
                {CacheManager.formatBytes(cacheInfo.sessionStorage)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cookies:</span>
              <span className="font-medium">
                {CacheManager.formatBytes(cacheInfo.cookies)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Worker:</span>
              <span className="font-medium">
                {CacheManager.formatBytes(cacheInfo.serviceWorker)}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-gray-900">Total Cache Size:</span>
              <span className="text-blue-600">
                {CacheManager.formatBytes(
                  cacheInfo.localStorage +
                    cacheInfo.sessionStorage +
                    cacheInfo.cookies +
                    cacheInfo.serviceWorker,
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cache Button */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">
            Clear All Caches
          </h4>
          <p className="text-xs text-gray-600 mt-1">
            This will clear all stored data and reload the page
          </p>
        </div>
        <CacheClearButton
          variant="danger"
          onCacheCleared={handleCacheCleared}
        />
      </div>
    </div>
  );
}

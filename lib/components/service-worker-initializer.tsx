/**
 * Service Worker Initializer Component
 * Handles service worker registration and cache management
 */

"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import {
  initializeServiceWorkerWithCaching,
  clearUserCaches,
  isServiceWorkerSupported,
} from "@/lib/utils/service-worker";
import { useCacheInitialization } from "@/lib/hooks/use-cache-initialization";

export function ServiceWorkerInitializer() {
  const { user, isAuthenticated } = useAuth();

  // Initialize cache system
  const { initializeCache, clearUserCache } = useCacheInitialization();

  // Initialize service worker on mount
  useEffect(() => {
    if (isServiceWorkerSupported()) {
      console.log("🚀 Initializing Service Worker...");
      initializeServiceWorkerWithCaching().catch((error) => {
        console.error("❌ Service Worker initialization failed:", error);
      });
    }
  }, []);

  // Clear user caches on logout
  useEffect(() => {
    if (!isAuthenticated && !user) {
      // User logged out, clear their caches
      const previousUserId = localStorage.getItem("current-cache-user-id");
      if (previousUserId) {
        console.log("🧹 Clearing caches for logged out user:", previousUserId);
        clearUserCaches(previousUserId).catch((error) => {
          console.error("❌ Failed to clear user caches:", error);
        });
      }
    }
  }, [isAuthenticated, user]);

  // This component doesn't render anything
  return null;
}

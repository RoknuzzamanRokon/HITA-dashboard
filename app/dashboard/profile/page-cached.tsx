"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { useNotification } from "@/lib/components/notifications/notification-provider";
import { NotificationService } from "@/lib/api/notifications";
import { TokenStorage } from "@/lib/auth/token-storage";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Coins,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  Crown,
  Building,
  X,
  MapPin,
  Clock,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";

// Import cached hooks
import { useCachedProfile } from "@/lib/hooks/use-cached-profile";
import { useCachedApiKey } from "@/lib/hooks/use-cached-api-key";
import { useCachedSupplierInfo } from "@/lib/hooks/use-cached-supplier-info";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  user_status: string;
  available_points: number;
  total_points: number;
  supplier_info: {
    total_active: number;
    active_list: string[];
    temporary_off: number;
    temporary_off_supplier: string[];
  };
  created_at: string;
  updated_at: string;
  need_to_next_upgrade: string;
}

export default function CachedProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  // Cached profile data
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    isUsingCachedData: profileUsingCache,
    cacheAge: profileCacheAge,
    forceRefresh: forceRefreshProfile,
    updateProfile,
  } = useCachedProfile();

  // Cached API key data
  const {
    data: apiKeyData,
    isLoading: apiKeyLoading,
    error: apiKeyError,
    isUsingCachedData: apiKeyUsingCache,
    cacheAge: apiKeyCacheAge,
    forceRefresh: forceRefreshApiKey,
    fetchApiKey,
  } = useCachedApiKey();

  // Local state
  const [error, setError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedSupplierName, setSelectedSupplierName] = useState<string>("");
  const [turningOffSupplier, setTurningOffSupplier] = useState(false);
  const [turningOnSupplier, setTurningOnSupplier] = useState(false);
  const [showTempOffSupplierModal, setShowTempOffSupplierModal] =
    useState(false);

  // Cached supplier info data
  const {
    data: supplierInfo,
    isLoading: supplierLoading,
    error: supplierError,
    isUsingCachedData: supplierUsingCache,
    cacheAge: supplierCacheAge,
    forceRefresh: forceRefreshSupplier,
  } = useCachedSupplierInfo(selectedSupplierName || null);

  const { addNotification } = useNotification();

  // Extract API key and info from cached data
  const apiKey = apiKeyData?.security?.apiKey || null;
  const apiKeyInfo = apiKeyData?.apiKeyInfo || null;

  // Handle errors from cached hooks
  useEffect(() => {
    if (profileError) {
      setError(
        profileError instanceof Error
          ? profileError.message
          : "Failed to load profile",
      );
    } else if (apiKeyError && apiKeyData) {
      setError(
        apiKeyError instanceof Error
          ? apiKeyError.message
          : "Failed to load API key",
      );
    } else if (supplierError && selectedSupplierName) {
      setError(
        supplierError instanceof Error
          ? supplierError.message
          : "Failed to load supplier info",
      );
    } else {
      setError(null);
    }
  }, [
    profileError,
    apiKeyError,
    supplierError,
    apiKeyData,
    selectedSupplierName,
  ]);

  // Handle refresh all cached data
  const handleRefreshAll = async () => {
    console.log("🔄 Refreshing all profile cached data...");

    await Promise.all([
      forceRefreshProfile(),
      apiKeyData ? forceRefreshApiKey() : Promise.resolve(),
      selectedSupplierName ? forceRefreshSupplier() : Promise.resolve(),
    ]);
  };

  // Create backend notification for supplier changes
  const createSupplierNotification = async (
    supplierName: string,
    action: "turned_off" | "activated",
  ) => {
    try {
      if (profile?.id) {
        const currentTime = new Date().toISOString();

        const notificationData = {
          user_id: profile.id,
          type: "permission" as const,
          title: `Supplier ${
            action === "turned_off" ? "Deactivated" : "Activated"
          }`,
          message: `Supplier "${supplierName}" has been ${
            action === "turned_off"
              ? "turned off and moved to temporary off list"
              : "activated and moved to active suppliers list"
          }.`,
          priority: "medium" as const,
          meta_data: {
            supplier_name: supplierName,
            action: action,
            timestamp: currentTime,
            source: "profile_management",
            user_initiated: true,
            previous_status:
              action === "turned_off" ? "active" : "temporary_off",
            new_status: action === "turned_off" ? "temporary_off" : "active",
            change_time: currentTime,
            user_id: profile.id,
            username: profile.username,
            sent_by: profile.username,
            sent_by_role: profile.user_status,
            sent_at: currentTime,
            notification_source: "supplier_management",
            operation_type: "supplier_status_change",
            details: {
              supplier: supplierName,
              from_status: action === "turned_off" ? "active" : "temporary_off",
              to_status: action === "turned_off" ? "temporary_off" : "active",
              initiated_by: profile.username,
              initiated_at: currentTime,
            },
          },
        };

        console.log(
          "🔔 Creating supplier notification with enhanced meta_data:",
          JSON.stringify(notificationData, null, 2),
        );

        const result =
          await NotificationService.createNotification(notificationData);

        console.log("✅ Supplier notification created successfully:", result);

        // Show immediate frontend notification
        addNotification({
          type: "success",
          title: "Notification Created",
          message: `Supplier notification for "${supplierName}" has been created and will appear in your notifications.`,
          autoDismiss: true,
          duration: 3000,
        });

        // Immediate refresh trigger
        console.log("🔄 Triggering immediate notification refresh...");
        window.dispatchEvent(new CustomEvent("refreshNotifications"));

        // Verify the notification was created with meta_data
        setTimeout(async () => {
          try {
            console.log(
              "🔍 Fetching notifications to verify meta_data was saved...",
            );

            const notifications = await NotificationService.getNotifications(
              1,
              5,
            );
            const latestNotification = notifications.notifications?.[0];

            if (latestNotification && latestNotification.id === result?.id) {
              console.log("✅ Verification: Found our notification");
              console.log(
                "🔍 Verification: meta_data in fetched notification:",
                latestNotification.meta_data,
              );

              if (
                latestNotification.meta_data &&
                latestNotification.meta_data.supplier_name === supplierName
              ) {
                console.log(
                  "✅ SUCCESS: meta_data was saved and retrieved correctly!",
                );
              } else {
                console.log(
                  "❌ ISSUE: meta_data is missing or incomplete in saved notification!",
                );
                console.log("Expected supplier_name:", supplierName);
                console.log("Actual meta_data:", latestNotification.meta_data);
              }
            } else {
              console.log(
                "⚠️ Could not find our notification for verification",
              );
            }

            // Trigger a global notification refresh to update UI
            console.log("🔄 Triggering global notification refresh...");
            window.dispatchEvent(new CustomEvent("refreshNotifications"));

            // Also trigger immediate refresh for any active notification hooks
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent("refreshNotifications"));
            }, 1000);
          } catch (fetchErr) {
            console.error(
              "Failed to fetch notifications for verification:",
              fetchErr,
            );
          }
        }, 2000);
      }
    } catch (err) {
      console.error("❌ Failed to create backend notification:", err);
      console.error("❌ Error details:", err);
      // Don't throw error as this is not critical for the main operation
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
    }
  };

  const handleTurnOffSupplier = async () => {
    if (!selectedSupplierName) return;

    setTurningOffSupplier(true);

    try {
      const token = TokenStorage.getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      console.log("Turning off supplier:", selectedSupplierName);

      const response = await fetch(
        "http://127.0.0.1:8001/v1.0/permissions/turn-off-supplier",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            supplier_name: [selectedSupplierName],
          }),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error(`Failed to turn off supplier: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Turn off supplier response:", data);

      // Optimistically update the profile state using cached hook
      if (profile) {
        const updatedProfile = {
          ...profile,
          supplier_info: {
            ...profile.supplier_info,
            active_list: profile.supplier_info.active_list.filter(
              (supplier: string) => supplier !== selectedSupplierName,
            ),
            temporary_off_supplier: [
              ...profile.supplier_info.temporary_off_supplier,
              selectedSupplierName,
            ],
            total_active: profile.supplier_info.total_active - 1,
            temporary_off: profile.supplier_info.temporary_off + 1,
          },
        };
        updateProfile(() => updatedProfile);
      }

      // Close modal
      setShowSupplierModal(false);

      // Show success notification
      addNotification({
        type: "success",
        title: "Supplier Turned Off",
        message: `Supplier "${selectedSupplierName}" has been turned off successfully and moved to temporary off list.`,
        autoDismiss: true,
        duration: 5000,
      });

      // Create backend notification
      await createSupplierNotification(selectedSupplierName, "turned_off");

      setError(null);
    } catch (err) {
      console.error("Error turning off supplier:", err);

      // Revert optimistic update on error by refreshing profile
      await forceRefreshProfile();

      const errorMessage =
        err instanceof Error ? err.message : "Failed to turn off supplier";

      // Show error notification
      addNotification({
        type: "error",
        title: "Failed to Turn Off Supplier",
        message: `Could not turn off supplier "${selectedSupplierName}". ${errorMessage}`,
        autoDismiss: false, // Error notifications stay until dismissed
      });

      setError(errorMessage);
    } finally {
      setTurningOffSupplier(false);
    }
  };

  const handleTempOffSupplierClick = (supplierName: string) => {
    setSelectedSupplierName(supplierName);
    setShowTempOffSupplierModal(true);
  };

  const handleTurnOnSupplier = async () => {
    if (!selectedSupplierName) return;

    setTurningOnSupplier(true);

    try {
      const token = TokenStorage.getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      console.log("Turning on supplier:", selectedSupplierName);

      const response = await fetch(
        "http://127.0.0.1:8001/v1.0/permissions/turn-on-supplier",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            supplier_name: [selectedSupplierName],
          }),
        },
      );

      console.log("Response status:", response.status);
      console.log("Response statusText:", response.statusText);

      if (!response.ok) {
        // Try to get the response body for more details
        let errorMessage = `Failed to turn on supplier: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.log("Error response data:", errorData);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (e) {
          console.log("Could not parse error response as JSON");
        }

        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        if (response.status === 404) {
          throw new Error(
            "Turn-on supplier endpoint not found. This feature may not be implemented on the backend yet.",
          );
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Turn on supplier response:", data);

      // Optimistically update the profile state using cached hook
      if (profile) {
        const updatedProfile = {
          ...profile,
          supplier_info: {
            ...profile.supplier_info,
            active_list: [
              ...profile.supplier_info.active_list,
              selectedSupplierName,
            ],
            temporary_off_supplier:
              profile.supplier_info.temporary_off_supplier.filter(
                (supplier: string) => supplier !== selectedSupplierName,
              ),
            total_active: profile.supplier_info.total_active + 1,
            temporary_off: profile.supplier_info.temporary_off - 1,
          },
        };
        updateProfile(() => updatedProfile);
      }

      // Close modal
      setShowTempOffSupplierModal(false);

      // Show success notification
      addNotification({
        type: "success",
        title: "Supplier Activated",
        message: `Supplier "${selectedSupplierName}" has been activated successfully and moved to active suppliers list.`,
        autoDismiss: true,
        duration: 5000,
      });

      // Create backend notification
      await createSupplierNotification(selectedSupplierName, "activated");

      setError(null);
    } catch (err) {
      console.error("Error turning on supplier:", err);

      // Revert optimistic update on error by refreshing profile
      await forceRefreshProfile();

      const errorMessage =
        err instanceof Error ? err.message : "Failed to turn on supplier";

      // Show error notification
      addNotification({
        type: "error",
        title: "Failed to Activate Supplier",
        message: `Could not activate supplier "${selectedSupplierName}". ${errorMessage}`,
        autoDismiss: false, // Error notifications stay until dismissed
      });

      setError(errorMessage);
    } finally {
      setTurningOnSupplier(false);
    }
  };

  const handleSupplierClick = async (supplierName: string) => {
    setShowSupplierModal(true);
    setSelectedSupplierName(supplierName);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-primary))]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-color mx-auto mb-4" />
          <p className="text-[rgb(var(--text-secondary))]">
            Loading profile...
          </p>
          {profileUsingCache && (
            <p className="text-sm text-blue-600 mt-2">
              ⚡ Using cached data (
              {profileCacheAge ? Math.round(profileCacheAge / 1000) : 0}s old)
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) return null;

  const getRoleInfo = (status: string) => {
    const roles: Record<string, { label: string; icon: React.ReactElement }> = {
      super_user: {
        label: "Super User",
        icon: <Crown className="w-4 h-4" />,
      },
      admin_user: {
        label: "Admin User",
        icon: <Shield className="w-4 h-4" />,
      },
      general_user: {
        label: "General User",
        icon: <User className="w-4 h-4" />,
      },
    };
    return roles[status] || roles.general_user;
  };

  const roleInfo = getRoleInfo(profile.user_status);

  // Check if any data is using cache
  const isUsingAnyCachedData =
    profileUsingCache || apiKeyUsingCache || supplierUsingCache;

  return (
    <div className="mx-auto hide-amber-sections hide-status-sections">
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            {isUsingAnyCachedData && (
              <button
                onClick={handleRefreshAll}
                className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Refresh Data
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md overflow-hidden mb-6 border border-[rgb(var(--border-primary))]">
        <div
          className="relative h-32 bg-primary-color"
          style={{
            background: `linear-gradient(135deg, var(--primary-color) 0%, rgba(var(--primary-rgb), 0.8) 50%, var(--primary-hover) 100%)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)",
            }}
          ></div>
          <div className="absolute -bottom-24 left-8">
            <div className="w-48 h-48 rounded-lg bg-[rgb(var(--bg-primary))] shadow-lg flex items-center justify-center border-8 border-[rgb(var(--bg-primary))]">
              <span className="text-7xl font-bold text-primary-color">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="relative pt-28 px-8 pb-6">
          <div className="absolute top-4 right-8 text-right">
            <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
              {profile.username.charAt(0).toUpperCase() +
                profile.username.slice(1).toLowerCase()}
            </h1>
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 border-primary-color text-primary-color bg-transparent">
                {roleInfo.icon}
                <span className="ml-1">{roleInfo.label}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-6 mb-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center">
          <User className="w-5 h-5 mr-2 text-primary-color" />
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Username</span>
            </div>
            <p className="text-lg font-semibold text-[rgb(var(--text-primary))]">
              {profile.username.charAt(0).toUpperCase() +
                profile.username.slice(1).toLowerCase()}
            </p>
          </div>

          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Email</span>
            </div>
            <p className="text-lg font-semibold text-[rgb(var(--text-primary))]">
              {profile.email}
            </p>
          </div>

          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">User ID</span>
            </div>
            <p className="text-sm font-mono text-[rgb(var(--text-primary))]">
              {profile.id}
            </p>
          </div>

          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <Building className="w-4 h-4" />
              <span className="text-sm font-medium">Status</span>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 border-primary-color text-primary-color bg-transparent">
              {roleInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Points Information */}
      <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-6 mb-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center">
          <Coins className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
          Points Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <Coins className="w-4 h-4" />
              <span className="text-sm font-medium">Available Points</span>
            </div>
            <p className="text-2xl font-bold text-primary-color">
              {profile.available_points.toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Total Points</span>
            </div>
            <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              {profile.total_points.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Supplier Information */}
      <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] flex items-center">
            <Building className="w-5 h-5 mr-2 text-primary-color" />
            Supplier Information
          </h2>

          {/* Test Notification Button (Development Only) */}
          {process.env.NODE_ENV === "development" && (
            <button
              onClick={() =>
                createSupplierNotification("test_supplier", "turned_off")
              }
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
              title="Test supplier notification"
            >
              Test Notification
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Total Active</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {profile.supplier_info.total_active}
            </p>
          </div>

          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Temporary Off</span>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {profile.supplier_info.temporary_off}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-[rgb(var(--text-secondary))] mb-3">
            Active Suppliers ({profile.supplier_info.active_list.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.supplier_info.active_list.map((supplier: string) => (
              <button
                key={supplier}
                onClick={() => handleSupplierClick(supplier)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 border-primary-color text-primary-color bg-transparent hover:bg-primary-light transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              >
                {supplier}
              </button>
            ))}
          </div>
        </div>

        {profile.supplier_info.temporary_off_supplier.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-[rgb(var(--text-secondary))] mb-3">
              Temporary Off Suppliers (
              {profile.supplier_info.temporary_off_supplier.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.supplier_info.temporary_off_supplier.map(
                (supplier: string) => (
                  <button
                    key={supplier}
                    onClick={() => handleTempOffSupplierClick(supplier)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 border-orange-600 dark:border-orange-400 text-orange-600 dark:text-orange-400 bg-transparent hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {supplier}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Supplier Permissions & IP Address Permissions - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Supplier Permissions */}
        <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-6">
          <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary-color" />
            Supplier Permissions
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                Manage supplier access and permissions
              </p>
            </div>
          </div>
        </div>

        {/* IP Address Permissions */}
        <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-6">
          <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary-color" />
            IP Address Permissions
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                Manage IP address access control
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Section */}
      <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-6 mb-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center">
          <Key className="w-5 h-5 mr-2 text-primary-color" />
          API Key
        </h2>

        <div className="space-y-4">
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            Your API key is used to authenticate requests to export endpoints.
            Keep it secure and don't share it publicly.
          </p>

          {!apiKey ? (
            <button
              onClick={fetchApiKey}
              disabled={apiKeyLoading}
              className="px-6 py-3 bg-primary-color text-white rounded-md hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2 transition-all duration-200 font-medium hover:shadow-lg hover:scale-105 active:scale-95"
            >
              {apiKeyLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  Show API Key
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              {/* API Key Display */}
              <div className="flex items-center gap-2">
                <div className="flex-1 p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))] font-mono text-sm">
                  {showApiKey ? (
                    <span className="text-[rgb(var(--text-primary))] break-all">
                      {apiKey}
                    </span>
                  ) : (
                    <span className="text-[rgb(var(--text-tertiary))]">
                      ••••••••••••••••••••••••••••••••
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-3 hover:bg-[rgb(var(--bg-secondary))] rounded-lg transition-colors border border-[rgb(var(--border-primary))]"
                  title={showApiKey ? "Hide API Key" : "Show API Key"}
                >
                  {showApiKey ? (
                    <EyeOff className="w-5 h-5 text-[rgb(var(--text-secondary))]" />
                  ) : (
                    <Eye className="w-5 h-5 text-[rgb(var(--text-secondary))]" />
                  )}
                </button>
                <button
                  onClick={handleCopyApiKey}
                  className="p-3 hover:bg-[rgb(var(--bg-secondary))] rounded-lg transition-colors border border-[rgb(var(--border-primary))]"
                  title="Copy API Key"
                >
                  {apiKeyCopied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-[rgb(var(--text-secondary))]" />
                  )}
                </button>
              </div>

              {apiKeyCopied && (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  API Key copied to clipboard!
                </p>
              )}

              {/* API Key Information */}
              {apiKeyInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                    <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <p className="text-base font-semibold text-[rgb(var(--text-primary))]">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 ${
                          apiKeyInfo.status === "active"
                            ? "border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 bg-transparent"
                            : "border-red-600 dark:border-red-400 text-red-600 dark:text-red-400 bg-transparent"
                        }`}
                      >
                        {apiKeyInfo.status?.toUpperCase()}
                      </span>
                    </p>
                  </div>

                  <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                    <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Generated At</span>
                    </div>
                    <p className="text-sm text-[rgb(var(--text-primary))]">
                      {new Date(apiKeyInfo.generatedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                    <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Expires At</span>
                    </div>
                    <p className="text-sm text-[rgb(var(--text-primary))]">
                      {new Date(apiKeyInfo.expiresAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                    <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Days Until Expiration
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-primary-color">
                      {apiKeyInfo.daysUntilExpiration}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Account Timeline */}
      <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-6 mb-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-primary-color" />
          Account Timeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Created At</span>
            </div>
            <p className="text-base font-semibold text-[rgb(var(--text-primary))]">
              {new Date(profile.created_at).toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Updated At</span>
            </div>
            <p className="text-base font-semibold text-[rgb(var(--text-primary))]">
              {new Date(profile.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        {profile.need_to_next_upgrade && (
          <div className="mt-4 p-4 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-md">
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              <strong className="text-[rgb(var(--text-primary))]">
                Next Upgrade:
              </strong>{" "}
              {profile.need_to_next_upgrade}
            </p>
          </div>
        )}
      </div>

      {/* Supplier Info Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[rgb(var(--border-primary))]">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[rgb(var(--bg-primary))] border-b border-[rgb(var(--border-primary))] p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] flex items-center">
                <Building className="w-5 h-5 mr-2 text-primary-color" />
                Supplier Information
              </h3>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {supplierLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-primary-color mb-4" />
                  <p className="text-[rgb(var(--text-secondary))]">
                    Loading supplier information...
                  </p>
                </div>
              ) : supplierInfo ? (
                <div className="space-y-6">
                  {/* Supplier Info Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-primary-color" />
                      Supplier Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <Building className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Supplier Name
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-primary-color">
                          {supplierInfo.supplier_info.supplier_name}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Total Hotels
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                          {supplierInfo.supplier_info.total_hotel.toLocaleString()}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Total Mappings
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                          {supplierInfo.supplier_info.total_mappings.toLocaleString()}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Has Hotels
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 bg-transparent ${
                            supplierInfo.supplier_info.has_hotels
                              ? "border-green-600 dark:border-green-400 text-green-600 dark:text-green-400"
                              : "border-red-600 dark:border-red-400 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {supplierInfo.supplier_info.has_hotels ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4">
                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Last Checked
                          </span>
                        </div>
                        <p className="text-sm text-[rgb(var(--text-primary))]">
                          {new Date(
                            supplierInfo.supplier_info.last_checked,
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Last Updated
                          </span>
                        </div>
                        <p className="text-sm text-[rgb(var(--text-primary))]">
                          {new Date(
                            supplierInfo.supplier_info.last_updated,
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Info Section */}
                  <div className="border-t border-[rgb(var(--border-primary))] pt-6">
                    <h4 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary-color" />
                      Access Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <User className="w-4 h-4" />
                          <span className="text-sm font-medium">Username</span>
                        </div>
                        <p className="text-base font-semibold text-[rgb(var(--text-primary))]">
                          {supplierInfo.user_info.username}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-medium">User Role</span>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 border-primary-color text-primary-color bg-transparent">
                          {supplierInfo.user_info.user_role}
                        </span>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-medium">User ID</span>
                        </div>
                        <p className="text-sm font-mono text-[rgb(var(--text-primary))]">
                          {supplierInfo.user_info.user_id}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Access Level
                          </span>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 bg-transparent">
                          {supplierInfo.user_info.access_level}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Off Section */}
                  <div className="border-t border-[rgb(var(--border-primary))] pt-6">
                    <h4 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
                      Supplier Management
                    </h4>

                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                            Turn Off Supplier
                          </h5>
                          <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                            This will temporarily disable the supplier "
                            {selectedSupplierName}" from your active list. You
                            can reactivate it later from your admin panel.
                          </p>
                          <button
                            onClick={handleTurnOffSupplier}
                            disabled={turningOffSupplier}
                            className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                          >
                            {turningOffSupplier ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Turning Off...
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Turn Off Supplier
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-[rgb(var(--bg-primary))] border-t border-[rgb(var(--border-primary))] p-6">
              <button
                onClick={() => setShowSupplierModal(false)}
                className="w-full px-6 py-3 bg-primary-color text-white rounded-md hover:bg-primary-hover transition-all duration-200 font-medium hover:shadow-lg hover:scale-105 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Off Supplier Modal */}
      {showTempOffSupplierModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-2xl max-w-md w-full border border-[rgb(var(--border-primary))]">
            {/* Modal Header */}
            <div className="bg-[rgb(var(--bg-primary))] border-b border-[rgb(var(--border-primary))] p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                Turn On Supplier
              </h3>
              <button
                onClick={() => setShowTempOffSupplierModal(false)}
                className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      Activate Supplier
                    </h5>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                      This will reactivate the supplier "{selectedSupplierName}"
                      and move it back to your active suppliers list.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleTurnOnSupplier}
                        disabled={turningOnSupplier}
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                      >
                        {turningOnSupplier ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Activating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Turn On Supplier
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowTempOffSupplierModal(false)}
                        disabled={turningOnSupplier}
                        className="inline-flex items-center px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 text-sm font-medium rounded-md transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

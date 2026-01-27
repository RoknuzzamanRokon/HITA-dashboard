"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { BackendNotification } from "@/lib/api/notifications";
import { RealTimeTimestamp } from "@/lib/components/ui/real-time-timestamp";
import { getNotificationDisplayTimestamp } from "@/lib/utils/notification-helpers";
import { NotificationInspector } from "@/lib/components/debug/notification-inspector";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  AlertCircle,
  Info,
  Shield,
  Coins,
  Download,
  Key,
  Settings,
  Loader2,
  Search,
} from "lucide-react";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "system":
      return <Info className="w-5 h-5" />;
    case "permission":
      return <Shield className="w-5 h-5" />;
    case "export":
      return <Download className="w-5 h-5" />;
    case "point":
      return <Coins className="w-5 h-5" />;
    case "api_key":
      return <Key className="w-5 h-5" />;
    case "maintenance":
      return <Settings className="w-5 h-5" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
};

const getNotificationColor = (type: string, priority: string) => {
  if (priority === "critical") return "text-red-600 bg-red-50 border-red-200";
  if (priority === "high")
    return "text-orange-600 bg-orange-50 border-orange-200";

  switch (type) {
    case "system":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "permission":
      return "text-purple-600 bg-purple-50 border-purple-200";
    case "export":
      return "text-green-600 bg-green-50 border-green-200";
    case "point":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "api_key":
      return "text-indigo-600 bg-indigo-50 border-indigo-200";
    case "maintenance":
      return "text-gray-600 bg-gray-50 border-gray-200";
    default:
      return "text-blue-600 bg-blue-50 border-blue-200";
  }
};

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refresh,
    syncUnreadCount,
  } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [markingAsRead, setMarkingAsRead] = useState<Set<number>>(new Set());
  const [inspectingNotification, setInspectingNotification] =
    useState<BackendNotification | null>(null);

  // Auto-sync unread count when there's a mismatch
  useEffect(() => {
    const actualUnreadCount = notifications.filter(
      (n) => n.status === "unread",
    ).length;
    if (actualUnreadCount !== unreadCount && notifications.length > 0) {
      console.log("🔄 Auto-syncing unread count due to mismatch");
      syncUnreadCount();
    }
  }, [notifications, unreadCount, syncUnreadCount]);

  // Calculate actual unread count from notifications
  const actualUnreadCount = notifications.filter(
    (n) => n.status === "unread",
  ).length;
  const displayUnreadCount = actualUnreadCount; // Use actual count instead of API count

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    // Status filter
    if (filter === "unread" && notification.status !== "unread") return false;
    if (filter === "read" && notification.status !== "read") return false;

    // Type filter
    if (typeFilter !== "all" && notification.type !== typeFilter) return false;

    // Search filter
    if (
      searchQuery &&
      !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const handleMarkAsRead = async (notificationId: number) => {
    // Prevent multiple clicks
    if (markingAsRead.has(notificationId)) {
      console.log(
        `⏳ Already marking notification ${notificationId}, ignoring duplicate request`,
      );
      return;
    }

    try {
      setMarkingAsRead((prev) => new Set(prev).add(notificationId));
      console.log(
        `🖱️ UI: User clicked mark as read for notification ${notificationId}`,
      );

      // Find the notification to check its current state
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification) {
        console.log(`📊 Notification ${notificationId} current state:`, {
          id: notification.id,
          status: notification.status,
          title: notification.title,
          created_at: notification.created_at,
          meta_data: notification.meta_data,
        });
      }

      await markAsRead(notificationId);
      console.log(`✅ UI: Mark as read completed successfully`);

      // Force immediate refresh to ensure UI is in sync
      setTimeout(() => {
        console.log(
          "🔄 Notifications page: Force refreshing after mark as read",
        );
        refresh();
      }, 100); // Reduced delay
    } catch (err) {
      console.error(`❌ UI: Failed to mark notification as read:`, err);
    } finally {
      // Remove from loading set after a short delay to allow state to update
      setTimeout(() => {
        setMarkingAsRead((prev) => {
          const next = new Set(prev);
          next.delete(notificationId);
          return next;
        });
      }, 500);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      console.log(
        `🗑️ UI: User clicked delete for notification ${notificationId}`,
      );
      await deleteNotification(notificationId);
      console.log(`✅ UI: Delete completed successfully`);

      // Show success feedback
      console.log(`🎉 UI: Notification ${notificationId} deleted successfully`);
    } catch (err) {
      console.error(
        `❌ UI: Failed to delete notification ${notificationId}:`,
        err,
      );

      // Show specific error messages to user
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete notification";

      if (errorMessage.includes("Permission denied")) {
        console.error(
          `🚫 UI: Permission error - user cannot delete this notification`,
        );
        alert("Permission denied: You can only delete your own notifications");
      } else if (errorMessage.includes("Authentication failed")) {
        console.error(`🔒 UI: Authentication error - token expired`);
        alert("Authentication failed: Please login again");
      } else if (errorMessage.includes("not found")) {
        console.log(
          `⚠️ UI: Notification not found - may have been already deleted`,
        );
        // Don't show error to user, just refresh the list
      } else {
        console.error(`❌ UI: General delete error: ${errorMessage}`);
        alert(`Failed to delete notification: ${errorMessage}`);
      }
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-color" />
      </div>
    );
  }

  return (
    <div
      className="mx-auto px-4 sm:px-6 lg:px-8 py-8"
      style={{ position: "relative", zIndex: 1 }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-color rounded-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                Notifications
              </h1>
              <p className="text-[rgb(var(--text-secondary))]">
                {displayUnreadCount > 0
                  ? `${displayUnreadCount} unread notifications`
                  : "All caught up!"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-secondary))] rounded-lg transition-colors"
              title="Refresh notifications"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            <button
              onClick={() => {
                console.log("🔍 Manual sync triggered");
                syncUnreadCount();
              }}
              className="px-3 py-2 text-xs bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
              title="Sync unread count"
            >
              Sync Count
            </button>

            <button
              onClick={() => {
                console.log("🔄 Force refresh triggered");
                refresh();
              }}
              className="px-3 py-2 text-xs bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
              title="Force refresh notifications"
            >
              Force Refresh
            </button>

            {displayUnreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-primary-color text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
              >
                <CheckCheck className="w-4 h-4 mr-2 inline" />
                Mark All Read ({displayUnreadCount})
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-[rgb(var(--bg-secondary))] rounded-lg">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-tertiary))]" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-primary))] rounded-lg text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-primary-color"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "unread" | "read")
            }
            className="px-3 py-2 bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-primary))] rounded-lg text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary-color"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-primary))] rounded-lg text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary-color"
          >
            <option value="all">All Types</option>
            <option value="system">System</option>
            <option value="permission">Permission</option>
            <option value="export">Export</option>
            <option value="point">Points</option>
            <option value="api_key">API Key</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-[rgb(var(--text-tertiary))] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[rgb(var(--text-primary))] mb-2">
              {searchQuery || filter !== "all" || typeFilter !== "all"
                ? "No notifications match your filters"
                : "No notifications yet"}
            </h3>
            <p className="text-[rgb(var(--text-secondary))]">
              {searchQuery || filter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "You'll see notifications here when you receive them"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const isMarking = markingAsRead.has(notification.id);
            return (
              <div
                key={notification.id}
                onClick={async (e) => {
                  // Don't handle click if already marking as read
                  if (isMarking) {
                    console.log(
                      `⏳ Already marking notification ${notification.id} as read, ignoring click`,
                    );
                    return;
                  }

                  // Don't handle click if user clicked on a button or link
                  const target = e.target as HTMLElement;
                  if (target.closest("button") || target.closest("a")) {
                    console.log(
                      `🖱️ Click on button/link detected, ignoring notification click`,
                    );
                    return;
                  }

                  // Only mark as read if notification is currently unread
                  if (notification.status === "unread") {
                    console.log(
                      `📖 Notification ${notification.id} clicked - marking as read`,
                    );
                    console.log(
                      `📊 Current notification status:`,
                      notification.status,
                    );
                    console.log(`📊 Full notification object:`, notification);
                    await handleMarkAsRead(notification.id);
                  } else {
                    console.log(
                      `ℹ️ Notification ${notification.id} is already read, no action needed`,
                    );
                    console.log(
                      `📊 Current notification status:`,
                      notification.status,
                    );
                  }
                }}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  notification.status === "unread"
                    ? "bg-blue-50/50 border-blue-200 shadow-sm cursor-pointer"
                    : "bg-[rgb(var(--bg-primary))] border-[rgb(var(--border-primary))]"
                } ${isMarking ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-lg border ${getNotificationColor(
                      notification.type,
                      notification.priority,
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className={`text-sm font-semibold ${
                          notification.status === "unread"
                            ? "text-[rgb(var(--text-primary))]"
                            : "text-[rgb(var(--text-secondary))]"
                        }`}
                      >
                        {notification.title}
                      </h3>

                      <div className="flex items-center space-x-2 ml-4">
                        {notification.priority === "critical" && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Critical
                          </span>
                        )}
                        {notification.priority === "high" && (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                            High
                          </span>
                        )}
                        <span className="text-xs text-[rgb(var(--text-tertiary))]">
                          <RealTimeTimestamp
                            dateString={getNotificationDisplayTimestamp(
                              notification,
                            )}
                            className="text-xs text-[rgb(var(--text-tertiary))]"
                            updateInterval={5000}
                          />
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-[rgb(var(--text-secondary))] mb-3">
                      {notification.message}
                    </p>

                    {/* Timing and Metadata Information */}
                    {notification.meta_data && (
                      <div className="mb-3 p-2 bg-[rgb(var(--bg-secondary))] rounded-md border border-[rgb(var(--border-primary))]">
                        <div className="text-xs text-[rgb(var(--text-tertiary))] space-y-1">
                          {notification.meta_data.sent_by && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Sent by:</span>
                              <span>{notification.meta_data.sent_by}</span>
                              {notification.meta_data.sent_by_role && (
                                <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                  {notification.meta_data.sent_by_role}
                                </span>
                              )}
                            </div>
                          )}
                          {notification.meta_data.sent_at && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Sent at:</span>
                              <span>
                                <RealTimeTimestamp
                                  dateString={notification.meta_data.sent_at}
                                  className="text-xs"
                                  updateInterval={30000}
                                />
                              </span>
                            </div>
                          )}
                          {notification.meta_data.source && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Source:</span>
                              <span className="capitalize">
                                {notification.meta_data.source.replace(
                                  "_",
                                  " ",
                                )}
                              </span>
                            </div>
                          )}
                          {notification.meta_data.supplier_name && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Supplier:</span>
                              <span className="font-mono">
                                {notification.meta_data.supplier_name}
                              </span>
                              {notification.meta_data.action && (
                                <span
                                  className={`px-1 py-0.5 rounded text-xs ${
                                    notification.meta_data.action ===
                                    "activated"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-orange-100 text-orange-800"
                                  }`}
                                >
                                  {notification.meta_data.action}
                                </span>
                              )}
                            </div>
                          )}
                          {notification.meta_data.change_time && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Changed at:</span>
                              <span>
                                <RealTimeTimestamp
                                  dateString={
                                    notification.meta_data.change_time
                                  }
                                  className="text-xs"
                                  updateInterval={30000}
                                />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {notification.status === "unread" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(
                              `🖱️ Mark as read button clicked for notification ${notification.id}`,
                            );
                            if (!isMarking) {
                              handleMarkAsRead(notification.id);
                            } else {
                              console.log(
                                `⏳ Already marking notification ${notification.id}, ignoring button click`,
                              );
                            }
                          }}
                          disabled={isMarking}
                          className={`text-xs font-medium flex items-center space-x-1 ${
                            isMarking
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-blue-600 hover:text-blue-700"
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>
                            {isMarking ? "Marking..." : "Mark as read"}
                          </span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>

                      {process.env.NODE_ENV === "development" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectingNotification(notification);
                          }}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>Debug</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load More */}
      {hasMore && filteredNotifications.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 bg-[rgb(var(--bg-secondary))] hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-primary))] rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}

      {/* Debug Inspector */}
      {inspectingNotification && (
        <NotificationInspector
          notification={inspectingNotification}
          onClose={() => setInspectingNotification(null)}
        />
      )}
    </div>
  );
}

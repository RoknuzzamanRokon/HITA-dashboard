"use client";

import React, { useState } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { NotificationService } from "@/lib/api/notifications";
import { useNotification } from "@/lib/components/notifications/notification-provider";
import {
  Send,
  Users,
  User,
  AlertCircle,
  Loader2,
  Bell,
  Radio,
  MessageSquare,
} from "lucide-react";

const notificationTypes = [
  {
    value: "system",
    label: "System",
    icon: "🔧",
    description: "System announcements and updates",
  },
  {
    value: "permission",
    label: "Permission",
    icon: "🔐",
    description: "Access and permission changes",
  },
  {
    value: "export",
    label: "Export",
    icon: "📥",
    description: "Export completion notifications",
  },
  {
    value: "point",
    label: "Points",
    icon: "🪙",
    description: "Point transactions and updates",
  },
  {
    value: "api_key",
    label: "API Key",
    icon: "🔑",
    description: "API key related events",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    icon: "⚠️",
    description: "System maintenance alerts",
  },
];

const priorityLevels = [
  { value: "low", label: "Low", color: "text-gray-600 bg-gray-100" },
  { value: "medium", label: "Medium", color: "text-blue-600 bg-blue-100" },
  { value: "high", label: "High", color: "text-orange-600 bg-orange-100" },
  { value: "critical", label: "Critical", color: "text-red-600 bg-red-100" },
];

export default function AdminNotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [mode, setMode] = useState<"single" | "broadcast">("single");
  const [formData, setFormData] = useState({
    user_id: "",
    type: "system" as const,
    title: "",
    message: "",
    priority: "medium" as const,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has admin permissions
  const isAdmin = user?.role === "super_user" || user?.role === "admin_user";

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    }
    if (!formData.message.trim()) {
      setError("Message is required");
      return false;
    }
    if (mode === "single" && !formData.user_id.trim()) {
      setError("User ID is required for single notifications");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      if (mode === "single") {
        await NotificationService.createNotification({
          user_id: formData.user_id,
          type: formData.type,
          title: formData.title,
          message: formData.message,
          priority: formData.priority,
          meta_data: {
            sent_by: user?.username || "admin",
            sent_by_role: user?.role || "admin",
            sent_at: new Date().toISOString(),
            notification_source: "admin_panel",
            target_type: "single_user",
            admin_message: true,
            test_field: "This is a test to verify meta_data works",
            form_data_snapshot: {
              type: formData.type,
              priority: formData.priority,
              title_length: formData.title.length,
              message_length: formData.message.length,
            },
          },
        });

        addNotification({
          type: "success",
          title: "Notification Sent",
          message: `Notification sent successfully to user ${
            formData.user_id
          } at ${new Date().toLocaleString()}`,
          autoDismiss: true,
          duration: 7000,
        });
      } else {
        await NotificationService.broadcastNotification({
          type: formData.type,
          title: formData.title,
          message: formData.message,
          priority: formData.priority,
          meta_data: {
            sent_by: user?.username || "admin",
            sent_by_role: user?.role || "admin",
            sent_at: new Date().toISOString(),
            notification_source: "admin_panel",
            target_type: "broadcast",
            admin_message: true,
            broadcast_timestamp: new Date().toISOString(),
          },
        });

        addNotification({
          type: "success",
          title: "Broadcast Sent",
          message: `Notification broadcasted successfully to all users at ${new Date().toLocaleString()}`,
          autoDismiss: true,
          duration: 7000,
        });
      }

      // Reset form
      setFormData({
        user_id: "",
        type: "system",
        title: "",
        message: "",
        priority: "medium",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send notification";
      setError(errorMessage);

      addNotification({
        type: "error",
        title: "Failed to Send Notification",
        message: errorMessage,
        autoDismiss: false,
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-color" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-2">
            Access Denied
          </h1>
          <p className="text-[rgb(var(--text-secondary))]">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-color rounded-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              Send Notifications
            </h1>
            <p className="text-[rgb(var(--text-secondary))]">
              Create and send notifications to users
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center space-x-4 p-4 bg-[rgb(var(--bg-secondary))] rounded-lg">
          <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
            Send to:
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMode("single")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "single"
                  ? "bg-primary-color text-white"
                  : "bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Single User</span>
            </button>
            <button
              onClick={() => setMode("broadcast")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "broadcast"
                  ? "bg-primary-color text-white"
                  : "bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Users</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[rgb(var(--bg-primary))] rounded-lg border border-[rgb(var(--border-primary))] p-6">
          {/* User ID (only for single mode) */}
          {mode === "single" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                User ID
              </label>
              <input
                type="text"
                value={formData.user_id}
                onChange={(e) => handleInputChange("user_id", e.target.value)}
                placeholder="Enter user ID (e.g., 1a203ccda4)"
                className="w-full px-4 py-3 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-lg text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-primary-color"
                required={mode === "single"}
              />
              <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1">
                The unique identifier of the user to send the notification to
              </p>
            </div>
          )}

          {/* Notification Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
              Notification Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {notificationTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange("type", type.value)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    formData.type === type.value
                      ? "border-primary-color bg-primary-light text-primary-color"
                      : "border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] hover:border-primary-color"
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg">{type.icon}</span>
                    <span className="font-medium">{type.label}</span>
                  </div>
                  <p className="text-xs text-[rgb(var(--text-secondary))]">
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
              Priority Level
            </label>
            <div className="flex flex-wrap gap-2">
              {priorityLevels.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleInputChange("priority", priority.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.priority === priority.value
                      ? `${priority.color} ring-2 ring-offset-2 ring-current`
                      : "bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))]"
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter notification title"
              className="w-full px-4 py-3 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-lg text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-primary-color"
              required
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Enter notification message"
              rows={4}
              className="w-full px-4 py-3 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-lg text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-primary-color resize-vertical"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-[rgb(var(--text-tertiary))]">
              <span>Notification will be sent at: </span>
              <span className="font-mono">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    user_id: "",
                    type: "system",
                    title: "",
                    message: "",
                    priority: "medium",
                  });
                  setError(null);
                }}
                className="px-6 py-3 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-primary-color text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    {mode === "broadcast" ? (
                      <Radio className="w-4 h-4" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>
                      {mode === "broadcast"
                        ? "Broadcast to All"
                        : "Send Notification"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Bell className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Notification Guidelines
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Use clear, concise titles that describe the notification
                purpose
              </li>
              <li>• Keep messages informative but brief</li>
              <li>
                • Choose appropriate priority levels (Critical for urgent system
                issues)
              </li>
              <li>• Single notifications require a valid user ID</li>
              <li>• Broadcast notifications are sent to all active users</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

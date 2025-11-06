/**
 * Live Activity Feed Component
 * Shows real-time user activities and system events
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  UserPlus,
  LogIn,
  LogOut,
  Coins,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type:
    | "user_login"
    | "user_logout"
    | "user_created"
    | "points_awarded"
    | "system_event"
    | "api_request";
  message: string;
  timestamp: Date;
  user?: string;
  severity: "info" | "success" | "warning" | "error";
}

interface LiveActivityFeedProps {
  isEnabled: boolean;
  maxItems?: number;
  compact?: boolean;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  isEnabled,
  maxItems = 10,
  compact = false,
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Generate mock activities (in a real app, this would come from WebSocket or SSE)
  useEffect(() => {
    if (!isEnabled) return;

    const generateActivity = (): ActivityItem => {
      const types: ActivityItem["type"][] = [
        "user_login",
        "user_logout",
        "user_created",
        "points_awarded",
        "system_event",
        "api_request",
      ];
      const users = [
        "john_doe",
        "jane_smith",
        "admin_user",
        "test_user",
        "alice_wonder",
      ];
      const type = types[Math.floor(Math.random() * types.length)];
      const user = users[Math.floor(Math.random() * users.length)];

      const messages = {
        user_login: `${user} logged in successfully`,
        user_logout: `${user} logged out`,
        user_created: `New user ${user} was created`,
        points_awarded: `${Math.floor(
          Math.random() * 1000
        )} points awarded to ${user}`,
        system_event: "System health check completed",
        api_request: `API request processed for ${user}`,
      };

      const severities: Record<ActivityItem["type"], ActivityItem["severity"]> =
        {
          user_login: "success",
          user_logout: "info",
          user_created: "success",
          points_awarded: "success",
          system_event: "info",
          api_request: "info",
        };

      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        message: messages[type],
        timestamp: new Date(),
        user: type.includes("user") ? user : undefined,
        severity: severities[type],
      };
    };

    // Add initial activities
    const initialActivities = Array.from({ length: 5 }, generateActivity);
    setActivities(initialActivities);

    // Add new activity every 3-8 seconds
    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setActivities((prev) => [newActivity, ...prev.slice(0, maxItems - 1)]);
    }, Math.random() * 5000 + 3000);

    return () => clearInterval(interval);
  }, [isEnabled, maxItems]);

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "user_login":
        return <LogIn className="w-4 h-4" />;
      case "user_logout":
        return <LogOut className="w-4 h-4" />;
      case "user_created":
        return <UserPlus className="w-4 h-4" />;
      case "points_awarded":
        return <Coins className="w-4 h-4" />;
      case "system_event":
        return <Settings className="w-4 h-4" />;
      case "api_request":
        return <User className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: ActivityItem["severity"]) => {
    switch (severity) {
      case "success":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "error":
        return "text-red-600 bg-red-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Live Activity Feed
        </h3>
        <div className="flex items-center space-x-2">
          {isEnabled && (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Live</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div
                className={`p-2 rounded-full ${getSeverityColor(
                  activity.severity
                )}`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.message}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                  {activity.user && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {activity.user}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!isEnabled && (
        <div className="text-center py-4 text-gray-400">
          <p className="text-sm">Real-time updates disabled</p>
        </div>
      )}
    </div>
  );
};

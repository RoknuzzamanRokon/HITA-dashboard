/**
 * Quick Actions Panel
 * Provides quick access to common dashboard actions
 */

"use client";

import React from "react";
import {
  UserPlus,
  Users,
  Settings,
  Download,
  Upload,
  BarChart3,
  Database,
  RefreshCw,
} from "lucide-react";

interface QuickActionsProps {
  onRefreshData?: () => void;
  isLoading?: boolean;
  compact?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onRefreshData,
  isLoading = false,
  compact = false,
}) => {
  const actions = [
    {
      id: "create-user",
      label: "Create User",
      icon: <UserPlus className="w-5 h-5" />,
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => {
        // Navigate to user creation
        window.location.href = "/dashboard/users/create";
      },
    },
    {
      id: "manage-users",
      label: "Manage Users",
      icon: <Users className="w-5 h-5" />,
      color: "bg-green-500 hover:bg-green-600",
      onClick: () => {
        // Navigate to user management
        window.location.href = "/dashboard/users";
      },
    },
    {
      id: "system-settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: () => {
        alert("Settings panel coming soon!");
      },
    },
    {
      id: "export-data",
      label: "Export Data",
      icon: <Download className="w-5 h-5" />,
      color: "bg-orange-500 hover:bg-orange-600",
      onClick: () => {
        // Simulate data export
        const data = {
          timestamp: new Date().toISOString(),
          stats: "Dashboard statistics would be exported here",
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dashboard-export-${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
    },
    {
      id: "import-data",
      label: "Import Data",
      icon: <Upload className="w-5 h-5" />,
      color: "bg-teal-500 hover:bg-teal-600",
      onClick: () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,.csv";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            alert(
              `File "${file.name}" selected for import. Import functionality coming soon!`
            );
          }
        };
        input.click();
      },
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "bg-indigo-500 hover:bg-indigo-600",
      onClick: () => {
        alert("Advanced analytics panel coming soon!");
      },
    },
    {
      id: "database",
      label: "Database",
      icon: <Database className="w-5 h-5" />,
      color: "bg-gray-500 hover:bg-gray-600",
      onClick: () => {
        alert("Database management panel coming soon!");
      },
    },
    {
      id: "refresh",
      label: "Refresh All",
      icon: (
        <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
      ),
      color: "bg-red-500 hover:bg-red-600",
      onClick: onRefreshData,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={isLoading && action.id === "refresh"}
            className={`
              ${action.color} text-white p-4 rounded-lg transition-all duration-200 
              transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
              flex flex-col items-center space-y-2 min-h-[80px] justify-center
            `}
          >
            {action.icon}
            <span className="text-sm font-medium text-center">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Quick access to common tasks</span>
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>All systems operational</span>
          </span>
        </div>
      </div>
    </div>
  );
};

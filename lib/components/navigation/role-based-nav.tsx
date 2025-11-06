/**
 * Role-Based Navigation Component
 * Shows different navigation items based on user permissions
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { PermissionGuard } from "@/lib/components/auth/permission-guard";
import { Permission } from "@/lib/utils/rbac";
import { cn } from "@/lib/utils";
import {
  Users,
  BarChart3,
  Building2,
  FileText,
  Settings,
  Shield,
  Coins,
  Activity,
  Home,
  UserCog,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  permissions?: Permission[];
  description?: string;
}

const navigationItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and statistics",
  },
  {
    name: "User Management",
    href: "/dashboard/users",
    icon: Users,
    permission: Permission.VIEW_ALL_USERS,
    description: "Manage users and roles",
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    permission: Permission.VIEW_ANALYTICS,
    description: "View detailed analytics",
  },
  {
    name: "Hotels",
    href: "/dashboard/hotels",
    icon: Building2,
    permission: Permission.VIEW_ALL_HOTELS,
    description: "Manage hotel listings",
  },
  {
    name: "Content",
    href: "/dashboard/content",
    icon: FileText,
    permission: Permission.VIEW_ALL_CONTENT,
    description: "Manage content and media",
  },
  {
    name: "Providers",
    href: "/dashboard/providers",
    icon: UserCog,
    permission: Permission.VIEW_ALL_PROVIDERS,
    description: "Manage service providers",
  },
  {
    name: "Points & Transactions",
    href: "/dashboard/points",
    icon: Coins,
    permission: Permission.VIEW_ALL_TRANSACTIONS,
    description: "Manage points and transactions",
  },
  {
    name: "System Settings",
    href: "/dashboard/settings",
    icon: Settings,
    permission: Permission.VIEW_SYSTEM_SETTINGS,
    description: "System configuration",
  },
];

interface RoleBasedNavProps {
  className?: string;
  variant?: "sidebar" | "horizontal" | "grid";
  compact?: boolean;
}

export function RoleBasedNav({
  className,
  variant = "sidebar",
  compact = false,
}: RoleBasedNavProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    const content = (
      <Link
        href={item.href}
        className={cn(
          "group flex items-center transition-colors duration-200",
          variant === "sidebar" && "px-3 py-2 rounded-md text-sm font-medium",
          variant === "horizontal" &&
            "px-4 py-2 rounded-md text-sm font-medium",
          variant === "grid" &&
            "p-4 rounded-lg border text-center flex-col space-y-2",
          isActive
            ? "bg-blue-100 text-blue-700 border-blue-200"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-200",
          variant === "grid" && !isActive && "hover:border-gray-300"
        )}
      >
        <Icon
          className={cn(
            "flex-shrink-0",
            variant === "sidebar" && "mr-3 h-5 w-5",
            variant === "horizontal" && "mr-2 h-4 w-4",
            variant === "grid" && "h-8 w-8 mx-auto",
            isActive
              ? "text-blue-500"
              : "text-gray-400 group-hover:text-gray-500"
          )}
        />
        <span className={variant === "grid" ? "text-sm font-medium" : ""}>
          {item.name}
        </span>
        {variant === "grid" && item.description && (
          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
        )}
      </Link>
    );

    // Wrap with permission guard if permissions are specified
    if (item.permission || item.permissions) {
      return (
        <PermissionGuard
          key={item.href}
          permission={item.permission}
          permissions={item.permissions}
        >
          {content}
        </PermissionGuard>
      );
    }

    return <div key={item.href}>{content}</div>;
  };

  if (variant === "grid") {
    return (
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
          className
        )}
      >
        {navigationItems.map(renderNavItem)}
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <nav className={cn("flex space-x-4", className)}>
        {navigationItems.map(renderNavItem)}
      </nav>
    );
  }

  // Default sidebar variant
  return (
    <nav className={cn("space-y-1", className)}>
      {navigationItems.map(renderNavItem)}
    </nav>
  );
}

/**
 * Role-based quick actions component
 */
export function RoleBasedQuickActions() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PermissionGuard permission={Permission.CREATE_USERS}>
          <Link
            href="/dashboard/users/create"
            className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Users className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-blue-900">
              Create User
            </span>
          </Link>
        </PermissionGuard>

        <PermissionGuard permission={Permission.VIEW_ANALYTICS}>
          <Link
            href="/dashboard/analytics"
            className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <BarChart3 className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-green-900">
              View Analytics
            </span>
          </Link>
        </PermissionGuard>

        <PermissionGuard permission={Permission.MANAGE_SYSTEM_SETTINGS}>
          <Link
            href="/dashboard/settings"
            className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Settings className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-purple-900">
              System Settings
            </span>
          </Link>
        </PermissionGuard>

        <PermissionGuard permission={Permission.GIVE_POINTS}>
          <Link
            href="/dashboard/points/give"
            className="flex items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <Coins className="h-5 w-5 text-yellow-600 mr-3" />
            <span className="text-sm font-medium text-yellow-900">
              Give Points
            </span>
          </Link>
        </PermissionGuard>

        {/* Always show profile link */}
        <Link
          href="/dashboard/profile"
          className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Shield className="h-5 w-5 text-gray-600 mr-3" />
          <span className="text-sm font-medium text-gray-900">My Profile</span>
        </Link>
      </div>
    </div>
  );
}

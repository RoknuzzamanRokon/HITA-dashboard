/**
 * Permission Guard Component
 * Conditionally renders content based on user permissions
 */

"use client";

import React from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  Permission,
} from "@/lib/utils/rbac";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission
  fallback?: React.ReactNode;
  showForRoles?: string[]; // Alternative: show for specific roles
}

/**
 * Component that conditionally renders children based on user permissions
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  showForRoles,
}: PermissionGuardProps) {
  const { user } = useAuth();

  // Check role-based access if showForRoles is specified
  if (showForRoles && showForRoles.length > 0) {
    const hasRole = user && showForRoles.includes(user.role);
    return hasRole ? <>{children}</> : <>{fallback}</>;
  }

  // Check single permission
  if (permission) {
    const hasAccess = hasPermission(user, permission);
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(user, permissions)
      : hasAnyPermission(user, permissions);
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // If no permissions specified, render children
  return <>{children}</>;
}

/**
 * Hook to check permissions in components
 */
export function usePermissions() {
  const { user } = useAuth();

  return {
    hasPermission: (permission: Permission) => hasPermission(user, permission),
    hasAnyPermission: (permissions: Permission[]) =>
      hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions: Permission[]) =>
      hasAllPermissions(user, permissions),
    isAdmin: user?.role === "admin_user",
    isSuper: user?.role === "super_user",
    isGeneral: user?.role === "general_user",
    canManageUsers: hasPermission(user, Permission.VIEW_ALL_USERS),
    canCreateUsers: hasPermission(user, Permission.CREATE_USERS),
    canDeleteUsers: hasPermission(user, Permission.DELETE_USERS),
    canViewAnalytics: hasPermission(user, Permission.VIEW_ANALYTICS),
    canManageSystem: hasPermission(user, Permission.MANAGE_SYSTEM_SETTINGS),
  };
}

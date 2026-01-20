/**
 * Navigation Guard Hook
 * Provides role-based route protection and access control
 */

"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { UserRole } from "@/lib/types/auth";

interface RouteConfig {
    path: string;
    requiredRoles: UserRole[];
    redirectTo?: string;
}

// Route configuration with required roles
const routeConfigs: RouteConfig[] = [
    {
        path: "/dashboard",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER, UserRole.GENERAL_USER],
    },
    {
        path: "/users",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER],
        redirectTo: "/dashboard",
    },
    {
        path: "/dashboard/users",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER],
        redirectTo: "/dashboard",
    },
    {
        path: "/hotels",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER, UserRole.GENERAL_USER],
    },
    {
        path: "/providers",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER, UserRole.GENERAL_USER],
    },
    {
        path: "/dashboard/exports",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER, UserRole.GENERAL_USER],
    },
    {
        path: "/dashboard/documentation",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER, UserRole.GENERAL_USER],
    },
    {
        path: "/billing",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER],
        redirectTo: "/dashboard",
    },
    {
        path: "/sync",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER],
        redirectTo: "/dashboard",
    },
    {
        path: "/dashboard/issues",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER, UserRole.GENERAL_USER],
    },
    {
        path: "/admin",
        requiredRoles: [UserRole.SUPER_USER],
        redirectTo: "/dashboard",
    },
];

export function useNavigationGuard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Don't check access while loading or if not authenticated
        if (isLoading || !isAuthenticated || !user) {
            return;
        }

        // Find matching route configuration
        const routeConfig = routeConfigs.find((config) =>
            pathname.startsWith(config.path)
        );

        if (routeConfig) {
            // Check if user has required role
            const hasAccess = routeConfig.requiredRoles.includes(user.role);

            if (!hasAccess) {
                // Redirect to specified route or dashboard
                const redirectTo = routeConfig.redirectTo || "/dashboard";
                router.replace(redirectTo);
            }
        }
    }, [user, isAuthenticated, isLoading, pathname, router]);

    /**
     * Check if user has access to a specific route
     */
    const hasRouteAccess = (path: string): boolean => {
        if (!user) return false;

        const routeConfig = routeConfigs.find((config) =>
            path.startsWith(config.path)
        );

        if (!routeConfig) return true; // Allow access to unprotected routes

        return routeConfig.requiredRoles.includes(user.role);
    };

    /**
     * Check if user has specific role
     */
    const hasRole = (role: UserRole): boolean => {
        return user?.role === role;
    };

    /**
     * Check if user has any of the specified roles
     */
    const hasAnyRole = (roles: UserRole[]): boolean => {
        return user ? roles.includes(user.role) : false;
    };

    /**
     * Get user's role hierarchy level (higher number = more permissions)
     */
    const getRoleLevel = (): number => {
        if (!user) return 0;

        switch (user.role) {
            case UserRole.SUPER_USER:
                return 3;
            case UserRole.ADMIN_USER:
                return 2;
            case UserRole.GENERAL_USER:
                return 1;
            default:
                return 0;
        }
    };

    /**
     * Check if user can perform admin actions
     */
    const canPerformAdminActions = (): boolean => {
        return hasAnyRole([UserRole.SUPER_USER, UserRole.ADMIN_USER]);
    };

    /**
     * Check if user can manage other users
     */
    const canManageUsers = (): boolean => {
        return hasAnyRole([UserRole.SUPER_USER, UserRole.ADMIN_USER]);
    };

    /**
     * Check if user can access system administration
     */
    const canAccessSystemAdmin = (): boolean => {
        return hasRole(UserRole.SUPER_USER);
    };

    return {
        hasRouteAccess,
        hasRole,
        hasAnyRole,
        getRoleLevel,
        canPerformAdminActions,
        canManageUsers,
        canAccessSystemAdmin,
        user,
        isAuthenticated,
        isLoading,
    };
}
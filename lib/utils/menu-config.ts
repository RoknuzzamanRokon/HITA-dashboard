/**
 * Menu Configuration Utility
 * Provides dynamic menu configuration based on user roles and permissions
 */

import {
    Home,
    Users,
    Building2,
    Database,
    Download,
    CreditCard,
    Activity,
    MessageSquare,
    Settings,
    UserCheck,
    BarChart3,
    Shield,
    FileText,
    Search,
    User,
} from "lucide-react";
import { UserRole } from "@/lib/types/auth";

export interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    requiredRoles: UserRole[];
    description?: string;
    badge?: string;
    children?: MenuItem[];
}

export interface MenuSection {
    id: string;
    label: string;
    items: MenuItem[];
}

// Main navigation menu items
export const mainMenuItems: MenuItem[] = [
    {
        id: "dashboard",
        label: "Dashboard",
        icon: Home,
        path: "/dashboard",
        description: "Overview and system statistics",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER, UserRole.GENERAL_USER],
    },
    {
        id: "profile",
        label: "Profile",
        icon: User,
        path: "/dashboard/profile",
        description: "View and manage your profile",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER, UserRole.GENERAL_USER],
    },
    {
        id: "users",
        label: "User Management",
        icon: Users,
        path: "/dashboard/users",
        description: "Manage system users and permissions",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER],
    },
    {
        id: "hotels",
        label: "Hotel Search",
        icon: Building2,
        path: "/dashboard/hotels",
        description: "Search and view hotel information",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER, UserRole.GENERAL_USER],
    },
    {
        id: "providers",
        label: "Provider Content",
        icon: Database,
        path: "/dashboard/provider",
        description: "Manage provider content and mappings",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER, UserRole.GENERAL_USER],
    },
    {
        id: "exports",
        label: "Content Export",
        icon: Download,
        path: "/exports",
        description: "Download and export content data",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER, UserRole.GENERAL_USER],
    },
];

// Administrative menu items
export const adminMenuItems: MenuItem[] = [
    {
        id: "billing",
        label: "Billing & Points",
        icon: CreditCard,
        path: "/billing",
        description: "Manage user points and billing",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER],
    },
    {
        id: "sync",
        label: "Sync History",
        icon: Activity,
        path: "/sync",
        description: "Monitor content synchronization",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER],
    },
    {
        id: "issues",
        label: "Report Issues",
        icon: MessageSquare,
        path: "/issues",
        description: "Report and track system issues",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER, UserRole.GENERAL_USER],
    },
];

// System administration menu items
export const systemMenuItems: MenuItem[] = [
    {
        id: "admin",
        label: "System Admin",
        icon: Settings,
        path: "/admin",
        description: "System configuration and management",
        requiredRoles: [UserRole.SUPER_USER],
        children: [
            {
                id: "admin-dashboard",
                label: "Admin Dashboard",
                icon: BarChart3,
                path: "/admin/dashboard",
                description: "System metrics and health",
                requiredRoles: [UserRole.SUPER_USER],
            },
            {
                id: "admin-permissions",
                label: "Permissions",
                icon: Shield,
                path: "/admin/permissions",
                description: "Manage user permissions",
                requiredRoles: [UserRole.SUPER_USER],
            },
            {
                id: "admin-config",
                label: "Configuration",
                icon: Settings,
                path: "/admin/config",
                description: "System configuration",
                requiredRoles: [UserRole.SUPER_USER],
            },
        ],
    },
];

// Grouped menu sections
export const menuSections: MenuSection[] = [
    {
        id: "main",
        label: "Main",
        items: mainMenuItems,
    },
    {
        id: "admin",
        label: "Administration",
        items: adminMenuItems,
    },
    {
        id: "system",
        label: "System",
        items: systemMenuItems,
    },
];

/**
 * Get menu items filtered by user role
 */
export function getMenuItemsByRole(userRole: UserRole): MenuItem[] {
    const allItems = [...mainMenuItems, ...adminMenuItems, ...systemMenuItems];

    return allItems.filter((item) => item.requiredRoles.includes(userRole));
}

/**
 * Get menu sections filtered by user role
 */
export function getMenuSectionsByRole(userRole: UserRole): MenuSection[] {
    return menuSections
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => item.requiredRoles.includes(userRole)),
        }))
        .filter((section) => section.items.length > 0);
}

/**
 * Check if user has access to a menu item
 */
export function hasMenuAccess(item: MenuItem, userRole: UserRole): boolean {
    return item.requiredRoles.includes(userRole);
}

/**
 * Get breadcrumb items for a given path
 */
export function getBreadcrumbs(pathname: string, userRole: UserRole): Array<{ label: string; path: string }> {
    const allItems = getMenuItemsByRole(userRole);
    const breadcrumbs: Array<{ label: string; path: string }> = [];

    // Find matching menu item
    const findMenuItem = (items: MenuItem[], path: string): MenuItem | null => {
        for (const item of items) {
            if (path.startsWith(item.path)) {
                return item;
            }
            if (item.children) {
                const childItem = findMenuItem(item.children, path);
                if (childItem) return childItem;
            }
        }
        return null;
    };

    const matchedItem = findMenuItem(allItems, pathname);

    if (matchedItem) {
        // Add home breadcrumb
        breadcrumbs.push({ label: "Dashboard", path: "/dashboard" });

        // Add current page breadcrumb
        if (matchedItem.path !== "/dashboard") {
            breadcrumbs.push({ label: matchedItem.label, path: matchedItem.path });
        }
    }

    return breadcrumbs;
}

/**
 * Get quick actions based on user role
 */
export function getQuickActions(userRole: UserRole): MenuItem[] {
    const quickActions: MenuItem[] = [];

    // Add role-specific quick actions
    if (userRole === UserRole.SUPER_USER || userRole === UserRole.ADMIN_USER) {
        quickActions.push(
            {
                id: "quick-user-create",
                label: "Create User",
                icon: UserCheck,
                path: "/users/create",
                requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER],
            },
            {
                id: "quick-export",
                label: "Export Data",
                icon: Download,
                path: "/exports",
                requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER, UserRole.GENERAL_USER],
            }
        );
    }

    // Add search action for all users
    quickActions.push({
        id: "quick-search",
        label: "Search Hotels",
        icon: Search,
        path: "/dashboard/hotels",
        requiredRoles: [UserRole.SUPER_USER, UserRole.ADMIN_USER, UserRole.GENERAL_USER],
    });

    return quickActions.filter((action) => action.requiredRoles.includes(userRole));
}
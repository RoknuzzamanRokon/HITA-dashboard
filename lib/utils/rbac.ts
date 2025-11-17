/**
 * Role-Based Access Control (RBAC) utilities
 * Manages permissions and access control for different user roles
 */

import { UserRole } from '@/lib/types/auth';
import type { User } from '@/lib/types/auth';

// Define permissions for different features
export enum Permission {
    // User Management
    VIEW_ALL_USERS = 'view_all_users',
    CREATE_USERS = 'create_users',
    EDIT_USERS = 'edit_users',
    DELETE_USERS = 'delete_users',
    MANAGE_USER_ROLES = 'manage_user_roles',

    // Dashboard & Analytics
    VIEW_DASHBOARD_STATS = 'view_dashboard_stats',
    VIEW_ANALYTICS = 'view_analytics',
    EXPORT_DATA = 'export_data',

    // Hotel Management
    VIEW_ALL_HOTELS = 'view_all_hotels',
    CREATE_HOTELS = 'create_hotels',
    EDIT_HOTELS = 'edit_hotels',
    DELETE_HOTELS = 'delete_hotels',

    // Content Management
    VIEW_ALL_CONTENT = 'view_all_content',
    CREATE_CONTENT = 'create_content',
    EDIT_CONTENT = 'edit_content',
    DELETE_CONTENT = 'delete_content',

    // Provider Management
    VIEW_ALL_PROVIDERS = 'view_all_providers',
    MANAGE_PROVIDERS = 'manage_providers',

    // System Settings
    VIEW_SYSTEM_SETTINGS = 'view_system_settings',
    MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',

    // Points & Transactions
    VIEW_ALL_TRANSACTIONS = 'view_all_transactions',
    MANAGE_POINTS = 'manage_points',
    GIVE_POINTS = 'give_points',
}

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.SUPER_USER]: [
        // Super users have ALL permissions
        Permission.VIEW_ALL_USERS,
        Permission.CREATE_USERS,
        Permission.EDIT_USERS,
        Permission.DELETE_USERS,
        Permission.MANAGE_USER_ROLES,
        Permission.VIEW_DASHBOARD_STATS,
        Permission.VIEW_ANALYTICS,
        Permission.EXPORT_DATA,
        Permission.VIEW_ALL_HOTELS,
        Permission.CREATE_HOTELS,
        Permission.EDIT_HOTELS,
        Permission.DELETE_HOTELS,
        Permission.VIEW_ALL_CONTENT,
        Permission.CREATE_CONTENT,
        Permission.EDIT_CONTENT,
        Permission.DELETE_CONTENT,
        Permission.VIEW_ALL_PROVIDERS,
        Permission.MANAGE_PROVIDERS,
        Permission.VIEW_SYSTEM_SETTINGS,
        Permission.MANAGE_SYSTEM_SETTINGS,
        Permission.VIEW_ALL_TRANSACTIONS,
        Permission.MANAGE_POINTS,
        Permission.GIVE_POINTS,
    ],

    [UserRole.ADMIN_USER]: [
        // Admin users have most permissions except system management
        Permission.VIEW_ALL_USERS,
        Permission.CREATE_USERS,
        Permission.EDIT_USERS,
        Permission.DELETE_USERS,
        // Note: Admins cannot manage super user roles
        Permission.VIEW_DASHBOARD_STATS,
        Permission.VIEW_ANALYTICS,
        Permission.EXPORT_DATA,
        Permission.VIEW_ALL_HOTELS,
        Permission.CREATE_HOTELS,
        Permission.EDIT_HOTELS,
        Permission.DELETE_HOTELS,
        Permission.VIEW_ALL_CONTENT,
        Permission.CREATE_CONTENT,
        Permission.EDIT_CONTENT,
        Permission.DELETE_CONTENT,
        Permission.VIEW_ALL_PROVIDERS,
        Permission.MANAGE_PROVIDERS,
        Permission.VIEW_ALL_TRANSACTIONS,
        Permission.MANAGE_POINTS,
        Permission.GIVE_POINTS,
    ],

    [UserRole.USER]: [
        // Regular users can view their own dashboard and analytics
        Permission.VIEW_DASHBOARD_STATS, // Can see basic dashboard
        Permission.VIEW_ANALYTICS, // Can see their own analytics/charts
        // Note: Cannot view all users, only their own profile
        // Cannot create/edit/delete users
        // Cannot manage hotels, content, providers
        // Cannot access system settings
    ],

    [UserRole.GENERAL_USER]: [
        // General users have very limited permissions
        Permission.VIEW_DASHBOARD_STATS, // Can see basic dashboard
        // Note: Cannot view analytics - restricted to admin/super users only
        // Note: Cannot view all users, only their own profile
        // Cannot create/edit/delete users
        // Cannot manage hotels, content, providers
        // Cannot access system settings
    ],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
    if (!user) return false;

    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
    if (!user) return false;

    return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
    if (!user) return false;

    return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Get all permissions for a user's role
 */
export function getUserPermissions(user: User | null): Permission[] {
    if (!user) return [];

    return ROLE_PERMISSIONS[user.role] || [];
}

/**
 * Check if user can access a specific route/page
 */
export function canAccessRoute(user: User | null, route: string): boolean {
    if (!user) return false;

    // Define route permissions
    const routePermissions: Record<string, Permission[]> = {
        '/dashboard/users': [Permission.VIEW_ALL_USERS],
        '/dashboard/users/create': [Permission.CREATE_USERS],
        '/dashboard/hotels': [Permission.VIEW_ALL_HOTELS],
        '/dashboard/analytics': [Permission.VIEW_ANALYTICS],
        '/dashboard/providers': [Permission.VIEW_ALL_PROVIDERS],
        '/dashboard/settings': [Permission.VIEW_SYSTEM_SETTINGS],
    };

    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) {
        // If no specific permissions required, allow access
        return true;
    }

    return hasAnyPermission(user, requiredPermissions);
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigationByPermissions(
    user: User | null,
    navigationItems: any[]
): any[] {
    if (!user) return [];

    return navigationItems.filter(item => {
        if (item.permission) {
            return hasPermission(user, item.permission);
        }
        if (item.permissions) {
            return hasAnyPermission(user, item.permissions);
        }
        // If no permissions specified, show the item
        return true;
    });
}

/**
 * Check if user is admin or super user
 */
export function isAdminOrSuper(user: User | null): boolean {
    if (!user) return false;
    return user.role === UserRole.ADMIN_USER || user.role === UserRole.SUPER_USER;
}

/**
 * Check if user is super user
 */
export function isSuperUser(user: User | null): boolean {
    if (!user) return false;
    return user.role === UserRole.SUPER_USER;
}

/**
 * Check if user is general user
 */
export function isGeneralUser(user: User | null): boolean {
    if (!user) return false;
    return user.role === UserRole.GENERAL_USER;
}
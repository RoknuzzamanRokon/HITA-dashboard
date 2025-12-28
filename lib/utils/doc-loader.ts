/**
 * Dynamic Documentation Loader
 * Loads and displays documentation files based on user role and folder structure
 */

"use client";

import { useState, useEffect } from "react";
import { UserRole } from "@/lib/types/auth";

export interface DocFile {
    title: string;
    path: string;
    folder: string;
}

// Define which folder maps to which user type
export function getUserDocFolder(role: UserRole, isPaid: boolean): string {
    if (role === UserRole.SUPER_USER || role === UserRole.ADMIN_USER) {
        return "admin";
    } else if (role === UserRole.GENERAL_USER && isPaid) {
        return "paid_user";
    } else {
        return "non_paid_user";
    }
}

// Manually define available docs for each folder
// In a real app, you could fetch this from an API
export const availableDocs: Record<string, DocFile[]> = {
    admin: [
        { title: "Analytics", path: "admin/ANALYTICS_API_ADMIN.md", folder: "admin" },
        { title: "Audit Dashboard", path: "admin/AUDIT_DASHBOARD_API_ADMIN.md", folder: "admin" },
        { title: "Authentication", path: "admin/AUTHENTICATION_API_ADMIN.md", folder: "admin" },
        { title: "Cache Management", path: "admin/CACHE_MANAGEMENT_ADMIN.md", folder: "admin" },
        { title: "Content API", path: "admin/CONTENT_API_ADMIN.md", folder: "admin" },
        { title: "Dashboard API", path: "admin/DASHBOARD_API_ADMIN.md", folder: "admin" },
        { title: "Export Jobs API", path: "admin/EXPORT_JOBS_API_ADMIN.md", folder: "admin" },
        { title: "Notifications API", path: "admin/NOTIFICATIONS_API_ADMIN.md", folder: "admin" },
    ],
    paid_user: [
        { title: "Analytics", path: "paid_user/ANALYTICS_API_GENERAL_USER.md", folder: "paid_user" },
        { title: "Audit Dashboard", path: "paid_user/AUDIT_DASHBOARD_API_GENERAL_USER.md", folder: "paid_user" },
        { title: "Authentication", path: "paid_user/AUTHENTICATION_API_GENERAL_USER.md", folder: "paid_user" },
        { title: "Content API", path: "paid_user/CONTENT_API_GENERAL_USER.md", folder: "paid_user" },
        { title: "Export Jobs API", path: "paid_user/EXPORT_JOBS_API_GENERAL_USER.md", folder: "paid_user" },
        { title: "Notifications API", path: "paid_user/NOTIFICATIONS_API_GENERAL_USER.md", folder: "paid_user" },
    ],
    non_paid_user: [
        { title: "Analytics", path: "non_paid_user/ANALYTICS_API_DEMO_USER.md", folder: "non_paid_user" },
        { title: "Audit Dashboard", path: "non_paid_user/AUDIT_DASHBOARD_API_DEMO_USER.md", folder: "non_paid_user" },
        { title: "Authentication", path: "non_paid_user/AUTHENTICATION_API_DEMO_USER.md", folder: "non_paid_user" },
        { title: "Content API", path: "non_paid_user/CONTENT_API_DEMO_USER.md", folder: "non_paid_user" },
    ],
};

export function getDocsForUser(role: UserRole, isPaid: boolean): DocFile[] {
    const folder = getUserDocFolder(role, isPaid);
    return availableDocs[folder] || [];
}

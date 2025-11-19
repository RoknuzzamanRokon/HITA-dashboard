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
        { title: "Authentication", path: "admin/auth.md", folder: "admin" },
        { title: "User Management", path: "admin/user-management.md", folder: "admin" },
        { title: "System Config", path: "admin/system-config.md", folder: "admin" },
    ],
    paid_user: [
        { title: "API Access", path: "paid_user/api-access.md", folder: "paid_user" },
        { title: "Export Guide", path: "paid_user/export-guide.md", folder: "paid_user" },
    ],
    non_paid_user: [
        { title: "Getting Started", path: "non_paid_user/getting-started.md", folder: "non_paid_user" },
        { title: "Authentication", path: "non_paid_user/auth.md", folder: "non_paid_user" },
        { title: "Upgrade Guide", path: "non_paid_user/upgrade.md", folder: "non_paid_user" },
    ],
};

export function getDocsForUser(role: UserRole, isPaid: boolean): DocFile[] {
    const folder = getUserDocFolder(role, isPaid);
    return availableDocs[folder] || [];
}

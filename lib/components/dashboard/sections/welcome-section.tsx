/**
 * Welcome Section Component
 * Admin/Super User welcome message
 */

"use client";

import React from "react";
import { PermissionGuard } from "@/lib/components/auth/permission-guard";
import { Permission } from "@/lib/utils/rbac";

export function WelcomeSection() {
  return (
    <PermissionGuard
      permissions={[
        Permission.VIEW_ALL_USERS,
        Permission.MANAGE_SYSTEM_SETTINGS,
      ]}
    >
      <div className="border-4 border-dashed mb-8 border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Welcome to the Admin Management Panel
          </h2>
          <p className="text-gray-600 mb-6">
            You have successfully logged in. The authentication system is
            working correctly.
          </p>
        </div>
      </div>
    </PermissionGuard>
  );
}

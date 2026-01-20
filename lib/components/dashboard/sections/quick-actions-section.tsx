/**
 * Quick Actions Section Component
 * Admin/Super User quick actions panel
 */

"use client";

import React from "react";
import { PermissionGuard } from "@/lib/components/auth/permission-guard";
import { Permission } from "@/lib/utils/rbac";
import { QuickActions } from "@/lib/components/dashboard";

interface QuickActionsSectionProps {
  onRefreshData: () => void;
  isLoading: boolean;
}

export function QuickActionsSection({
  onRefreshData,
  isLoading,
}: QuickActionsSectionProps) {
  return (
    <PermissionGuard
      permissions={[Permission.CREATE_USERS, Permission.MANAGE_SYSTEM_SETTINGS]}
    >
      <div className="mb-8">
        <QuickActions onRefreshData={onRefreshData} isLoading={isLoading} />
      </div>
    </PermissionGuard>
  );
}

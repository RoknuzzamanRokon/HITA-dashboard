"use client";

import React, { useState } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { PermissionGuard } from "@/lib/components/auth/permission-guard";
import { Permission } from "@/lib/utils/rbac";
import { UserInfoSection } from "@/lib/components/points/user-info-section";
import { GivePointsSection } from "@/lib/components/points/give-points-section";
import { ApiKeySection } from "@/lib/components/points/api-key-section";
import { SupplierPermissionSection } from "@/lib/components/points/supplier-permission-section";
import { IpAddressPermissionSection } from "@/lib/components/points/ip-address-permission-section";
import { Shield, RefreshCw } from "lucide-react";

export default function pointsPermissionPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-primary))]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <PermissionGuard
      permissions={[
        Permission.MANAGE_SYSTEM_SETTINGS,
        Permission.MANAGE_POINTS,
      ]}
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-primary))]">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
              Access Denied
            </h1>
            <p className="text-[rgb(var(--text-secondary))]">
              Only Super Users and Admins can access this page.
            </p>
          </div>
        </div>
      }
    >
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                User Management
              </h1>
              <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                Manage user points, API keys, supplier permissions, and IP
                access
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary-color text-white rounded-md hover:bg-primary-hover flex items-center space-x-2 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh All</span>
            </button>
          </div>
        </div>

        {/* User Info Section */}
        <div className="mb-6">
          <UserInfoSection key={`user-info-${refreshKey}`} />
        </div>

        {/* Give Points and API Key Section - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="h-full">
            <GivePointsSection key={`give-points-${refreshKey}`} />
          </div>
          <div className="h-full">
            <ApiKeySection key={`api-key-${refreshKey}`} />
          </div>
        </div>

        {/* Supplier Permission and IP Address Permission - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="h-full">
            <SupplierPermissionSection key={`supplier-${refreshKey}`} />
          </div>
          <div className="h-full">
            <IpAddressPermissionSection key={`ip-${refreshKey}`} />
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}

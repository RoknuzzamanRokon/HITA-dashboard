/**
 * User Actions Section Component
 * Provides action buttons for user management operations:
 * - Activate/Deactivate user
 * - Reset points (with confirmation)
 * - Delete user (with confirmation)
 * - Generate API key
 */

"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { ConfirmationDialog } from "@/lib/components/ui/confirmation-dialog";
import { UserEditService } from "@/lib/api/user-edit";
import {
  Power,
  PowerOff,
  RotateCcw,
  Trash2,
  Key,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserActionsSectionProps {
  userId: string;
  isActive: boolean;
  currentPoints: number;
  onActionComplete: (action: string, success: boolean, message: string) => void;
}

type ConfirmationAction = "reset-points" | "delete-user" | null;

export function UserActionsSection({
  userId,
  isActive,
  currentPoints,
  onActionComplete,
}: UserActionsSectionProps) {
  // State management
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  /**
   * Clear local messages after 3 seconds
   */
  React.useEffect(() => {
    if (localError || localSuccess) {
      const timer = setTimeout(() => {
        setLocalError(null);
        setLocalSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [localError, localSuccess]);

  /**
   * Handle activate/deactivate user
   */
  const handleToggleUserStatus = async () => {
    setLoadingAction("toggle-status");
    setLocalError(null);
    setLocalSuccess(null);

    try {
      const response = await UserEditService.activateUser(userId);

      if (response.success) {
        const action = isActive ? "deactivated" : "activated";
        const message = `User ${action} successfully`;
        setLocalSuccess(message);
        onActionComplete("toggle-status", true, message);
      } else {
        const errorMsg =
          response.error?.message || "Failed to update user status";
        setLocalError(errorMsg);
        onActionComplete("toggle-status", false, errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setLocalError(errorMsg);
      onActionComplete("toggle-status", false, errorMsg);
    } finally {
      setLoadingAction(null);
    }
  };

  /**
   * Handle reset points
   */
  const handleResetPoints = async () => {
    setConfirmationAction(null);
    setLoadingAction("reset-points");
    setLocalError(null);
    setLocalSuccess(null);

    try {
      const response = await UserEditService.resetUserPoints(userId);

      if (response.success) {
        const message = "User points reset to zero successfully";
        setLocalSuccess(message);
        onActionComplete("reset-points", true, message);
      } else {
        const errorMsg = response.error?.message || "Failed to reset points";
        setLocalError(errorMsg);
        onActionComplete("reset-points", false, errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setLocalError(errorMsg);
      onActionComplete("reset-points", false, errorMsg);
    } finally {
      setLoadingAction(null);
    }
  };

  /**
   * Handle delete user
   */
  const handleDeleteUser = async () => {
    setConfirmationAction(null);
    setLoadingAction("delete-user");
    setLocalError(null);
    setLocalSuccess(null);

    try {
      const response = await UserEditService.deleteUser(userId);

      if (response.success) {
        const message = "User deleted successfully";
        setLocalSuccess(message);
        onActionComplete("delete-user", true, message);
      } else {
        const errorMsg = response.error?.message || "Failed to delete user";
        setLocalError(errorMsg);
        onActionComplete("delete-user", false, errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setLocalError(errorMsg);
      onActionComplete("delete-user", false, errorMsg);
    } finally {
      setLoadingAction(null);
    }
  };

  /**
   * Handle generate API key
   */
  const handleGenerateApiKey = async () => {
    setLoadingAction("generate-api-key");
    setLocalError(null);
    setLocalSuccess(null);

    try {
      const response = await UserEditService.generateApiKey(userId);

      if (response.success) {
        const message = "API key generated successfully";
        setLocalSuccess(message);
        onActionComplete("generate-api-key", true, message);
      } else {
        const errorMsg =
          response.error?.message || "Failed to generate API key";
        setLocalError(errorMsg);
        onActionComplete("generate-api-key", false, errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setLocalError(errorMsg);
      onActionComplete("generate-api-key", false, errorMsg);
    } finally {
      setLoadingAction(null);
    }
  };

  /**
   * Open confirmation dialog
   */
  const openConfirmation = (action: ConfirmationAction) => {
    setConfirmationAction(action);
  };

  /**
   * Close confirmation dialog
   */
  const closeConfirmation = () => {
    setConfirmationAction(null);
  };

  /**
   * Get confirmation dialog props based on action
   */
  const getConfirmationProps = () => {
    if (confirmationAction === "reset-points") {
      return {
        title: "Reset User Points",
        message: `Are you sure you want to reset all points for this user? The user currently has ${currentPoints} points. This will set their points to zero.`,
        confirmText: "Reset Points",
        variant: "warning" as const,
        onConfirm: handleResetPoints,
      };
    } else if (confirmationAction === "delete-user") {
      return {
        title: "Delete User",
        message:
          "Are you sure you want to delete this user? This will permanently remove the user account and all associated data.",
        confirmText: "Delete User",
        variant: "danger" as const,
        onConfirm: handleDeleteUser,
      };
    }
    return null;
  };

  const confirmationProps = getConfirmationProps();
  const isAnyActionLoading = loadingAction !== null;

  return (
    <>
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-orange-100">
              <Power className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              User Actions
            </h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Local Success Message */}
          {localSuccess && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-900">{localSuccess}</p>
            </div>
          )}

          {/* Local Error Message */}
          {localError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-900">{localError}</p>
            </div>
          )}

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Activate/Deactivate User Button */}
            <Button
              onClick={handleToggleUserStatus}
              disabled={isAnyActionLoading}
              loading={loadingAction === "toggle-status"}
              variant={isActive ? "outline" : "primary"}
              className={cn(
                "w-full justify-start space-x-2",
                isActive && "border-red-200 text-red-700 hover:bg-red-50"
              )}
              leftIcon={
                loadingAction !== "toggle-status" &&
                (isActive ? (
                  <PowerOff className="h-4 w-4" />
                ) : (
                  <Power className="h-4 w-4" />
                ))
              }
            >
              {isActive ? "Deactivate User" : "Activate User"}
            </Button>

            {/* Generate API Key Button */}
            <Button
              onClick={handleGenerateApiKey}
              disabled={isAnyActionLoading}
              loading={loadingAction === "generate-api-key"}
              variant="outline"
              className="w-full justify-start space-x-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              leftIcon={
                loadingAction !== "generate-api-key" && (
                  <Key className="h-4 w-4" />
                )
              }
            >
              Generate API Key
            </Button>

            {/* Reset Points Button */}
            <Button
              onClick={() => openConfirmation("reset-points")}
              disabled={isAnyActionLoading}
              variant="outline"
              className="w-full justify-start space-x-2 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Reset Points
            </Button>

            {/* Delete User Button */}
            <Button
              onClick={() => openConfirmation("delete-user")}
              disabled={isAnyActionLoading}
              variant="outline"
              className="w-full justify-start space-x-2 border-red-200 text-red-700 hover:bg-red-50"
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete User
            </Button>
          </div>

          {/* Action Descriptions */}
          <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Activate/Deactivate controls user access.
              Reset Points clears the point balance. Delete User permanently
              removes the account. Generate API Key creates a new authentication
              key.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {confirmationProps && (
        <ConfirmationDialog
          isOpen={confirmationAction !== null}
          onClose={closeConfirmation}
          isLoading={isAnyActionLoading}
          {...confirmationProps}
        />
      )}
    </>
  );
}

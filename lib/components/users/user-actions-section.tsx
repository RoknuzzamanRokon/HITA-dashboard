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
import { useToast } from "@/lib/components/ui/toast";
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
  // Hooks
  const toast = useToast();

  // State management
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Handle activate/deactivate user
   */
  const handleToggleUserStatus = async () => {
    setLoadingAction("toggle-status");
    setLocalError(null);

    try {
      const response = await UserEditService.activateUser(userId);

      if (response.success) {
        const action = isActive ? "deactivated" : "activated";
        const message = `User ${action} successfully`;
        toast.success("Status Updated", message);
        onActionComplete("toggle-status", true, message);
      } else {
        const errorMsg =
          response.error?.message || "Failed to update user status";
        toast.error("Status Update Failed", errorMsg);
        setLocalError(errorMsg);
        onActionComplete("toggle-status", false, errorMsg);

        if (response.error?.status === 403) {
          setLocalError("You don't have permission to change user status");
        }
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Error", errorMsg);
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

    try {
      const response = await UserEditService.resetUserPoints(userId);

      if (response.success) {
        const message = "User points reset to zero successfully";
        toast.success("Points Reset", message);
        onActionComplete("reset-points", true, message);
      } else {
        const errorMsg = response.error?.message || "Failed to reset points";
        toast.error("Reset Failed", errorMsg);
        setLocalError(errorMsg);
        onActionComplete("reset-points", false, errorMsg);

        if (response.error?.status === 403) {
          setLocalError("You don't have permission to reset points");
        }
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Error", errorMsg);
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

    try {
      const response = await UserEditService.deleteUser(userId);

      if (response.success) {
        const message = "User deleted successfully";
        toast.success("User Deleted", message);
        onActionComplete("delete-user", true, message);
      } else {
        const errorMsg = response.error?.message || "Failed to delete user";
        toast.error("Deletion Failed", errorMsg);
        setLocalError(errorMsg);
        onActionComplete("delete-user", false, errorMsg);

        if (response.error?.status === 403) {
          setLocalError("You don't have permission to delete users");
        }
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Error", errorMsg);
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

    try {
      const response = await UserEditService.generateApiKey(userId);

      if (response.success) {
        const message = "API key generated successfully";
        toast.success("API Key Generated", message);
        onActionComplete("generate-api-key", true, message);
      } else {
        const errorMsg =
          response.error?.message || "Failed to generate API key";
        toast.error("Generation Failed", errorMsg);
        setLocalError(errorMsg);
        onActionComplete("generate-api-key", false, errorMsg);

        if (response.error?.status === 403) {
          setLocalError("You don't have permission to generate API keys");
        }
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Error", errorMsg);
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
            <div className="p-2 rounded-lg bg-orange-100" aria-hidden="true">
              <Power className="h-5 w-5 text-orange-600" />
            </div>
            <h3
              className="text-lg font-semibold text-gray-900"
              id="user-actions-heading"
            >
              User Actions
            </h3>
          </div>
        </CardHeader>
        <CardContent
          className="space-y-4"
          aria-labelledby="user-actions-heading"
        >
          {/* ARIA live region for action status */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {loadingAction === "toggle-status" &&
              `${isActive ? "Deactivating" : "Activating"} user, please wait`}
            {loadingAction === "reset-points" &&
              "Resetting points, please wait"}
            {loadingAction === "delete-user" && "Deleting user, please wait"}
            {loadingAction === "generate-api-key" &&
              "Generating API key, please wait"}
            {localError && `Error: ${localError}`}
          </div>

          {/* Local Error Message */}
          {localError && (
            <div
              className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle
                className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="text-sm text-red-900">{localError}</p>
            </div>
          )}

          {/* Action Buttons Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
            role="group"
            aria-label="User management actions"
          >
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
                  <PowerOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Power className="h-4 w-4" aria-hidden="true" />
                ))
              }
              aria-label={
                isActive ? "Deactivate user account" : "Activate user account"
              }
              aria-busy={loadingAction === "toggle-status"}
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
                  <Key className="h-4 w-4" aria-hidden="true" />
                )
              }
              aria-label="Generate new API key for user"
              aria-busy={loadingAction === "generate-api-key"}
            >
              Generate API Key
            </Button>

            {/* Reset Points Button */}
            <Button
              onClick={() => openConfirmation("reset-points")}
              disabled={isAnyActionLoading}
              variant="outline"
              className="w-full justify-start space-x-2 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
              leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
              aria-label={`Reset user points to zero. Current points: ${currentPoints}`}
            >
              Reset Points
            </Button>

            {/* Delete User Button */}
            <Button
              onClick={() => openConfirmation("delete-user")}
              disabled={isAnyActionLoading}
              variant="outline"
              className="w-full justify-start space-x-2 border-red-200 text-red-700 hover:bg-red-50"
              leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
              aria-label="Delete user account permanently"
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

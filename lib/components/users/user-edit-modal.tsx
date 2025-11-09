/**
 * User Edit Modal Component
 * Modal interface for comprehensive user management operations
 * Displays detailed user information and provides action sections for:
 * - Point allocation
 * - Supplier management
 * - User activation/deactivation
 * - Point reset
 * - User deletion
 * - API key generation
 */

"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalBody, ModalFooter } from "@/lib/components/ui/modal";
import { Button } from "@/lib/components/ui/button";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import { ErrorBoundary } from "@/lib/components/ui/error-boundary";
import { UserDetailsSkeleton } from "@/lib/components/ui/loading-skeleton";
import { useToast } from "@/lib/components/ui/toast";
import { UserEditService, DetailedUserInfo } from "@/lib/api/user-edit";
import { PointAllocationSection } from "./point-allocation-section";
import { UserActionsSection } from "./user-actions-section";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Coins,
  Activity,
  Key,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Users,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onUserUpdated?: () => void;
}

export function UserEditModal({
  isOpen,
  onClose,
  userId,
  onUserUpdated,
}: UserEditModalProps) {
  // Hooks
  const toast = useToast();

  // State management
  const [userDetails, setUserDetails] = useState<DetailedUserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  /**
   * Fetch user details when modal opens
   */
  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  /**
   * Clear error after 5 seconds
   */
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  /**
   * Fetch detailed user information from API
   */
  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await UserEditService.getUserDetails(userId);

      if (response.success && response.data) {
        setUserDetails(response.data);
        setRetryAttempt(0);
      } else {
        const errorMsg =
          response.error?.message || "Failed to load user details";
        setError(errorMsg);

        // Show toast for specific error types
        if (response.error?.status === 403) {
          toast.error(
            "Permission Denied",
            "You don't have permission to view this user"
          );
        } else if (response.error?.status === 404) {
          toast.error("User Not Found", "This user may have been deleted");
        } else if (response.error?.status && response.error.status >= 500) {
          toast.error("Server Error", "Please try again later");
        }
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMsg);
      toast.error("Error Loading User", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh user data after successful actions
   */
  const refreshUserData = async () => {
    await fetchUserDetails();
    onUserUpdated?.();
  };

  /**
   * Handle action completion (success or error)
   */
  const handleActionComplete = (
    success: boolean,
    message: string,
    shouldRefresh: boolean = true
  ) => {
    setActionInProgress(null);

    if (success) {
      toast.success("Success", message);
      if (shouldRefresh) {
        refreshUserData();
      }
    } else {
      toast.error("Action Failed", message);
      setError(message);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  /**
   * Get role badge color
   */
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "super_user":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "admin_user":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "general_user":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setUserDetails(null);
    setError(null);
    setActionInProgress(null);
    setRetryAttempt(0);
    onClose();
  };

  /**
   * Handle retry with exponential backoff
   */
  const handleRetry = () => {
    setRetryAttempt((prev) => prev + 1);
    fetchUserDetails();
  };

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("UserEditModal Error:", error, errorInfo);
        toast.error(
          "Component Error",
          "An unexpected error occurred in the user edit modal"
        );
      }}
    >
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={`Edit User: ${userDetails?.username || "Loading..."}`}
        size="2xl"
        animation="slide"
      >
        <ModalBody className="p-0">
          {/* Error Message */}
          {error && !loading && (
            <div className="mx-6 mt-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">{error}</p>
                {retryAttempt < 3 && (
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    leftIcon={<RefreshCw className="h-3 w-3" />}
                  >
                    Retry
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Loading State with Skeleton */}
          {loading && !userDetails && <UserDetailsSkeleton />}

          {/* User Details Content */}
          {!loading && userDetails && (
            <div className="p-6 space-y-6">
              {/* User Information Section */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        User Information
                      </h3>
                    </div>
                    {getStatusBadge(userDetails.is_active)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          User ID
                        </span>
                        <span className="text-sm text-gray-900 font-mono">
                          {userDetails.id}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Username
                        </span>
                        <span className="text-sm text-gray-900">
                          {userDetails.username}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </span>
                        <span className="text-sm text-gray-900">
                          {userDetails.email}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Role
                        </span>
                        <Badge className={getRoleBadgeColor(userDetails.role)}>
                          {userDetails.role}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <Activity className="h-4 w-4 mr-2" />
                          User Status
                        </span>
                        <span className="text-sm text-gray-900">
                          {userDetails.user_status}
                        </span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Created At
                        </span>
                        <span className="text-xs text-gray-900">
                          {formatDate(userDetails.created_at)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Updated At
                        </span>
                        <span className="text-xs text-gray-900">
                          {formatDate(userDetails.updated_at)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Created By
                        </span>
                        <span className="text-sm text-gray-900">
                          {userDetails.created_by}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <Key className="h-4 w-4 mr-2" />
                          API Key
                        </span>
                        <span className="text-xs text-gray-900 font-mono">
                          {userDetails.api_key || "Not generated"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-500 flex items-center">
                          <Activity className="h-4 w-4 mr-2" />
                          RQ Status
                        </span>
                        <span className="text-sm text-gray-900">
                          {userDetails.using_rq_status}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Points Information Section */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Coins className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Points & Usage
                    </h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600">
                        {userDetails.points.current_points}
                      </div>
                      <div className="text-xs text-blue-500 font-medium mt-1">
                        Current Points
                      </div>
                    </div>

                    <div className="text-center p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                      <div className="text-2xl font-bold text-green-600">
                        {userDetails.points.total_points}
                      </div>
                      <div className="text-xs text-green-500 font-medium mt-1">
                        Total Points
                      </div>
                    </div>

                    <div className="text-center p-3 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-100">
                      <div className="text-2xl font-bold text-red-600">
                        {userDetails.points.total_used_points}
                      </div>
                      <div className="text-xs text-red-500 font-medium mt-1">
                        Used Points
                      </div>
                    </div>

                    <div className="text-center p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                      <div className="text-2xl font-bold text-purple-600">
                        {userDetails.points.total_rq}
                      </div>
                      <div className="text-xs text-purple-500 font-medium mt-1">
                        Total Requests
                      </div>
                    </div>

                    <div className="text-center p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100">
                      <div className="text-sm font-bold text-yellow-700">
                        {userDetails.points.paid_status}
                      </div>
                      <div className="text-xs text-yellow-600 font-medium mt-1">
                        Payment Status
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supplier Information Section */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Supplier Access
                    </h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        Active Suppliers
                      </span>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {userDetails.active_suppliers.length} /{" "}
                        {userDetails.total_suppliers}
                      </Badge>
                    </div>

                    {userDetails.active_suppliers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {userDetails.active_suppliers.map((supplier) => (
                          <Badge
                            key={supplier}
                            className="bg-green-100 text-green-800 border-green-200"
                          >
                            {supplier}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No active suppliers
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Viewed By Information */}
              {userDetails.viewed_by && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-indigo-100">
                        <Users className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Viewed By
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">
                          User ID
                        </span>
                        <span className="text-sm text-gray-900 font-mono">
                          {userDetails.viewed_by.user_id}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">
                          Username
                        </span>
                        <span className="text-sm text-gray-900">
                          {userDetails.viewed_by.username}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">
                          Email
                        </span>
                        <span className="text-sm text-gray-900">
                          {userDetails.viewed_by.email}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">
                          Role
                        </span>
                        <Badge
                          className={getRoleBadgeColor(
                            userDetails.viewed_by.role
                          )}
                        >
                          {userDetails.viewed_by.role}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Point Allocation Section */}
              <PointAllocationSection
                userId={userDetails.id}
                userEmail={userDetails.email}
                currentPoints={userDetails.points.current_points}
                onAllocationComplete={refreshUserData}
              />

              {/* User Actions Section */}
              <UserActionsSection
                userId={userDetails.id}
                isActive={userDetails.is_active}
                currentPoints={userDetails.points.current_points}
                onActionComplete={(action, success, message) => {
                  handleActionComplete(
                    success,
                    message,
                    action !== "delete-user"
                  );
                  // Close modal if user was deleted
                  if (action === "delete-user" && success) {
                    setTimeout(() => {
                      handleClose();
                    }, 2000);
                  }
                }}
              />

              {/* Action Sections Placeholder */}
              {/* These sections will be implemented in subsequent tasks:
                - Task 6: SupplierManagementSection
                - Task 8: ApiKeyDisplay
            */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Additional action sections (Supplier
                  Management, API Key Display) will be added in subsequent
                  implementation tasks.
                </p>
              </div>
            </div>
          )}

          {/* Error State - No Data */}
          {!loading && !userDetails && error && (
            <div className="p-12 flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-600" />
              <p className="text-sm text-gray-600">
                Unable to load user details
              </p>
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Retry
              </Button>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading || actionInProgress !== null}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </ErrorBoundary>
  );
}

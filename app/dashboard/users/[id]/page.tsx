/**
 * User Profile Page
 * Detailed view of a specific user with profile information and activity
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { UserService } from "@/lib/api/users";
import { Button } from "@/lib/components/ui/button";
import { Badge } from "@/lib/components/ui/badge";
import { Card } from "@/lib/components/ui/card";
import { UserForm } from "@/lib/components/users/user-form";
import {
  ArrowLeft,
  Edit,
  UserCheck,
  UserX,
  Trash2,
  Mail,
  Calendar,
  CreditCard,
  Activity,
  Shield,
} from "lucide-react";
import type { UserListItem, UserFormData } from "@/lib/types/user";
import type { UserRole } from "@/lib/types/auth";

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  // State management
  const [user, setUser] = useState<UserListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  /**
   * Fetch user details
   */
  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await UserService.getUserById(userId);

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setError(response.error?.message || "Failed to fetch user details");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user on component mount
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchUser();
    }
  }, [isAuthenticated, userId]);

  /**
   * Handle user actions
   */
  const handleEditUser = () => {
    setShowEditModal(true);
  };

  const handleUpdateUser = async (userData: UserFormData) => {
    if (!user) return;

    try {
      const response = await UserService.updateUser(user.id, userData);
      if (response.success) {
        setShowEditModal(false);
        fetchUser(); // Refresh user data
      } else {
        throw new Error(response.error?.message || "Failed to update user");
      }
    } catch (err) {
      throw err; // Let the form handle the error
    }
  };

  const handleToggleUserStatus = async () => {
    if (!user) return;

    try {
      const response = await UserService.toggleUserStatus(
        user.id,
        !user.isActive
      );
      if (response.success) {
        fetchUser(); // Refresh user data
      } else {
        setError(response.error?.message || "Failed to update user status");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the user "${user.username}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        const response = await UserService.deleteUser(user.id);
        if (response.success) {
          router.push("/dashboard/users?deleted=true");
        } else {
          setError(response.error?.message || "Failed to delete user");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    }
  };

  /**
   * Get role display information
   */
  const getRoleInfo = (role: UserRole) => {
    const roleConfig: Record<
      string,
      { label: string; color: string; icon: any }
    > = {
      super_user: {
        label: "Super User",
        color: "bg-purple-100 text-purple-800",
        icon: Shield,
      },
      admin_user: {
        label: "Admin User",
        color: "bg-blue-100 text-blue-800",
        icon: Shield,
      },
      user: {
        label: "User",
        color: "bg-green-100 text-green-800",
        icon: UserCheck,
      },
      general_user: {
        label: "General User",
        color: "bg-green-100 text-green-800",
        icon: UserCheck,
      },
    };

    return roleConfig[role] || roleConfig.general_user;
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show loading while fetching user
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if user not found or error occurred
  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/users")}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Users
          </Button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">
                {error || "User not found"}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error || "The requested user could not be found."}
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard/users")}
                >
                  Return to Users List
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roleInfo = getRoleInfo(user.role);
  const RoleIcon = roleInfo.icon;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/users")}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Users
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <span>{user.username}</span>
              {!user.isActive && (
                <Badge variant="outline" className="text-xs">
                  Inactive
                </Badge>
              )}
            </h1>
            <p className="mt-1 text-sm text-gray-600">{user.email}</p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditUser}
              leftIcon={<Edit className="h-4 w-4" />}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleUserStatus}
              leftIcon={
                user.isActive ? (
                  <UserX className="h-4 w-4" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )
              }
              className={
                user.isActive
                  ? "text-orange-600 hover:text-orange-700"
                  : "text-green-600 hover:text-green-700"
              }
            >
              {user.isActive ? "Deactivate" : "Activate"}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteUser}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <RoleIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Role</p>
                  <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <Badge
                    variant={user.isActive ? "success" : "outline"}
                    className={
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "text-gray-600"
                    }
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Member Since
                  </p>
                  <p className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {user.lastLogin && (
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Last Login
                    </p>
                    <p className="text-sm text-gray-900">
                      {new Date(user.lastLogin).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}

              {user.updatedAt && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Last Updated
                    </p>
                    <p className="text-sm text-gray-900">
                      {new Date(user.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Active Suppliers Card */}
          {user.activeSuppliers && user.activeSuppliers.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Active Suppliers
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.activeSuppliers.map((supplier, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {supplier}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Points Card */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Point Balance
              </h2>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {user.pointBalance !== undefined
                  ? user.pointBalance.toLocaleString()
                  : "N/A"}
              </div>
              <p className="text-sm text-gray-600 mt-1">Available Points</p>
            </div>

            {user.totalPoints !== undefined && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Earned:</span>
                  <span className="font-medium">
                    {user.totalPoints.toLocaleString()}
                  </span>
                </div>
                {user.usedPoints !== undefined && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Total Used:</span>
                    <span className="font-medium">
                      {user.usedPoints.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Quick Actions Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleEditUser}
                leftIcon={<Edit className="h-4 w-4" />}
              >
                Edit Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleToggleUserStatus}
                leftIcon={
                  user.isActive ? (
                    <UserX className="h-4 w-4" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )
                }
              >
                {user.isActive ? "Deactivate User" : "Activate User"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit User Modal */}
      <UserForm
        user={user}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateUser}
        loading={loading}
      />
    </div>
  );
}

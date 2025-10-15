/**
 * User Management Page Component
 * Complete user management interface with table, modals, and actions
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/lib/components/ui/button";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import { ToastProvider, useToast } from "@/lib/components/ui/toast";
import { EnhancedUserTable } from "./enhanced-user-table";
import { EnhancedUserForm } from "./enhanced-user-form";
import { UserDetailView } from "./user-detail-view";
import { UserService } from "@/lib/api/users";
import { UserListItem, UserFormData } from "@/lib/types/user";
import { UserRole } from "@/lib/types/auth";
import { useAuth } from "@/lib/contexts/auth-context";
import {
  Plus,
  Users,
  UserCheck,
  UserX,
  Crown,
  Settings,
  User,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserManagementPageProps {
  className?: string;
}

export function UserManagementPage({ className }: UserManagementPageProps) {
  const { user: currentUser } = useAuth();
  const { success, error: showError } = useToast();

  // State
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<UserListItem[]>([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  // Action loading states
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /**
   * Load users from API
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAllUsers();

      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        showError("Error", "Failed to load users");
      }
    } catch (error) {
      showError("Error", "Failed to load users");
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load users on component mount
   */
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Handle user creation
   */
  const handleCreateUser = async (userData: UserFormData) => {
    try {
      setActionLoading("create");

      let response;
      switch (userData.role) {
        case UserRole.SUPER_USER:
          response = await UserService.createSuperUser({
            username: userData.username,
            email: userData.email,
            password: userData.password!,
          });
          break;
        case UserRole.ADMIN_USER:
          response = await UserService.createAdminUser({
            username: userData.username,
            email: userData.email,
            password: userData.password!,
            business_id: "default", // You might want to make this configurable
          });
          break;
        default:
          response = await UserService.createGeneralUser({
            username: userData.username,
            email: userData.email,
            password: userData.password!,
          });
      }

      if (response.success) {
        success(
          "User Created",
          `${userData.username} has been created successfully`
        );
        setShowCreateModal(false);
        await loadUsers(); // Refresh the list
      } else {
        showError("Error", "Failed to create user");
      }
    } catch (error) {
      showError(
        "Error",
        error instanceof Error ? error.message : "Failed to create user"
      );
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Handle user editing
   */
  const handleEditUser = async (userData: UserFormData) => {
    if (!selectedUser) return;

    try {
      setActionLoading("edit");

      const response = await UserService.updateUser(selectedUser.id, userData);

      if (response.success) {
        success(
          "User Updated",
          `${userData.username} has been updated successfully`
        );
        setShowEditModal(false);
        setSelectedUser(null);
        await loadUsers(); // Refresh the list
      } else {
        showError("Error", "Failed to update user");
      }
    } catch (error) {
      showError(
        "Error",
        error instanceof Error ? error.message : "Failed to update user"
      );
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Handle user deletion
   */
  const handleDeleteUser = async (user: UserListItem) => {
    try {
      setActionLoading(`delete-${user.id}`);

      let response;
      if (user.role === UserRole.SUPER_USER) {
        response = await UserService.deleteSuperUser(user.id);
      } else {
        response = await UserService.deleteUser(user.id);
      }

      if (response.success) {
        success(
          "User Deleted",
          `${user.username} has been deleted successfully`
        );
        await loadUsers(); // Refresh the list
      } else {
        showError("Error", "Failed to delete user");
      }
    } catch (error) {
      showError(
        "Error",
        error instanceof Error ? error.message : "Failed to delete user"
      );
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Handle user status toggle
   */
  const handleToggleUserStatus = async (user: UserListItem) => {
    try {
      setActionLoading(`toggle-${user.id}`);

      const response = await UserService.toggleUserStatus(
        user.id,
        !user.isActive
      );

      if (response.success) {
        success(
          "Status Updated",
          `${user.username} has been ${
            !user.isActive ? "activated" : "deactivated"
          }`
        );
        await loadUsers(); // Refresh the list
      } else {
        showError("Error", "Failed to update user status");
      }
    } catch (error) {
      showError(
        "Error",
        error instanceof Error ? error.message : "Failed to update user status"
      );
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Open edit modal
   */
  const openEditModal = (user: UserListItem) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  /**
   * Open detail modal
   */
  const openDetailModal = (user: UserListItem) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  /**
   * Get user statistics
   */
  const getUserStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;
    const superUsers = users.filter(
      (u) => u.role === UserRole.SUPER_USER
    ).length;
    const adminUsers = users.filter(
      (u) => u.role === UserRole.ADMIN_USER
    ).length;
    const generalUsers = users.filter(
      (u) => u.role === UserRole.GENERAL_USER
    ).length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      superUsers,
      adminUsers,
      generalUsers,
    };
  };

  const stats = getUserStats();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={loadUsers}
            disabled={loading}
            leftIcon={
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            }
          >
            Refresh
          </Button>

          <Button
            variant="gradient"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-3xl font-bold text-blue-900">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500 text-white">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Active Users
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {stats.activeUsers}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500 text-white">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">
                  Inactive Users
                </p>
                <p className="text-3xl font-bold text-red-900">
                  {stats.inactiveUsers}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-red-500 text-white">
                <UserX className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Admins</p>
                <p className="text-3xl font-bold text-purple-900">
                  {stats.superUsers + stats.adminUsers}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500 text-white">
                <Crown className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-100 border-l-4 border-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-500 text-white">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-amber-900">
                    {selectedUsers.length} user
                    {selectedUsers.length > 1 ? "s" : ""} selected
                  </p>
                  <p className="text-sm text-amber-700">
                    Choose an action to apply to selected users
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUsers([])}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Export Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Table */}
      <EnhancedUserTable
        users={users}
        loading={loading}
        onEdit={openEditModal}
        onView={openDetailModal}
        onDelete={handleDeleteUser}
        onSelectionChange={setSelectedUsers}
      />

      {/* Create User Modal */}
      <EnhancedUserForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
        loading={actionLoading === "create"}
      />

      {/* Edit User Modal */}
      <EnhancedUserForm
        user={selectedUser}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSubmit={handleEditUser}
        loading={actionLoading === "edit"}
      />

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailView
          user={selectedUser}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedUser(null);
          }}
          onEdit={openEditModal}
          onDelete={handleDeleteUser}
          onToggleStatus={handleToggleUserStatus}
          loading={
            actionLoading?.startsWith(`toggle-${selectedUser.id}`) ||
            actionLoading?.startsWith(`delete-${selectedUser.id}`)
          }
        />
      )}
    </div>
  );
}

/**
 * User Management Page with Toast Provider
 * Wrapper component that provides toast context
 */
export function UserManagementPageWithProvider(props: UserManagementPageProps) {
  return (
    <ToastProvider>
      <UserManagementPage {...props} />
    </ToastProvider>
  );
}

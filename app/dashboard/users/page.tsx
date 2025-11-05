/**
 * User Management Page
 * Comprehensive user management with role-based creation and deletion
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { UserService } from "@/lib/api/users";
import { apiClient } from "@/lib/api/client";
import { DataTable, Column } from "@/lib/components/ui/data-table";
import { Button } from "@/lib/components/ui/button";
import { Badge } from "@/lib/components/ui/badge";
import { Modal } from "@/lib/components/ui/modal";
import { UserForm } from "@/lib/components/users/user-form";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Filter,
  Users,
  Shield,
  Crown,
  RefreshCw,
} from "lucide-react";
import type {
  UserListItem,
  UserSearchParams,
  UserFormData,
} from "@/lib/types/user";
import { UserRole } from "@/lib/types/auth";
import {
  PermissionGuard,
  usePermissions,
} from "@/lib/components/auth/permission-guard";
import { Permission } from "@/lib/utils/rbac";

export default function UsersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { user: currentUser } = useAuth();
  const permissions = usePermissions();

  // State management
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserDetails, setCurrentUserDetails] = useState<any>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0,
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    role?: UserRole;
    isActive?: boolean;
  }>({});

  // Modal state
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUserType, setCreateUserType] = useState<
    "super" | "admin" | "general"
  >("general");

  // Create user form state
  const [createUserData, setCreateUserData] = useState({
    username: "",
    email: "",
    password: "",
    business_id: "", // For admin users
  });
  const [createUserError, setCreateUserError] = useState<string | null>(null);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Fetch users with current parameters
   */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching users...");

      // Check authentication status
      console.log("🔐 Auth status:", {
        isAuthenticated,
        currentUser: currentUser?.username,
        userRole: currentUser?.role,
      });

      // Use the admin endpoint to get all users
      const response = await UserService.getAllUsers();

      console.log("🔍 Full API response:", JSON.stringify(response, null, 2));
      console.log("🔍 Response success:", response.success);
      console.log("🔍 Response data:", response.data);
      console.log("🔍 Response error:", response.error);

      // Additional debugging
      if (!response.success) {
        console.log("🔍 Error details:", {
          errorType: typeof response.error,
          errorKeys: response.error
            ? Object.keys(response.error)
            : "no error object",
          fullError: response.error,
        });
      }

      if (response.success && response.data) {
        console.log("✅ Users fetched successfully:", response.data.length);

        // Ensure response.data is an array
        const usersData = Array.isArray(response.data) ? response.data : [];

        // Apply client-side filtering if needed
        let filteredUsers = usersData;

        if (searchQuery) {
          filteredUsers = filteredUsers.filter(
            (user) =>
              user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        if (filters.role) {
          filteredUsers = filteredUsers.filter(
            (user) => user.role === filters.role
          );
        }

        if (filters.isActive !== undefined) {
          filteredUsers = filteredUsers.filter(
            (user) => user.isActive === filters.isActive
          );
        }

        setUsers(filteredUsers);
        setPagination((prev) => ({
          ...prev,
          total: filteredUsers.length,
        }));
      } else {
        console.error(
          "❌ Failed to fetch users:",
          JSON.stringify(response.error, null, 2)
        );

        // Handle different error formats with user-friendly messages
        let errorMessage = "Failed to fetch users";
        if (response.error) {
          if (typeof response.error === "string") {
            errorMessage = response.error;
          } else if (response.error.message) {
            // Handle array of validation errors in message
            if (Array.isArray(response.error.message)) {
              const validationErrors = response.error.message
                .map((err) => {
                  if (typeof err === "string") return err;
                  if (err.msg) {
                    // Convert technical validation messages to user-friendly ones
                    if (err.msg.includes("less than or equal to")) {
                      return "Too many users requested. Please contact support if you need to view more users.";
                    }
                    return err.msg;
                  }
                  return err.message || "Validation error";
                })
                .join(", ");
              errorMessage = validationErrors;
            } else {
              errorMessage = response.error.message;
            }
          } else if (response.error.details) {
            // Handle details which can be any type
            if (typeof response.error.details === "string") {
              errorMessage = response.error.details;
            } else if (Array.isArray(response.error.details)) {
              // Handle validation errors array in details
              errorMessage = response.error.details
                .map((err) => {
                  if (typeof err === "string") return err;
                  if (err.msg) {
                    // Convert technical validation messages to user-friendly ones
                    if (err.msg.includes("less than or equal to")) {
                      return "Request limit exceeded. The system will automatically fetch users in smaller batches.";
                    }
                    return err.msg;
                  }
                  return err.message || "Validation error";
                })
                .join(", ");
            } else if (
              response.error.details &&
              typeof response.error.details === "object"
            ) {
              // Handle object details
              errorMessage =
                response.error.details.message ||
                response.error.details.detail ||
                "Unable to fetch users due to a server error";
            } else {
              errorMessage = String(response.error.details);
            }
          } else if (Array.isArray(response.error)) {
            // Handle validation errors array at root level
            errorMessage = response.error
              .map((err) => {
                if (typeof err === "string") return err;
                if (err.msg) {
                  // Convert technical validation messages to user-friendly ones
                  if (err.msg.includes("less than or equal to")) {
                    return "Request limit exceeded. Please try again.";
                  }
                  return err.msg;
                }
                return err.message || "Validation error";
              })
              .join(", ");
          } else {
            errorMessage = "Unable to fetch users. Please try again later.";
          }
        }

        setError(String(errorMessage));
        setUsers([]); // Ensure users is always an array
      }
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      setError(
        err instanceof Error ? err.message : String(err) || "An error occurred"
      );
      setUsers([]); // Ensure users is always an array
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  /**
   * Fetch current user details
   */
  const fetchCurrentUserDetails = useCallback(async () => {
    try {
      console.log("👤 Fetching current user details...");

      // Make direct API call to get raw response from /user/check-me
      const response = await apiClient.get<any>("/user/check-me");

      if (response.success && response.data) {
        setCurrentUserDetails(response.data);
        console.log("✅ Current user details fetched:", response.data);
      } else {
        console.error(
          "❌ Failed to fetch current user details:",
          response.error
        );
      }
    } catch (err) {
      console.error("❌ Error fetching current user details:", err);
    }
  }, []);

  // Fetch users and current user details on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchCurrentUserDetails();
    }
  }, [isAuthenticated, fetchUsers, fetchCurrentUserDetails]);

  /**
   * Handle search
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageSize, page: 1 }));
  };

  /**
   * Handle user actions
   */
  const handleViewUser = async (user: UserListItem) => {
    try {
      setLoading(true);
      console.log("👁️ Viewing user details for:", user.username);

      // Fetch detailed user information
      const response = await UserService.getUserInfo(user.id);

      if (response.success && response.data) {
        setSelectedUser(response.data);
        setShowUserModal(true);
      } else {
        console.error("❌ Failed to fetch user details:", response.error);
        // Fallback to using the existing user data
        setSelectedUser(user);
        setShowUserModal(true);
      }
    } catch (err) {
      console.error("❌ Error fetching user details:", err);
      // Fallback to using the existing user data
      setSelectedUser(user);
      setShowUserModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserListItem) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (userData: UserFormData) => {
    if (!selectedUser) return;

    try {
      const response = await UserService.updateUser(selectedUser.id, userData);
      if (response.success) {
        // Show success message
        setSuccessMessage(
          `✅ User "${selectedUser.username}" updated successfully!`
        );

        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh the list

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        throw new Error(response.error?.message || "Failed to update user");
      }
    } catch (err) {
      throw err; // Let the form handle the error
    }
  };

  const handleDeleteUser = (user: UserListItem) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleToggleUserStatus = async (user: UserListItem) => {
    try {
      const response = await UserService.toggleUserStatus(
        user.id,
        !user.isActive
      );
      if (response.success) {
        // Show success message
        const statusAction = user.isActive ? "deactivated" : "activated";
        setSuccessMessage(
          `✅ User "${user.username}" ${statusAction} successfully!`
        );

        // Refresh the user list
        fetchUsers();

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setError(
          String(response.error?.message || "Failed to update user status")
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : String(err) || "An error occurred"
      );
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      console.log(
        "🗑️ Deleting user:",
        selectedUser.username,
        "Role:",
        selectedUser.role
      );

      let response;
      if (selectedUser.role === UserRole.SUPER_USER) {
        response = await UserService.deleteSuperUser(selectedUser.id);
      } else {
        response = await UserService.deleteUser(selectedUser.id);
      }

      if (response.success) {
        console.log("✅ User deleted successfully");

        // Show success message
        setSuccessMessage(
          `✅ User "${selectedUser.username}" deleted successfully!`
        );

        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh the list

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        console.error("❌ Failed to delete user:", response.error);
        setError(String(response.error?.message || "Failed to delete user"));
      }
    } catch (err) {
      console.error("❌ Error deleting user:", err);
      setError(
        err instanceof Error ? err.message : String(err) || "An error occurred"
      );
    }
  };

  /**
   * Handle create user
   */
  const handleCreateUser = async () => {
    try {
      setCreateUserLoading(true);
      setCreateUserError(null);
      console.log("👤 Creating user:", createUserType, createUserData);

      // Basic validation
      if (!createUserData.username.trim()) {
        setCreateUserError("Username is required");
        return;
      }
      if (!createUserData.email.trim()) {
        setCreateUserError("Email is required");
        return;
      }
      if (!createUserData.password.trim()) {
        setCreateUserError("Password is required");
        return;
      }
      if (createUserType === "admin" && !createUserData.business_id.trim()) {
        setCreateUserError("Business ID is required for admin users");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(createUserData.email)) {
        setCreateUserError("Please enter a valid email address");
        return;
      }

      // Password validation
      if (createUserData.password.length < 8) {
        setCreateUserError("Password must be at least 8 characters long");
        return;
      }

      let response;
      switch (createUserType) {
        case "super":
          response = await UserService.createSuperUser({
            username: createUserData.username.trim(),
            email: createUserData.email.trim(),
            password: createUserData.password,
          });
          break;
        case "admin":
          response = await UserService.createAdminUser({
            username: createUserData.username.trim(),
            email: createUserData.email.trim(),
            business_id: createUserData.business_id.trim(),
            password: createUserData.password,
          });
          break;
        case "general":
          response = await UserService.createGeneralUser({
            username: createUserData.username.trim(),
            email: createUserData.email.trim(),
            password: createUserData.password,
          });
          break;
      }

      if (response && response.success) {
        console.log("✅ User created successfully:", response.data);

        // Show success message
        const userTypeLabel =
          createUserType === "super"
            ? "Super User"
            : createUserType === "admin"
            ? "Admin User"
            : "General User";
        setSuccessMessage(
          `✅ ${userTypeLabel} "${createUserData.username}" created successfully!`
        );
        setError(null);

        // Close modal and reset form
        setShowCreateModal(false);
        setCreateUserData({
          username: "",
          email: "",
          password: "",
          business_id: "",
        });
        setCreateUserType("general");
        setCreateUserError(null);

        // Refresh the list
        fetchUsers();

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        console.error("❌ Failed to create user:", response?.error);
        const errorMessage =
          response?.error?.message ||
          (typeof response?.error === "string"
            ? response.error
            : "Failed to create user");
        setCreateUserError(errorMessage);
      }
    } catch (err) {
      console.error("❌ Error creating user:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setCreateUserError(errorMessage);
    } finally {
      setCreateUserLoading(false);
    }
  };

  /**
   * Define table columns
   */
  const columns: Column<UserListItem>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: "username",
      label: "Username",
      sortable: true,
      render: (value, user) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">{value}</span>
          {!user.isActive && (
            <Badge variant="outline" className="text-xs">
              Inactive
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      className: "text-gray-600",
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (value: UserRole) => {
        const roleColors = {
          [UserRole.SUPER_USER]: "bg-purple-100 text-purple-800",
          [UserRole.ADMIN_USER]: "bg-blue-100 text-blue-800",
          [UserRole.GENERAL_USER]: "bg-green-100 text-green-800",
        };

        const roleLabels = {
          [UserRole.SUPER_USER]: "Super User",
          [UserRole.ADMIN_USER]: "Admin",
          [UserRole.GENERAL_USER]: "User",
        };

        return <Badge className={roleColors[value]}>{roleLabels[value]}</Badge>;
      },
    },
    {
      key: "pointBalance",
      label: "Current Points",
      sortable: true,
      render: (value, user) => (
        <div className="text-gray-900">
          <div className="font-medium">
            {value !== undefined ? value.toLocaleString() : "N/A"}
          </div>
          {user.totalPoints !== undefined && user.totalPoints !== value && (
            <div className="text-xs text-gray-500">
              Total: {user.totalPoints.toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "paidStatus",
      label: "Status",
      sortable: true,
      render: (value) => {
        const statusColors = {
          Paid: "bg-green-100 text-green-800",
          Unpaid: "bg-red-100 text-red-800",
          "I am super user, I have unlimited points.":
            "bg-purple-100 text-purple-800",
        };

        const displayText =
          value === "I am super user, I have unlimited points."
            ? "Unlimited"
            : value || "Unknown";

        return (
          <Badge
            className={
              statusColors[value as keyof typeof statusColors] ||
              "bg-gray-100 text-gray-800"
            }
          >
            {displayText}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value) => (
        <span className="text-gray-600 text-sm">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "createdBy",
      label: "Created By",
      sortable: true,
      render: (value) => (
        <span className="text-gray-600 text-xs">
          {value ? (
            <div className="max-w-32 truncate" title={value}>
              {value}
            </div>
          ) : (
            "Unknown"
          )}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewUser(user)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <PermissionGuard permission={Permission.DELETE_USERS}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteUser(user)}
              title="Delete User"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

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

  return (
    <PermissionGuard
      permission={Permission.VIEW_ALL_USERS}
      fallback={
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Access Denied
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to view user management.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage system users, roles, and permissions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={fetchUsers}
                leftIcon={<RefreshCw className="h-4 w-4" />}
                disabled={loading}
              >
                Refresh
              </Button>
              <PermissionGuard permission={Permission.CREATE_USERS}>
                <div className="relative">
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Create User
                  </Button>
                </div>
              </PermissionGuard>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm animate-fade-in">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    This message will disappear in 5 seconds
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={() => setSuccessMessage(null)}
                      className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current User Profile */}
          {currentUserDetails && (
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {currentUserDetails.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {currentUserDetails.username}
                    </h3>
                    <p className="text-gray-600">{currentUserDetails.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge
                        className={
                          currentUserDetails.user_status === "super_user"
                            ? "bg-purple-100 text-purple-800"
                            : currentUserDetails.user_status === "admin_user"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {currentUserDetails.user_status === "super_user"
                          ? "Super User"
                          : currentUserDetails.user_status === "admin_user"
                          ? "Admin User"
                          : "General User"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Available Points</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {currentUserDetails.available_points?.toLocaleString() ||
                          0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Points</p>
                      <p className="text-2xl font-bold text-gray-700">
                        {currentUserDetails.total_points?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Member since{" "}
                      {new Date(
                        currentUserDetails.created_at
                      ).toLocaleDateString()}
                    </p>
                    {currentUserDetails.updated_at && (
                      <p className="text-xs text-gray-500">
                        Last updated{" "}
                        {new Date(
                          currentUserDetails.updated_at
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">User ID:</span>
                    <span className="ml-2 font-mono text-gray-700">
                      {currentUserDetails.id}
                    </span>
                  </div>
                  {currentUserDetails.active_supplier &&
                    currentUserDetails.active_supplier.length > 0 && (
                      <div>
                        <span className="text-gray-500">Active Suppliers:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {currentUserDetails.active_supplier.map(
                            (supplier: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {supplier}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  {currentUserDetails.need_to_next_upgrade && (
                    <div>
                      <span className="text-gray-500">Upgrade Status:</span>
                      <p className="text-xs text-orange-600 mt-1">
                        {currentUserDetails.need_to_next_upgrade}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* User Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Total Users
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Array.isArray(users) ? users.length : 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center">
                <Crown className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Super Users
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Array.isArray(users)
                      ? users.filter((u) => u.role === UserRole.SUPER_USER)
                          .length
                      : 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Admin Users
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Array.isArray(users)
                      ? users.filter((u) => u.role === UserRole.ADMIN_USER)
                          .length
                      : 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    General Users
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Array.isArray(users)
                      ? users.filter((u) => u.role === UserRole.GENERAL_USER)
                          .length
                      : 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-emerald-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Active Users
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Array.isArray(users)
                      ? users.filter((u) => u.isActive).length
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {typeof error === "string" ? error : JSON.stringify(error)}
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      fetchUsers();
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          pagination={{
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
          }}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          searchable
          onSearch={handleSearch}
          searchPlaceholder="Search users by username or email..."
          emptyMessage="No users found"
          actions={
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Filter className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement filter modal
                  console.log("Open filters");
                }}
              >
                Filters
              </Button>
            </div>
          }
        />

        {/* User Details Modal */}
        <Modal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          title="User Details"
          size="lg"
        >
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedUser.username}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedUser.role}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Points
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedUser.pointBalance !== undefined
                      ? selectedUser.pointBalance.toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Points
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedUser.totalPoints !== undefined
                      ? selectedUser.totalPoints.toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Status
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedUser.paidStatus ===
                    "I am super user, I have unlimited points."
                      ? "Unlimited Points"
                      : selectedUser.paidStatus || "Unknown"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Requests
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedUser.totalRequests !== undefined
                      ? selectedUser.totalRequests.toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Request Status
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedUser.usingRqStatus || "Unknown"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Created
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedUser.createdBy && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Created By
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.createdBy}
                    </p>
                  </div>
                )}
                {selectedUser.updatedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Updated
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedUser.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedUser.activeSuppliers &&
                selectedUser.activeSuppliers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Active Suppliers
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.activeSuppliers.map((supplier, index) => (
                        <Badge key={index} variant="outline">
                          {supplier}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          title="Delete User"
          size="md"
        >
          {selectedUser && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the user{" "}
                <strong>{selectedUser.username}</strong>? This action cannot be
                undone.
              </p>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDeleteUser}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  Delete User
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Create User Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setCreateUserData({
              username: "",
              email: "",
              password: "",
              business_id: "",
            });
          }}
          title="Create New User"
          size="lg"
        >
          <div className="space-y-6">
            {/* Error Display */}
            {createUserError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      {typeof createUserError === "string"
                        ? createUserError
                        : JSON.stringify(createUserError)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                User Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setCreateUserType("general")}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    createUserType === "general"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Users className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                  <div className="text-sm text-gray-900 font-medium">
                    General User
                  </div>
                  <div className="text-xs text-gray-500">Standard access</div>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateUserType("admin")}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    createUserType === "admin"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Shield className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                  <div className="text-sm font-medium  text-gray-900">
                    Admin User
                  </div>
                  <div className="text-xs text-gray-500">
                    Business management
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateUserType("super")}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    createUserType === "super"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Crown className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                  <div className="text-sm font-medium  text-gray-900">
                    Super User
                  </div>
                  <div className="text-xs text-gray-500">
                    Full system access
                  </div>
                </button>
              </div>
            </div>

            {/* User Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={createUserData.username}
                  onChange={(e) => {
                    setCreateUserData({
                      ...createUserData,
                      username: e.target.value,
                    });
                    if (createUserError) setCreateUserError(null);
                  }}
                  className={`w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    createUserError &&
                    createUserError.toLowerCase().includes("username")
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter username"
                  required
                  disabled={createUserLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={createUserData.email}
                  onChange={(e) => {
                    setCreateUserData({
                      ...createUserData,
                      email: e.target.value,
                    });
                    if (createUserError) setCreateUserError(null);
                  }}
                  className={`w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    createUserError &&
                    createUserError.toLowerCase().includes("email")
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter email"
                  required
                  disabled={createUserLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={createUserData.password}
                  onChange={(e) => {
                    setCreateUserData({
                      ...createUserData,
                      password: e.target.value,
                    });
                    if (createUserError) setCreateUserError(null);
                  }}
                  className={`w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    createUserError &&
                    createUserError.toLowerCase().includes("password")
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter password (min 8 characters)"
                  required
                  disabled={createUserLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>
              {createUserType === "admin" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business ID *
                  </label>
                  <input
                    type="text"
                    value={createUserData.business_id}
                    onChange={(e) => {
                      setCreateUserData({
                        ...createUserData,
                        business_id: e.target.value,
                      });
                      if (createUserError) setCreateUserError(null);
                    }}
                    className={`w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      createUserError &&
                      createUserError.toLowerCase().includes("business")
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter business ID"
                    required
                    disabled={createUserLoading}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateUserData({
                    username: "",
                    email: "",
                    password: "",
                    business_id: "",
                  });
                  setCreateUserError(null);
                  setCreateUserType("general");
                }}
                disabled={createUserLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={
                  !createUserData.username.trim() ||
                  !createUserData.email.trim() ||
                  !createUserData.password.trim() ||
                  (createUserType === "admin" &&
                    !createUserData.business_id.trim()) ||
                  createUserLoading
                }
                leftIcon={
                  createUserLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )
                }
              >
                {createUserLoading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PermissionGuard>
  );
}

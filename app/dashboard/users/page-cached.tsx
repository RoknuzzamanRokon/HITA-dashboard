/**
 * Cached User Management Page
 * Fast loading with persistent caching and background updates
 * Enhanced UI with matrix-style design
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { useAuth } from "@/lib/contexts/auth-context";
import {
  useCachedUsers,
  useCachedUserAnalytics,
  useCachedGeneralUsersAnalytics,
} from "@/lib/hooks/use-cached-users";
import { UserService } from "@/lib/api/users";
import { apiClient } from "@/lib/api/client";
import { DataTable, Column } from "@/lib/components/ui/data-table";
import { Button } from "@/lib/components/ui/button";
import { Badge } from "@/lib/components/ui/badge";
import { Modal } from "@/lib/components/ui/modal";
import { UserForm } from "@/lib/components/users/user-form";
import { UserEditModal } from "@/lib/components/users/user-edit-modal";
import { CacheStatus } from "@/lib/components/ui/cache-status";
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
  TrendingUp,
  AlertTriangle,
  Minus,
  Calendar,
  Activity,
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
import "@/app/globals.css";

export default function CachedUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { user: currentUser } = useAuth();
  const permissions = usePermissions();

  // Cached data hooks
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
    isUsingCachedData,
    cacheAge,
    forceRefresh,
  } = useCachedUsers();

  const {
    data: userAnalytics,
    isLoading: analyticsLoading,
    isUsingCachedData: isUsingCachedUserAnalytics,
  } = useCachedUserAnalytics();

  // Local state management
  const [error, setError] = useState<string | null>(null);
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
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUserType, setCreateUserType] = useState<
    "super" | "admin" | "general"
  >("general");
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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

  // User detail modal state
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null);

  // User activity modal state
  const [showUserActivityModal, setShowUserActivityModal] = useState(false);
  const [selectedUserActivity, setSelectedUserActivity] = useState<any>(null);
  const [userActivityLoading, setUserActivityLoading] = useState(false);

  // Enhanced analytics state
  const [currentUserDetails, setCurrentUserDetails] = useState<any>(null);

  // Analytics search and filter state
  const [analyticsSearchQuery, setAnalyticsSearchQuery] = useState("");
  const [analyticsFilters, setAnalyticsFilters] = useState({
    sortBy: "name" as "name" | "date" | "points",
    sortOrder: "asc" as "asc" | "desc",
    dateFrom: "",
    dateTo: "",
  });

  // Use cached analytics data instead of separate state
  const {
    data: allUsersData,
    isLoading: allUsersLoading,
    error: allUsersError,
    isUsingCachedData: isUsingCachedGeneralAnalytics,
    cacheAge: analyticsCacheAge,
    forceRefresh: forceRefreshAnalytics,
  } = useCachedGeneralUsersAnalytics();

  // Apply client-side filtering
  const filteredUsers = React.useMemo(() => {
    if (!Array.isArray(users)) return [];

    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filters.role) {
      filtered = filtered.filter((user) => user.role === filters.role);
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter((user) => user.isActive === filters.isActive);
    }

    return filtered;
  }, [users, searchQuery, filters]);

  // Calculate pagination based on filtered users
  const paginationWithTotal = React.useMemo(
    () => ({
      ...pagination,
      total: filteredUsers.length,
    }),
    [pagination.page, pagination.pageSize, filteredUsers.length],
  );

  /**
   * Fetch current user details with caching
   */
  const fetchCurrentUserDetails = useCallback(async () => {
    // Prevent duplicate calls within 30 seconds
    const now = Date.now();
    const lastFetchKey = "current-user-details-last-fetch";
    const lastFetch = parseInt(localStorage.getItem(lastFetchKey) || "0");

    if (now - lastFetch < 30000) {
      // 30 seconds cooldown
      console.log("🚫 Skipping current user details fetch - too recent");
      return;
    }

    try {
      console.log("👤 Fetching current user details...");
      localStorage.setItem(lastFetchKey, now.toString());

      // Make direct API call to get raw response from /user/check-me
      const response = await apiClient.get<any>("/user/check-me");

      if (response.success && response.data) {
        setCurrentUserDetails(response.data);
        console.log("✅ Current user details fetched:", response.data);
      } else {
        console.error(
          "❌ Failed to fetch current user details:",
          response.error,
        );
      }
    } catch (err) {
      console.error("❌ Error fetching current user details:", err);
    }
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageSize, page: 1 }));
  };

  // Handle refresh
  const handleRefresh = async () => {
    await forceRefresh();
    // Also refresh the analytics data
    if (isAuthenticated) {
      fetchCurrentUserDetails();
      await forceRefreshAnalytics();
    }
  };

  // Fetch users and current user details on component mount
  useEffect(() => {
    if (isAuthenticated) {
      console.log("🔄 useEffect triggered - fetching data...");
      fetchCurrentUserDetails();
      // Analytics data will be fetched automatically by the cached hook
    }
  }, [isAuthenticated, fetchCurrentUserDetails]);

  const handleViewUser = async (user: UserListItem) => {
    try {
      console.log(
        "👁️ Viewing user details for:",
        user.username,
        "ID:",
        user.id,
      );

      // Fetch detailed user information using the new check-user-info API
      const response = await UserService.checkUserInfo(user.id);

      if (response.success && response.data) {
        console.log("✅ User details fetched successfully:", response.data);
        setSelectedUser(user);
        setSelectedUserDetails(response.data);
        setShowUserModal(true);
      } else {
        console.error("❌ Failed to fetch user details:", response.error);
        // Fallback to using the existing user data
        setSelectedUser(user);
        setSelectedUserDetails(null);
        setShowUserModal(true);
      }
    } catch (err) {
      console.error("❌ Error fetching user details:", err);
      // Fallback to using the existing user data
      setSelectedUser(user);
      setSelectedUserDetails(null);
      setShowUserModal(true);
    }
  };

  const handleCheckActivity = async () => {
    try {
      setUserActivityLoading(true);
      console.log(
        "🔍 Check Activity clicked for user:",
        selectedUser?.username || selectedUserDetail?.username,
      );

      const userId =
        selectedUserDetails?.id || selectedUser?.id || selectedUserDetail?.id;
      if (!userId) {
        console.error("❌ No user ID available for activity check");
        return;
      }

      console.log("📡 Fetching activity for user ID:", userId);
      const response = await UserService.getUserActivity(userId);

      if (response.success && response.data) {
        console.log("✅ User activity fetched successfully:", response.data);
        setSelectedUserActivity(response.data);
        setShowUserActivityModal(true);
      } else {
        console.error("❌ Failed to fetch user activity:", response.error);
        // Show error message to user
        alert("Failed to fetch user activity. Please try again.");
      }
    } catch (err) {
      console.error("❌ Error fetching user activity:", err);
      alert("An error occurred while fetching user activity.");
    } finally {
      setUserActivityLoading(false);
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

      // Basic validation (password is optional)
      if (!createUserData.username.trim()) {
        setCreateUserError("Username is required");
        return;
      }
      if (!createUserData.email.trim()) {
        setCreateUserError("Email is required");
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

      // Prepare user data - only include password if provided
      const baseUserData: any = {
        username: createUserData.username.trim(),
        email: createUserData.email.trim(),
      };

      // Only add password if it's not empty
      if (createUserData.password && createUserData.password.trim()) {
        baseUserData.password = createUserData.password.trim();
      }

      console.log("🔧 Creating user with data:", {
        ...baseUserData,
        password: baseUserData.password ? "***" : "not provided",
      });

      let response;
      switch (createUserType) {
        case "super":
          response = await UserService.createSuperUser(baseUserData);
          break;
        case "admin":
          response = await UserService.createAdminUser({
            ...baseUserData,
            business_id: createUserData.business_id.trim(),
          });
          break;
        case "general":
          response = await UserService.createGeneralUser(baseUserData);
          break;
      }

      console.log("📡 API Response:", response);

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
          `✅ ${userTypeLabel} "${createUserData.username}" created successfully!`,
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

        // Refresh the cached data
        await forceRefresh();
        await forceRefreshAnalytics();

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        console.error("❌ Failed to create user - Full response:", response);
        console.error("❌ Error object:", response?.error);

        // Parse the error message from the backend
        let errorMessage = "Failed to create user";

        if (response?.error) {
          // Check if error has details (Pydantic validation errors)
          if (response.error.details) {
            console.log("❌ Error details:", response.error.details);

            // Handle array of validation errors
            if (Array.isArray(response.error.details)) {
              const validationErrors = response.error.details
                .map((err: any) => {
                  if (typeof err === "string") return err;
                  if (err.msg) return err.msg;
                  if (err.message) return err.message;
                  return JSON.stringify(err);
                })
                .join(", ");
              errorMessage = validationErrors || errorMessage;
            } else if (typeof response.error.details === "string") {
              errorMessage = response.error.details;
            }
          }
          // Check if error has a message
          else if (response.error.message) {
            errorMessage = response.error.message;
          }
          // Check if error is a string
          else if (typeof response.error === "string") {
            errorMessage = response.error;
          }
        }

        // Make the error message more user-friendly
        if (
          errorMessage.includes(
            "Password must contain at least one uppercase letter",
          )
        ) {
          errorMessage =
            "Password must contain at least one uppercase letter. Please update the password and try again.";
        }

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

  const handleEditUser = (user: UserListItem) => {
    setSelectedUserId(user.id);
    setShowUserEditModal(true);
  };

  const handleDeleteUser = (user: UserListItem) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleToggleUserStatus = async (user: UserListItem) => {
    try {
      const response = await UserService.toggleUserStatus(
        user.id,
        !user.isActive,
      );
      if (response.success) {
        const statusAction = user.isActive ? "deactivated" : "activated";
        setSuccessMessage(
          `✅ User "${user.username}" ${statusAction} successfully!`,
        );

        // Refresh the cached data
        await forceRefresh();

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setError(
          String(response.error?.message || "Failed to update user status"),
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : String(err) || "An error occurred",
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
        selectedUser.role,
      );

      let response;
      if (selectedUser.role === UserRole.SUPER_USER) {
        response = await UserService.deleteSuperUser(selectedUser.id);
      } else {
        response = await UserService.deleteUser(selectedUser.id);
      }

      if (response.success) {
        console.log("✅ User deleted successfully");
        setSuccessMessage(
          `✅ User "${selectedUser.username}" deleted successfully!`,
        );

        setShowDeleteModal(false);
        setSelectedUser(null);

        // Refresh the cached data
        await forceRefresh();

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
        err instanceof Error ? err.message : String(err) || "An error occurred",
      );
    }
  };

  // Define table columns
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
        const roleColors: Record<string, string> = {
          [UserRole.SUPER_USER]: "bg-purple-100 text-purple-800",
          [UserRole.ADMIN_USER]: "bg-blue-100 text-blue-800",
          [UserRole.USER]: "bg-green-100 text-gray-900",
          [UserRole.GENERAL_USER]: "bg-green-100 text-gray-900",
        };

        const roleLabels: Record<string, string> = {
          [UserRole.SUPER_USER]: "Super User",
          [UserRole.ADMIN_USER]: "Admin",
          [UserRole.USER]: "User",
          [UserRole.GENERAL_USER]: "User",
        };

        return (
          <Badge
            className={roleColors[value] || roleColors[UserRole.GENERAL_USER]}
          >
            {roleLabels[value] || roleLabels[UserRole.GENERAL_USER]}
          </Badge>
        );
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
          Paid: "bg-green-100 text-gray-900",
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
        <div className="mx-auto">
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
      <div className="mx-auto">
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
                onClick={handleRefresh}
                leftIcon={<RefreshCw className="h-4 w-4" />}
                disabled={usersLoading}
              >
                Refresh
              </Button>
              <PermissionGuard permission={Permission.CREATE_USERS}>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Create User
                </Button>
              </PermissionGuard>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm animate-fade-in">
              <div className="flex items-center">
                <div className="shrink-0">
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
                </div>
                <div className="ml-auto pl-3">
                  <button
                    type="button"
                    onClick={() => setSuccessMessage(null)}
                    className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100"
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
          )}

          {/* Error Message */}
          {(error || usersError) && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error || usersError}</p>
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
                              : "text-gray-900 text-green-800"
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
                        currentUserDetails.created_at,
                      ).toLocaleDateString()}
                    </p>
                    {currentUserDetails.updated_at && (
                      <p className="text-xs text-gray-500">
                        Last updated{" "}
                        {new Date(
                          currentUserDetails.updated_at,
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
                            ),
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

          {/* Users Table */}
          <div className="mt-8">
            <DataTable
              data={filteredUsers}
              columns={columns}
              loading={usersLoading && !isUsingCachedData}
              pagination={paginationWithTotal}
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
          </div>

          {/* General Users Analytics Section */}
          <div className="mt-12 pt-8 border-t-4 border-gray-200">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="px-8 py-6 bg-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        General Users Analytics
                      </h2>
                      <p className="text-white/80 text-sm mt-1">
                        Real-time insights and user activity monitoring
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={forceRefreshAnalytics}
                    disabled={allUsersLoading}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    leftIcon={
                      allUsersLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )
                    }
                  >
                    {allUsersLoading ? "Refreshing..." : "Refresh Data"}
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white p-8">
                {/* Analytics Cache Status Debug Info (only in development) */}
                {/* {process.env.NODE_ENV === "development" &&
                  isUsingCachedGeneralAnalytics && (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <span>⚡ Using cached analytics data</span>
                        {analyticsCacheAge && (
                          <span>
                            • Age: {Math.round(analyticsCacheAge / 1000)}s
                          </span>
                        )}
                        <button
                          onClick={forceRefreshAnalytics}
                          className="ml-auto px-2 py-1 bg-green-100 rounded text-xs hover:bg-green-200"
                        >
                          Refresh Now
                        </button>
                      </div>
                    </div>
                  )} */}

                {allUsersLoading && !allUsersData && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">
                      Loading user data...
                    </p>
                  </div>
                )}

                {allUsersError && (
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                    <div className="flex items-start">
                      <div className="shrink-0">
                        <svg
                          className="h-6 w-6 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-red-800 font-semibold">
                          Unable to load data
                        </h3>
                        <p className="text-red-700 text-sm mt-1">
                          {allUsersError}
                        </p>
                        <button
                          onClick={forceRefreshAnalytics}
                          className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 underline"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {allUsersData && !allUsersError && (
                  <div className="space-y-8">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full"></div>
                        <div className="relative">
                          <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">
                            Total Users
                          </p>
                          <p className="text-4xl font-bold mt-2">
                            {allUsersData.pagination?.total || 0}
                          </p>
                          <p className="text-blue-100 text-xs mt-2">
                            Showing {allUsersData.statistics?.showing || 0}{" "}
                            users
                          </p>
                        </div>
                      </div>

                      <div className="relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full"></div>
                        <div className="relative">
                          <p className="text-red-100 text-sm font-medium uppercase tracking-wide">
                            Unpaid Users
                          </p>
                          <p className="text-4xl font-bold mt-2">
                            {allUsersData.statistics?.total_unpaid_users || 0}
                          </p>
                          <p className="text-red-100 text-xs mt-2">
                            Require payment
                          </p>
                        </div>
                      </div>

                      <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full"></div>
                        <div className="relative">
                          <p className="text-green-100 text-sm font-medium uppercase tracking-wide">
                            Active Users
                          </p>
                          <p className="text-4xl font-bold mt-2">
                            {allUsersData.users?.filter((u: any) => u.is_active)
                              .length || 0}
                          </p>
                          <p className="text-green-100 text-xs mt-2">
                            Currently active
                          </p>
                        </div>
                      </div>

                      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full"></div>
                        <div className="relative">
                          <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">
                            Paid Users
                          </p>
                          <p className="text-4xl font-bold mt-2">
                            {allUsersData.users?.filter(
                              (u: any) => u.points?.paid_status === "Paid",
                            ).length || 0}
                          </p>
                          <p className="text-purple-100 text-xs mt-2">
                            Payment complete
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Users Grid */}
                    {allUsersData.users && allUsersData.users.length > 0 && (
                      <div>
                        {/* Search and Filter Section */}
                        <div className="mb-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                              User Directory
                              <span className="ml-2 text-sm font-normal text-gray-500">
                                (
                                {(() => {
                                  let filtered = allUsersData.users;
                                  if (analyticsSearchQuery) {
                                    filtered = filtered.filter(
                                      (u: any) =>
                                        u.username
                                          ?.toLowerCase()
                                          .includes(
                                            analyticsSearchQuery.toLowerCase(),
                                          ) ||
                                        u.email
                                          ?.toLowerCase()
                                          .includes(
                                            analyticsSearchQuery.toLowerCase(),
                                          ),
                                    );
                                  }
                                  if (analyticsFilters.dateFrom) {
                                    filtered = filtered.filter(
                                      (u: any) =>
                                        new Date(u.created_at) >=
                                        new Date(analyticsFilters.dateFrom),
                                    );
                                  }
                                  if (analyticsFilters.dateTo) {
                                    filtered = filtered.filter(
                                      (u: any) =>
                                        new Date(u.created_at) <=
                                        new Date(analyticsFilters.dateTo),
                                    );
                                  }
                                  return filtered.length;
                                })()}{" "}
                                users)
                              </span>
                            </h3>
                          </div>

                          {/* Search and Filter Controls */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search Input */}
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={analyticsSearchQuery}
                                onChange={(e) =>
                                  setAnalyticsSearchQuery(e.target.value)
                                }
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                              />
                              <svg
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                              </svg>
                            </div>

                            {/* Sort By */}
                            <select
                              value={analyticsFilters.sortBy}
                              onChange={(e) =>
                                setAnalyticsFilters({
                                  ...analyticsFilters,
                                  sortBy: e.target.value as
                                    | "name"
                                    | "date"
                                    | "points",
                                })
                              }
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            >
                              <option value="name">Sort by Name</option>
                              <option value="date">Sort by Date</option>
                              <option value="points">Sort by Points</option>
                            </select>

                            {/* Date From */}
                            <input
                              type="date"
                              value={analyticsFilters.dateFrom}
                              onChange={(e) =>
                                setAnalyticsFilters({
                                  ...analyticsFilters,
                                  dateFrom: e.target.value,
                                })
                              }
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                              placeholder="From Date"
                            />

                            {/* Date To */}
                            <input
                              type="date"
                              value={analyticsFilters.dateTo}
                              onChange={(e) =>
                                setAnalyticsFilters({
                                  ...analyticsFilters,
                                  dateTo: e.target.value,
                                })
                              }
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                              placeholder="To Date"
                            />
                          </div>

                          {/* Sort Order Toggle */}
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() =>
                                setAnalyticsFilters({
                                  ...analyticsFilters,
                                  sortOrder:
                                    analyticsFilters.sortOrder === "asc"
                                      ? "desc"
                                      : "asc",
                                })
                              }
                              className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                            >
                              <svg
                                className={`w-4 h-4 transition-transform ${
                                  analyticsFilters.sortOrder === "desc"
                                    ? "rotate-180"
                                    : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                              <span className="text-sm font-medium">
                                {analyticsFilters.sortOrder === "asc"
                                  ? "Ascending"
                                  : "Descending"}
                              </span>
                            </button>

                            {/* Clear Filters */}
                            {(analyticsSearchQuery ||
                              analyticsFilters.dateFrom ||
                              analyticsFilters.dateTo) && (
                              <button
                                onClick={() => {
                                  setAnalyticsSearchQuery("");
                                  setAnalyticsFilters({
                                    sortBy: "name",
                                    sortOrder: "asc",
                                    dateFrom: "",
                                    dateTo: "",
                                  });
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                <span className="text-sm font-medium">
                                  Clear Filters
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* User List Table */}
                        <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                          <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                              <Users className="h-5 w-5 mr-2 text-indigo-600" />
                              User List Cards
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Click on any row to view detailed information
                            </p>
                          </div>
                          <div className="max-h-[600px] overflow-y-auto">
                            {(() => {
                              let filtered = [...allUsersData.users];

                              // Apply search filter
                              if (analyticsSearchQuery) {
                                filtered = filtered.filter(
                                  (u: any) =>
                                    u.username
                                      ?.toLowerCase()
                                      .includes(
                                        analyticsSearchQuery.toLowerCase(),
                                      ) ||
                                    u.email
                                      ?.toLowerCase()
                                      .includes(
                                        analyticsSearchQuery.toLowerCase(),
                                      ),
                                );
                              }

                              // Apply date filters
                              if (analyticsFilters.dateFrom) {
                                filtered = filtered.filter(
                                  (u: any) =>
                                    new Date(u.created_at) >=
                                    new Date(analyticsFilters.dateFrom),
                                );
                              }
                              if (analyticsFilters.dateTo) {
                                filtered = filtered.filter(
                                  (u: any) =>
                                    new Date(u.created_at) <=
                                    new Date(analyticsFilters.dateTo),
                                );
                              }

                              // Apply sorting
                              filtered.sort((a: any, b: any) => {
                                let comparison = 0;

                                if (analyticsFilters.sortBy === "name") {
                                  comparison = (a.username || "").localeCompare(
                                    b.username || "",
                                  );
                                } else if (analyticsFilters.sortBy === "date") {
                                  comparison =
                                    new Date(a.created_at).getTime() -
                                    new Date(b.created_at).getTime();
                                } else if (
                                  analyticsFilters.sortBy === "points"
                                ) {
                                  comparison =
                                    (a.points?.current_points || 0) -
                                    (b.points?.current_points || 0);
                                }

                                return analyticsFilters.sortOrder === "asc"
                                  ? comparison
                                  : -comparison;
                              });

                              // Show no results message if filtered list is empty
                              if (filtered.length === 0) {
                                return (
                                  <div className="text-center py-12">
                                    <svg
                                      className="mx-auto h-12 w-12 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                      No users found
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                      Try adjusting your search or filter
                                      criteria
                                    </p>
                                  </div>
                                );
                              }

                              return (
                                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                                  <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        User
                                      </th>
                                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Status
                                      </th>
                                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Current Points
                                      </th>
                                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Total Points
                                      </th>
                                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Requests
                                      </th>
                                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Payment
                                      </th>
                                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Created
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {filtered.map(
                                      (user: any, index: number) => (
                                        <tr
                                          key={user.id || index}
                                          onClick={() => {
                                            setSelectedUserDetail(user);
                                            setShowUserDetailModal(true);
                                          }}
                                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                          <td className="py-3 px-4">
                                            <div className="flex items-center space-x-3">
                                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {user.username
                                                  ?.charAt(0)
                                                  .toUpperCase()}
                                              </div>
                                              <div>
                                                <p className="font-semibold text-gray-900 text-sm">
                                                  {user.username}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                  {user.email}
                                                </p>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="py-3 px-4">
                                            <span
                                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 ${
                                                user.is_active
                                                  ? "border-green-600 text-green-600 bg-transparent"
                                                  : "border-gray-600 text-gray-600 bg-transparent"
                                              }`}
                                            >
                                              {user.is_active
                                                ? "Active"
                                                : "Inactive"}
                                            </span>
                                          </td>
                                          <td className="py-3 px-4 text-sm text-indigo-600 font-bold">
                                            {user.points?.current_points?.toLocaleString() ||
                                              "0"}
                                          </td>
                                          <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
                                            {user.points?.total_points?.toLocaleString() ||
                                              "0"}
                                          </td>
                                          <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
                                            {user.total_requests || "0"}
                                          </td>
                                          <td className="py-3 px-4">
                                            <span
                                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 ${
                                                user.points?.paid_status ===
                                                "Paid"
                                                  ? "border-cyan-600 text-cyan-600 bg-transparent"
                                                  : "border-amber-600 text-amber-600 bg-transparent"
                                              }`}
                                            >
                                              {user.points?.paid_status ||
                                                "Pending"}
                                            </span>
                                          </td>
                                          <td className="py-3 px-4 text-sm text-gray-900">
                                            {new Date(
                                              user.created_at,
                                            ).toLocaleDateString()}
                                          </td>
                                        </tr>
                                      ),
                                    )}
                                  </tbody>
                                </table>
                              );
                            })()}
                          </div>

                          {/* Footer Info */}
                          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Page:</span>{" "}
                                {allUsersData.pagination?.page || 1} of{" "}
                                {allUsersData.pagination?.total_pages || 1}
                              </div>
                              <div>
                                <span className="font-medium">Limit:</span>{" "}
                                {allUsersData.pagination?.limit || 25} per page
                              </div>
                            </div>
                            {allUsersData.timestamp && (
                              <div className="text-xs text-gray-500">
                                Last updated:{" "}
                                {new Date(
                                  allUsersData.timestamp,
                                ).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Total Users:</span>{" "}
                          {allUsersData?.statistics?.total_users ||
                            users.length}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

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
                  placeholder="Enter password"
                  required
                  disabled={createUserLoading}
                />
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

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          title="Confirm Delete"
          size="sm"
        >
          {selectedUser && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete user "{selectedUser.username}"?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={confirmDeleteUser}>
                  Delete User
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* User Edit Modal */}
        {showUserEditModal && selectedUserId && (
          <UserEditModal
            userId={selectedUserId}
            isOpen={showUserEditModal}
            onClose={() => {
              setShowUserEditModal(false);
              setSelectedUserId(null);
            }}
            onUserUpdated={() => {
              setShowUserEditModal(false);
              setSelectedUserId(null);
              forceRefresh(); // Refresh cached data
            }}
          />
        )}
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
          setSelectedUserDetails(null);
        }}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            {/* User Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {(selectedUserDetails?.username || selectedUser.username)
                    ?.charAt(0)
                    .toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedUserDetails?.username || selectedUser.username}
                  </h3>
                  <p className="text-gray-600 text-sm mt-0.5">
                    {selectedUserDetails?.email || selectedUser.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border-2 ${
                        (selectedUserDetails?.using_rq_status ||
                          selectedUser.usingRqStatus) === "Active"
                          ? "bg-green-50 text-green-700 border-green-300"
                          : "bg-red-50 text-red-700 border-red-300"
                      }`}
                    >
                      {selectedUserDetails?.using_rq_status ||
                        selectedUser.usingRqStatus ||
                        "INACTIVE"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border-2 ${
                        (selectedUserDetails?.points?.paid_status ||
                          selectedUser.paidStatus) === "Paid"
                          ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                          : "bg-amber-50 text-amber-700 border-amber-300"
                      }`}
                    >
                      {(selectedUserDetails?.points?.paid_status ||
                        selectedUser.paidStatus) === "Paid"
                        ? "PAID"
                        : "PENDING"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information Table */}
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                      Field
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      User ID
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900 font-mono">
                      {selectedUserDetails?.id || selectedUser.id}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Username
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900 font-semibold">
                      {selectedUserDetails?.username || selectedUser.username}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Email
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900">
                      {selectedUserDetails?.email || selectedUser.email}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Role
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900">
                      {selectedUserDetails?.role || selectedUser.role}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Status
                    </td>
                    <td className="py-2 px-3 text-xs">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          (selectedUserDetails?.using_rq_status ||
                            selectedUser.usingRqStatus) === "Active"
                            ? "border-green-600 text-green-600 bg-transparent"
                            : "border-red-600 text-red-600 bg-transparent"
                        }`}
                      >
                        {selectedUserDetails?.using_rq_status ||
                          selectedUser.usingRqStatus ||
                          "Inactive"}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Current Points
                    </td>
                    <td className="py-2 px-3 text-sm text-indigo-600 font-bold">
                      {(
                        selectedUserDetails?.points?.current_points ??
                        selectedUser.pointBalance
                      )?.toLocaleString() || "0"}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Total Points
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900 font-semibold">
                      {(
                        selectedUserDetails?.points?.total_points ??
                        selectedUser.totalPoints
                      )?.toLocaleString() || "0"}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Payment Status
                    </td>
                    <td className="py-2 px-3 text-xs">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          (selectedUserDetails?.points?.paid_status ||
                            selectedUser.paidStatus) === "Paid"
                            ? "border-cyan-600 text-cyan-600 bg-transparent"
                            : "border-amber-600 text-amber-600 bg-transparent"
                        }`}
                      >
                        {selectedUserDetails?.points?.paid_status ||
                          selectedUser.paidStatus ||
                          "Pending"}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Total Requests
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900 font-semibold">
                      {selectedUserDetails?.points?.total_rq ||
                        selectedUser.totalRequests ||
                        "0"}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Created At
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900">
                      {selectedUserDetails?.created_at
                        ? new Date(
                            selectedUserDetails.created_at,
                          ).toLocaleString()
                        : selectedUser.createdAt
                          ? new Date(selectedUser.createdAt).toLocaleString()
                          : "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                  setSelectedUserDetails(null);
                }}
              >
                Close
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const userId = selectedUserDetails?.id || selectedUser.id;

                  // Close the modal
                  setShowUserModal(false);

                  // Navigate to billing page with user ID
                  router.push(`/dashboard/billing?userId=${userId}`);
                }}
                leftIcon={<Edit className="h-3 w-3" />}
              >
                Edit User
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleCheckActivity}
                disabled={userActivityLoading}
              >
                {userActivityLoading ? "Loading..." : "Check Activity"}
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
        title="Confirm Delete"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete user "{selectedUser.username}"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDeleteUser}>
                Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* User Edit Modal */}
      {showUserEditModal && selectedUserId && (
        <UserEditModal
          userId={selectedUserId}
          isOpen={showUserEditModal}
          onClose={() => {
            setShowUserEditModal(false);
            setSelectedUserId(null);
          }}
          onUserUpdated={() => {
            setShowUserEditModal(false);
            setSelectedUserId(null);
            forceRefresh(); // Refresh cached data
            forceRefreshAnalytics(); // Refresh analytics data
          }}
        />
      )}

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
          setCreateUserError(null);
          setCreateUserType("general");
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
                <div className="text-sm font-medium text-gray-900">
                  Admin User
                </div>
                <div className="text-xs text-gray-500">Business management</div>
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
                <div className="text-sm font-medium text-gray-900">
                  Super User
                </div>
                <div className="text-xs text-gray-500">Full system access</div>
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
                placeholder="Enter password"
                required
                disabled={createUserLoading}
              />
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

      {/* User Detail Modal with Table */}
      <Modal
        isOpen={showUserDetailModal}
        onClose={() => {
          setShowUserDetailModal(false);
          setSelectedUserDetail(null);
        }}
        title="User Details"
        size="md"
      >
        {selectedUserDetail && (
          <div className="space-y-4">
            {/* User Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {selectedUserDetail.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedUserDetail.username}
                  </h3>
                  <p className="text-gray-600 text-sm mt-0.5">
                    {selectedUserDetail.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border-2 ${
                        selectedUserDetail.using_rq_status === "Active"
                          ? "bg-green-50 text-green-700 border-green-300"
                          : "bg-red-50 text-red-700 border-red-300"
                      }`}
                    >
                      {selectedUserDetail.using_rq_status || "INACTIVE"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border-2 ${
                        selectedUserDetail.points?.paid_status === "Paid"
                          ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                          : "bg-amber-50 text-amber-700 border-amber-300"
                      }`}
                    >
                      {selectedUserDetail.points?.paid_status === "Paid"
                        ? "PAID"
                        : "PENDING"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information Table */}
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                      Field
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      User ID
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900 font-mono">
                      {selectedUserDetail.id}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Username
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900 font-semibold">
                      {selectedUserDetail.username}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Email
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900">
                      {selectedUserDetail.email}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Status
                    </td>
                    <td className="py-2 px-3 text-xs">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          selectedUserDetail.is_active
                            ? "border-green-600 text-green-600 bg-transparent"
                            : "border-gray-600 text-gray-600 bg-transparent"
                        }`}
                      >
                        {selectedUserDetail.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Current Points
                    </td>
                    <td className="py-2 px-3 text-sm text-indigo-600 font-bold">
                      {selectedUserDetail.points?.current_points?.toLocaleString() ||
                        "0"}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Total Points
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900 font-semibold">
                      {selectedUserDetail.points?.total_points?.toLocaleString() ||
                        "0"}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Payment Status
                    </td>
                    <td className="py-2 px-3 text-xs">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          selectedUserDetail.points?.paid_status === "Paid"
                            ? "border-cyan-600 text-cyan-600 bg-transparent"
                            : "border-amber-600 text-amber-600 bg-transparent"
                        }`}
                      >
                        {selectedUserDetail.points?.paid_status || "Pending"}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Total Requests
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900 font-semibold">
                      {selectedUserDetail.total_requests || "0"}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Activity Status
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900">
                      {selectedUserDetail.activity_status || "Unknown"}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Total Suppliers
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900 font-semibold">
                      {selectedUserDetail.total_suppliers || "0"}
                    </td>
                  </tr>
                  {selectedUserDetail.active_suppliers &&
                    selectedUserDetail.active_suppliers.length > 0 && (
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-3 text-xs font-medium text-gray-500 align-top">
                          Active Suppliers
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex flex-wrap gap-1.5">
                            {selectedUserDetail.active_suppliers.map(
                              (supplier: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-indigo-600 text-indigo-600 bg-transparent"
                                >
                                  {supplier}
                                </span>
                              ),
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Created At
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900">
                      {new Date(selectedUserDetail.created_at).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-500">
                      Created By
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900">
                      {selectedUserDetail.created_by || "Unknown"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowUserDetailModal(false);
                  setSelectedUserDetail(null);
                }}
              >
                Close
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const userId = selectedUserDetail.id;

                  // Close the detail modal
                  setShowUserDetailModal(false);

                  // Navigate to billing page with user ID
                  router.push(`/dashboard/billing?userId=${userId}`);
                }}
                leftIcon={<Edit className="h-3 w-3" />}
              >
                Edit User
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cache Status (Development Only) */}
      <CacheStatus />

      {/* User Activity Modal */}
      <Modal
        isOpen={showUserActivityModal}
        onClose={() => {
          setShowUserActivityModal(false);
          setSelectedUserActivity(null);
        }}
        title="User Activity"
        size="lg"
      >
        {selectedUserActivity && (
          <div className="space-y-4">
            {/* Activity Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    Activity Log
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Recent user activity and API usage
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Content */}
            <div className="max-h-96 overflow-y-auto">
              {selectedUserActivity.activities &&
              selectedUserActivity.activities.length > 0 ? (
                <div className="space-y-3">
                  {selectedUserActivity.activities.map(
                    (activity: any, index: number) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {activity.action || activity.type || "Activity"}
                              </span>
                              {activity.status && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    activity.status === "success"
                                      ? "bg-green-100 text-green-800"
                                      : activity.status === "error"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {activity.status}
                                </span>
                              )}
                            </div>
                            {activity.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {activity.description}
                              </p>
                            )}
                            {activity.details && (
                              <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 font-mono">
                                {typeof activity.details === "string"
                                  ? activity.details
                                  : JSON.stringify(activity.details, null, 2)}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 ml-4">
                            {activity.timestamp
                              ? new Date(activity.timestamp).toLocaleString()
                              : activity.created_at
                                ? new Date(activity.created_at).toLocaleString()
                                : "Unknown time"}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Activity Found
                  </h3>
                  <p className="text-gray-600">
                    {selectedUserActivity.message ||
                      "No recent activity data available for this user."}
                  </p>
                  {selectedUserActivity.error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">
                        Error: {selectedUserActivity.error}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Activity Summary */}
            {selectedUserActivity.summary && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(selectedUserActivity.summary).map(
                    ([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {typeof value === "number"
                            ? value.toLocaleString()
                            : String(value)}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {key.replace(/_/g, " ")}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Raw Data (for debugging) */}
            {process.env.NODE_ENV === "development" && (
              <details className="border-t border-gray-200 pt-4">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                  Raw Activity Data (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded-lg overflow-auto max-h-40">
                  {JSON.stringify(selectedUserActivity, null, 2)}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowUserActivityModal(false);
                  setSelectedUserActivity(null);
                }}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  // Refresh activity data
                  const userId =
                    selectedUserDetails?.id ||
                    selectedUser?.id ||
                    selectedUserDetail?.id;
                  if (userId) {
                    handleCheckActivity();
                  }
                }}
                leftIcon={<RefreshCw className="h-3 w-3" />}
              >
                Refresh
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PermissionGuard>
  );
}

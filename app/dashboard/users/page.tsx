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
import { UserEditModal } from "@/lib/components/users/user-edit-modal";
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

  // All Users Check state
  const [allUsersData, setAllUsersData] = useState<any>(null);
  const [allUsersLoading, setAllUsersLoading] = useState(false);
  const [allUsersError, setAllUsersError] = useState<string | null>(null);

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

  // Analytics search and filter state
  const [analyticsSearchQuery, setAnalyticsSearchQuery] = useState("");
  const [analyticsFilters, setAnalyticsFilters] = useState({
    sortBy: "name" as "name" | "date" | "points",
    sortOrder: "asc" as "asc" | "desc",
    dateFrom: "",
    dateTo: "",
  });

  // User detail modal state
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null);

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

  // MetricCard Component Definition
  const MetricCard = ({
    title,
    value,
    change,
    color,
    icon,
    trend,
  }: {
    title: string;
    value: number;
    change: string;
    color: "cyan" | "red" | "green" | "purple";
    icon: string;
    trend: "up" | "alert" | "stable";
  }) => {
    const colorConfig = {
      cyan: {
        gradient: "from-cyan-500 to-blue-600",
        glow: "shadow-cyan-500/20",
        text: "text-cyan-300",
        border: "border-cyan-400",
      },
      red: {
        gradient: "from-red-500 to-pink-600",
        glow: "shadow-red-500/20",
        text: "text-red-300",
        border: "border-red-400",
      },
      green: {
        gradient: "from-green-500 to-emerald-600",
        glow: "shadow-green-500/20",
        text: "text-green-300",
        border: "border-green-400",
      },
      purple: {
        gradient: "from-purple-500 to-indigo-600",
        glow: "shadow-purple-500/20",
        text: "text-purple-300",
        border: "border-purple-400",
      },
    };

    const config = colorConfig[color] || colorConfig.cyan;

    return (
      <div
        className={`relative overflow-hidden bg-gray-800/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm hover:border-${config.border}/50 transition-all duration-500 group hover:scale-105 hover:${config.glow} hover:shadow-xl`}
      >
        {/* Animated Border */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        ></div>

        {/* Corner Accents */}
        <div
          className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${config.border} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        ></div>
        <div
          className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${config.border} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        ></div>
        <div
          className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${config.border} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        ></div>
        <div
          className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${config.border} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        ></div>

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-mono text-sm uppercase tracking-wider">
              {title}
            </span>
            <span className="text-2xl">{icon}</span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className={`text-4xl font-bold ${config.text} font-mono`}>
                {value}
              </p>
              <p className="text-gray-400 text-sm mt-2 font-mono">{change}</p>
            </div>

            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center ${config.glow} shadow-lg`}
            >
              {trend === "up" && <TrendingUp className="h-6 w-6 text-white" />}
              {trend === "alert" && (
                <AlertTriangle className="h-6 w-6 text-white" />
              )}
              {trend === "stable" && <Minus className="h-6 w-6 text-white" />}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // UserMatrixCard Component Definition
  const UserMatrixCard = ({ user, index }: { user: any; index: number }) => {
    return (
      <div className="relative bg-gray-800/30 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-500 group hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10">
        {/* Matrix Background Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(12,150,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(12,150,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative">
          {/* User Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/20">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                {user.is_active && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-gray-900 rounded-full animate-pulse"></div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-white text-xl font-mono">
                  {user.username}
                </h4>
                <p className="text-cyan-300 text-sm font-mono mt-1">
                  {user.email}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-400 text-xs font-mono">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-col items-end space-y-2">
              <div
                className={`px-3 py-1 rounded-full border font-mono text-xs ${
                  user.is_active
                    ? "bg-green-400/10 text-green-400 border-green-400/30"
                    : "bg-gray-400/10 text-gray-400 border-gray-400/30"
                }`}
              >
                {user.is_active ? "ACTIVE" : "INACTIVE"}
              </div>
              <div
                className={`px-3 py-1 rounded-full border font-mono text-xs ${
                  user.points?.paid_status === "Paid"
                    ? "bg-cyan-400/10 text-cyan-400 border-cyan-400/30"
                    : "bg-amber-400/10 text-amber-400 border-amber-400/30"
                }`}
              >
                {user.points?.paid_status === "Paid" ? "PAID" : "PENDING"}
              </div>
            </div>
          </div>

          {/* Digital Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 font-mono text-xs uppercase tracking-wider mb-2">
                CURRENT POINTS
              </p>
              <p className="text-2xl font-bold text-cyan-400 font-mono">
                {user.points?.current_points?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 font-mono text-xs uppercase tracking-wider mb-2">
                TOTAL POINTS
              </p>
              <p className="text-2xl font-bold text-purple-400 font-mono">
                {user.points?.total_points?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 font-mono text-xs uppercase tracking-wider mb-2">
                REQUESTS
              </p>
              <p className="text-2xl font-bold text-blue-400 font-mono">
                {user.total_requests || "0"}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 font-mono text-xs uppercase tracking-wider mb-2">
                ACTIVITY
              </p>
              <p className="text-lg font-bold text-green-400 font-mono">
                {user.activity_status || "UNKNOWN"}
              </p>
            </div>
          </div>

          {/* Suppliers */}
          {user.active_suppliers && user.active_suppliers.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-400 font-mono text-xs uppercase tracking-wider">
                  ACTIVE SUPPLIERS
                </p>
                <span className="text-cyan-300 text-xs font-mono">
                  ({user.total_suppliers})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.active_suppliers
                  .slice(0, 4)
                  .map((supplier: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-cyan-400/10 text-cyan-300 rounded-full text-xs font-mono border border-cyan-400/30"
                    >
                      {supplier}
                    </span>
                  ))}
                {user.active_suppliers.length > 4 && (
                  <span className="px-3 py-1 bg-purple-400/10 text-purple-300 rounded-full text-xs font-mono border border-purple-400/30">
                    +{user.active_suppliers.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-gray-700 flex items-center justify-between text-gray-400 font-mono text-xs">
            <span>
              CREATED: {new Date(user.created_at).toLocaleDateString()}
            </span>
            <span className="max-w-[120px] truncate" title={user.created_by}>
              BY: {user.created_by}
            </span>
          </div>
        </div>
      </div>
    );
  };

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
          response.error
        );
      }
    } catch (err) {
      console.error("❌ Error fetching current user details:", err);
    }
  }, []);

  /**
   * Fetch all users check data
   */
  const fetchAllUsersCheck = useCallback(async () => {
    try {
      setAllUsersLoading(true);
      setAllUsersError(null);
      console.log("🔍 Fetching all general users data...");
      console.log("🔍 API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);

      const response = await apiClient.get<any>("/user/all-general-user");

      console.log("🔍 Full response:", response);
      console.log("🔍 Response success:", response.success);
      console.log("🔍 Response data:", response.data);
      console.log("🔍 Response error:", response.error);

      if (response.success && response.data) {
        setAllUsersData(response.data);
        console.log("✅ All users check data fetched successfully!");
        console.log("✅ Users count:", response.data.users?.length);
        console.log("✅ Statistics:", response.data.statistics);
        console.log("✅ Pagination:", response.data.pagination);
      } else {
        console.error("❌ Failed to fetch all users check:", response.error);
        const errorMsg =
          response.error?.message ||
          (typeof response.error === "string"
            ? response.error
            : "Failed to fetch all users data");
        setAllUsersError(errorMsg);
        console.error("❌ Error message set:", errorMsg);
      }
    } catch (err) {
      console.error("❌ Error fetching all users check:", err);
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setAllUsersError(errorMsg);
      console.error("❌ Error message set:", errorMsg);
    } finally {
      setAllUsersLoading(false);
      console.log("🔍 Loading state set to false");
    }
  }, []);

  // Fetch users and current user details on component mount
  useEffect(() => {
    if (isAuthenticated) {
      console.log("🔄 useEffect triggered - fetching data...");
      fetchUsers();
      fetchCurrentUserDetails();

      // Delay the all users check slightly to avoid race conditions
      setTimeout(() => {
        console.log("🔄 Calling fetchAllUsersCheck...");
        fetchAllUsersCheck();
      }, 500);
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
    setSelectedUserId(user.id);
    setShowUserEditModal(true);
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
        console.error("❌ Failed to create user - Full response:", response);
        console.error("❌ Error object:", response?.error);
        console.error("❌ Error type:", typeof response?.error);

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
            "Password must contain at least one uppercase letter"
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

          {/* Users Table */}
          <div className="mb-12 p-6">
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
          </div>

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
                  <strong>{selectedUser.username}</strong>? This action cannot
                  be undone.
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
                      <h3 className="text-sm font-medium text-red-800">
                        Error
                      </h3>
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

          {/* User Edit Modal */}
          {selectedUserId && (
            <UserEditModal
              isOpen={showUserEditModal}
              onClose={() => {
                console.log("UserEditModal onClose called");
                setShowUserEditModal(false);
                setSelectedUserId(null);
              }}
              userId={selectedUserId}
              onUserUpdated={() => {
                console.log("UserEditModal onUserUpdated called");
                // Refresh both the users list and analytics data
                fetchUsers();
                fetchAllUsersCheck();
              }}
            />
          )}
          {console.log("UserEditModal state:", {
            selectedUserId,
            showUserEditModal,
          })}

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
                    onClick={fetchAllUsersCheck}
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
                      <div className="flex-shrink-0">
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
                          onClick={fetchAllUsersCheck}
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
                              (u: any) => u.points?.paid_status === "Paid"
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
                                            analyticsSearchQuery.toLowerCase()
                                          ) ||
                                        u.email
                                          ?.toLowerCase()
                                          .includes(
                                            analyticsSearchQuery.toLowerCase()
                                          )
                                    );
                                  }
                                  if (analyticsFilters.dateFrom) {
                                    filtered = filtered.filter(
                                      (u: any) =>
                                        new Date(u.created_at) >=
                                        new Date(analyticsFilters.dateFrom)
                                    );
                                  }
                                  if (analyticsFilters.dateTo) {
                                    filtered = filtered.filter(
                                      (u: any) =>
                                        new Date(u.created_at) <=
                                        new Date(analyticsFilters.dateTo)
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
                                        analyticsSearchQuery.toLowerCase()
                                      ) ||
                                    u.email
                                      ?.toLowerCase()
                                      .includes(
                                        analyticsSearchQuery.toLowerCase()
                                      )
                                );
                              }

                              // Apply date filters
                              if (analyticsFilters.dateFrom) {
                                filtered = filtered.filter(
                                  (u: any) =>
                                    new Date(u.created_at) >=
                                    new Date(analyticsFilters.dateFrom)
                                );
                              }
                              if (analyticsFilters.dateTo) {
                                filtered = filtered.filter(
                                  (u: any) =>
                                    new Date(u.created_at) <=
                                    new Date(analyticsFilters.dateTo)
                                );
                              }

                              // Apply sorting
                              filtered.sort((a: any, b: any) => {
                                let comparison = 0;

                                if (analyticsFilters.sortBy === "name") {
                                  comparison = (a.username || "").localeCompare(
                                    b.username || ""
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
                                              user.created_at
                                            ).toLocaleDateString()}
                                          </td>
                                        </tr>
                                      )
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
                                  allUsersData.timestamp
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
                          selectedUserDetail.is_active
                            ? "bg-green-50 text-green-700 border-green-300"
                            : "bg-gray-50 text-gray-700 border-gray-300"
                        }`}
                      >
                        {selectedUserDetail.is_active ? "ACTIVE" : "INACTIVE"}
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
                  <thead className="sticky top-0 bg-[rgb(var(--bg-secondary))]">
                    <tr className="border-b border-[rgb(var(--border-primary))]">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[rgb(var(--text-primary))]">
                        Field
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-[rgb(var(--text-primary))]">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--border-primary))]">
                    <tr className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-[rgb(var(--text-secondary))]">
                        User ID
                      </td>
                      <td className="py-2 px-3 text-xs text-[rgb(var(--text-primary))] font-mono">
                        {selectedUserDetail.id}
                      </td>
                    </tr>
                    <tr className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-[rgb(var(--text-secondary))]">
                        Username
                      </td>
                      <td className="py-2 px-3 text-xs text-[rgb(var(--text-primary))] font-semibold">
                        {selectedUserDetail.username}
                      </td>
                    </tr>
                    <tr className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-[rgb(var(--text-secondary))]">
                        Email
                      </td>
                      <td className="py-2 px-3 text-xs text-[rgb(var(--text-primary))]">
                        {selectedUserDetail.email}
                      </td>
                    </tr>
                    <tr className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-[rgb(var(--text-secondary))]">
                        Status
                      </td>
                      <td className="py-2 px-3 text-xs">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                            selectedUserDetail.is_active
                              ? "border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 bg-transparent"
                              : "border-gray-600 dark:border-gray-400 text-gray-600 dark:text-gray-400 bg-transparent"
                          }`}
                        >
                          {selectedUserDetail.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-[rgb(var(--text-secondary))]">
                        Current Points
                      </td>
                      <td className="py-2 px-3 text-sm text-primary-color font-bold">
                        {selectedUserDetail.points?.current_points?.toLocaleString() ||
                          "0"}
                      </td>
                    </tr>
                    <tr className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-[rgb(var(--text-secondary))]">
                        Total Points
                      </td>
                      <td className="py-2 px-3 text-xs text-[rgb(var(--text-primary))] font-semibold">
                        {selectedUserDetail.points?.total_points?.toLocaleString() ||
                          "0"}
                      </td>
                    </tr>
                    <tr className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-[rgb(var(--text-secondary))]">
                        Payment Status
                      </td>
                      <td className="py-2 px-3 text-xs">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                            selectedUserDetail.points?.paid_status === "Paid"
                              ? "border-cyan-600 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 bg-transparent"
                              : "border-amber-600 dark:border-amber-400 text-amber-600 dark:text-amber-400 bg-transparent"
                          }`}
                        >
                          {selectedUserDetail.points?.paid_status || "Pending"}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-[rgb(var(--text-secondary))]">
                        Total Requests
                      </td>
                      <td className="py-2 px-3 text-xs text-[rgb(var(--text-primary))] font-semibold">
                        {selectedUserDetail.total_requests || "0"}
                      </td>
                    </tr>
                    <tr className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-[rgb(var(--text-secondary))]">
                        Activity Status
                      </td>
                      <td className="py-2 px-3 text-xs text-[rgb(var(--text-primary))]">
                        {selectedUserDetail.activity_status || "Unknown"}
                      </td>
                    </tr>
                    <tr className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-[rgb(var(--text-secondary))]">
                        Total Suppliers
                      </td>
                      <td className="py-2 px-3 text-xs text-[rgb(var(--text-primary))] font-semibold">
                        {selectedUserDetail.total_suppliers || "0"}
                      </td>
                    </tr>
                    {selectedUserDetail.active_suppliers &&
                      selectedUserDetail.active_suppliers.length > 0 && (
                        <tr className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                          <td className="py-2 px-3 text-xs font-medium text-[rgb(var(--text-secondary))] align-top">
                            Active Suppliers
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex flex-wrap gap-1.5">
                              {selectedUserDetail.active_suppliers.map(
                                (supplier: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-primary-color text-primary-color bg-transparent"
                                  >
                                    {supplier}
                                  </span>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    <tr className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-[rgb(var(--text-secondary))]">
                        Created At
                      </td>
                      <td className="py-2 px-3 text-xs text-[rgb(var(--text-primary))]">
                        {new Date(
                          selectedUserDetail.created_at
                        ).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-[rgb(var(--text-secondary))]">
                        Created By
                      </td>
                      <td className="py-2 px-3 text-xs text-[rgb(var(--text-primary))]">
                        {selectedUserDetail.created_by || "Unknown"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-[rgb(var(--border-primary))]">
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
                    console.log(
                      "Edit User clicked, navigating to billing page for userId:",
                      selectedUserDetail.id
                    );

                    // Close the detail modal
                    setShowUserDetailModal(false);

                    // Navigate to billing page
                    router.push("/dashboard/billing");
                  }}
                  leftIcon={<Edit className="h-3 w-3" />}
                >
                  Edit User
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PermissionGuard>
  );
}

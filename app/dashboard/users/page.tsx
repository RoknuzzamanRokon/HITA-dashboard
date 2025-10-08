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

export default function UsersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { user: currentUser } = useAuth();

  // State management
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  /**
   * Fetch users with current parameters
   */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching users...");

      // Use the admin endpoint to get all users
      const response = await UserService.getAllUsers();

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
        console.error("❌ Failed to fetch users:", response.error);
        setError(response.error?.message || "Failed to fetch users");
        setUsers([]); // Ensure users is always an array
      }
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setUsers([]); // Ensure users is always an array
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  // Fetch users on component mount and when dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, fetchUsers]);

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
  const handleViewUser = (user: UserListItem) => {
    router.push(`/dashboard/users/${user.id}`);
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
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh the list
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
        // Refresh the user list
        fetchUsers();
      } else {
        setError(response.error?.message || "Failed to update user status");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh the list
      } else {
        console.error("❌ Failed to delete user:", response.error);
        setError(response.error?.message || "Failed to delete user");
      }
    } catch (err) {
      console.error("❌ Error deleting user:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  /**
   * Handle create user
   */
  const handleCreateUser = async () => {
    try {
      setLoading(true);
      console.log("👤 Creating user:", createUserType, createUserData);

      let response;
      switch (createUserType) {
        case "super":
          response = await UserService.createSuperUser({
            username: createUserData.username,
            email: createUserData.email,
            password: createUserData.password,
          });
          break;
        case "admin":
          response = await UserService.createAdminUser({
            username: createUserData.username,
            email: createUserData.email,
            business_id: createUserData.business_id,
            password: createUserData.password,
          });
          break;
        case "general":
          response = await UserService.createGeneralUser({
            username: createUserData.username,
            email: createUserData.email,
            password: createUserData.password,
          });
          break;
      }

      if (response.success) {
        console.log("✅ User created successfully:", response.data);
        setShowCreateModal(false);
        setCreateUserData({
          username: "",
          email: "",
          password: "",
          business_id: "",
        });
        fetchUsers(); // Refresh the list
      } else {
        console.error("❌ Failed to create user:", response.error);
        setError(response.error?.message || "Failed to create user");
      }
    } catch (err) {
      console.error("❌ Error creating user:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Define table columns
   */
  const columns: Column<UserListItem>[] = [
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
      key: "lastLogin",
      label: "Last Login",
      sortable: true,
      render: (value) => (
        <span className="text-gray-600 text-sm">
          {value ? new Date(value).toLocaleDateString() : "Never"}
        </span>
      ),
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
      key: "id",
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditUser(user)}
            title="Edit User"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleUserStatus(user)}
            title={user.isActive ? "Deactivate" : "Activate"}
            className={
              user.isActive
                ? "text-orange-600 hover:text-orange-700"
                : "text-green-600 hover:text-green-700"
            }
          >
            {user.isActive ? (
              <UserX className="h-4 w-4" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteUser(user)}
            title="Delete User"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
            <div className="relative">
              <Button
                onClick={() => setShowCreateModal(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Create User
              </Button>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
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
                <p className="text-sm font-medium text-gray-500">Super Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Array.isArray(users)
                    ? users.filter((u) => u.role === UserRole.SUPER_USER).length
                    : 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Admin Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Array.isArray(users)
                    ? users.filter((u) => u.role === UserRole.ADMIN_USER).length
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
              <div className="mt-2 text-sm text-red-700">{error}</div>
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
                  Last Login
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedUser.lastLogin
                    ? new Date(selectedUser.lastLogin).toLocaleString()
                    : "Never"}
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
              <Button
                onClick={() => {
                  setShowUserModal(false);
                  router.push(`/dashboard/users/${selectedUser.id}`);
                }}
                leftIcon={<Edit className="h-4 w-4" />}
              >
                View Profile
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

      {/* Edit User Modal */}
      <UserForm
        user={selectedUser}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateUser}
        loading={loading}
      />

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
                <Users className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">General User</div>
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
                <Shield className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Admin User</div>
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
                <Crown className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Super User</div>
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
                onChange={(e) =>
                  setCreateUserData({
                    ...createUserData,
                    username: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={createUserData.email}
                onChange={(e) =>
                  setCreateUserData({
                    ...createUserData,
                    email: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={createUserData.password}
                onChange={(e) =>
                  setCreateUserData({
                    ...createUserData,
                    password: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                required
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
                  onChange={(e) =>
                    setCreateUserData({
                      ...createUserData,
                      business_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter business ID"
                  required
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
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={
                !createUserData.username ||
                !createUserData.email ||
                !createUserData.password ||
                (createUserType === "admin" && !createUserData.business_id) ||
                loading
              }
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {loading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

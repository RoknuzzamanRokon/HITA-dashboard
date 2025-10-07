/**
 * User Management Page
 * Displays list of users with search, filtering, and pagination
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/hooks/use-auth";
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
} from "lucide-react";
import type {
  UserListItem,
  UserSearchParams,
  UserFormData,
} from "@/lib/types/user";
import type { UserRole } from "@/lib/types/auth";

export default function UsersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

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

  /**
   * Fetch users with current parameters
   */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: UserSearchParams = {
        page: pagination.page,
        limit: pagination.pageSize,
        search: searchQuery || undefined,
        role: filters.role,
        isActive: filters.isActive,
      };

      const response = await UserService.getUsers(params);

      if (response.success && response.data) {
        setUsers(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data!.pagination.total,
        }));
      } else {
        setError(response.error?.message || "Failed to fetch users");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchQuery, filters]);

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
      const response = await UserService.deleteUser(selectedUser.id);
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh the list
      } else {
        setError(response.error?.message || "Failed to delete user");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
          super_user: "bg-purple-100 text-purple-800",
          admin_user: "bg-blue-100 text-blue-800",
          general_user: "bg-green-100 text-green-800",
        };

        const roleLabels = {
          super_user: "Super User",
          admin_user: "Admin",
          general_user: "User",
        };

        return <Badge className={roleColors[value]}>{roleLabels[value]}</Badge>;
      },
    },
    {
      key: "pointBalance",
      label: "Points",
      sortable: true,
      render: (value) => (
        <span className="text-gray-900">
          {value !== undefined ? value.toLocaleString() : "N/A"}
        </span>
      ),
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
          <Button
            onClick={() => router.push("/dashboard/users/create")}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add User
          </Button>
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
                  Point Balance
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedUser.pointBalance !== undefined
                    ? selectedUser.pointBalance.toLocaleString()
                    : "N/A"}
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
    </div>
  );
}

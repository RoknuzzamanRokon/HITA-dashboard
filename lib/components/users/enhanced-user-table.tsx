/**
 * Enhanced User Table Component
 * Beautiful user table with alternating row colors, hover effects, sorting, and pagination
 */

"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { Select } from "@/lib/components/ui/select";
import { Badge } from "@/lib/components/ui/badge";
import { Card, CardContent } from "@/lib/components/ui/card";
import { UserListItem } from "@/lib/types/user";
import { UserRole } from "@/lib/types/auth";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Trash2,
  Filter,
  Users,
  CheckCircle,
  XCircle,
  Crown,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedUserTableProps {
  users: UserListItem[];
  loading?: boolean;
  onEdit?: (user: UserListItem) => void;
  onView?: (user: UserListItem) => void;
  onDelete?: (user: UserListItem) => void;
  onSelectionChange?: (selectedUsers: UserListItem[]) => void;
  className?: string;
}

type SortField = keyof UserListItem;
type SortOrder = "asc" | "desc";

interface TableState {
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  currentPage: number;
  pageSize: number;
  selectedUsers: Set<string>;
  roleFilter: UserRole | "all";
  statusFilter: "all" | "active" | "inactive";
}

export function EnhancedUserTable({
  users,
  loading = false,
  onEdit,
  onView,
  onDelete,
  onSelectionChange,
  className,
}: EnhancedUserTableProps) {
  const [state, setState] = useState<TableState>({
    searchQuery: "",
    sortField: "createdAt",
    sortOrder: "desc",
    currentPage: 1,
    pageSize: 10,
    selectedUsers: new Set(),
    roleFilter: "all",
    statusFilter: "all",
  });

  /**
   * Filter and sort users
   */
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      // Search filter
      const matchesSearch =
        user.username.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(state.searchQuery.toLowerCase());

      // Role filter
      const matchesRole =
        state.roleFilter === "all" || user.role === state.roleFilter;

      // Status filter
      const matchesStatus =
        state.statusFilter === "all" ||
        (state.statusFilter === "active" && user.isActive) ||
        (state.statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[state.sortField];
      const bValue = b[state.sortField];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return state.sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    users,
    state.searchQuery,
    state.sortField,
    state.sortOrder,
    state.roleFilter,
    state.statusFilter,
  ]);

  /**
   * Paginated users
   */
  const paginatedUsers = useMemo(() => {
    const startIndex = (state.currentPage - 1) * state.pageSize;
    return filteredAndSortedUsers.slice(
      startIndex,
      startIndex + state.pageSize
    );
  }, [filteredAndSortedUsers, state.currentPage, state.pageSize]);

  /**
   * Pagination info
   */
  const totalPages = Math.ceil(filteredAndSortedUsers.length / state.pageSize);
  const startItem = (state.currentPage - 1) * state.pageSize + 1;
  const endItem = Math.min(
    state.currentPage * state.pageSize,
    filteredAndSortedUsers.length
  );

  /**
   * Handle sorting
   */
  const handleSort = (field: SortField) => {
    setState((prev) => ({
      ...prev,
      sortField: field,
      sortOrder:
        prev.sortField === field && prev.sortOrder === "asc" ? "desc" : "asc",
      currentPage: 1,
    }));
  };

  /**
   * Handle search
   */
  const handleSearch = (query: string) => {
    setState((prev) => ({
      ...prev,
      searchQuery: query,
      currentPage: 1,
    }));
  };

  /**
   * Handle selection
   */
  const handleSelectUser = (userId: string, selected: boolean) => {
    setState((prev) => {
      const newSelected = new Set(prev.selectedUsers);
      if (selected) {
        newSelected.add(userId);
      } else {
        newSelected.delete(userId);
      }

      // Notify parent of selection change
      const selectedUserObjects = users.filter((user) =>
        newSelected.has(user.id)
      );
      onSelectionChange?.(selectedUserObjects);

      return {
        ...prev,
        selectedUsers: newSelected,
      };
    });
  };

  /**
   * Handle select all
   */
  const handleSelectAll = (selected: boolean) => {
    setState((prev) => {
      const newSelected = selected
        ? new Set(paginatedUsers.map((user) => user.id))
        : new Set<string>();

      // Notify parent of selection change
      const selectedUserObjects = users.filter((user) =>
        newSelected.has(user.id)
      );
      onSelectionChange?.(selectedUserObjects);

      return {
        ...prev,
        selectedUsers: newSelected,
      };
    });
  };

  /**
   * Get role display info
   */
  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_USER:
        return {
          label: "Super User",
          icon: Crown,
          color: "text-purple-600 bg-purple-100",
        };
      case UserRole.ADMIN_USER:
        return {
          label: "Admin",
          icon: Settings,
          color: "text-blue-600 bg-blue-100",
        };
      case UserRole.GENERAL_USER:
        return {
          label: "User",
          icon: User,
          color: "text-green-600 bg-green-100",
        };
    }
  };

  /**
   * Get sort icon
   */
  const getSortIcon = (field: SortField) => {
    if (state.sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    return state.sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-600" />
    );
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "w-full shadow-lg border-0 bg-white/95 backdrop-blur-xl",
        className
      )}
    >
      <CardContent className="p-0">
        {/* Header with search and filters */}
        <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  User Management
                </h3>
                <p className="text-sm text-gray-500">
                  {filteredAndSortedUsers.length} of {users.length} users
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={state.searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              {/* Role filter */}
              <Select
                value={state.roleFilter}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    roleFilter: e.target.value as UserRole | "all",
                    currentPage: 1,
                  }))
                }
                options={[
                  { value: "all", label: "All Roles" },
                  { value: UserRole.SUPER_USER, label: "Super User" },
                  { value: UserRole.ADMIN_USER, label: "Admin User" },
                  { value: UserRole.GENERAL_USER, label: "General User" },
                ]}
                className="w-full sm:w-40"
              />

              {/* Status filter */}
              <Select
                value={state.statusFilter}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    statusFilter: e.target.value as
                      | "all"
                      | "active"
                      | "inactive",
                    currentPage: 1,
                  }))
                }
                options={[
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                className="w-full sm:w-32"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={
                      paginatedUsers.length > 0 &&
                      paginatedUsers.every((user) =>
                        state.selectedUsers.has(user.id)
                      )
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort("username")}
                >
                  <div className="flex items-center space-x-1">
                    <span>User</span>
                    {getSortIcon("username")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Role</span>
                    {getSortIcon("role")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort("isActive")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {getSortIcon("isActive")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort("pointBalance")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Points</span>
                    {getSortIcon("pointBalance")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    {getSortIcon("createdAt")}
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user, index) => {
                const roleInfo = getRoleInfo(user.role);
                const RoleIcon = roleInfo.icon;
                const isSelected = state.selectedUsers.has(user.id);

                return (
                  <tr
                    key={user.id}
                    className={cn(
                      "transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 hover:shadow-sm",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30",
                      isSelected && "bg-blue-50 border-l-4 border-blue-500"
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          handleSelectUser(user.id, e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          roleInfo.color
                        )}
                      >
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {roleInfo.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={cn(
                          user.isActive
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        )}
                      >
                        {user.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.pointBalance || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(user)}
                            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(user)}
                            className="text-gray-600 hover:text-green-600 hover:bg-green-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(user)}
                            className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty state */}
          {paginatedUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No users found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {state.searchQuery ||
                state.roleFilter !== "all" ||
                state.statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating a new user."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startItem}</span> to{" "}
                <span className="font-medium">{endItem}</span> of{" "}
                <span className="font-medium">
                  {filteredAndSortedUsers.length}
                </span>{" "}
                results
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage - 1,
                    }))
                  }
                  disabled={state.currentPage === 1}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          state.currentPage === pageNum ? "primary" : "ghost"
                        }
                        size="sm"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            currentPage: pageNum,
                          }))
                        }
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage + 1,
                    }))
                  }
                  disabled={state.currentPage === totalPages}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

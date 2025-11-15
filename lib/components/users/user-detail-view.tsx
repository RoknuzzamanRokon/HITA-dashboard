/**
 * User Detail View Component
 * Beautiful user profile view with attractive card layout and status indicators
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/lib/components/ui/button";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/lib/components/ui/modal";
import { UserListItem } from "@/lib/types/user";
import { UserRole } from "@/lib/types/auth";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Coins,
  Activity,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Crown,
  Settings,
  BarChart3,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserDetailViewProps {
  user: UserListItem;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (user: UserListItem) => void;
  onDelete?: (user: UserListItem) => void;
  onToggleStatus?: (user: UserListItem) => void;
  loading?: boolean;
}

export function UserDetailView({
  user,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  loading = false,
}: UserDetailViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * Get role display information
   */
  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_USER:
        return {
          label: "Super User",
          icon: Crown,
          color: "bg-gradient-to-r from-purple-500 to-pink-500",
          textColor: "text-white",
          description: "Full system access and control",
        };
      case UserRole.ADMIN_USER:
        return {
          label: "Admin User",
          icon: Settings,
          color: "bg-gradient-to-r from-blue-500 to-indigo-500",
          textColor: "text-white",
          description: "Administrative privileges",
        };
      case UserRole.USER:
        return {
          label: "User",
          icon: User,
          color: "bg-gradient-to-r from-green-500 to-emerald-500",
          textColor: "text-white",
          description: "Standard user access",
        };
      case UserRole.GENERAL_USER:
        return {
          label: "General User",
          icon: User,
          color: "bg-gradient-to-r from-green-500 to-emerald-500",
          textColor: "text-white",
          description: "Standard user access",
        };
      default:
        return {
          label: "User",
          icon: User,
          color: "bg-gradient-to-r from-green-500 to-emerald-500",
          textColor: "text-white",
          description: "Standard user access",
        };
    }
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
   * Format date
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
   * Generate user avatar
   */
  const getUserAvatar = (username: string) => {
    const initials = username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const colors = [
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600",
      "from-purple-400 to-purple-600",
      "from-pink-400 to-pink-600",
      "from-indigo-400 to-indigo-600",
      "from-red-400 to-red-600",
    ];

    const colorIndex = username.length % colors.length;

    return (
      <div
        className={cn(
          "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-lg",
          colors[colorIndex]
        )}
      >
        {initials}
      </div>
    );
  };

  const roleInfo = getRoleInfo(user.role);
  const RoleIcon = roleInfo.icon;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="User Details"
        size="xl"
        animation="slide"
      >
        <ModalBody className="p-0">
          {/* Header Section */}
          <div className="relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-transparent" />

            <div className="relative p-6">
              <div className="flex items-start space-x-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {getUserAvatar(user.username)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 truncate">
                      {user.username}
                    </h2>
                    {getStatusBadge(user.isActive)}
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600 mb-3">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>

                  {/* Role Badge */}
                  <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
                    <div className={cn("p-1.5 rounded-lg", roleInfo.color)}>
                      <RoleIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {roleInfo.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {roleInfo.description}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 flex space-x-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(user)}
                      disabled={loading}
                      leftIcon={<Edit className="h-4 w-4" />}
                    >
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={loading}
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Information */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Account Information
                  </h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">
                    User ID
                  </span>
                  <span className="text-sm text-gray-900 font-mono">
                    {user.id}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">
                    Username
                  </span>
                  <span className="text-sm text-gray-900">{user.username}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">
                    Email
                  </span>
                  <span className="text-sm text-gray-900">{user.email}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">
                    Status
                  </span>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(user.isActive)}
                    {onToggleStatus && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleStatus(user)}
                        disabled={loading}
                        className="text-xs"
                      >
                        Toggle
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-500">
                    Created
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Points & Activity */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Coins className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Points & Activity
                  </h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">
                      {user.pointBalance || 0}
                    </div>
                    <div className="text-xs text-blue-500 font-medium">
                      Current Points
                    </div>
                  </div>

                  <div className="text-center p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                    <div className="text-2xl font-bold text-green-600">
                      {user.totalPoints || 0}
                    </div>
                    <div className="text-xs text-green-500 font-medium">
                      Total Points
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">
                      Total Requests
                    </span>
                    <span className="text-sm text-gray-900">
                      {user.totalRequests || 0}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">
                      Payment Status
                    </span>
                    <Badge
                      className={cn(
                        user.paidStatus === "Paid"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      )}
                    >
                      {user.paidStatus || "Unknown"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-500">
                      RQ Status
                    </span>
                    <Badge
                      className={cn(
                        user.usingRqStatus === "Active"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      )}
                    >
                      {user.usingRqStatus || "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 md:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Additional Information
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Last Login
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Created By
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.createdBy || "System"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                    <Activity className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Active Suppliers
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.activeSuppliers?.length || 0} suppliers
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Delete"
        size="md"
      >
        <ModalBody>
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete User Account
              </h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete <strong>{user.username}</strong>
                ? This action cannot be undone and will permanently remove all
                user data.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onDelete?.(user);
              setShowDeleteConfirm(false);
            }}
            disabled={loading}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete User
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

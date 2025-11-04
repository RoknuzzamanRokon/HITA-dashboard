/**
 * User Profile Page
 * Professional user profile with editable information and activity overview
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/lib/components/ui/button";
import { Badge } from "@/lib/components/ui/badge";
import { Modal } from "@/lib/components/ui/modal";
import { PermissionGuard } from "@/lib/components/auth/permission-guard";
import { Permission } from "@/lib/utils/rbac";
import {
  User,
  Shield,
  Calendar,
  Edit,
  Save,
  X,
  Coins,
  Activity,
  Clock,
  Settings,
  Key,
  UserCheck,
} from "lucide-react";
import { UserRole } from "@/lib/types/auth";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  pointBalance: number;
  totalPoints: number;
  paidStatus: string;
  totalRequests: number;
  activityStatus: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  activeSuppliers: string[];
  lastLogin?: string;
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  // State management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit form state
  const [editData, setEditData] = useState({
    username: "",
    email: "",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  /**
   * Fetch user profile data
   */
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch from backend v1.0 endpoints
      const meRes = await apiClient.get<any>(
        "http://127.0.0.1:8002/v1.0/user/me"
      );
      const pointsRes = await apiClient.get<any>(
        "http://127.0.0.1:8002/v1.0/user/points/check/me/"
      );
      const suppliersRes = await apiClient.get<any>(
        "http://127.0.0.1:8002/v1.0/user/check_active_my_supplier"
      );

      if (meRes.success && meRes.data) {
        const me = meRes.data;
        const points = pointsRes.success ? pointsRes.data : null;
        const suppliers = suppliersRes.success ? suppliersRes.data : null;

        const roleMap: Record<string, UserRole> = {
          super_user: UserRole.SUPER_USER,
          admin_user: UserRole.ADMIN_USER,
          general_user: UserRole.GENERAL_USER,
        };

        const resolvedRole: UserRole =
          roleMap[me.user_status] ?? UserRole.GENERAL_USER;

        const profileData: UserProfile = {
          id: me.id,
          username: me.username,
          email: me.email,
          role: resolvedRole,
          isActive: me.is_active !== false,
          pointBalance:
            (points && (points.current_points ?? points.available_points)) ??
            me.available_points ??
            0,
          totalPoints: (points && points.total_points) ?? me.total_points ?? 0,
          paidStatus:
            resolvedRole === UserRole.SUPER_USER
              ? "I am super user, I have unlimited points."
              : me.paid_status || "Paid",
          totalRequests: me.total_rq ?? 0,
          activityStatus: me.using_rq_status || "Inactive",
          createdAt: me.created_at,
          updatedAt: me.updated_at,
          createdBy: me.created_by,
          activeSuppliers:
            (me.supplier_info && me.supplier_info.active_list) ||
            (suppliers && suppliers.my_supplier) ||
            [],
          lastLogin: me.last_login,
        };

        setProfile(profileData);
        setEditData({
          username: profileData.username,
          email: profileData.email,
        });
      } else {
        setError("Failed to load profile data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  /**
   * Handle profile update
   */
  const handleUpdateProfile = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      setError(null);

      // Here you would call your update API
      // const response = await UserService.updateProfile(editData);

      // For now, just simulate success
      setProfile({
        ...profile,
        username: editData.username,
        email: editData.email,
        updatedAt: new Date().toISOString(),
      });

      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle password change
   */
  const handleChangePassword = async () => {
    try {
      setPasswordLoading(true);
      setPasswordError(null);

      // Validation
      if (!passwordData.currentPassword) {
        setPasswordError("Current password is required");
        return;
      }
      if (!passwordData.newPassword) {
        setPasswordError("New password is required");
        return;
      }
      if (passwordData.newPassword.length < 8) {
        setPasswordError("New password must be at least 8 characters long");
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError("New passwords do not match");
        return;
      }

      // Here you would call your password change API
      // const response = await UserService.changePassword(passwordData);

      // For now, just simulate success
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage("Password changed successfully!");

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setPasswordLoading(false);
    }
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
  if (!isAuthenticated || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_USER:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case UserRole.ADMIN_USER:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case UserRole.GENERAL_USER:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_USER:
        return "Super User";
      case UserRole.ADMIN_USER:
        return "Admin User";
      case UserRole.GENERAL_USER:
        return "General User";
      default:
        return "User";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm animate-fade-in">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-green-800">
                {successMessage}
              </p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
              <span className="text-3xl font-bold text-white">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {profile.username}
              </h1>
              <p className="text-blue-100 mb-3">{profile.email}</p>
              <div className="flex items-center space-x-3">
                <Badge className={`${getRoleColor(profile.role)} border`}>
                  {getRoleLabel(profile.role)}
                </Badge>
                <Badge
                  className={
                    profile.isActive
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-red-100 text-red-800 border-red-200"
                  }
                >
                  {profile.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                leftIcon={
                  isEditing ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Edit className="h-4 w-4" />
                  )
                }
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Basic Information
              </h2>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) =>
                      setEditData({ ...editData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({
                        username: profile.username,
                        email: profile.email,
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Username
                    </label>
                    <p className="text-lg text-gray-900 font-medium">
                      {profile.username}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Email Address
                    </label>
                    <p className="text-lg text-gray-900">{profile.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      User Role
                    </label>
                    <Badge className={getRoleColor(profile.role)}>
                      {getRoleLabel(profile.role)}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Account Status
                    </label>
                    <Badge
                      className={
                        profile.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {profile.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Security */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-500" />
                Account Security
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Password</h3>
                  <p className="text-sm text-gray-500">Last changed recently</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowChangePassword(true)}
                  leftIcon={<Key className="h-4 w-4" />}
                >
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Account ID</h3>
                  <p className="text-sm text-gray-500 font-mono">
                    {profile.id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Overview */}
          <PermissionGuard permissions={[Permission.VIEW_ALL_TRANSACTIONS]}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  Activity Overview
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Coins className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total Requests
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {profile.totalRequests}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Activity Status
                      </p>
                      <p className="text-lg font-semibold text-green-600">
                        {profile.activityStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PermissionGuard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Points Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Coins className="h-5 w-5 mr-2 text-yellow-500" />
              Points Balance
            </h3>

            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-600 mb-1">Current Points</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {profile.pointBalance.toLocaleString()}
                </p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                <p className="text-xl font-semibold text-gray-700">
                  {profile.totalPoints.toLocaleString()}
                </p>
              </div>

              <div className="text-center">
                <Badge
                  className={
                    profile.paidStatus === "Paid"
                      ? "bg-green-100 text-green-800"
                      : profile.paidStatus ===
                        "I am super user, I have unlimited points."
                      ? "bg-purple-100 text-purple-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {profile.paidStatus ===
                  "I am super user, I have unlimited points."
                    ? "Unlimited Points"
                    : profile.paidStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Account Details
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Member Since</span>
                <span className="text-gray-900 font-medium">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>

              {profile.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="text-gray-900">
                    {new Date(profile.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {profile.lastLogin && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Login</span>
                  <span className="text-gray-900">
                    {new Date(profile.lastLogin).toLocaleDateString()}
                  </span>
                </div>
              )}

              <PermissionGuard permissions={[Permission.VIEW_ALL_USERS]}>
                {profile.createdBy && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created By</span>
                    <span className="text-gray-900 text-xs">
                      {profile.createdBy}
                    </span>
                  </div>
                )}
              </PermissionGuard>
            </div>
          </div>

          {/* Active Suppliers */}
          {profile.activeSuppliers.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-500" />
                Active Suppliers
              </h3>

              <div className="flex flex-wrap gap-2">
                {profile.activeSuppliers.map((supplier, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {supplier}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => {
          setShowChangePassword(false);
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setPasswordError(null);
        }}
        title="Change Password"
        size="md"
      >
        <div className="space-y-4">
          {passwordError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-700">{passwordError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => {
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                });
                if (passwordError) setPasswordError(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => {
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                });
                if (passwordError) setPasswordError(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new password (min 8 characters)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => {
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                });
                if (passwordError) setPasswordError(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowChangePassword(false);
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
                setPasswordError(null);
              }}
              disabled={passwordLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              leftIcon={
                passwordLoading ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Key className="h-4 w-4" />
                )
              }
            >
              {passwordLoading ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { apiClient } from "@/lib/api/client";
import {
  PerformanceMonitor,
  useApiPerformance,
} from "@/lib/components/performance/performance-monitor";
import { Button } from "@/lib/components/ui/button";
import { Badge } from "@/lib/components/ui/badge";
import { Modal } from "@/lib/components/ui/modal";
import { PermissionGuard } from "@/lib/components/auth/permission-guard";
import { Permission } from "@/lib/utils/rbac";
import { SupplierStatus } from "@/lib/components/profile/supplier-status";
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
  Mail,
  IdCard,
  TrendingUp,
  CheckCircle,
  AlertCircle,
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
  const { measureApiCall } = useApiPerformance();

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

  // Memoize utility functions to prevent unnecessary re-calculations
  const getRoleColor = useCallback((role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_USER:
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white";
      case UserRole.ADMIN_USER:
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      case UserRole.GENERAL_USER:
        return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  }, []);

  const getRoleLabel = useCallback((role: UserRole) => {
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
  }, []);

  const getStatusColor = useCallback((isActive: boolean) => {
    return isActive
      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
      : "bg-gradient-to-r from-red-500 to-red-600 text-white";
  }, []);

  /**
   * Fetch user profile data with parallel API calls for better performance
   */
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Make all API calls in parallel for better performance
      const [meRes, pointsRes, suppliersRes] = await Promise.allSettled([
        measureApiCall(
          () => apiClient.get<any>("/user/check-me"),
          "user-profile"
        ),
        measureApiCall(
          () => apiClient.get<any>("/user/points-check"),
          "user-points"
        ),
        measureApiCall(
          () => apiClient.get<any>("/user/check-active-my-supplier"),
          "user-suppliers"
        ),
      ]);

      // Process results
      const meData =
        meRes.status === "fulfilled" && meRes.value.success
          ? meRes.value
          : null;
      const pointsData =
        pointsRes.status === "fulfilled" && pointsRes.value.success
          ? pointsRes.value
          : null;
      const suppliersData =
        suppliersRes.status === "fulfilled" && suppliersRes.value.success
          ? suppliersRes.value
          : null;

      // Log any failed requests for debugging
      if (pointsRes.status === "rejected") {
        console.warn("Points endpoint failed:", pointsRes.reason);
      }
      if (suppliersRes.status === "rejected") {
        console.warn("Suppliers endpoint failed:", suppliersRes.reason);
      }

      if (meData && meData.data) {
        const me = meData.data;
        const points = pointsData ? pointsData.data : null;
        const suppliers = suppliersData ? suppliersData.data : null;

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
            (points && points.available_points) ?? me.available_points ?? 0,
          totalPoints: (points && points.total_points) ?? me.total_points ?? 0,
          paidStatus:
            resolvedRole === UserRole.SUPER_USER
              ? "I am super user, I have unlimited points."
              : me.paid_status || "Paid",
          totalRequests: me.total_rq ?? 0,
          activityStatus: me.using_rq_status || "Active",
          createdAt: me.created_at,
          updatedAt: me.updated_at,
          createdBy: me.created_by,
          activeSuppliers:
            (suppliers && suppliers.my_supplier) || me.active_supplier || [],
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
  }, []);

  // Memoize formatted dates to avoid recalculation on every render
  const formattedDates = useMemo(() => {
    if (!profile) return {};

    return {
      createdAt: new Date(profile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      lastLogin: profile.lastLogin
        ? new Date(profile.lastLogin).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null,
      updatedAt: profile.updatedAt
        ? new Date(profile.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null,
      createdAtShort: new Date(profile.createdAt).toLocaleDateString(),
    };
  }, [profile]);

  // Fetch profile on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show loading skeleton while fetching profile data
  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Profile Header Skeleton */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 px-8 py-12">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                  <div className="w-28 h-28 bg-white/20 rounded-2xl animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="h-8 w-48 bg-white/20 rounded animate-pulse"></div>
                    <div className="h-4 w-64 bg-white/20 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-white/20 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3 space-y-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 w-48 bg-gray-200 rounded"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="h-20 bg-gray-100 rounded-xl"></div>
                      <div className="h-20 bg-gray-100 rounded-xl"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-20 bg-gray-100 rounded-xl"></div>
                      <div className="h-20 bg-gray-100 rounded-xl"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 w-32 bg-gray-200 rounded"></div>
                  <div className="space-y-3">
                    <div className="h-16 bg-gray-100 rounded-xl"></div>
                    <div className="h-16 bg-gray-100 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !profile) {
    return null;
  }

  return (
    <PerformanceMonitor name="ProfilePage">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-white border-l-4 border-green-500 rounded-lg p-4 shadow-lg animate-fade-in">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                </div>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="ml-auto text-green-500 hover:text-green-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-white border-l-4 border-red-500 rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 px-8 py-12">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                  <div className="relative">
                    <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-4 border-white/30 shadow-2xl">
                      <span className="text-4xl font-bold text-white">
                        {profile.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${getStatusColor(
                          profile.isActive
                        )}`}
                      >
                        {profile.isActive ? "✓ Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                  <div className="text-white">
                    <h1 className="text-4xl font-bold mb-2">
                      {profile.username}
                    </h1>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-blue-200" />
                        <p className="text-blue-100">{profile.email}</p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(
                          profile.role
                        )}`}
                      >
                        {getRoleLabel(profile.role)}
                      </div>
                    </div>
                    <p className="text-blue-200 text-sm">
                      Member since {formattedDates.createdAtShort}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowChangePassword(true)}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                    leftIcon={<Key className="h-4 w-4" />}
                  >
                    Change Password
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
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

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Content - 3 columns */}
            <div className="xl:col-span-3 space-y-8">
              {/* Basic Information Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    Basic Information
                  </h2>
                </div>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Username
                        </label>
                        <input
                          type="text"
                          value={editData.username}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              username: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) =>
                            setEditData({ ...editData, email: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                    <div className="flex items-end space-x-4">
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="px-6 py-3 rounded-xl"
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
                        className="px-6 py-3 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-500 mb-2">
                          Username
                        </label>
                        <p className="text-lg text-gray-900 font-semibold">
                          {profile.username}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-500 mb-2">
                          Email Address
                        </label>
                        <p className="text-lg text-gray-900">{profile.email}</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-500 mb-2">
                          User Role
                        </label>
                        <div
                          className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${getRoleColor(
                            profile.role
                          )}`}
                        >
                          {getRoleLabel(profile.role)}
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-500 mb-2">
                          User ID
                        </label>
                        <div className="flex items-center space-x-2">
                          <IdCard className="h-4 w-4 text-gray-400" />
                          <code className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                            {profile.id}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats & Activity Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Points Overview */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                        <Coins className="h-5 w-5 text-amber-600" />
                      </div>
                      Points Overview
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-amber-100 text-sm font-semibold">
                          Current Balance
                        </span>
                        <TrendingUp className="h-4 w-4 text-amber-200" />
                      </div>
                      <p className="text-3xl font-bold">
                        {profile.pointBalance.toLocaleString()}
                      </p>
                      <div className="mt-2 text-amber-100 text-sm">
                        Total Earned: {profile.totalPoints.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-center">
                        <Badge
                          className={
                            profile.paidStatus === "Paid"
                              ? "bg-green-100 text-green-800 px-4 py-2 text-sm"
                              : profile.paidStatus ===
                                "I am super user, I have unlimited points."
                              ? "bg-purple-100 text-purple-800 px-4 py-2 text-sm"
                              : "bg-red-100 text-red-800 px-4 py-2 text-sm"
                          }
                        >
                          {profile.paidStatus ===
                          "I am super user, I have unlimited points."
                            ? "✨ Unlimited Points"
                            : profile.paidStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Overview */}
                <PermissionGuard
                  permissions={[Permission.VIEW_ALL_TRANSACTIONS]}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <Activity className="h-5 w-5 text-green-600" />
                        </div>
                        Activity Overview
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm font-semibold">
                              Total Requests
                            </p>
                            <p className="text-2xl font-bold">
                              {profile.totalRequests}
                            </p>
                          </div>
                          <Activity className="h-8 w-8 text-green-200" />
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-600 text-sm font-semibold">
                              Status
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {profile.activityStatus}
                            </p>
                          </div>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              profile.isActive ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </PermissionGuard>
              </div>

              {/* Supplier Status - Active/Inactive Suppliers */}
              <SupplierStatus />
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-8">
              {/* Account Details */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  Account Timeline
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Account Created
                      </p>
                      <p className="text-sm text-gray-600">
                        {formattedDates.createdAt}
                      </p>
                    </div>
                  </div>

                  {profile.lastLogin && (
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Last Login
                        </p>
                        <p className="text-sm text-gray-600">
                          {formattedDates.lastLogin}
                        </p>
                      </div>
                    </div>
                  )}

                  {profile.updatedAt && (
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Edit className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Last Updated
                        </p>
                        <p className="text-sm text-gray-600">
                          {formattedDates.updatedAt}
                        </p>
                      </div>
                    </div>
                  )}

                  <PermissionGuard permissions={[Permission.VIEW_ALL_USERS]}>
                    {profile.createdBy && (
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Created By
                          </p>
                          <p className="text-sm text-gray-600">
                            {profile.createdBy}
                          </p>
                        </div>
                      </div>
                    )}
                  </PermissionGuard>
                </div>
              </div>

              {/* Security Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  Security
                </h3>

                <div className="space-y-4">
                  <Button
                    onClick={() => setShowChangePassword(true)}
                    variant="outline"
                    className="w-full justify-start px-4 py-3 rounded-xl border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all"
                    leftIcon={<Key className="h-4 w-4" />}
                  >
                    Change Password
                  </Button>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Account Protected
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
          <div className="space-y-6">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{passwordError}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
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
                className="px-6 py-3 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="px-6 py-3 rounded-xl"
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
    </PerformanceMonitor>
  );
}

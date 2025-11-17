"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/lib/components/ui/button";
import { Badge } from "@/lib/components/ui/badge";
import { Modal } from "@/lib/components/ui/modal";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Activity,
  Coins,
  TrendingUp,
  Clock,
  CheckCircle,
  Edit,
  Save,
  X,
  Key,
  AlertCircle,
  Loader2,
  Crown,
  Building,
  MapPin,
  BarChart3,
  Zap,
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
  lastLogin?: string;
  activeSuppliers: string[];
  department?: string;
  position?: string;
  location?: string;
  phone?: string;
}

interface SupplierInfo {
  supplier_name: string;
  total_hotel: number;
  has_hotels: boolean;
  last_checked: string;
  total_mappings: number;
  last_updated: string;
  summary_generated_at: string;
}

interface SupplierModalData {
  supplier_info: SupplierInfo;
  user_info: {
    user_id: string;
    username: string;
    user_role: string;
    access_level: string;
  };
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierModalData | null>(null);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    department: "",
    position: "",
    location: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch profile data
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [meRes, pointsRes, availableSuppliersRes] =
        await Promise.allSettled([
          apiClient.get<any>("/user/check-me"),
          apiClient.get<any>("/user/points-check"),
          apiClient.get<any>("/user/check-available-suppliers"),
        ]);

      const meData =
        meRes.status === "fulfilled" && meRes.value.success
          ? meRes.value.data
          : null;
      const pointsData =
        pointsRes.status === "fulfilled" && pointsRes.value.success
          ? pointsRes.value.data
          : null;
      const availableSuppliersData =
        availableSuppliersRes.status === "fulfilled" &&
        availableSuppliersRes.value.success
          ? availableSuppliersRes.value.data
          : null;

      if (meData) {
        const roleMap: Record<string, UserRole> = {
          super_user: UserRole.SUPER_USER,
          admin_user: UserRole.ADMIN_USER,
          general_user: UserRole.GENERAL_USER,
        };

        const resolvedRole =
          roleMap[meData.user_status] ?? UserRole.GENERAL_USER;

        const profileData: UserProfile = {
          id: meData.id,
          username: meData.username,
          email: meData.email,
          role: resolvedRole,
          isActive: meData.is_active !== false,
          pointBalance:
            pointsData?.available_points ?? meData.available_points ?? 0,
          totalPoints: pointsData?.total_points ?? meData.total_points ?? 0,
          paidStatus:
            resolvedRole === UserRole.SUPER_USER
              ? "Unlimited Access"
              : meData.paid_status || "Standard",
          totalRequests: meData.total_rq ?? 0,
          activityStatus: meData.using_rq_status || "Active",
          createdAt: meData.created_at,
          updatedAt: meData.updated_at,
          lastLogin: meData.last_login,
          activeSuppliers:
            availableSuppliersData?.supplier_list ||
            meData.active_supplier ||
            [],
          department: meData.department || "Operations",
          position: meData.position || "Team Member",
          location: meData.location || "Not specified",
          phone: meData.phone || "Not specified",
        };

        setProfile(profileData);
        setEditForm({
          username: profileData.username,
          email: profileData.email,
          department: profileData.department || "",
          position: profileData.position || "",
          location: profileData.location || "",
          phone: profileData.phone || "",
        });
      }
    } catch (error) {
      setErrorMessage("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierClick = async (supplierName: string) => {
    try {
      setSupplierLoading(true);
      setShowSupplierModal(true);

      const response = await apiClient.get<SupplierModalData>(
        `/hotels/get-supplier-info?supplier=${supplierName}`
      );

      if (response.success && response.data) {
        setSelectedSupplier(response.data);
      } else {
        setErrorMessage("Failed to load supplier information");
        setShowSupplierModal(false);
      }
    } catch (error) {
      setErrorMessage("Failed to load supplier information");
      setShowSupplierModal(false);
    } finally {
      setSupplierLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // API call would go here
      setProfile((prev) =>
        prev
          ? { ...prev, ...editForm, updatedAt: new Date().toISOString() }
          : null
      );
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    try {
      // API call would go here
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage("Password changed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Failed to change password");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) return null;

  const getRoleBadge = (role: UserRole) => {
    const config: Record<
      UserRole,
      { style: string; label: string; icon: React.ReactElement }
    > = {
      [UserRole.SUPER_USER]: {
        style: "bg-purple-100 text-purple-700 border-purple-200",
        label: "Executive Admin",
        icon: <Crown className="w-4 h-4" />,
      },
      [UserRole.ADMIN_USER]: {
        style: "bg-blue-100 text-blue-700 border-blue-200",
        label: "Administrator",
        icon: <Shield className="w-4 h-4" />,
      },
      [UserRole.GENERAL_USER]: {
        style: "bg-green-100 text-green-700 border-green-200",
        label: "Team Member",
        icon: <User className="w-4 h-4" />,
      },
      [UserRole.USER]: {
        style: "bg-green-100 text-green-700 border-green-200",
        label: "User",
        icon: <User className="w-4 h-4" />,
      },
    };
    return config[role];
  };

  const roleBadge = getRoleBadge(profile.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className=" mx-auto">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-emerald-800 font-medium">
              {successMessage}
            </span>
            <button onClick={() => setSuccessMessage("")} className="ml-auto">
              <X className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800 font-medium">{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="ml-auto">
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="relative h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -bottom-16 left-8">
              <div className="w-32 h-32 rounded-2xl bg-white shadow-2xl flex items-center justify-center border-4 border-white">
                <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {profile.username}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center gap-1 ${roleBadge.style}`}
                  >
                    {roleBadge.icon}
                    {roleBadge.label}
                  </Badge>
                  <Badge
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      profile.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {profile.isActive ? "● Active" : "● Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Change Password
                </Button>
                <Button
                  onClick={() =>
                    isEditing ? handleSaveProfile() : setIsEditing(true)
                  }
                  className="flex items-center gap-2"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" /> Save
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" /> Edit Profile
                    </>
                  )}
                </Button>
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        username: profile.username,
                        email: profile.email,
                        department: profile.department || "",
                        position: profile.position || "",
                        location: profile.location || "",
                        phone: profile.phone || "",
                      });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl shadow-xl overflow-hidden mb-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                Personal Information
              </h2>

              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm({ ...editForm, username: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={editForm.department}
                      onChange={(e) =>
                        setEditForm({ ...editForm, department: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      value={editForm.position}
                      onChange={(e) =>
                        setEditForm({ ...editForm, position: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) =>
                        setEditForm({ ...editForm, location: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">Username</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      {profile.username}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      {profile.email}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Building className="w-4 h-4" />
                      <span className="text-sm font-medium">Department</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      {profile.department}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Position</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      {profile.position}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      {profile.location}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      {profile.activityStatus}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Card - Stats Grid */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                Quick Card
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Points Card */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Coins className="w-6 h-6" />
                    </div>
                    <TrendingUp className="w-5 h-5 opacity-80" />
                  </div>
                  <h3 className="text-sm font-medium opacity-90 mb-1">
                    Points Balance
                  </h3>
                  <p className="text-4xl font-bold mb-2">
                    {profile.pointBalance.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between text-sm opacity-90">
                    <span>
                      Total Earned: {profile.totalPoints.toLocaleString()}
                    </span>
                    <span className="px-2 py-1 bg-white/20 rounded-lg">
                      {profile.paidStatus}
                    </span>
                  </div>
                </div>

                {/* Activity Card */}
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6" />
                    </div>
                    <CheckCircle className="w-5 h-5 opacity-80" />
                  </div>
                  <h3 className="text-sm font-medium opacity-90 mb-1">
                    Total Requests
                  </h3>
                  <p className="text-4xl font-bold mb-2">
                    {profile.totalRequests}
                  </p>
                  <div className="text-sm opacity-90">
                    Active Suppliers: {profile.activeSuppliers.length}
                  </div>
                </div>

                {/* Quick Stats Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <Zap className="w-5 h-5 opacity-80" />
                  </div>
                  <h3 className="text-sm font-medium opacity-90 mb-1">
                    Quick Stats
                  </h3>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-90">User ID</span>
                      <code className="bg-white/20 px-2 py-1 rounded text-xs font-mono">
                        {profile.id.substring(0, 8)}...
                      </code>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-90">Account Age</span>
                      <span className="font-semibold">
                        {Math.floor(
                          (Date.now() - new Date(profile.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-90">Status</span>
                      <span className="font-semibold">
                        {profile.isActive ? "✓ Active" : "✗ Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Timeline Card */}
                <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <Clock className="w-5 h-5 opacity-80" />
                  </div>
                  <h3 className="text-sm font-medium opacity-90 mb-1">
                    Account Timeline
                  </h3>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-90">Created</span>
                      <span className="font-semibold text-xs">
                        {new Date(profile.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    {profile.lastLogin && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="opacity-90">Last Login</span>
                        <span className="font-semibold text-xs">
                          {new Date(profile.lastLogin).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    )}
                    {profile.updatedAt && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="opacity-90">Updated</span>
                        <span className="font-semibold text-xs">
                          {new Date(profile.updatedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Available Suppliers Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Building className="w-5 h-5 text-indigo-600" />
                  </div>
                  Available Suppliers
                </h2>
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1">
                  {profile.activeSuppliers.length} Suppliers
                </Badge>
              </div>

              {profile.activeSuppliers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {profile.activeSuppliers.map((supplier, index) => {
                    // Capitalize supplier name
                    const displayName = supplier
                      .split(/(?=[A-Z])/)
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ");

                    return (
                      <div
                        key={index}
                        onClick={() => handleSupplierClick(supplier)}
                        className="group p-4 bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Building className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1 capitalize">
                          {displayName}
                        </h3>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          {supplier}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No Available Suppliers
                  </h3>
                  <p className="text-slate-600">
                    You don't have any available suppliers at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleChangePassword} className="flex-1">
                Change Password
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Supplier Info Modal */}
      {showSupplierModal && (
        <Modal
          isOpen={showSupplierModal}
          onClose={() => {
            setShowSupplierModal(false);
            setSelectedSupplier(null);
          }}
          title="Supplier Information"
          size="lg"
        >
          {supplierLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : selectedSupplier ? (
            <div className="space-y-6">
              {/* Supplier Info */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  {selectedSupplier.supplier_info.supplier_name.toUpperCase()}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Total Hotels</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {selectedSupplier.supplier_info.total_hotel.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">
                      Total Mappings
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {selectedSupplier.supplier_info.total_mappings.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Has Hotels</p>
                    <p className="text-lg font-semibold">
                      {selectedSupplier.supplier_info.has_hotels ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Yes
                        </span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Status</p>
                    <Badge className="bg-green-100 text-green-700">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  Timeline
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Last Checked</span>
                    <span className="text-sm font-medium text-slate-900">
                      {new Date(
                        selectedSupplier.supplier_info.last_checked
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Last Updated</span>
                    <span className="text-sm font-medium text-slate-900">
                      {new Date(
                        selectedSupplier.supplier_info.last_updated
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">
                      Summary Generated
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {new Date(
                        selectedSupplier.supplier_info.summary_generated_at
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-600" />
                  Your Access
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">User ID:</span>
                    <p className="font-medium text-slate-900">
                      {selectedSupplier.user_info.user_id}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Username:</span>
                    <p className="font-medium text-slate-900">
                      {selectedSupplier.user_info.username}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Role:</span>
                    <p className="font-medium text-slate-900">
                      {selectedSupplier.user_info.user_role}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Access Level:</span>
                    <Badge className="bg-blue-100 text-blue-700">
                      {selectedSupplier.user_info.access_level}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSupplierModal(false);
                    setSelectedSupplier(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </Modal>
      )}
    </div>
  );
}

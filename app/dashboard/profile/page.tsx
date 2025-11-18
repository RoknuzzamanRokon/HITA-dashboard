"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { TokenStorage } from "@/lib/auth/token-storage";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Coins,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  Crown,
  Building,
  X,
  MapPin,
  Clock,
} from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  user_status: string;
  available_points: number;
  total_points: number;
  supplier_info: {
    total_active: number;
    active_list: string[];
    temporary_off: number;
    temporary_off_supplier: string[];
  };
  created_at: string;
  updated_at: string;
  need_to_next_upgrade: string;
}

interface SupplierInfo {
  supplier_info: {
    supplier_name: string;
    total_hotel: number;
    has_hotels: boolean;
    last_checked: string;
    total_mappings: number;
    last_updated: string;
    summary_generated_at: string;
  };
  user_info: {
    user_id: string;
    username: string;
    user_role: string;
    access_level: string;
  };
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierInfo, setSupplierInfo] = useState<SupplierInfo | null>(null);
  const [supplierLoading, setSupplierLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = TokenStorage.getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch("http://127.0.0.1:8001/v1.0/user/check-me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Profile data:", data);
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-primary))]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-color mx-auto mb-4" />
          <p className="text-[rgb(var(--text-secondary))]">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) return null;

  const getRoleInfo = (status: string) => {
    const roles: Record<string, { label: string; icon: React.ReactElement }> = {
      super_user: {
        label: "Super User",
        icon: <Crown className="w-4 h-4" />,
      },
      admin_user: {
        label: "Admin User",
        icon: <Shield className="w-4 h-4" />,
      },
      general_user: {
        label: "General User",
        icon: <User className="w-4 h-4" />,
      },
    };
    return roles[status] || roles.general_user;
  };

  const roleInfo = getRoleInfo(profile.user_status);

  const handleSupplierClick = async (supplierName: string) => {
    setShowSupplierModal(true);
    setSupplierLoading(true);
    setSupplierInfo(null);

    try {
      const token = TokenStorage.getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      console.log("Fetching supplier info for:", supplierName);

      const response = await fetch(
        `http://127.0.0.1:8001/v1.0/hotels/get-supplier-info?supplier=${supplierName}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error(
          `Failed to fetch supplier info: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Supplier info:", data);
      setSupplierInfo(data);
    } catch (err) {
      console.error("Error fetching supplier info:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load supplier info"
      );
      setShowSupplierModal(false);
    } finally {
      setSupplierLoading(false);
    }
  };

  return (
    <div className="mx-auto">
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md overflow-hidden mb-6 border border-[rgb(var(--border-primary))]">
        <div
          className="relative h-32 bg-primary-color"
          style={{
            background: `linear-gradient(135deg, var(--primary-color) 0%, rgba(var(--primary-rgb), 0.8) 50%, var(--primary-hover) 100%)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)",
            }}
          ></div>
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-lg bg-[rgb(var(--bg-primary))] shadow-lg flex items-center justify-center border-4 border-[rgb(var(--bg-primary))]">
              <span className="text-4xl font-bold text-primary-color">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
                {profile.username}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 border-primary-color text-primary-color bg-transparent">
                  {roleInfo.icon}
                  <span className="ml-1">{roleInfo.label}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-6 mb-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center">
          <User className="w-5 h-5 mr-2 text-primary-color" />
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Username</span>
            </div>
            <p className="text-lg font-semibold text-[rgb(var(--text-primary))]">
              {profile.username}
            </p>
          </div>

          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Email</span>
            </div>
            <p className="text-lg font-semibold text-[rgb(var(--text-primary))]">
              {profile.email}
            </p>
          </div>

          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">User ID</span>
            </div>
            <p className="text-sm font-mono text-[rgb(var(--text-primary))]">
              {profile.id}
            </p>
          </div>

          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <Building className="w-4 h-4" />
              <span className="text-sm font-medium">Status</span>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 border-primary-color text-primary-color bg-transparent">
              {roleInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Points Information */}
      <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-6 mb-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center">
          <Coins className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
          Points Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <Coins className="w-4 h-4" />
              <span className="text-sm font-medium">Available Points</span>
            </div>
            <p className="text-2xl font-bold text-primary-color">
              {profile.available_points.toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Total Points</span>
            </div>
            <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              {profile.total_points.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Supplier Information */}
      <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-6 mb-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center">
          <Building className="w-5 h-5 mr-2 text-primary-color" />
          Supplier Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Total Active</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {profile.supplier_info.total_active}
            </p>
          </div>

          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Temporary Off</span>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {profile.supplier_info.temporary_off}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-[rgb(var(--text-secondary))] mb-3">
            Active Suppliers ({profile.supplier_info.active_list.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.supplier_info.active_list.map((supplier) => (
              <button
                key={supplier}
                onClick={() => handleSupplierClick(supplier)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 border-primary-color text-primary-color bg-transparent hover:bg-primary-light transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              >
                {supplier}
              </button>
            ))}
          </div>
        </div>

        {profile.supplier_info.temporary_off_supplier.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-[rgb(var(--text-secondary))] mb-3">
              Temporary Off Suppliers (
              {profile.supplier_info.temporary_off_supplier.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.supplier_info.temporary_off_supplier.map((supplier) => (
                <span
                  key={supplier}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 border-orange-600 dark:border-orange-400 text-orange-600 dark:text-orange-400 bg-transparent"
                >
                  {supplier}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Supplier Permissions & IP Address Permissions - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Supplier Permissions */}
        <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-6">
          <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary-color" />
            Supplier Permissions
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                Manage supplier access and permissions
              </p>
            </div>
          </div>
        </div>

        {/* IP Address Permissions */}
        <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-6">
          <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary-color" />
            IP Address Permissions
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                Manage IP address access control
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Timeline */}
      <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-6">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-primary-color" />
          Account Timeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Created At</span>
            </div>
            <p className="text-base font-semibold text-[rgb(var(--text-primary))]">
              {new Date(profile.created_at).toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Updated At</span>
            </div>
            <p className="text-base font-semibold text-[rgb(var(--text-primary))]">
              {new Date(profile.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        {profile.need_to_next_upgrade && (
          <div className="mt-4 p-4 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-md">
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              <strong className="text-[rgb(var(--text-primary))]">
                Next Upgrade:
              </strong>{" "}
              {profile.need_to_next_upgrade}
            </p>
          </div>
        )}
      </div>

      {/* Supplier Info Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[rgb(var(--border-primary))]">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[rgb(var(--bg-primary))] border-b border-[rgb(var(--border-primary))] p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] flex items-center">
                <Building className="w-5 h-5 mr-2 text-primary-color" />
                Supplier Information
              </h3>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {supplierLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-primary-color mb-4" />
                  <p className="text-[rgb(var(--text-secondary))]">
                    Loading supplier information...
                  </p>
                </div>
              ) : supplierInfo ? (
                <div className="space-y-6">
                  {/* Supplier Info Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-primary-color" />
                      Supplier Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <Building className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Supplier Name
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-primary-color">
                          {supplierInfo.supplier_info.supplier_name}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Total Hotels
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                          {supplierInfo.supplier_info.total_hotel.toLocaleString()}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Total Mappings
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                          {supplierInfo.supplier_info.total_mappings.toLocaleString()}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Has Hotels
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 bg-transparent ${
                            supplierInfo.supplier_info.has_hotels
                              ? "border-green-600 dark:border-green-400 text-green-600 dark:text-green-400"
                              : "border-red-600 dark:border-red-400 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {supplierInfo.supplier_info.has_hotels ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4">
                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Last Checked
                          </span>
                        </div>
                        <p className="text-sm text-[rgb(var(--text-primary))]">
                          {new Date(
                            supplierInfo.supplier_info.last_checked
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Last Updated
                          </span>
                        </div>
                        <p className="text-sm text-[rgb(var(--text-primary))]">
                          {new Date(
                            supplierInfo.supplier_info.last_updated
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Summary Generated At
                          </span>
                        </div>
                        <p className="text-sm text-[rgb(var(--text-primary))]">
                          {new Date(
                            supplierInfo.supplier_info.summary_generated_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Info Section */}
                  <div className="border-t border-[rgb(var(--border-primary))] pt-6">
                    <h4 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary-color" />
                      Access Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <User className="w-4 h-4" />
                          <span className="text-sm font-medium">Username</span>
                        </div>
                        <p className="text-base font-semibold text-[rgb(var(--text-primary))]">
                          {supplierInfo.user_info.username}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-medium">User Role</span>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 border-primary-color text-primary-color bg-transparent">
                          {supplierInfo.user_info.user_role}
                        </span>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-medium">User ID</span>
                        </div>
                        <p className="text-sm font-mono text-[rgb(var(--text-primary))]">
                          {supplierInfo.user_info.user_id}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] mb-1">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Access Level
                          </span>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-2 border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 bg-transparent">
                          {supplierInfo.user_info.access_level}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-[rgb(var(--bg-primary))] border-t border-[rgb(var(--border-primary))] p-6">
              <button
                onClick={() => setShowSupplierModal(false)}
                className="w-full px-6 py-3 bg-primary-color text-white rounded-md hover:bg-primary-hover transition-all duration-200 font-medium hover:shadow-lg hover:scale-105 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
